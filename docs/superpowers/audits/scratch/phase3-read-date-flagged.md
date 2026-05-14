# Phase 3 — read_date computation results

Captured: 2026-05-14
Branch: phase-3-book-enrichment

For each booknote MD file, `read_date` was computed via:
`git log --diff-filter=A --follow --format="%aI" -- <file> | tail -1 | cut -c1-10`

Cross-checked against `git log --all --diff-filter=A --format="%aI" -- <file> | tail -1`
to detect delete-and-readd cases.

## Summary

- Total processed: 106
- Clean MATCH: 105
- MISMATCH: 1 (see below)
- UNTRACKED: 0
- FOLLOW_ONLY: 0

## Flagged cases

| File | --follow date | --all earliest | Stored | Reason |
|------|---------------|----------------|--------|--------|
| 高祖本纪.md | 2024-03-04 | 2024-03-05 | 2024-03-05 | 1-day delta between --follow and --all; stored the --all value. User: change to 2024-03-04 if you prefer the earlier date. |

## Sanity checks

| Sample | read_date |
|--------|-----------|
| 1Q84 | 2021-05-24 |
| 百年孤独 | 2024-04-13 |
| 三国志通俗演义 | 2023-09-13 |
| 围城 | 2021-01-30 (earliest) |
| 平原 | 2025-09-05 (latest in dataset) |
