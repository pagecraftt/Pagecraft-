import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { CookieConsent } from "@/components/cookie-consent";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta página não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error instanceof Error ? error : new Error(String(error)), { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Não foi possível abrir esta página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente novamente ou volte ao início para continuar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </Button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PageCraft — Sites, sistemas e apps em Lorena/SP" },
      { name: "description", content: "PageCraft é um estúdio de tecnologia em Lorena/SP que cria sites, sistemas web, aplicativos e experiências digitais sob medida." },
      { name: "author", content: "PageCraft" },
      { property: "og:site_name", content: "PageCraft" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:title", content: "PageCraft — Sites, sistemas e apps em Lorena/SP" },
      { property: "og:description", content: "PageCraft é um estúdio de tecnologia em Lorena/SP que cria sites, sistemas web, aplicativos e experiências digitais sob medida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@PageCraft" },
      { name: "twitter:title", content: "PageCraft — Sites, sistemas e apps em Lorena/SP" },
      { name: "twitter:description", content: "PageCraft é um estúdio de tecnologia em Lorena/SP que cria sites, sistemas web, aplicativos e experiências digitais sob medida." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "PageCraft",
          alternateName: "PD Craft",
          url: "https://pagecraft-digital-craft.lovable.app",
          logo: "https://pagecraft-digital-craft.lovable.app/favicon.png",
          email: "page.craftt@gmail.com",
          telephone: "+55-12-99188-1061",
          founder: { "@type": "Person", name: "J. Pedro Gonçalves" },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Lorena",
            addressRegion: "SP",
            addressCountry: "BR",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});


function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        sessionStorage.setItem("pagecraft:recovery", "true");
        void router.navigate({ to: "/redefinir-senha", replace: true });
        return;
      }
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <CookieConsent />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
