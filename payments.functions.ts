import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

import { paymentStatus, ownsPayment, validatePaymentEnvironment } from "@/lib/payment-rules";

type CheckoutSessionResult = { clientSecret: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data[0]) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      if (options.userId && customer.metadata?.["userId"] !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

/**
 * Cria a sessão de checkout. Exige login: o dono do pedido vem sempre do token
 * validado no servidor, nunca de dados enviados pelo navegador.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      priceId: string;
      installments?: number;
      returnUrl: string;
      environment: StripeEnv;
      attemptId: string;
    }) => {
      if (!["dia_marcado_avista", "site_mais_avista"].includes(data.priceId)) throw new Error("Plano inválido.");
      if (!/^[a-f0-9-]{36}$/.test(data.attemptId)) throw new Error("Tentativa inválida.");
      if (![1, 2, 3].includes(data.installments ?? 1)) throw new Error("Parcelamento inválido.");
      validatePaymentEnvironment(data.environment, import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN);
      const url = new URL(data.returnUrl);
      const allowed = ["https://pagecraft-digital-craft.lovable.app", "https://id-preview--71b57fc6-a1af-4661-b394-69894a0a43a8.lovable.app"];
      if (import.meta.env.DEV) allowed.push("http://localhost:8080");
      if (!allowed.includes(url.origin) || url.pathname !== "/pagamento/retorno") throw new Error("Destino de pagamento inválido.");
      return data;
    },
  )
  .handler(async ({ data, context }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const userId = context.userId;
      const {
        data: { user },
      } = await context.supabase.auth.getUser();
      const customerEmail = user?.email ?? undefined;

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice) throw new Error("Plano não encontrado.");

      const productId =
        typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);
      const productDescription = product.name;

      const customerId = await resolveOrCreateCustomer(stripe, {
        email: customerEmail,
        userId,
      });

      const parcelas = Math.min(Math.max(data.installments ?? 1, 1), 3);

      const baseParams = {
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment" as const,
        ui_mode: "embedded_page" as const,
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: { description: productDescription },
        metadata: {
          userId,
          parcelas: String(parcelas),
          plano: data.priceId,
          plano_nome: productDescription,
        },
      };

      const session = await stripe.checkout.sessions.create({
        ...baseParams,
        ...(parcelas > 1 && {
          payment_method_options: { card: { installments: { enabled: true } } },
        }),
      }, { idempotencyKey: `checkout-${userId}-${data.attemptId}` });

      // Pedido pendente gravado já no início: o cliente vê o pedido no painel
      // mesmo que o webhook demore ou falhe.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: writeError } = await supabaseAdmin.from("orders").upsert(
        {
          user_id: userId,
          customer_email: customerEmail ?? null,
          price_id: data.priceId,
          product_name: productDescription,
          plan_name: productDescription,
          amount_cents: session.amount_total ?? stripePrice.unit_amount ?? 0,
          currency: session.currency ?? stripePrice.currency ?? "brl",
          installments: parcelas,
          status: "pendente",
          stripe_session_id: session.id,
          environment: data.environment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" },
      );

      if (writeError) throw new Error("Não foi possível registrar seu pedido. Tente novamente.");
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export type ConfirmResult =
  | {
      status: "pago" | "pendente" | "falhou";
      planName: string | null;
      amountCents: number;
      currency: string;
      installments: number;
    }
  | { error: string };

/**
 * Confirma o pagamento consultando a Stripe (não confia no que veio na URL) e
 * sincroniza o pedido no banco — rede de segurança caso o webhook atrase.
 */
export const confirmCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    validatePaymentEnvironment(data.environment, import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN);
    if (!/^cs_[a-zA-Z0-9_]+$/.test(data.sessionId)) throw new Error("Invalid sessionId");
    return data;
  })
  .handler(async ({ data, context }): Promise<ConfirmResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);

      const metadata = (session.metadata ?? {}) as Record<string, string>;
      if (!ownsPayment(metadata["userId"], context.userId)) {
        return { error: "Esta sessão de pagamento pertence a outra conta." };
      }

      const status = paymentStatus(session.payment_status, session.status);

      const installments = Number(metadata["parcelas"] ?? 1) || 1;
      const planName = metadata["plano_nome"] ?? metadata["plano"] ?? null;

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: writeError } = await supabaseAdmin.from("orders").upsert(
        {
          user_id: context.userId,
          customer_email: session.customer_details?.email ?? null,
          price_id: metadata["plano"] ?? "desconhecido",
          product_name: planName,
          plan_name: planName,
          amount_cents: session.amount_total ?? 0,
          currency: session.currency ?? "brl",
          installments,
          status,
          stripe_session_id: session.id,
          environment: data.environment,
          ...(status === "pago" && { paid_at: new Date().toISOString() }),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" },
      );

      if (writeError) throw new Error("Não foi possível atualizar seu pedido. Tente novamente.");
      return {
        status,
        planName,
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "brl",
        installments,
      };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
