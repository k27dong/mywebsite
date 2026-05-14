# FE Audit — Design

**Date:** 2026-05-13
**Phase:** 1 of 4 (audit → deps upgrade → /book styling → BE fix)
**Status:** read-only audit, no code changes

## Goal

Produce a written report giving an honest, evidence-backed picture of the FE's current state across deps, build output, code structure, config, DX, and load speed. Findings drive the spec for Phase 2; this phase changes no code.

## Deliverable

A single markdown report at `docs/superpowers/audits/2026-05-13-fe-audit.md` with:

- **Executive summary** at top — 3 to 5 bullets answering: biggest issue, what's healthy, biggest surprise.
- **Per-axis findings** (six axes, below) — each with evidence (file paths, line numbers, command output, measured numbers).
- **Severity** on each finding (high / medium / low) reflecting impact or risk. No effort estimates.
- **Recommendations** grouped by destination phase: `Phase 2 (deps upgrade)`, `Phase 3 (/book styling)`, `Phase 4 (BE fix)`, `Cross-cutting`, `Suggestions (no obligation)`. Each future spec pulls its inputs directly from this grouping.
- **Questions for the user** — anything the audit can't resolve alone.
- **Appendix: new tooling worth considering** — flagged as candidates, not prescriptions.

## Audit axes

### 1. Dependency hygiene

For every entry in `package.json`:
- `pnpm outdated` for version drift
- Grep usage across `web/` (and the Rust side where relevant) — flag deps with zero imports
- Cross-check `@astrojs/*` against Astro 5's current recommendations
- Skim Tailwind 4 release notes and the `@astrojs/tailwind` deprecation path
- Output per dep: keep / upgrade / remove / replace

### 2. Build output & runtime perf

- `pnpm build`, capture per-route output sizes from Astro's build summary
- Inspect `dist/_astro/` to see which JS chunks ship and why
- Compare font payload in `public/` against actual chars referenced across the site (verify `sync_fontbook` is still effective)
- Image strategy — note where `astro:assets` is or isn't used and whether it'd help
- Lighthouse run on production `kefan.me` for one content-light page (home) and one content-heavy page (a blog post). Capture numbers.

This axis measures; it does not optimize.

### 3. Code structure & patterns

- Read every file in `web/components/` and `web/pages/` (small surface, ~20 files)
- Inspect content collection schemas in `web/content.config.ts` against actual data shape — any `z.coerce` that suggests upstream type mismatch
- Look closely at `OnePiece.tsx` (400+ lines, only client-side fetcher, multi-language) — does it justify its size and runtime fetch
- Note repeated patterns that could be extracted, or extracted abstractions that could be inlined
- Type tightness — any `any`, sloppy coercion, missing types

### 4. Config & tooling

Read each, note anything deprecated, missing, or non-default-without-reason:
- `astro.config.mjs`
- `tsconfig.json` (currently inherits — verify what)
- `tailwind.config.mjs`
- `vercel.json`
- `.prettierrc` + prettier plugins
- `web/content.config.ts`

Specifically check: is `astro check` ever run? Is TS strictness on?

### 5. Content workflow

- Diff `docs/` vs `web/content/` to document current drift extent
- Read `src/bin/sync_content.rs` to confirm what the sync actually does
- Survey three options for resolving the duplication and recommend one:
  - (a) gitignore `web/content/`, regenerate at build
  - (b) gitignore `docs/`, treat `web/content/` as source
  - (c) keep both, enforce sync via CI

This axis is in-scope despite touching BE territory: the drift between `docs/` and `web/content/` *is* the "doc duplication" issue, and FE content collections can't be evaluated without facing it.

### 6. DX & new tooling worth considering

Read-only survey, no commitments:
- Newer Astro 5 features the codebase doesn't use (content layer evolutions, server islands if relevant)
- Tailwind 4 migration story
- Vercel-specific niceties not used yet
- Type-checking in CI (`astro check`)
- Pre-commit hooks

Findings here go in the appendix, tagged "consider," not in the recommendations table.

## Out of scope

Explicitly **not** part of this phase:

- No code changes anywhere — `web/`, `src/`, `docs/`, configs. Audit is read-only.
- No dep upgrades, even small ones. That's Phase 2.
- No /book style work. That's Phase 3.
- No BE fix, no Lightsail SSH, no Caddy / systemd / Infisical poking. That's Phase 4.
- No new features. Suggestions go in the appendix only.
- The Rust crate's CLI scripts (`gen_blogpost`, `sync_fontbook`, etc.) — not audited; internal author tooling, not user-facing FE. Mentioned only where they touch the content workflow.
- The 8 dead BE endpoints (already known) — audit covers what FE *uses*, not BE surface area.

Recommendations may span into BE/infra (e.g., "stop committing `web/content/`, regenerate via CI"). Recommendations are fine; the audit just won't execute them.

## Success criteria

The audit is done when:

1. Every axis (1–6) has a written section, with evidence.
2. Each finding has a severity (high / medium / low) and a specific, actionable recommendation (e.g., "remove `tiny-pinyin` from package.json, it's unreferenced," not "audit unused deps").
3. Recommendations are grouped by destination phase.
4. Executive summary at top — 3 to 5 bullets.
5. Open questions section captures anything ambiguous the audit can't resolve.
6. No placeholders, no TBDs. Every section is answered or explicitly marked "verified, nothing to report."

## What comes next

Once the audit report is delivered and reviewed, we separately brainstorm + spec each follow-up phase, pulling inputs from the audit's grouped recommendations. Order: Phase 2 (deps upgrade) → Phase 3 (/book styling) → Phase 4 (BE fix).
