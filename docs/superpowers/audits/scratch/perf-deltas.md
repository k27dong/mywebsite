# Phase 2 perf deltas

Captured: 2026-05-13
Branch: phase-2-fe-modernization
Commits in this phase: 16
HEAD: d0338e2f06b016cb0bb69d14db39ea9c022748dc

## Headline deltas

| Metric | Baseline | After Tailwind 4 | Final | Δ from baseline |
|--------|----------|------------------|-------|-----------------|
| Total dist/ size | 12 MB | 12 MB | 12 MB | 0 (fonts dominate; JS savings < rounding threshold) |
| Route count | 136 | 135 | 135 | -1 (/op gone) |
| JS shipped (raw, sum of chunks) | ~541 KB (553,556 B) | ~190 KB (194,632 B) | ~205 KB (209,611 B) | -344 KB (-62%) |
| JS shipped (gzip, sum) | ~145 KB (87.8+57.6 KB) | ~61 KB (60.92 KB) | ~65 KB (66,374 B) | -80 KB (-55%) |
| Top JS chunk | OnePiece.CT4baDkq.js 350 KB | client.CCqJHTmc.js 190 KB | client.C_wjdFXZ.js 189 KB | -161 KB (-46%) |
| ClientRouter / View Transitions | n/a | n/a | 15,896 B (15.5 KB) gzip 5.4 KB | new in Task 9 |
| CSS chunk (raw) | _slug_.D_FEw4ik.css 38,438 B (37.5 KB) | _slug_.BUpHsMOo.css 40,165 B (39.2 KB) | MainLayout.m1UHSoLS.css 40,250 B (39.3 KB) | +1,812 B (+4.7%) |
| CSS chunk (gzip) | — | 7.59 KB | 7,798 B (7.6 KB) | — |
| / HTML size | ~9.7 KB (est.) | — | 10,112 B (9.9 KB) | ~+0.2 KB |
| /contact HTML size | ~10.1 KB (est.) | — | 10,494 B (10.2 KB) | ~+0.1 KB |
| /cv HTML size | ~24 KB (est.) | — | 25,452 B (24.9 KB) | ~+0.9 KB |
| /blog HTML size | — | — | 18,893 B (18.4 KB) | — |
| /book HTML size | — | — | 122,486 B (119.6 KB) | — |
| /project HTML size | — | — | 19,208 B (18.8 KB) | — |
| Font payload (total) | 4.4 MB | 4.4 MB | 4.4 MB | unchanged |

Notes on JS delta:
- Final is ~15 KB more than midpoint because Task 9 (View Transitions) added the ClientRouter runtime (15,896 B raw / 5.4 KB gzip). This is expected and intentional.
- The React client bundle shrank slightly from midpoint: 194,632 B → 193,715 B (-917 B), likely tree-shaking variance across Astro 6 / Vite 7.

## Cold-cache transfer estimates

| Page | Before (preload all 3 CJK fonts + JBMono) | After (Latin-only — JBMono only) | Δ |
|------|-------------------------------------------|----------------------------------|---|
| /         | ~4.4 MB | ~182 KB (JBMono ×2 = 182 KB) | ~ -4.2 MB |
| /contact  | ~4.4 MB | ~182 KB | ~ -4.2 MB |
| /cv       | ~4.4 MB | ~182 KB | ~ -4.2 MB |

(CJK fonts — SourceHanSerifSC-Regular 1.6 MB, SourceHanSerifSC-Medium 1.7 MB, NotoSerifSC-ExtraBold 928 KB — still preload on /blog, /book, /project where Chinese content renders.)

## Build verification

### Sanity checks — CJK preload (Task 11)

| Route | CJK preload tags | Expected |
|-------|-----------------|----------|
| / | 0 | 0 (Latin-only) |
| /contact | 0 | 0 (Latin-only) |
| /cv | 0 | 0 (Latin-only) |
| /blog | 1 | >0 (CJK content) |
| /project | 1 | >0 (CJK content) |

All pass.

### Sanity checks — MathJax conditional load (Task 12)

| Route | mathjax script tags | Expected |
|-------|---------------------|----------|
| / | 0 | 0 |
| /blog | 0 | 0 (index, no math) |
| /blog/miller-rabin | 1 | 1 (math post) |

All pass. MathJax loads on the 3 math-bearing posts and nowhere else (~132 routes saved a CDN round-trip).

### Final build output

```
[build] output: "static"
[build] mode: "static"
[build] directory: /Users/kd/Github/mywebsite/dist/
[build] adapter: @astrojs/vercel

 building client (vite)
 built in 741ms

 generating static routes
[build] 135 page(s) built in 1.46s
[build] Complete!
```

Total dist/ (du -h): 12 MB (24,320 blocks = ~12.4 MB precise)
Chunks emitted:
- dist/_astro/client.C_wjdFXZ.js — 193,715 B (189 KB) | gzip 59.4 KB
- dist/_astro/ClientRouter.astro_astro_type_script_index_0_lang.CAqDO0tx.js — 15,896 B (15.5 KB) | gzip 5.4 KB
- dist/_astro/MainLayout.m1UHSoLS.css — 40,250 B (39.3 KB) | gzip 7.6 KB

## Notable wins

- **OnePiece eliminated: -358 KB raw JS / -88 KB gzip on /op** (route removed entirely in Task 1; combined with the index.js chunk disappearing, total baseline JS dropped 62% from 554 KB to 210 KB)
- **CJK font preload removed from Latin-only pages (Task 11):** /, /contact, /cv drop ~4.2 MB of cold-cache font transfer each; fonts now only preload on /blog, /book, /project where CJK text actually renders
- **MathJax script removed from non-math pages (Task 12):** ~132 of 135 routes no longer fetch the CDN script (~25 KB); only the 3 math-bearing blog posts load it
- **View Transitions enabled (Task 9):** ClientRouter runtime adds 15.5 KB raw / 5.4 KB gzip in exchange for native SPA-style navigation across the site
- **Stack modernized — Astro 5→6, Vite 6→7, Tailwind 3→4, @astrojs/react 4→5, @astrojs/vercel 9→10 (Tasks 5–7):** no perf regression observed; build time dropped from ~1.94s to ~1.46s (-25%)
- **47 dependency packages removed** (mdx, @vercel/analytics, headlessui, tiny-pinyin + transitives): leaner install, fewer attack vectors, faster CI installs
- **TS strict + astro:env + FE CI gate (Tasks 8, 10, 13):** type safety enforced at compile time; PUBLIC_API_URL validated at build; astro check + type-check + format:check run in CI before merge

## Lighthouse (PageSpeed Insights) — status

PageSpeed Insights unauthenticated API returned HTTP 429 (quota exhausted) for all requests at capture time (2026-05-13) — same outcome as baseline (Task 0). The branch has not yet been merged to master, so production still serves the pre-migration site. Lighthouse numbers from production would reflect baseline, not final. Deferred to post-merge.

The bundle-size deltas above (62% JS reduction, 4.2 MB cold-cache font savings on Latin routes, conditional MathJax) provide the meaningful signal for this phase. LCP improvements from font preload changes should be measurable post-merge via RUM or a fresh PSI run with a different API key.
