# Baseline perf — pre-Phase-2

Captured: 2026-05-13
Branch: phase-2-fe-modernization
Commit (HEAD before any phase-2 commits): a1a9185c5c047cd10b6d7b88d07f1abe5f0a1757

## Build output

```
[build] output: "static"
[build] mode: "static"
[build] directory: /Users/kd/Github/mywebsite/dist/
[build] adapter: @astrojs/vercel

 building client (vite)
dist/_astro/index.Bhg9cjbP.js      12.23 kB │ gzip:  4.40 kB
dist/_astro/client.BJjWi__I.js    182.70 kB │ gzip: 57.59 kB
dist/_astro/OnePiece.CT4baDkq.js  358.63 kB │ gzip: 87.80 kB
✓ built in 433ms

 generating static routes
/blog/index.html
/blog/miller-rabin/index.html       ← Miller-Rabin post (abbrlink slug)
/book/index.html
/contact/index.html
/cv/index.html
/op/index.html
/project/index.html
/index.html
[build] 136 page(s) built in 1.94s
[build] Complete!
```

## Top JS/CSS chunks

(Only 4 JS/CSS assets emitted — full list, sorted by size descending)

| File | Raw size | Gzip |
|------|----------|------|
| dist/_astro/OnePiece.CT4baDkq.js | 358,628 B (350 KB) | 87.80 KB |
| dist/_astro/client.BJjWi__I.js   | 182,703 B (178 KB) | 57.59 KB |
| dist/_astro/_slug_.D_FEw4ik.css  |  38,438 B (37.5 KB) | — |
| dist/_astro/index.Bhg9cjbP.js    |  12,225 B (11.9 KB) | 4.40 KB |

Notes:
- `OnePiece.CT4baDkq.js` (350 KB raw) is the One Piece easter-egg component — will be removed in Task 1.
- `client.BJjWi__I.js` (178 KB raw) is the React client bundle.
- Only one CSS chunk generated for the blog slug route.

## Total dist size

12M	dist/

## Font payload

Fonts live in `public/fonts/` (copied verbatim into `dist/fonts/`):

| File | Size |
|------|------|
| NotoSerifSC-ExtraBold-subset.woff2 | 928 KB |
| SourceHanSerifSC-Medium-subset.woff2 | 1.7 MB |
| SourceHanSerifSC-Regular-subset.woff2 | 1.6 MB |
| jbmono-bold.woff2 | 96 KB |
| jbmono-regular.woff2 | 92 KB |
| **Total** | **4.4 MB** |

All fonts are woff2 subsets. No woff fallbacks present. CJK fonts dominate at ~4.2 MB of the 4.4 MB total — Task 11 (route-aware CJK font preload) targets this directly.

## Lighthouse (PageSpeed Insights)

All 6 API calls (3 pages × 2 strategies) returned HTTP 429 (quota exhausted) at capture time (2026-05-13). Rows will be populated in Task 14 (final measurements).

| Page | Strategy | Perf | LCP (ms) | FCP (ms) | CLS | TBT (ms) | Transfer (KB) |
|------|----------|------|----------|----------|-----|----------|---------------|
| / | mobile | n/a (API 429) | n/a | n/a | n/a | n/a | n/a |
| / | desktop | n/a (API 429) | n/a | n/a | n/a | n/a | n/a |
| /blog/miller-rabin | mobile | n/a (API 429) | n/a | n/a | n/a | n/a | n/a |
| /blog/miller-rabin | desktop | n/a (API 429) | n/a | n/a | n/a | n/a | n/a |
| /book | mobile | n/a (API 429) | n/a | n/a | n/a | n/a | n/a |
| /book | desktop | n/a (API 429) | n/a | n/a | n/a | n/a | n/a |

Note: PageSpeed Insights unauthenticated quota was exhausted for all requests. Re-measure in Task 14 against prod post-merge. The build output and chunk sizes above still provide a valid pre-migration baseline for bundle-size deltas.
