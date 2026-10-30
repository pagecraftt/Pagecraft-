<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep login destinations in the shared auth utility and read browser storage after hydration to avoid unsafe redirects and rendering mismatches.
- Keep a single root auth-state subscriber for router freshness and password-recovery navigation; sign-out cancels and clears cached queries first.
- Keep the reference contract, clauses and annexes in a browser-safe shared document module; use it for the on-screen document and PDF to prevent divergent terms, preserving unfilled reference fields instead of inventing legal identity or commercial conditions.
- Persist each new contract's full document and version at acceptance; generate signed PDFs from that snapshot, with legacy clauses only for records predating snapshots, so updates cannot rewrite existing agreements.
- Store per-client contract preparation in admin-only writable permission records; signing accepts only client identity and acceptance, reads commercial terms server-side, and checks the preparation revision to prevent signing stale terms.

- Keep marketing sections in browser-safe shared components with SiteFrame; home contains introduction and services, company information is consolidated at /sobre, and commercial pages remain separate. Preserve old informational URLs with redirects to /sobre.

- Mount consent once at the root, keep versioned choices in the shared cookie utility, and require explicit acceptance before optional tracking; this preserves refusal across all pages.
- Keep payment ownership, status and environment rules in the browser-safe payment rules module, with database transitions protecting confirmed orders; this prevents divergent webhook and account behavior.
- Live paid orders alone grant commercial maintenance access; sandbox orders remain visible and labeled for testing without unlocking production benefits.
