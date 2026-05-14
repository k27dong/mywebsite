# Phase 3 — Booknote Data Enrichment + CRLF Cleanup — Design

**Date:** 2026-05-14
**Phase:** 3 of 4 (audit → FE modernization → **book enrichment + CRLF** → BE fix)
**Status:** spec, ready for plan-writing
**Reference audit:** `docs/superpowers/audits/2026-05-13-fe-audit.md` (Axis 5: content workflow)

## Goal

Enrich the booknote dataset with three meaningful fields (`year_published`, `country`, `read_date`), normalize line endings across the repo to eliminate diff noise in commit history, and update the `/book` page to surface two of the new fields in place of the current low-value Rating + Tags columns.

## Scope summary

**In scope (five logical commits):**

1. **CRLF normalization** — repo-wide. Add `.gitattributes`, run `git add --renormalize .`, commit.
2. **Schema type additions** — Rust struct in `src/booknote.rs` adds three new optional fields. FE Zod schema in `web/content.config.ts` adds the same three as `z.string().optional()`. Build still passes.
3. **Backfill `year_published` + `country`** — single commit. Drafted by Claude, reviewed by user. Edit all 106 `docs/salt/*.md` frontmatters. Run `cargo run --bin sync_content` to regenerate JSON. Commit MD + JSON together.
4. **Backfill `read_date`** — separate commit because it's computed (not curated). Edit all 106 MD frontmatters with values from git history. Regenerate JSON. Commit.
5. **FE display change** — `web/pages/book/index.astro` replaces "Rating" column with "Year" (`year_published`) and "Tags" column with "Country" (`country`). Tighten Zod fields from `.optional()` to required (post-backfill).

**Rating + tags are preserved** in MD frontmatter, Rust struct, JSON output, and FE schema — just not rendered in the table.

**Out of scope:**
- BE fix work (Phase 4): Lightsail / Caddy / systemd / Infisical / BE API endpoints.
- Other content workflow concerns: the audit's missing `data/op_sanitized.json` is moot post-OP-sunset.
- Individual `/book/<slug>` post pages — schema change is backward-compatible.
- Any visual or layout changes beyond the two-column swap.
- Per-book `/book/<slug>` displaying `read_date` (data is available; display deferred).

## Constraints

- **No commits without explicit user approval** (standing rule). Each of the five commits is a STOP-gate.
- **No effort/time estimates** in the derived plan.
- **Rust changes confined to `src/booknote.rs`** — one file. Do not touch `src/main.rs`, `src/bin/*`, the BE Actix server, or `Cargo.toml`/`Cargo.lock` (cargo build will update Cargo.lock automatically; that's fine).
- Each commit independently revertable.

## Field details

### `year_published` — string (Zod `z.string()`, required post-backfill)

Format conventions:
- Clear modern works: `"1984"`, `"1967"`, `"2003"`.
- Ambiguous ancient works: `"c. 1330"` (三国演义), `"~1791"` (红楼梦), `"14th century"`, `"BCE ~500"`, etc.
- Compilation / posthumous works: use the year of the compilation.
- Multi-author anthologies: use the year of the anthology.

Claude drafts based on each book's title + author. Ambiguous cases flagged in a `phase3-flagged.md` report for user review.

### `country` — string (Zod `z.string()`, required post-backfill)

Format:
- Chinese names: `阿根廷`, `日本`, `中国`, `美国`, `法国`, `德国`, `俄罗斯`, `英国`, etc.
- Multi-country authors (Nabokov, Borges, Calvino, etc.): pick primary nationality, flag for user.
- Stateless / multi-author compilations: `多国` or the first author's country, flag for user.

### `read_date` — string (Zod `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)`, required post-backfill, with `"unknown"` allowed for files with no git history)

Format: `"2021-05-24"` (YYYY-MM-DD).

Computation method:

```bash
git log --diff-filter=A --follow --format="%aI" -- "docs/salt/<filename>.md" | tail -1 | cut -c1-10
```

- `--diff-filter=A`: only "added" commits.
- `--follow`: tracks through renames.
- `tail -1`: oldest add (most recent line is the rightmost rename; oldest is the leftmost).
- `cut -c1-10`: truncate ISO 8601 to date.

**Edge cases handled in the backfill commit:**

| Case | Detection | Action |
|------|-----------|--------|
| Single rename in history | `--follow` handles | Use original add date |
| Delete-then-readd | Compare `--follow` result against `git log --all --diff-filter=A` for the same path | Flag for review; use earlier date if both methods agree on one |
| Untracked file | `git log` returns empty | Set `read_date: "unknown"`, flag |
| Multi-hop renames | Compare results between methods, flag mismatches | Manual review |

A `phase3-read-date-flagged.md` report lists every flagged entry. User scans it after the backfill commit; corrections go in a follow-up commit if needed.

## Schema changes

### `src/booknote.rs` (Rust)

Current `BookNoteFrontmatter` struct (verified):

```rust
pub struct BookNoteFrontmatter {
    pub title: String,
    pub author: String,
    pub format: String,
    pub id: u32,
    pub num: u32,
    pub rating: String,
    pub tags: Vec<String>,
}
```

Phase-3 addition (commit 2 — all three new fields optional during transition):

```rust
pub struct BookNoteFrontmatter {
    pub title: String,
    pub author: String,
    pub format: String,
    pub id: u32,
    pub num: u32,
    pub rating: String,
    pub tags: Vec<String>,
    // NEW (Option during transition; required after backfill):
    pub year_published: Option<String>,
    pub country: Option<String>,
    pub read_date: Option<String>,
}
```

After backfill (commit 5), change the three new fields from `Option<String>` to `String` (required). Sync regenerates JSON. The FE schema follows.

Also update `src/bin/sync_content.rs` (`sync_booknotes()` function): the JSON output is constructed explicitly via a `json!{}` macro that lists each field. New fields will NOT auto-flow from the struct — the macro must be updated to include `year_published`, `country`, and `read_date` keys explicitly.

Current `sync_booknotes()` JSON construction (verified):

```rust
let file_data = json!({
    "title": note.frontmatter.title,
    "author": note.frontmatter.author,
    "id": note.frontmatter.id,
    "notenum": note.frontmatter.num,
    "rating": note.frontmatter.rating,
    "tags": note.frontmatter.tags,
    "content": note.content,
});
```

After commit 2 (additions optional in Rust, still missing from JSON output): add the new fields conditionally or always:

```rust
let file_data = json!({
    "title": note.frontmatter.title,
    "author": note.frontmatter.author,
    "id": note.frontmatter.id,
    "notenum": note.frontmatter.num,
    "rating": note.frontmatter.rating,
    "tags": note.frontmatter.tags,
    "year_published": note.frontmatter.year_published,
    "country": note.frontmatter.country,
    "read_date": note.frontmatter.read_date,
    "content": note.content,
});
```

Note: `format` is in the struct but currently absent from the json! macro. Out of scope to add; leave as-is.

### `web/content.config.ts` (FE)

Initially (commit 2):

```ts
const booknotes = defineCollection({
  loader: glob({ ... }),
  schema: z.object({
    title: z.coerce.string(),
    author: z.string(),
    id: z.number(),
    notenum: z.number(),
    rating: z.coerce.number(),       // kept; not displayed
    tags: z.array(z.string()),        // kept; not displayed
    // NEW (initially optional during transition):
    year_published: z.string().optional(),
    country: z.string().optional(),
    read_date: z.string().optional(),
    content: z.array(/* unchanged */),
  }),
})
```

Final (commit 5): the three new fields become required.

## CRLF normalization details

### `.gitattributes` content (commit 1)

```
# Normalize all text to LF
* text=auto eol=lf

# Explicit overrides
*.md text eol=lf
*.json text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.astro text eol=lf
*.mjs text eol=lf
*.css text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
*.toml text eol=lf

# Binaries
*.woff binary
*.woff2 binary
*.png binary
*.jpg binary
*.jpeg binary
*.webp binary
*.ico binary
*.pdf binary
```

### Renormalize command

```bash
git add --renormalize .
git status --short | wc -l    # estimate of files touched
git commit -m "Normalize line endings to LF (one-time renormalization)"
```

Expected impact: 50+ files cosmetically reformatted in this single commit. Future `git log -p` for those files will be clean.

### Future-PR review tip

After this commit lands, users reviewing history can:
- `git log -w <file>` ignores whitespace changes.
- `git blame --ignore-rev <SHA>` ignores the renormalization commit. We document the commit SHA in `.git-blame-ignore-revs` so `git blame` ignores it by default for tooling that respects that file.

## Backfill workflow

### Step A — Draft (Claude)

For each of 106 `docs/salt/*.md`:
1. Read filename + frontmatter (title + author).
2. Determine `year_published` from title/author knowledge.
3. Determine `country` from author nationality.
4. Append both fields to the existing frontmatter (after `rating:` and `tags:`).

Flagged cases written to `docs/superpowers/audits/scratch/phase3-flagged.md`:
- Ancient works without a definitive year.
- Multi-country authors.
- Stateless authors or multi-author compilations.
- Anything else where Claude is < 80% confident.

### Step B — Sync + commit (Claude, after user review of draft)

```bash
cargo run --bin sync_content
git status --short docs/salt/ web/content/booknotes/
```

User reviews the draft + flagged report. Corrections applied if needed. Commit.

### Step C — `read_date` backfill (separate commit)

```bash
for f in docs/salt/*.md; do
  date=$(git log --diff-filter=A --follow --format="%aI" -- "$f" | tail -1 | cut -c1-10)
  # Compare against --all method, flag mismatches
  # Append read_date to frontmatter
done
```

Flagged cases (delete-readd, multi-hop renames, untracked) written to `docs/superpowers/audits/scratch/phase3-read-date-flagged.md`.

### Step D — Sync + commit

```bash
cargo run --bin sync_content
git status --short
```

User reviews flagged report. Commit.

## Display changes (commit 5)

File: `web/pages/book/index.astro`.

Current `<thead>` row:

```astro
<th class="w-5/12 px-2 py-2 text-left sm:w-auto sm:px-4">Title</th>
<th class="w-5/12 px-1 py-2 text-left sm:w-auto sm:px-4">Author</th>
<th class="w-1/6 px-1 py-2 text-center whitespace-nowrap sm:w-auto sm:px-4">Count</th>
<th class="hidden px-4 py-2 text-center md:table-cell">Rating</th>
<th class="hidden max-w-[30vw] px-4 py-2 text-left md:table-cell">Tags</th>
```

After:

```astro
<th class="w-5/12 px-2 py-2 text-left sm:w-auto sm:px-4">Title</th>
<th class="w-5/12 px-1 py-2 text-left sm:w-auto sm:px-4">Author</th>
<th class="w-1/6 px-1 py-2 text-center whitespace-nowrap sm:w-auto sm:px-4">Count</th>
<th class="hidden px-4 py-2 text-center md:table-cell">Year</th>
<th class="hidden px-4 py-2 text-left md:table-cell">Country</th>
```

Current body cells:

```astro
<td class="font-jbmono hidden px-4 py-2 text-center md:table-cell">
  {book.data.rating.toFixed(1)}
</td>
<td class="hidden max-w-[30vw] px-4 py-2 md:table-cell">
  <div class="flex flex-wrap gap-2 overflow-hidden">
    {book.data.tags.map((tag: string) => (
      <span class="inline-block rounded-sm bg-gray-200 px-2 py-1 text-sm text-gray-700">
        {tag}
      </span>
    ))}
  </div>
</td>
```

After:

```astro
<td class="font-jbmono hidden px-4 py-2 text-center md:table-cell">
  {book.data.year_published}
</td>
<td class="hidden px-4 py-2 md:table-cell">
  {book.data.country}
</td>
```

Mobile: unchanged. Title / Author / Count still visible; Year / Country still hidden via `hidden md:table-cell`.

Final Zod schema tightening (drop `.optional()` from year_published, country, read_date):

```ts
year_published: z.string(),
country: z.string(),
read_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("unknown")),
```

## Success criteria

1. `.gitattributes` exists; line endings normalized; future diffs are stable.
2. All 106 `docs/salt/*.md` frontmatters have `year_published`, `country`, `read_date`.
3. `cargo run --bin sync_content` succeeds; 106 JSON files in `web/content/booknotes/` have the three new fields.
4. `pnpm astro check` passes with required schema (`.optional()` removed for the three new fields).
5. `/book` displays Year + Country columns on desktop. Mobile unchanged.
6. Rating + tags data preserved in JSON; just not rendered.
7. User has reviewed both `phase3-flagged.md` and `phase3-read-date-flagged.md` and applied any corrections.
8. Working tree clean after each commit; no orphan dist/, .astro/, scratch files in commits.

## What comes next

After this phase: Phase 4 (BE fix — Lightsail diagnose and restore) gets its own brainstorm + spec + plan cycle.
