# Phase 2 — FE Modernization & OP Sunset — Design

**Date:** 2026-05-13
**Phase:** 2 of 4 (audit → **FE modernization** → /book styling → BE fix)
**Status:** spec, ready for plan-writing
**Reference audit:** `docs/superpowers/audits/2026-05-13-fe-audit.md`

## Goal

Get the FE to "a good working state": sunset the One Piece project, upgrade Astro 5 → 6 and Tailwind 3 → 4 with all chained bumps, tighten TS, fix the audit's two perf wins (CJK font preload + MathJax global load), and lock the state behind a CI gate. FE-only — no BE / Rust / Lightsail work.

## Scope summary

**In scope:** all 14 numbered steps below + the side-action Vercel Skew Protection toggle. Each step independently revertable. All work on a single feature branch with one commit per step.

**Out of scope:**
- BE fix (Lightsail, Caddy, systemd, Infisical, `src/main.rs`, the BE Rust server) — Phase 4.
- `/book` (salt) page visual styling — Phase 3.
- Content workflow drift (CRLF normalization, missing `data/op_sanitized.json`) — separate phase, touches Rust.
- Vite 8 (gated on a future Astro version; Astro 6 requires Vite 7).
- Axis 6 appendix items beyond View Transitions, Skew Protection, `astro:env`. Server islands, content layer custom loaders, Vercel Cron, lefthook pre-commit, etc., remain possible follow-ups.
- The Rust crate's CLI scripts and `src/onepiece.rs` library — leave intact even though FE consumers are gone.
- BE `/api/op/today` endpoint — leave intact (Phase 4 territory; may have non-FE consumers).

## Constraints

- **No commits, branches, staging, or pushes** without explicit per-action user approval. Standing rule.
- **No effort/time estimates** in the plan derived from this spec.
- One commit per numbered step (or per cohesive sub-task). Each commit independently revertable.

## Migration list (14 steps + 2 measurement gates)

Ordering rule: subtractive first → independent upgrades → big chained bump → polish → perf fixes → CI gate.

| # | Step | Description |
|---|------|-------------|
| 0 | Baseline measurements | `pnpm build` output, Lighthouse on home / one blog post / `/book`, font payload, `dist/` totals. Save to `docs/superpowers/audits/scratch/baseline-perf.md`. |
| 1 | Sunset OP (FE-only) | Delete `web/pages/op/`, `web/components/op/`, `web/content/onepiece/`; remove `onepiece` collection from `web/content.config.ts`; remove `tiny-pinyin` and `@headlessui/react` from `package.json`; remove any nav links to `/op`. |
| 2 | Delete 3 dead components | `BtnToggle.astro`, `FullDate.astro`, `HeaderLink.astro`; remove commented-out references in `Navigation.astro`. |
| 3 | Drop dead deps | Remove `@astrojs/mdx` (no `.mdx` files exist) and `@vercel/analytics` (already covered by adapter's `webAnalytics`). |
| 4 | Fix `project.astro` ts(2345) | Sort before map so the comparator's type matches the entries it sees. |
| 5 | Tailwind 3 → 4 | Remove `@astrojs/tailwind` integration; install `@tailwindcss/vite`; wire in `astro.config.mjs`. Migrate `tailwind.config.mjs` to CSS-first `@theme` config (custom fonts, colors, typography variants, keyframes). Verify `@tailwindcss/typography` v0.5.19+ works with v4. Visual smoke check on home / blog post / `/book` / `/project` / `/contact`. |
| 5.5 | Measurement gate A | Re-capture sizes + Lighthouse on the same three pages. Append to perf log. |
| 6 | Astro 5 → 6 | Bump `astro@6`; chain-bump `@astrojs/react@5`, `@astrojs/vercel@10`, `@astrojs/sitemap@latest`, `@astrojs/rss@latest` (Vite 7 lands transitively). Verify `import.meta.env.PUBLIC_API_URL` still works under v6's "inlined, never coerced" rule. Verify image cropping default (`fit`) doesn't break existing images. Verify no `Astro.glob()` usage anywhere (audit didn't see any; re-grep for safety). Update Vercel project's Node version setting to 22.12+ if pinned. |
| 7 | Minor bumps | `prettier 3.6 → 3.8` + plugins; `@types/react` / `@types/react-dom` to latest matching React 19.2.x; any other drifting deps. |
| 8 | TS strict + Prettier overrides | Switch `extends` in `tsconfig.json` from `astro/tsconfigs/base` to `astro/tsconfigs/strict`. Fix new errors (`noImplicitAny`, `noUncheckedIndexedAccess`, etc.). Add the `*.astro` override block to `.prettierrc` per `prettier-plugin-astro` README. |
| 9 | View Transitions | Add `<ClientRouter />` from `astro:transitions` to `web/components/Base.astro`. Verify MathJax re-init on `astro:page-load` (see risk 6). |
| 10 | `astro:env` for `PUBLIC_API_URL` | Declare `PUBLIC_API_URL` in `astro.config.mjs` `env.schema`. Replace `import.meta.env.PUBLIC_API_URL` in `web/consts.ts` with `import { PUBLIC_API_URL } from 'astro:env/client'`. |
| 11 | CJK font preload fix | Only emit CJK font preload `<link>` tags on routes that render CJK content. Detection rule: hardcoded route allow-list (blog, book, project, post pages). Latin-only pages (`/contact`, `/cv`) skip the preload. Target: `/contact` cold-cache transfer drops by ≥ 3 MB. |
| 12 | MathJax conditional load | Only inject the MathJax CDN `<script>` on pages whose content actually contains math syntax (`$...$` or `\(...\)`). Detection rule: scan content at build time, expose a `hasMath: boolean` per route. |
| 13 | FE CI gate | New `.github/workflows/fe-check.yml`: `pnpm install --frozen-lockfile` + `pnpm build` + `pnpm astro check` on PRs against master. Add `@astrojs/check` and `typescript` to devDeps. Add `check` script to `package.json`. |
| 14 | Final measurement gate | Re-capture all measurements. Produce a delta table (baseline / after-Tailwind / final) appended to `perf-deltas.md` and a 5-bullet summary at the top of the audit report. |

**Side action (no code):** Toggle Vercel Skew Protection in dashboard. Tracked in the success criteria but not a step.

## Measurement methodology

Used at steps 0, 5.5, and 14. Outputs go to `docs/superpowers/audits/scratch/perf-*.md`.

- **Build output:** `pnpm build` summary captured to text. Per-route HTML / JS / CSS sizes, total `dist/` size.
- **Font payload:** `du -sh public/*.woff2` and which routes preload which fonts.
- **Lighthouse:** PageSpeed Insights API (`strategy=mobile` + `strategy=desktop`) on three pages: home (`/`), one blog post, `/book`. Capture: Performance score, LCP, FCP, CLS, TBT, total transfer size. Fall back to local Chrome DevTools if API is quota-limited.
- **Final delta table:** rows = metric × page × strategy; columns = baseline / after-tailwind / final.

## Risks called out for the plan

These exist so the plan addresses them directly — not asking the user to decide each.

1. **CJK preload detection rule:** hardcoded route allow-list (recommended) vs per-page frontmatter flag. Plan adopts allow-list; covers the real set, no author overhead.
2. **MathJax conditional rule:** build-time content scan for math syntax (recommended) vs frontmatter flag. Plan adopts content scan; automatic.
3. **`@tailwindcss/typography` v4 story:** plugin v0.5.19+ supports v4 but the CSS-first config wiring differs. Plan must verify before commit on step 5.
4. **`Astro.glob()` removal in Astro 6:** audit didn't see it; plan must re-grep before step 6.
5. **Vercel Node version:** Astro 6 requires Node 22.12+. If `package.json` has `engines.node` pinned or Vercel project settings override, both need updating in step 6.
6. **View Transitions + scripts:** `Base.astro` has a MathJax `<script>`; with `ClientRouter` active, MathJax needs to re-typeset on `astro:page-load`. Plan must add an `astro:page-load` listener. Order matters: step 12 (MathJax conditional) and step 9 (ClientRouter) interact — the plan should sequence carefully.

## Success criteria

Phase 2 is done when ALL hold:

1. **OP gone from FE:** `/op` 404s; `web/pages/op/`, `web/components/op/`, `web/content/onepiece/` deleted; `onepiece` collection removed; `tiny-pinyin` and `@headlessui/react` removed from `package.json`.
2. **Dead components gone:** `BtnToggle.astro`, `FullDate.astro`, `HeaderLink.astro` deleted; `Navigation.astro` no longer references them.
3. **Dead deps gone:** `@astrojs/mdx` and `@vercel/analytics` removed; build still succeeds.
4. **`astro check` passes** with exit code 0 — no errors, warnings, or hints.
5. **Astro on 6.x** with `@astrojs/react@5`, `@astrojs/vercel@10`, `@astrojs/sitemap@latest`, `@astrojs/rss@latest`; Vite at 7.x transitively; build succeeds; `pnpm preview` renders correctly.
6. **Tailwind on 4.x** with `@tailwindcss/vite`; custom theme preserved; visual smoke check passes on home / blog post / `/book` / `/project` / `/contact`.
7. **TS on `astro/tsconfigs/strict`**; no `any` regressions vs. baseline (the existing `HTMLAttributes<any>` in `Callout.astro` may stay if it's the cleanest polymorphic pattern).
8. **`<ClientRouter />` integrated;** MathJax still works on math-containing posts (re-init on `astro:page-load`).
9. **`astro:env` schema** declares `PUBLIC_API_URL`; `web/consts.ts` uses the new import.
10. **CJK font preload route-aware:** Latin-only pages drop ≥ 3 MB of cold-cache transfer.
11. **MathJax conditional:** non-math pages no longer include the MathJax `<script>` (verified by viewing source).
12. **FE CI gate live:** new workflow runs on PRs; a deliberately broken test PR fails the gate.
13. **Vercel Skew Protection enabled** in dashboard.
14. **Measurement deltas captured** in `docs/superpowers/audits/scratch/perf-deltas.md`: baseline / after-Tailwind / final, on home / blog post / `/book`.
15. **Working tree clean** after each commit; no orphaned `dist/`, `.astro/`, or scratch artifacts in commits.

## What comes next

After this plan completes, the FE is at "good working state." The remaining audit work (content workflow drift, BE fix, /book styling, and any Axis 6 follow-ups) each gets its own brainstorm → spec → plan cycle as a separate phase.
