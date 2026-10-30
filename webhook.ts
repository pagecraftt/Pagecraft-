import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { paymentStatus } from "@/lib/payment-rules";

async function upsertOrder(session: any, env: StripeEnv, status: string) {
  const metadata = session.metadata ?? {};
  const planName = metadata.plano_nome || metadata.plano || null;
  if (!metadata.userId) throw new Error("Payment session has no owner");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("orders").upsert(
    {
      user_id: metadata.userId || null,
      customer_email: session.customer_details?.email ?? session.customer_email ?? null,
      price_id: metadata.plano || "desconhecido",
      product_name: planName,
      plan_name: planName,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? "brl",
      installments: Number(metadata.parcelas ?? 1) || 1,
      status,
      stripe_session_id: session.id,
      environment: env,
      ...(status === "pago" && { paid_at: new Date().toISOString() }),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_session_id" },
  );
  if (error) throw new Error("Order persistence failed");
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await upsertOrder(session, env, paymentStatus(session.payment_status, session.status));
      break;
    }
    case "checkout.session.async_payment_succeeded":
      await upsertOrder(event.data.object, env, "pago");
      break;
    case "checkout.session.async_payment_failed":
      await upsertOrder(event.data.object, env, "falhou");
      break;
    case "checkout.session.expired":
      await upsertOrder(event.data.object, env, "falhou");
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
