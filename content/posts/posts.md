---
title: Posts
publish: false
disabled rules: [yaml-title]
created: 2026-10-03-Sat-5:14pm
updated: 2026-11-10-Tue-7:22pm
---
# How notes get into the book

The blog feed lists every published note. The book (the table-of-contents view) lists notes that have a **book position**: a dot-separated path of integers, e.g. `2000.100.030`. Each segment only means "nested one level deeper, sorted numerically"; labels come from each page's own title, and nothing is hardcoded in the site.

## Two ways to give a note a position

1. **By folder (default; just drag the file).** A note with no `book_position` in a folder whose folder note (`<folder>/<folder>.md`) has `book: true` and a `book_position` gets that position plus `.010`, `.020`, … in filename (date) order. Computed at build time (`quartz/plugins/transformers/folderBookPosition.ts`); nothing is written into the note. Only the immediate folder counts.
2. **By hand (pin an exact spot).** Put `book_position: "<path>"` (quoted) in the note's frontmatter. That alone puts the note in the book (no `book: true` needed), and it always wins over the folder rule. `book: false` opts a note out.

## Where things are

| Position | Page |
| --- | --- |
| `0` | front matter |
| `1000` / `2000` / `3000` | Part I / II / III (chapters at `.100`, `.200`, …) |
| `1000.900` / `2000.900` / `3000.900` | "To file" folder for each Part (`2-main/2.0-to-file-I`, `-II`, `-III`) |
| `4000` | back matter |
| `5000` | `5-to-file/` holding pen: `.100` maps, `.200` charts, `.300` bodies/work, `.400` memes/politics, `.500` art/ephemera, `.900` unsorted |

(A snapshot; each page's own `book_position` is authoritative.) Leave gaps between siblings (100 within a section, 1000 between top-level groups) so something can be inserted without renumbering.

## Filing and housekeeping

- **File a note:** drag it to another folder, e.g. from `5-to-file/5.2-…` to `2-main/2.0-to-file-II`. Nothing else to edit.
- **New Instagram imports** land in `5-to-file/5.9-unsorted` automatically.
- **New pen/group:** make a folder with a note named after it, containing `book: true` and `book_position`. If Folder Notes auto-creates an empty duplicate, keep the one with the position.
- **Group pages list their own entries.** A book page with entries directly beneath it (a Part, a chapter, a pen) shows them automatically under its own text: Title (linked), Image (if it has one), Added, Updated. See `quartz/components/BookIndex.tsx`; nothing to maintain.
- **Regroup a cluster:** change the folder note's position (or a shared prefix on pinned notes).
- **Old URLs keep working:** a note in a `to-file` folder, or imported from Instagram, also answers at `/posts/<name>` (an automatic redirect, so filing never 404s links made when it lived in `posts/`). A note filed somewhere else loses that, as does any other path it used to have. Any other dead URL lands on a 404 page that searches the site for the URL's words (`quartz/util/notFoundSearch.ts`).
- **Gotchas:** in `quartz build --serve`, restart after moving files so siblings renumber. The `order:` field in the template is an unused leftover, not the position.
- The TOC folds any group with more than 8 children (the current page's branch stays open).
