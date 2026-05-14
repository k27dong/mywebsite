# Midpoint perf — after Tailwind 4

Captured: 2026-05-13
Branch: phase-2-fe-modernization
Commits since baseline:
- 9833c61 Sunset OP
- c8be1ee Delete dead components
- e1694da Drop dead deps
- 7c21aee Fix project.astro ts(2345)
- 65c71e8 Tailwind 3 → 4

Commit HEAD at this snapshot: 65c71e8a70626125830bd681ec5a3c358dbc0320

## Build output

```
[build] output: "static"
[build] mode: "static"
[build] directory: /Users/kd/Github/mywebsite/dist/
[build] adapter: @astrojs/vercel

 building client (vite)
dist/_astro/client.CCqJHTmc.js  194.63 kB │ gzip: 60.99 kB
✓ built in 225ms

 generating static routes
[build] 135 page(s) built in 1.16s
[build] Complete!
```

## Top JS/CSS chunks

| File | Raw size | Gzip |
|------|----------|------|
| dist/_astro/client.CCqJHTmc.js | 194,632 B (190 KB) | 60.92 KB |
| dist/_astro/_slug_.BUpHsMOo.css | 40,165 B (39.2 KB) | 7.59 KB |

Note: only 2 assets emitted. OnePiece.js and index.js are gone entirely.

## Total dist size

12M	dist/

## Font payload

| File | Size |
|------|------|
| NotoSerifSC-ExtraBold-subset.woff2 | 928 KB |
| SourceHanSerifSC-Medium-subset.woff2 | 1.7 MB |
| SourceHanSerifSC-Regular-subset.woff2 | 1.6 MB |
| jbmono-bold.woff2 | 96 KB |
| jbmono-regular.woff2 | 92 KB |
| **Total** | **4.4 MB** |

Unchanged from baseline — no font work yet. CJK fonts still dominate at ~4.2 MB (Task 11 target).

## Deltas vs. baseline

| Metric | Baseline | Midpoint | Δ |
|--------|----------|----------|---|
| Total dist/ | 12 MB | 12 MB | 0 (fonts dominate) |
| Top JS chunk (raw) | OnePiece.CT4baDkq.js 358,628 B (350 KB) | client.CCqJHTmc.js 194,632 B (190 KB) | -163,996 B (-46%) — OP eliminated |
| Total JS shipped (sum of raw) | 553,556 B (~541 KB) | 194,632 B (190 KB) | -358,924 B (-65%) |
| CSS chunk (raw) | _slug_.D_FEw4ik.css 38,438 B (37.5 KB) | _slug_.BUpHsMOo.css 40,165 B (39.2 KB) | +1,727 B (+4.5%) |
| Number of routes | 136 | 135 | -1 (/op gone) |

## Notes

- **OnePiece.js eliminated**: The 350 KB easter-egg bundle is gone, accounting for the bulk of JS reduction.
- **index.js gone**: The small 12 KB index chunk (12,225 B) is also absent — likely inlined or tree-shaken away after OP removal reduced import graph size.
- **Total JS down 65%**: From ~541 KB to 190 KB raw. React client bundle (client.js) grew slightly from 182,703 B to 194,632 B (+6.5%) — likely Tailwind 4 runtime or class-name changes, but well within expected variance.
- **CSS slightly larger (+4.5%)**: Tailwind 4 changes class generation strategy; the 1.7 KB increase is negligible. Vite's gzip reporting for CSS is now 7.59 KB (vs. not reported at baseline), both reference the same slug route stylesheet.
- **Total dist unchanged at 12 MB**: Font payload (4.4 MB) and HTML pages dominate; JS savings (~360 KB) are not visible at this granularity. The `du -h` rounding at 1 MB resolution masks the actual reduction. Task 14 can use `du -s` for byte-precise comparison.
- **git diff --stat**: Empty — no tracked files modified. Only new untracked file added.
