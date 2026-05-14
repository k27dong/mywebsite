# Phase 2 — FE Modernization & OP Sunset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sunset the One Piece project (FE-only), upgrade Astro 5 → 6 + Tailwind 3 → 4 + chained bumps + minors, tighten TS, fix the audit's two perf wins (CJK preload + MathJax global), and lock the state behind a CI gate.

**Architecture:** Single feature branch. One commit per numbered task (each independently revertable). Sequential execution: subtractive first → independent upgrades → big chained bump → polish → perf fixes → CI gate. Baseline / mid / final measurements bracket the perf-relevant tasks for clean delta attribution.

**Tech Stack:** Astro 5→6, React 19, Tailwind 3→4 (`@tailwindcss/vite`), TypeScript (`base` → `strict`), pnpm, Vercel.

**Reference spec:** `docs/superpowers/specs/2026-05-13-phase2-fe-modernization-design.md`
**Reference audit:** `docs/superpowers/audits/2026-05-13-fe-audit.md`

**Working directory for all commands:** `/Users/kd/Github/mywebsite`

---

## Constraints (apply to every task)

- **NEVER commit, branch, stage, or push without explicit per-action user approval.** This is the user's standing rule and overrides the default "commit your work" instruction in any tooling. Each task has a final `git commit` step — but the implementing agent must STOP at that step, present the diff, and wait for the user's explicit "yes, commit this" before running.
- **FE-only.** Do not edit anything under `src/`, `.github/workflows/deploy.yml`'s existing Lightsail steps, `docs/blog/`, `docs/salt/`, `docs/project/`, `Cargo.toml`, `Cargo.lock`. Touching the Rust crate, BE endpoints, or content-source `docs/` is out of scope.
- **No effort/time estimates.**
- After every step that runs pnpm or might touch dependencies: run `git status --short` and verify only intended files are modified. If `pnpm-lock.yaml` or `package.json` change unintentionally, revert with `git checkout -- <file>`.
- After every task: `pnpm install --frozen-lockfile` should succeed; `pnpm build` should succeed; `pnpm astro check` should pass starting at Task 4 (when the existing ts(2345) is fixed). Document in the task report if any of these fail.
- Visual smoke check after Tailwind 4 (Task 5), Astro 6 (Task 6), and View Transitions (Task 9): `pnpm preview` and click through `/`, `/blog`, one blog post, `/book`, `/project`, `/contact`, `/cv`. Confirm no visual regression.

## Branch creation

Before Task 0: the agent must ask the user for the branch name and explicit permission to create the branch. Suggested name: `phase-2-fe-modernization`. The agent then runs:

```bash
git checkout -b phase-2-fe-modernization
```

All subsequent commits land on this branch.

---

## File structure — what this plan touches

**Created:**
- `docs/superpowers/audits/scratch/baseline-perf.md` (Task 0)
- `docs/superpowers/audits/scratch/midpoint-perf.md` (Task 5.5)
- `docs/superpowers/audits/scratch/perf-deltas.md` (Task 14)
- `.github/workflows/fe-check.yml` (Task 13)

**Modified:**
- `package.json` (Tasks 1, 3, 5, 6, 7, 13)
- `pnpm-lock.yaml` (Tasks 1, 3, 5, 6, 7, 13)
- `astro.config.mjs` (Tasks 3, 5, 6, 10)
- `tailwind.config.mjs` (Task 5 — deleted at the end of the Tailwind migration)
- `tsconfig.json` (Task 8)
- `.prettierrc` (Task 8)
- `web/content.config.ts` (Task 1)
- `web/components/Base.astro` (Tasks 9, 11, 12)
- `web/components/Navigation.astro` (Tasks 1, 2)
- `web/styles/global.css` (Task 5)
- `web/consts.ts` (Task 10)
- `web/pages/project.astro` (Task 4)
- `web/pages/blog/[...slug].astro` (Task 12 — passing hasMath prop)
- `web/layouts/MainLayout.astro` (Tasks 11, 12 — forwarding props to Base)

**Deleted:**
- `web/pages/op/` (Task 1)
- `web/components/op/` (Task 1)
- `web/content/onepiece/` (Task 1)
- `web/components/BtnToggle.astro` (Task 2)
- `web/components/FullDate.astro` (Task 2)
- `web/components/HeaderLink.astro` (Task 2)
- `tailwind.config.mjs` (Task 5)

---

## Task 0: Baseline measurements

**Goal:** Capture pre-migration build sizes, font payload, and Lighthouse so we can attribute deltas later.

**Files:**
- Create: `docs/superpowers/audits/scratch/baseline-perf.md`

- [ ] **Step 1: Clean build**

Run:
```bash
rm -rf dist/ .astro/ && pnpm install --frozen-lockfile && pnpm build 2>&1 | tee /tmp/baseline-build.txt
```

Expected: build succeeds. If lockfile is out of sync from earlier Phase 1 work, drop `--frozen-lockfile` once, then verify `pnpm-lock.yaml` is unchanged after install with `git diff pnpm-lock.yaml | head`.

- [ ] **Step 2: Capture per-route sizes**

Run:
```bash
find dist/_astro -type f \( -name "*.js" -o -name "*.css" \) -exec ls -la {} \; | sort -k5 -nr | head -20 > /tmp/baseline-chunks.txt
du -h dist/ | tail -1 > /tmp/baseline-dist-total.txt
du -sh public/*.woff2 public/*.woff 2>/dev/null > /tmp/baseline-fonts.txt
```

- [ ] **Step 3: Capture Lighthouse scores (PageSpeed Insights API)**

For each of the three target URLs and each strategy, fetch:
- `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fkefan.me%2F&strategy=mobile`
- Same with `strategy=desktop`
- Same for `https://kefan.me/blog/Miller-Rabin` (math + Chinese post — good cold-cache representative; if URL doesn't exist, pick any post by checking `web/content/posts/*.md`)
- Same for `https://kefan.me/book`

Use WebFetch on each URL. Capture for each combination: `lighthouseResult.categories.performance.score`, `audits.largest-contentful-paint.numericValue`, `audits.first-contentful-paint.numericValue`, `audits.cumulative-layout-shift.numericValue`, `audits.total-blocking-time.numericValue`, `audits.total-byte-weight.numericValue`.

If PageSpeed API returns 429 (quota), wait and retry once. If it still fails, document the failure and capture only the build-output and font numbers; the final-gate task can run Lighthouse locally instead.

- [ ] **Step 4: Write the baseline report**

Write to `docs/superpowers/audits/scratch/baseline-perf.md`:

```markdown
# Baseline perf — pre-Phase-2

Captured: <date>

## Build output

(paste relevant build summary lines from /tmp/baseline-build.txt — per-route sizes)

## Top JS/CSS chunks

(paste from /tmp/baseline-chunks.txt)

## Total dist size

(from /tmp/baseline-dist-total.txt)

## Font payload

(from /tmp/baseline-fonts.txt)

## Lighthouse (PageSpeed Insights)

| Page | Strategy | Perf | LCP | FCP | CLS | TBT | Transfer |
|------|----------|------|-----|-----|-----|-----|----------|
| /    | mobile   |      |     |     |     |     |          |
| /    | desktop  |      |     |     |     |     |          |
| /blog/<slug> | mobile | | | | | | |
| /blog/<slug> | desktop | | | | | | |
| /book | mobile | | | | | | |
| /book | desktop | | | | | | |

(or "PageSpeed API unavailable — local Chrome DevTools required for final gate")
```

- [ ] **Step 5: Verify and commit**

Run: `git status --short`. Expected: only `?? docs/superpowers/audits/scratch/baseline-perf.md` (the directory may already be untracked from Phase 1; that's fine).

**STOP. Present the file path and the diff. Ask the user for explicit approval before committing.**

If approved:
```bash
git add docs/superpowers/audits/scratch/baseline-perf.md
git commit -m "Capture baseline perf for Phase 2"
```

---

## Task 1: Sunset OP (FE-only)

**Goal:** Remove all FE OP code, content, and OP-only deps.

**Files:**
- Delete: `web/pages/op/`, `web/components/op/`, `web/content/onepiece/`
- Modify: `web/content.config.ts`, `web/components/Navigation.astro`, `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Verify no other FE consumer of OP code**

Run:
```bash
grep -rln "onepiece\|OnePiece\|/op/\|tiny-pinyin\|@headlessui/react" web/ astro.config.mjs 2>/dev/null
```

Expected (after deletion in next steps): only references in `web/pages/op/`, `web/components/op/`, `web/content/onepiece/`, and the `onepiece` collection definition in `web/content.config.ts`. Before deletion, those plus possibly a nav link if one exists. If a `/op` link exists in `Navigation.astro`, note its line.

- [ ] **Step 2: Delete the OP page, components, and content directories**

Run:
```bash
rm -rf web/pages/op web/components/op web/content/onepiece
```

- [ ] **Step 3: Remove `onepiece` collection from `web/content.config.ts`**

Open `web/content.config.ts`. Delete the entire `onepiece` collection definition (lines 104–139, the `const onepiece = defineCollection({...})` block).

Then update the export at the bottom (line 141):

Old:
```ts
export const collections = { posts, booknotes, experiences, skills, projects, onepiece }
```

New:
```ts
export const collections = { posts, booknotes, experiences, skills, projects }
```

- [ ] **Step 4: Remove `/op` nav link if present**

Open `web/components/Navigation.astro`. The current `links` array (lines 6–12) does NOT include `/op` based on Phase 1 inspection. Verify by reading the file. If a `/op` entry exists, remove it. If not, no change.

- [ ] **Step 5: Remove OP-only deps from `package.json`**

Open `package.json`. Remove these two lines from `dependencies`:
- `"@headlessui/react": "^2.2.9",`
- `"tiny-pinyin": "^1.3.2",`

(Comma handling: the JSON must stay valid. Adjust trailing commas as needed.)

- [ ] **Step 6: Regenerate lockfile**

Run:
```bash
pnpm install --no-frozen-lockfile
```

Expected: removes `@headlessui/react` and `tiny-pinyin` and their transitive deps from `pnpm-lock.yaml`. Verify with `git diff pnpm-lock.yaml | head -40`.

- [ ] **Step 7: Verify build succeeds**

Run: `pnpm build 2>&1 | tail -30`

Expected: build completes with no errors. The number of routes should drop (no more `/op`). Confirm no Astro warnings about the missing `onepiece` collection.

- [ ] **Step 8: Confirm no orphaned imports**

Run:
```bash
grep -rln "OnePiece\|onepiece\|/op/\|tiny-pinyin\|@headlessui/react" web/ astro.config.mjs 2>/dev/null
```

Expected: zero matches.

- [ ] **Step 9: Verify and commit**

Run: `git status --short`. Expected modifications: deleted `web/pages/op/...`, `web/components/op/...`, `web/content/onepiece/...`; modified `web/content.config.ts`, `package.json`, `pnpm-lock.yaml`. Possibly `web/components/Navigation.astro` if Step 4 changed it.

**STOP. Present `git status` and `git diff --stat`. Ask for explicit approval.**

If approved:
```bash
git add -A web/pages/op web/components/op web/content/onepiece web/content.config.ts web/components/Navigation.astro package.json pnpm-lock.yaml
git commit -m "Sunset One Piece project (FE-only)"
```

---

## Task 2: Delete 3 dead components

**Goal:** Remove unused `BtnToggle.astro`, `FullDate.astro`, `HeaderLink.astro` and the commented import in `Navigation.astro`.

**Files:**
- Delete: `web/components/BtnToggle.astro`, `web/components/FullDate.astro`, `web/components/HeaderLink.astro`
- Modify: `web/components/Navigation.astro`

- [ ] **Step 1: Verify all three are truly unused**

Run:
```bash
grep -rln "BtnToggle\|FullDate\|HeaderLink" web/ 2>/dev/null
```

Expected: only matches inside the three component files themselves, plus a commented reference in `web/components/Navigation.astro` (lines 2 and 40 per Phase 1 inspection).

- [ ] **Step 2: Delete the three components**

Run:
```bash
rm web/components/BtnToggle.astro web/components/FullDate.astro web/components/HeaderLink.astro
```

- [ ] **Step 3: Remove the commented import + render from `Navigation.astro`**

Open `web/components/Navigation.astro`.

Delete line 2 (the commented import):
```astro
// import BtnToggle from "./BtnToggle.astro"
```

Delete line 40 (the commented render):
```astro
<!-- <BtnToggle /> -->
```

Adjust blank lines so the file reads cleanly.

- [ ] **Step 4: Verify build**

Run: `pnpm build 2>&1 | tail -10`. Expected: success, no warnings about the deleted components.

- [ ] **Step 5: Verify and commit**

Run: `git status --short`.

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add -A web/components/
git commit -m "Delete three unused components"
```

---

## Task 3: Drop dead deps (`@astrojs/mdx`, `@vercel/analytics`)

**Goal:** Remove unused dependencies and their integration wiring.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`

- [ ] **Step 1: Re-verify no MDX or analytics imports**

Run:
```bash
grep -rn "@astrojs/mdx\|@vercel/analytics\|import mdx" web/ astro.config.mjs 2>/dev/null
find web docs -name "*.mdx" 2>/dev/null
```

Expected: `astro.config.mjs` references `mdx` import and `mdx()` integration call. Zero `.mdx` files. No source file imports `@vercel/analytics`.

- [ ] **Step 2: Remove `mdx` from `astro.config.mjs`**

Open `astro.config.mjs`.

Delete the import (line 4):
```js
import mdx from "@astrojs/mdx"
```

Remove `mdx(),` from the `integrations` array.

After: the integrations array should contain `sitemap()`, `tailwind()`, `icon({ iconDir: "./web/icons" })`, `react()`. (Tailwind will be replaced in Task 5 — leave it for now.)

- [ ] **Step 3: Remove deps from `package.json`**

Open `package.json`. From `dependencies`, delete these lines:
- `"@astrojs/mdx": "^4.3.12",`
- `"@vercel/analytics": "^1.5.0",`

Adjust trailing commas to keep JSON valid.

- [ ] **Step 4: Regenerate lockfile**

```bash
pnpm install --no-frozen-lockfile
```

Verify `git diff pnpm-lock.yaml | head -30` shows removal of these packages.

- [ ] **Step 5: Verify build**

```bash
pnpm build 2>&1 | tail -10
```

Expected: success. The build summary should no longer mention MDX-related processing.

- [ ] **Step 6: Verify and commit**

```bash
git status --short
```

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add astro.config.mjs package.json pnpm-lock.yaml
git commit -m "Drop unused deps (@astrojs/mdx, @vercel/analytics)"
```

---

## Task 4: Fix `project.astro` ts(2345)

**Goal:** Resolve the type error so `astro check` exits 0 (prerequisite for the CI gate in Task 13).

**Files:**
- Modify: `web/pages/project.astro:20-30`

- [ ] **Step 1: Confirm the current error**

Read `web/pages/project.astro` lines 16–30. The error is that `.sort()` is called on `CollectionEntry<"projects">[]` (no `mobile_tags` yet) but the comparator is typed `Project` (which has `mobile_tags`). Fix: sort first as the raw collection type, then map.

- [ ] **Step 2: Apply the fix**

Replace the projects-building block (current lines 16–30) with this exact code:

```ts
type Project = Omit<CollectionEntry<"projects">, "data"> & {
  data: CollectionEntry<"projects">["data"] & { mobile_tags: string[] }
}

const projects: Project[] = (await getCollection("projects"))
  .sort((a, b) => a.data.id - b.data.id)
  .map((project) => ({
    ...project,
    data: {
      ...project.data,
      mobile_tags: get_mobile_tags(project.data.language),
    },
  }))
```

Key change: the `.sort()` comparator no longer has explicit `Project` annotations on its parameters — they infer to `CollectionEntry<"projects">`, which matches what `.sort()` actually sees. The `.map()` then transforms each entry into the `Project` shape, and the array annotation `Project[]` is satisfied at the end.

- [ ] **Step 3: Run astro check**

This step requires `@astrojs/check` and `typescript`, which will be added in Task 13. For now, run via `pnpm dlx`:

```bash
pnpm dlx --package=@astrojs/check --package=typescript astro check 2>&1 | tail -20
```

Expected: 0 errors, 0 warnings, 0 hints (or hints related to OnePiece — which is deleted, so should be gone too).

If `pnpm dlx` tries to mutate `package.json` / `pnpm-lock.yaml`, immediately revert: `git checkout -- package.json pnpm-lock.yaml`.

- [ ] **Step 4: Verify build**

```bash
pnpm build 2>&1 | tail -10
```

Expected: success.

- [ ] **Step 5: Verify and commit**

```bash
git status --short
git diff web/pages/project.astro
```

Expected: only `web/pages/project.astro` modified. If `package.json` or `pnpm-lock.yaml` are dirty, revert them.

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add web/pages/project.astro
git commit -m "Fix ts(2345) in project.astro: sort before map"
```

---

## Task 5: Tailwind 3 → 4 (incl. `@astrojs/tailwind` → `@tailwindcss/vite`)

**Goal:** Migrate from Tailwind 3 + `@astrojs/tailwind` to Tailwind 4 + `@tailwindcss/vite`, preserving all custom theme (fonts, colors, typography variants, keyframes).

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `web/styles/global.css`
- Delete: `tailwind.config.mjs` (replaced by CSS-first `@theme` config in `global.css`)

**Reference docs:** https://tailwindcss.com/docs/upgrade-guide and https://tailwindcss.com/docs/installation/framework-guides/astro

- [ ] **Step 1: Read Tailwind 4 + Astro integration docs**

Fetch via context7 to confirm current canonical setup:

```
mcp__plugin_context7_context7__resolve-library-id with libraryName "tailwindcss"
mcp__plugin_context7_context7__query-docs with the resolved id and query "v4 install with @tailwindcss/vite plugin, @theme directive, font-family customization, typography plugin"
```

Confirm two things:
- The Astro integration story for v4 uses `@tailwindcss/vite` in the Vite plugin section of `astro.config.mjs` (not the `integrations` array).
- The `@import "tailwindcss"` directive replaces `@tailwind base/components/utilities`.
- Custom theme is now CSS-first via `@theme { ... }` block.

- [ ] **Step 2: Update `package.json` dependencies**

Open `package.json`. In `dependencies`:
- Remove `"@astrojs/tailwind": "^5.1.5",`
- Change `"tailwindcss": "^3.4.18"` to `"tailwindcss": "^4.3.0"`
- Add `"@tailwindcss/vite": "^4.3.0",`

In `devDependencies`:
- Change `"@tailwindcss/typography": "^0.5.19"` (it's already at the latest 0.5.x; just confirm).

- [ ] **Step 3: Update `astro.config.mjs`**

Open `astro.config.mjs`. Make these changes:

1. Remove the import:
```js
import tailwind from "@astrojs/tailwind"
```

2. Add a new import at the top of the imports:
```js
import tailwindcss from "@tailwindcss/vite"
```

3. Remove `tailwind(),` from the `integrations` array.

4. Add a `vite` config block at the top level of `defineConfig`:
```js
vite: {
  plugins: [tailwindcss()],
},
```

Place it next to `integrations`. After these edits, the file should look approximately:

```js
import { defineConfig } from "astro/config"
import vercel from "@astrojs/vercel"

import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import icon from "astro-icon"
import react from "@astrojs/react"

export default defineConfig({
  site: "https://www.kefan.me/",
  srcDir: "./web",
  markdown: {
    shikiConfig: {
      theme: "dark-plus",
      defaultColor: false,
      wrap: true,
    },
  },
  output: "static",
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [
    sitemap(),
    icon({
      iconDir: "./web/icons",
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
```

- [ ] **Step 4: Rewrite `web/styles/global.css`**

Open `web/styles/global.css`. The file currently starts with `@tailwind base; @tailwind components; @tailwind utilities;`. Replace those three lines with:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

Then, after the `@font-face` blocks (around line 52), add a `@theme` block translating the current `tailwind.config.mjs` `theme.extend` settings to CSS-first config:

```css
@theme {
  --font-jbmono: "JetBrains Mono", sans-serif;
  --font-sourcehan: "Source Han Serif", serif;
  --font-pagetitle: "Georgia", "Cambria", "Times New Roman", "Times", "Noto Serif SC ExtraBold", serif;
  --font-article: "Georgia", "Cambria", "Times New Roman", "Times", "Source Han Serif", serif;

  --color-highlight: #4a6c8c;
  --color-light: #f0f0f2;
  --color-background: #f0f0f2;
  --color-textblack: #0c0c0c;

  --animate-pop: pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;

  @keyframes pop {
    0% { transform: scale(0.9); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
}
```

The typography plugin's custom variants (`quoteless`, `quotemargin`, `codeblockwidth`, `bqitalic`, `notebox`) in v4 require a different approach. Add them after the `@theme` block:

```css
@layer utilities {
  /* Reproduce custom typography variants from old tailwind.config.mjs */
  .prose-quoteless blockquote p:first-of-type::before,
  .prose-quoteless blockquote p:first-of-type::after {
    content: none;
  }
  .prose-quotemargin blockquote p {
    margin: 0.5rem 0;
    line-height: 1.6rem;
  }
  .prose-codeblockwidth pre {
    word-break: break-word;
  }
  .prose-bqitalic blockquote {
    font-style: italic;
  }
  .prose-notebox {
    border: 1px solid #d1d5db;
    background-color: #f3f4f6;
    padding: 1rem;
    margin: 2rem 0;
  }
}
```

Also reproduce the default blockquote color override that was in the old typography config:

```css
@layer utilities {
  .prose blockquote {
    font-style: normal;
    color: #374151; /* theme gray-700 */
  }
}
```

Keep the existing `@font-face`, scrollbar styles, body styles, and other custom CSS untouched.

- [ ] **Step 5: Delete `tailwind.config.mjs`**

```bash
rm tailwind.config.mjs
```

- [ ] **Step 6: Regenerate lockfile**

```bash
pnpm install --no-frozen-lockfile
```

Verify in `git diff pnpm-lock.yaml`: `@astrojs/tailwind` removed; `tailwindcss` jumps to v4.x; `@tailwindcss/vite` added.

- [ ] **Step 7: Build and visually inspect**

```bash
pnpm build 2>&1 | tail -20
```

Expected: build succeeds. Look for any Tailwind warnings about unknown classes.

Run preview:
```bash
pnpm preview &
sleep 3
```

Then for each of these routes, open in the browser (or use `curl -s http://localhost:4321/<route>` to inspect HTML output):
- `/`
- `/contact`
- `/cv`
- `/blog`
- one blog post URL (look in `web/content/posts/` for an abbrlink to construct it)
- `/book`
- `/project`

For each: confirm the page renders, header/nav look correct, fonts apply, custom colors (`bg-light`, `text-highlight`, etc.) work.

Kill preview: `pkill -f "astro preview"` (or use the original process group).

- [ ] **Step 8: Check Chinese pages for font fallback**

Visit one of the Chinese-titled posts (e.g., `web/content/posts/再见.md` → the URL pattern is `/blog/<abbrlink>` — check the post's frontmatter for the abbrlink). Confirm Chinese characters render with `Source Han Serif` (not a system fallback). If they don't, the `--font-sourcehan` variable likely isn't being applied; check that the corresponding Tailwind utility class (`font-sourcehan` or equivalent) is still used in the post layout.

- [ ] **Step 9: Verify and commit**

```bash
git status --short
git diff --stat
```

Expected diffs: `astro.config.mjs`, `web/styles/global.css`, `package.json`, `pnpm-lock.yaml`. Deleted: `tailwind.config.mjs`.

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add astro.config.mjs web/styles/global.css package.json pnpm-lock.yaml
git rm tailwind.config.mjs
git commit -m "Migrate Tailwind 3 → 4 with @tailwindcss/vite"
```

---

## Task 5.5: Measurement gate A

**Goal:** Capture post-Tailwind perf so the final delta table can attribute the Tailwind portion of the change.

**Files:**
- Create: `docs/superpowers/audits/scratch/midpoint-perf.md`

- [ ] **Step 1: Clean build and capture build output**

```bash
rm -rf dist/ .astro/ && pnpm build 2>&1 | tee /tmp/midpoint-build.txt
find dist/_astro -type f \( -name "*.js" -o -name "*.css" \) -exec ls -la {} \; | sort -k5 -nr | head -20 > /tmp/midpoint-chunks.txt
du -h dist/ | tail -1 > /tmp/midpoint-dist-total.txt
```

- [ ] **Step 2: Write the midpoint report**

Write `docs/superpowers/audits/scratch/midpoint-perf.md` with the same structure as baseline-perf.md, but headed:

```markdown
# Midpoint perf — after Tailwind 4

Captured: <date>

## Build output
...

## Top chunks
...

## Total dist size
...

## Notes

(Note any per-route size changes vs. baseline. Tailwind 4's tree-shaking is more aggressive; expect CSS bundle to shrink.)
```

Skip Lighthouse here — it only makes sense against deployed production. The final-gate task in Task 14 captures Lighthouse against post-merge deployment.

- [ ] **Step 3: Verify and commit**

```bash
git status --short
```

**STOP. Ask for approval.**

If approved:
```bash
git add docs/superpowers/audits/scratch/midpoint-perf.md
git commit -m "Capture midpoint perf (post Tailwind 4)"
```

---

## Task 6: Astro 5 → 6

**Goal:** Bump Astro and all chained `@astrojs/*` integrations to their latest majors. Pull Vite 7 transitively.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, possibly `astro.config.mjs`, possibly `web/consts.ts` (for `import.meta.env` semantics)
- Reference: https://docs.astro.build/en/guides/upgrade-to/v6/

**Pre-bump checklist (do all before changing versions):**

- [ ] **Step 1: Re-grep for `Astro.glob()`**

```bash
grep -rn "Astro.glob" web/ 2>/dev/null
```

Expected: zero matches. Astro 6 removes `Astro.glob()`. If any exist, replace with `import.meta.glob` or content collections.

- [ ] **Step 2: Check for legacy `<ViewTransitions />`**

```bash
grep -rn "ViewTransitions" web/ 2>/dev/null
```

Expected: zero matches. The legacy `<ViewTransitions />` component is removed in Astro 6; the replacement is `<ClientRouter />` from `astro:transitions`, which Task 9 adds.

- [ ] **Step 3: Note current `import.meta.env` usage**

```bash
grep -rn "import.meta.env" web/ astro.config.mjs 2>/dev/null
```

Expected one hit: `web/consts.ts:17` for `PUBLIC_API_URL`. In Astro 6, `import.meta.env` values are inlined at build, never coerced. The current usage `import.meta.env.PUBLIC_API_URL || "http://localhost:5000"` should still work because string fallback via `||` is JS-level, not Astro-level. Document this so Task 10 (`astro:env`) can take it over cleanly.

- [ ] **Step 4: Check Node version requirement**

Astro 6 requires Node ≥ 22.12.0. Run `node --version`. Should be 22.12.0 or newer. If not, this task is BLOCKED — the user must update Node before proceeding.

Also check `package.json` for an `engines.node` field. If present and below 22.12, update it. If absent, no change here (Vercel uses its project-settings default).

**Bump:**

- [ ] **Step 5: Update `package.json` dependencies**

Update these versions in `dependencies` (use the latest stable at the time of execution; the values below are reference points from the audit):

- `"astro"` → `"^6.3.2"` (or whatever latest is at execution)
- `"@astrojs/react"` → `"^5.0.5"`
- `"@astrojs/vercel"` → `"^10.0.7"`
- `"@astrojs/sitemap"` → `"^3.7.2"`
- `"@astrojs/rss"` → `"^4.0.18"`

To find current latests at execution time, run:
```bash
for p in astro @astrojs/react @astrojs/vercel @astrojs/sitemap @astrojs/rss; do
  echo -n "$p: "; curl -s "https://registry.npmjs.org/$p" | python3 -c "import sys,json; print(json.load(sys.stdin)['dist-tags']['latest'])"
done
```

- [ ] **Step 6: Update `@types/react` if React 19.x has a newer types release**

```bash
for p in @types/react @types/react-dom; do
  echo -n "$p: "; curl -s "https://registry.npmjs.org/$p" | python3 -c "import sys,json; print(json.load(sys.stdin)['dist-tags']['latest'])"
done
```

Match these to current latest in `devDependencies`.

- [ ] **Step 7: Regenerate lockfile**

```bash
pnpm install --no-frozen-lockfile 2>&1 | tail -20
```

Expected: install completes. If peer dependency conflicts arise (e.g., `@astrojs/react@5` demands a specific React version range that conflicts), inspect the error and either bump React or adjust the integration version.

- [ ] **Step 8: Verify `vite` resolved to 7.x**

```bash
grep -m1 "^  vite@" pnpm-lock.yaml
```

Expected: `vite@7.x.x`. If still on 6.x, the Astro bump didn't take — investigate.

- [ ] **Step 9: Build**

```bash
pnpm build 2>&1 | tee /tmp/astro6-build.txt | tail -30
```

Expected: build succeeds. Common failure modes to scan for:
- Removed APIs: `Astro.glob`, legacy content collections (we already migrated). 
- Image service: `fit` behavior changed (default crop). Inspect any `<Image>` calls.
- Heading IDs: GitHub-style trailing hyphens preserved. Check if any anchor links break.
- Routing: trailing-slash behavior on extension URLs changed. Affects RSS (`/rss.xml`) — verify `curl -sI https://localhost:<port>/rss.xml` returns 200 in preview.

If build fails: read the error, identify the breaking change in the Astro 6 migration guide, fix it, retry. Stop and ask the user if the breaking change requires a judgment call.

- [ ] **Step 10: Smoke test in preview**

```bash
pnpm preview &
sleep 3
```

Visit `/`, `/blog`, one post, `/book`, `/project`, `/contact`, `/cv`, `/rss.xml`. Confirm all render. Pay attention to:
- Any image whose aspect ratio relied on `fit: 'contain'` (previously default behavior).
- The RSS feed validates as XML.

Kill preview.

- [ ] **Step 11: Verify and commit**

```bash
git status --short
git diff --stat
```

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add package.json pnpm-lock.yaml
# Plus any code fixes that surfaced during the bump
git commit -m "Upgrade Astro 5 → 6 with chained @astrojs/* bumps"
```

---

## Task 7: Minor bumps (prettier, types, other drifting deps)

**Goal:** Pull all remaining deps to current stable.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Survey what's still outdated**

```bash
pnpm outdated --long 2>&1 | tee /tmp/post-astro6-outdated.txt
```

- [ ] **Step 2: Bump prettier and plugins**

In `package.json` `devDependencies`, bump to latest:
- `prettier` → latest 3.x
- `prettier-plugin-astro` → latest
- `prettier-plugin-classnames` → latest
- `prettier-plugin-merge` → latest
- `prettier-plugin-tailwindcss` → latest
- `@trivago/prettier-plugin-sort-imports` → latest

Get exact versions:
```bash
for p in prettier prettier-plugin-astro prettier-plugin-classnames prettier-plugin-merge prettier-plugin-tailwindcss @trivago/prettier-plugin-sort-imports; do
  echo -n "$p: "; curl -s "https://registry.npmjs.org/$p" | python3 -c "import sys,json; print(json.load(sys.stdin)['dist-tags']['latest'])"
done
```

- [ ] **Step 3: Bump other minor deps**

- `astro-icon` → latest
- `@tailwindcss/typography` → latest 0.5.x
- `ts-pattern` → latest
- `react`, `react-dom` → latest 19.x
- `@vercel/speed-insights` → 2.0.0 (audit verified usage in `web/layouts/MainLayout.astro:2`)

Check `@vercel/speed-insights@2.0` breaking changes (license MIT→Apache-2.0 for v1→v2 was the main one, plus `sampleRate` move to code). Read https://github.com/vercel/speed-insights/releases for v2 specifics. If the codebase uses `sampleRate` config, migrate it.

- [ ] **Step 4: Regenerate lockfile and build**

```bash
pnpm install --no-frozen-lockfile
pnpm build 2>&1 | tail -10
```

- [ ] **Step 5: Run formatter to surface any new prettier behavior**

```bash
pnpm format
git diff --stat
```

If prettier reformats files: that's expected with plugin bumps. Stage them as part of the same commit (it's noise but it's appropriate noise — minor bumps that include formatting plugin changes will rewrite formatting).

- [ ] **Step 6: Verify and commit**

```bash
git status --short
```

**STOP. Present diff. Ask for approval. Highlight any non-trivial diffs (especially reformatted source files).**

If approved:
```bash
git add -A
git commit -m "Minor dep bumps (prettier, types, runtime libs)"
```

---

## Task 8: TS strict + Prettier overrides for `*.astro`

**Goal:** Tighten TypeScript to `astro/tsconfigs/strict` and add the `*.astro` parser override in `.prettierrc`.

**Files:**
- Modify: `tsconfig.json`, `.prettierrc`
- Possibly modify: any file that the strict bump now flags

- [ ] **Step 1: Update `tsconfig.json`**

Change the `extends` line. Current (line 2):
```json
"extends": "astro/tsconfigs/base",
```

To:
```json
"extends": "astro/tsconfigs/strict",
```

Keep the rest of the file as-is. The manual `strictNullChecks: true` becomes redundant (covered by `strict`), but leaving it is harmless. Optionally clean up:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./web/*"]
    }
  }
}
```

- [ ] **Step 2: Run astro check and capture errors**

```bash
pnpm dlx --package=@astrojs/check --package=typescript astro check 2>&1 | tee /tmp/strict-errors.txt | tail -40
```

If `pnpm dlx` mutates `package.json` / `pnpm-lock.yaml`, immediately revert: `git checkout -- package.json pnpm-lock.yaml`.

- [ ] **Step 3: Fix every error**

Walk the errors in `/tmp/strict-errors.txt`. Common patterns the strict preset surfaces:
- **`noImplicitAny`:** parameters without type annotations (e.g., callback args in `.map()` / `.filter()`). Add explicit types or rely on inference where the call site provides them.
- **`noUncheckedIndexedAccess`:** array/object index access now returns `T | undefined`. Add null-checks or non-null assertions only where the surrounding logic guarantees presence.
- **`noImplicitReturns`:** functions with code paths that don't return when the return type isn't `void`. Add explicit `return` statements.

For each error, fix it minimally. Do not refactor unrelated code. If a fix is non-obvious, mark it with a brief comment explaining the why.

After every batch of fixes, re-run `pnpm dlx --package=@astrojs/check --package=typescript astro check` to see progress.

The known existing pattern `HTMLAttributes<any>` in `web/components/Callout.astro:4` can stay if it's the cleanest polymorphic pattern.

- [ ] **Step 4: Update `.prettierrc` with `*.astro` override**

Read current `.prettierrc`. Add (or merge into existing structure) the `overrides` block for `prettier-plugin-astro`:

```json
"overrides": [
  { "files": "*.astro", "options": { "parser": "astro" } }
]
```

Place at the top level of the config. If `overrides` already exists, append the entry.

- [ ] **Step 5: Run formatter to verify the override works**

```bash
pnpm format:check
```

Expected: passes. If fails, run `pnpm format` and inspect the changes — they should be trivial.

- [ ] **Step 6: Build sanity check**

```bash
pnpm build 2>&1 | tail -10
```

- [ ] **Step 7: Verify and commit**

```bash
git status --short
git diff --stat
```

**STOP. Present diff including all the source files that needed type-tightening fixes. Ask for approval.**

If approved:
```bash
git add -A
git commit -m "Tighten TS to astro/tsconfigs/strict + add Prettier *.astro override"
```

---

## Task 9: View Transitions (`<ClientRouter />`)

**Goal:** Add Astro's `<ClientRouter />` for client-side page transitions. Re-init MathJax on `astro:page-load` so math posts still render after a transition.

**Files:**
- Modify: `web/components/Base.astro`

- [ ] **Step 1: Add the ClientRouter import and component to Base.astro**

Open `web/components/Base.astro`. After the `import "../styles/global.css"` line (line 2), add:

```astro
import { ClientRouter } from "astro:transitions"
```

In the rendered HTML output (currently the file's body has no explicit `<head>` wrapper since it IS the head — every element is added to head via the layout that consumes Base). Find a sensible place — after the sitemap link (line 61), before the MathJax `<script>` block (line 84). Add:

```astro
<!-- View Transitions -->
<ClientRouter />
```

- [ ] **Step 2: Add MathJax re-init on `astro:page-load`**

Currently the MathJax script (lines 84–89) is `is:inline async` and runs once on initial page load. With ClientRouter, navigations don't reload the page — MathJax won't re-typeset content on the new page.

Modify the MathJax block to re-typeset on `astro:page-load`. Replace the current block (lines 84–89):

```astro
<!-- MathJax -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
  is:inline
  async></script>
```

With:

```astro
<!-- MathJax -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
  is:inline
  async></script>
<script is:inline>
  document.addEventListener("astro:page-load", () => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise()
    }
  })
</script>
```

Note: this is temporary — Task 12 will further condition the MathJax script onto pages that need math. For now this just keeps MathJax working post-ClientRouter.

- [ ] **Step 3: Build and preview**

```bash
pnpm build 2>&1 | tail -10
pnpm preview &
sleep 3
```

Visit `/` and click through the nav to `/blog`, then click into one post (preferably `Miller-Rabin.md` or another math post), then back to `/`, then `/book`, then back. Check:
- Page transitions feel smooth (no full reload flash).
- Math posts still render formulas correctly after navigating from a non-math page.
- No console errors in browser devtools.

Kill preview.

- [ ] **Step 4: Verify and commit**

```bash
git status --short
git diff web/components/Base.astro
```

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add web/components/Base.astro
git commit -m "Add View Transitions (ClientRouter) and MathJax re-typeset on page-load"
```

---

## Task 10: `astro:env` for `PUBLIC_API_URL`

**Goal:** Replace the single `import.meta.env.PUBLIC_API_URL` usage with the type-safe `astro:env` API.

**Files:**
- Modify: `astro.config.mjs`, `web/consts.ts`

- [ ] **Step 1: Add `env.schema` to `astro.config.mjs`**

Open `astro.config.mjs`. Add a top-level `env` config inside `defineConfig`:

```js
env: {
  schema: {
    PUBLIC_API_URL: {
      context: "client",
      access: "public",
      type: "string",
      default: "http://localhost:5000",
    },
  },
},
```

Place it next to `output: "static"` or another top-level key. Also add the import:

```js
import { envField } from "astro/config"
```

If `envField` isn't needed for the schema syntax (Astro 6 supports plain object schemas), skip it. Confirm the canonical syntax via context7:

```
mcp__plugin_context7_context7__query-docs with the astro lib id, query "astro:env schema config example PUBLIC variable"
```

Final config snippet should be of the form Astro 6 documents.

- [ ] **Step 2: Update `web/consts.ts`**

Open `web/consts.ts`. Replace line 17:

Old:
```ts
export const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:5000"
```

New:
```ts
import { PUBLIC_API_URL } from "astro:env/client"
export const API_BASE_URL = PUBLIC_API_URL
```

The default falls back automatically because of the `default` field in the schema.

- [ ] **Step 3: Verify the type is exposed**

Run:
```bash
pnpm dlx --package=@astrojs/check --package=typescript astro check 2>&1 | tail -10
```

Expected: 0 errors. The `astro:env/client` import resolves to the schema we declared.

Revert lockfile if `pnpm dlx` dirtied it.

- [ ] **Step 4: Build and verify the value is inlined**

```bash
pnpm build 2>&1 | tail -10
grep -r "PUBLIC_API_URL" dist/ 2>/dev/null | head -5
```

Expected: build succeeds. The grep should find the inlined value in the dist (or none, if it was tree-shaken because nothing references API_BASE_URL — possible since OP was the only FE consumer and it's deleted).

Note: with OP deleted, `API_BASE_URL` may be unreferenced and tree-shaken out. That's fine. The astro:env schema is still valid for future consumers.

- [ ] **Step 5: Verify and commit**

```bash
git status --short
git diff astro.config.mjs web/consts.ts
```

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add astro.config.mjs web/consts.ts
git commit -m "Use astro:env for PUBLIC_API_URL"
```

---

## Task 11: CJK font preload — route-aware

**Goal:** Only emit the three CJK font preload `<link>` tags on routes that render Chinese content. Latin-only routes (`/`, `/contact`, `/cv`) drop ≥ 3 MB of cold-cache transfer.

**Files:**
- Modify: `web/components/Base.astro`, `web/layouts/MainLayout.astro`

**Approach:** Detect at render time from `Astro.url.pathname`. Use a hardcoded allow-list — simpler than per-page frontmatter flags. Routes that need CJK: `/blog`, `/blog/...`, `/book`, `/book/...`, `/project`. Routes that don't: `/`, `/contact`, `/cv`. RSS doesn't need preload either (`/rss.xml`).

- [ ] **Step 1: Add the detection logic in Base.astro**

Open `web/components/Base.astro`. After the existing frontmatter block (after line 12, before the closing `---`), add:

```ts
const pathname = Astro.url.pathname
const NEEDS_CJK = (() => {
  if (pathname.startsWith("/blog")) return true
  if (pathname.startsWith("/book")) return true
  if (pathname.startsWith("/project")) return true
  return false
})()
```

- [ ] **Step 2: Conditionally render the CJK preloads**

Currently lines 35–55 render the three CJK preloads unconditionally. Wrap them in `{NEEDS_CJK && (...)}`:

```astro
{
  NEEDS_CJK && (
    <>
      <link
        rel="preload"
        href="/fonts/SourceHanSerifSC-Medium-subset.woff2"
        as="font"
        type="font/woff2"
        crossorigin
      />
      <link
        rel="preload"
        href="/fonts/SourceHanSerifSC-Regular-subset.woff2"
        as="font"
        type="font/woff2"
        crossorigin
      />
      <link
        rel="preload"
        href="/fonts/NotoSerifSC-ExtraBold-subset.woff2"
        as="font"
        type="font/woff2"
        crossorigin
      />
    </>
  )
}
```

The JetBrains Mono preloads (lines 33–34) stay unconditional — they're used everywhere via nav and body font.

- [ ] **Step 3: Build and measure**

```bash
rm -rf dist/ .astro/ && pnpm build 2>&1 | tail -10
```

Inspect emitted HTML on a Latin-only page vs. a CJK page:

```bash
grep -l "SourceHanSerifSC" dist/*.html dist/contact/*.html dist/cv/*.html 2>/dev/null
grep -l "SourceHanSerifSC" dist/blog/*.html dist/book/*.html dist/project/*.html 2>/dev/null
```

(Adjust paths if Astro outputs differently — likely `dist/contact.html` directly.)

Expected: zero matches in Latin-only pages; matches in CJK pages.

Quick file-size check on a Latin-only route's HTML:
```bash
ls -la dist/contact*.html dist/index.html
```

Should be smaller than baseline (no preload tags).

- [ ] **Step 4: Verify Chinese content still renders correctly**

```bash
pnpm preview &
sleep 3
```

Visit `/book` and one booknote (the booknote slug is `web/content/booknotes/<title>.json`'s `id` field or wired via the page's route handler — check `web/pages/book/...`). Confirm Chinese characters render with Source Han Serif. Repeat for one Chinese blog post.

If a CJK route fails to render Chinese with the right font, the preload removal broke font loading on that route — investigate before continuing.

Kill preview.

- [ ] **Step 5: Verify and commit**

```bash
git status --short
git diff web/components/Base.astro
```

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add web/components/Base.astro
git commit -m "Route-aware CJK font preload (skip Latin-only pages)"
```

---

## Task 12: MathJax conditional load

**Goal:** Only inject the MathJax CDN `<script>` on routes whose content contains math syntax (`$...$` or `\(...\)` or `\[...\]`).

**Files:**
- Modify: `web/components/Base.astro`, `web/layouts/MainLayout.astro`, `web/pages/blog/[...slug].astro`

**Approach:** Detect at build time. Each post layout passes `hasMath: boolean` up through the layout chain. Other routes default to `false`. The MathJax `<script>` (and the re-init handler from Task 9) only render when `hasMath` is true.

- [ ] **Step 1: Add `hasMath` to Base.astro Props**

Open `web/components/Base.astro`. Extend the `Props` interface (lines 4–8):

```ts
interface Props {
  title: string
  description: string
  image: string
  hasMath?: boolean
}
```

And the destructure (line 12):

```ts
const { title, description, image, hasMath = false } = Astro.props
```

- [ ] **Step 2: Conditionalize the MathJax block in Base.astro**

Replace the MathJax block (the one from Task 9 — the loader plus the re-init handler) with a conditional:

```astro
{
  hasMath && (
    <>
      <!-- MathJax -->
      <script
        type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        is:inline
        async
      ></script>
      <script is:inline>
        document.addEventListener("astro:page-load", () => {
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise()
          }
        })
      </script>
    </>
  )
}
```

- [ ] **Step 3: Add `hasMath` to MainLayout.astro Props and forward**

Open `web/layouts/MainLayout.astro`. Extend the `Props` interface (lines 9–16) with:

```ts
interface Props {
  tab_title?: string
  tab_description?: string
  tab_icon?: string
  title?: string
  description?: string
  calloutPadding?: string
  hasMath?: boolean
}
```

And the destructure (lines 18–24):

```ts
const {
  tab_title = SITE_TITLE,
  tab_description = SITE_DESCRIPTION,
  tab_icon = SITE_PREVIEW_IMAGE,
  title,
  calloutPadding,
  hasMath = false,
} = Astro.props
```

Forward to Base (line 30):

```astro
<Base title={tab_title} description={tab_description} image={tab_icon} hasMath={hasMath} />
```

- [ ] **Step 4: Detect math in the post layout**

Open `web/pages/blog/[...slug].astro`. Read its current structure first.

The post layout already has access to the post's `body` (the markdown content) via the content collection entry. In the frontmatter, after the post is fetched, detect math:

```ts
const MATH_RE = /\$[^$\n]+\$|\\\(|\\\[/
const hasMath = MATH_RE.test(post.body ?? "")
```

(Adjust the variable name `post` to match the actual binding in `[...slug].astro`.)

Pass to MainLayout:

```astro
<MainLayout title={...} hasMath={hasMath}>
```

- [ ] **Step 5: Build and verify**

```bash
rm -rf dist/ .astro/ && pnpm build 2>&1 | tail -10
```

Verify the MathJax script is in math posts and absent elsewhere:

```bash
grep -l "mathjax" dist/blog/*.html | head -5
grep -L "mathjax" dist/blog/*.html | head -5
```

Expected: math posts (Miller-Rabin, Two Classes, Coding in Wenyan) include the script; others don't. Home, contact, book pages also don't.

Confirm: open `pnpm preview`, visit `Miller-Rabin` — formulas render. Visit a non-math post — page renders fine, no MathJax in source.

- [ ] **Step 6: Verify and commit**

```bash
git status --short
git diff --stat
```

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add web/components/Base.astro web/layouts/MainLayout.astro web/pages/blog/\[...slug\].astro
git commit -m "Conditional MathJax (only on posts containing math syntax)"
```

---

## Task 13: FE CI gate

**Goal:** A GitHub Action that runs `pnpm install --frozen-lockfile` + `pnpm build` + `pnpm astro check` on PRs against `master`. Add `@astrojs/check` and `typescript` to devDeps. Add a `check` script.

**Files:**
- Create: `.github/workflows/fe-check.yml`
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Add `@astrojs/check` and `typescript` to devDependencies**

Get the latest versions:
```bash
for p in @astrojs/check typescript; do
  echo -n "$p: "; curl -s "https://registry.npmjs.org/$p" | python3 -c "import sys,json; print(json.load(sys.stdin)['dist-tags']['latest'])"
done
```

Add to `package.json` `devDependencies`:
- `"@astrojs/check": "^<latest>",`
- `"typescript": "^<latest>",`

- [ ] **Step 2: Add `check` script**

In `package.json` `scripts`, add (alongside the existing `astro` script):

```json
"check": "astro check"
```

- [ ] **Step 3: Regenerate lockfile**

```bash
pnpm install --no-frozen-lockfile
```

Verify with `git diff pnpm-lock.yaml | head` that only the two new packages and their transitive deps are added.

- [ ] **Step 4: Test the check script locally**

```bash
pnpm check
```

Expected: 0 errors, 0 warnings, 0 hints. If anything fails: the prior tasks left an unfixed type error — go back and fix.

- [ ] **Step 5: Create the GitHub Actions workflow**

Create `.github/workflows/fe-check.yml` with this exact content:

```yaml
name: FE Check

on:
  pull_request:
    branches: [master]
    paths:
      - 'web/**'
      - 'package.json'
      - 'pnpm-lock.yaml'
      - 'astro.config.mjs'
      - 'tsconfig.json'
      - 'tailwind.config.mjs'
      - '.github/workflows/fe-check.yml'

jobs:
  check:
    name: Astro check + build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v6

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Astro check
        run: pnpm check

      - name: Build
        run: pnpm build
```

Notes:
- Uses `actions/checkout@v6` matching the existing `deploy.yml` convention.
- The path filter limits this workflow to FE-relevant changes.
- Runs on Node 22 (Astro 6 requirement).

- [ ] **Step 6: Verify YAML is valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/fe-check.yml'))"
```

Expected: no output (YAML parses cleanly).

- [ ] **Step 7: Verify and commit**

```bash
git status --short
```

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add .github/workflows/fe-check.yml package.json pnpm-lock.yaml
git commit -m "Add FE CI gate (astro check + build on PRs)"
```

---

## Task 14: Final measurements + delta summary

**Goal:** Capture post-Phase-2 perf and produce a single delta table comparing baseline, midpoint (post-Tailwind), and final.

**Files:**
- Create: `docs/superpowers/audits/scratch/perf-deltas.md`
- Optionally append a 5-bullet summary to `docs/superpowers/audits/2026-05-13-fe-audit.md` (appending to the existing report; not modifying its findings).

- [ ] **Step 1: Clean build, capture sizes**

```bash
rm -rf dist/ .astro/ && pnpm build 2>&1 | tee /tmp/final-build.txt
find dist/_astro -type f \( -name "*.js" -o -name "*.css" \) -exec ls -la {} \; | sort -k5 -nr | head -20 > /tmp/final-chunks.txt
du -h dist/ | tail -1 > /tmp/final-dist-total.txt
du -sh public/*.woff2 public/*.woff 2>/dev/null > /tmp/final-fonts.txt
```

- [ ] **Step 2: Verify per-route HTML size on Latin-only page dropped**

```bash
ls -la dist/contact*.html dist/cv*.html dist/index.html 2>/dev/null
```

Compare with baseline `dist/` sizes from `/tmp/baseline-build.txt`. Document the delta — expected: Latin-only pages are slightly smaller (no CJK preload tags ≈ 600 bytes per page); JS bundles drop by `/op/` chunks worth (≈ 540 KB raw / ≈ 145 KB gzip wiped).

- [ ] **Step 3: Run Lighthouse against production**

Note: this requires the changes to be deployed. If the branch isn't merged to production yet, this step captures only the staging-equivalent (a `pnpm preview` build is local — not what Lighthouse against prod would see).

Two options:
- **Option A — Local preview Lighthouse:** Run `pnpm preview` and Lighthouse against `localhost:4321`. Captures rendering perf; misses CDN/Vercel optimizations. Acceptable for an internal delta.
- **Option B — Skip Lighthouse here; capture from production after merge.** Note in the report that Lighthouse-on-prod is pending a post-merge re-measurement.

Pick A if the user is local; B if they're not. Document the choice.

- [ ] **Step 4: Build the delta table**

Write `docs/superpowers/audits/scratch/perf-deltas.md`:

```markdown
# Phase 2 perf deltas

| Metric | Baseline | After Tailwind 4 | Final | Δ |
|--------|----------|------------------|-------|---|
| Total dist/ size | <from baseline> | <from midpoint> | <from final> | <delta> |
| Top JS chunk (raw) | <from baseline> | <from midpoint> | <from final> | <delta> |
| Total JS (raw, gzip) | ... | ... | ... | ... |
| Total CSS (raw, gzip) | ... | ... | ... | ... |
| /contact HTML size | ... | ... | ... | ... |
| /index HTML size | ... | ... | ... | ... |

## Notable wins

- **CJK preload removed from Latin-only pages:** /contact, /cv, / no longer fetch 3.3 MB of CJK fonts on cold cache.
- **/op route eliminated:** ~540 KB of OnePiece JS no longer ships.
- **MathJax conditional:** non-math pages no longer fetch ~250 KB of MathJax CDN script.

## Notes

(any caveats: Lighthouse-on-prod pending merge, etc.)
```

- [ ] **Step 5: Append a 5-bullet summary to the audit report**

Open `docs/superpowers/audits/2026-05-13-fe-audit.md`. At the very bottom (after Open Questions), append:

```markdown
---

## Phase 2 outcomes (captured 2026-XX-XX)

(5 bullets summarizing the deltas: what was removed, what shrank, what was added like CI gate, View Transitions, etc.)
```

Keep to 5 bullets, tight.

- [ ] **Step 6: Verify and commit**

```bash
git status --short
```

**STOP. Present diff. Ask for approval.**

If approved:
```bash
git add docs/superpowers/audits/scratch/perf-deltas.md docs/superpowers/audits/2026-05-13-fe-audit.md
git commit -m "Capture Phase 2 perf deltas"
```

---

## Closing tasks (manual, not in commits)

After all 14 numbered tasks complete:

- [ ] **Enable Vercel Skew Protection** in the Vercel dashboard for this project. Settings → Deployment Protection → Skew Protection → enable. No code change. Mark complete in the success criteria checklist.

- [ ] **PR review.** The branch has ~14 commits. Open a PR against `master`. Step through commits; verify CI passes.

- [ ] **After merge:** capture Lighthouse against prod for the three target pages. Append to `perf-deltas.md` and commit on master directly (or via a small follow-up PR).

---

## Success criteria checklist (from spec)

Run through each before declaring Phase 2 complete:

1. [ ] OP gone from FE
2. [ ] Dead components gone
3. [ ] Dead deps gone (`@astrojs/mdx`, `@vercel/analytics`)
4. [ ] `pnpm astro check` exits 0 (no errors / warnings / hints)
5. [ ] Astro 6.x with all chained bumps
6. [ ] Tailwind 4.x via `@tailwindcss/vite`
7. [ ] TS on `astro/tsconfigs/strict`
8. [ ] `<ClientRouter />` integrated; MathJax still works on math posts
9. [ ] `astro:env` schema declared; `web/consts.ts` uses it
10. [ ] CJK preload route-aware; Latin-only pages drop ≥ 3 MB cold-cache transfer
11. [ ] MathJax conditional (non-math pages don't include the script)
12. [ ] FE CI gate live (verify with a deliberately broken test PR)
13. [ ] Vercel Skew Protection toggled on
14. [ ] Perf deltas captured
15. [ ] Working tree clean after every commit; no orphan dist/, .astro/, scratch files committed
