---
title: Posts
---

Quick, dated entries — the reverse-chronological blog view of this project. Anything can start here: a short note, an image, a fragment. Filing a post into the book structure (adding it to a `2.x` section, indexing it) is a separate, later, optional step — never required to post.

To start a new one: use the "new-post" template (Templater), give it a title, write, attach an image with a normal Obsidian embed if you want one, and save. It does NOT publish by default — set `publish: true` in the frontmatter when you want it live.

## Adding a post to the book

By default a post only shows up here, in the reverse-chronological feed. To also place it in the book (the alternate, table-of-contents view), add two fields to its frontmatter:

- `book: true` — includes it in the book.
- `book_position: "<path>"` — a dot-separated position, e.g. `"2.3.400"`. It both places the entry (which section) and orders it (where within that section) in one field.

The first one or two segments map to the book's existing structure:

| Segment | Section |
| --- | --- |
| `1` | front matter |
| `2.1` | anecdata |
| `2.2` | isotype |
| `2.3` | spaces |
| `2.4` | fields |
| `2.5` | bodies |
| `2.6` | worlds |
| `2.7` | interiors |
| `2.8` | ends |
| `3` | back matter |

Everything after that is the entry's own slot: `book_position: "2.3.400"` places a post 400th within "spaces." Leave gaps between entries (hundreds work well — 100, 200, 300…) so a new one can be inserted later (say, 250) without renumbering anything else. A fourth segment (`"2.3.400.100"`) is there if you ever need to nest one entry under another.

Because it's a path rather than a single number, a whole cluster of entries can be regrouped at once by changing their shared prefix (everything starting `"2.3."` → `"2.6."` moves that whole group from spaces to worlds), and a prefix or range is also what a future "generate a PDF from this slice of the book" feature would select on.

The post stays exactly where it is on disk — nothing needs to move into the `2 main/` folders. `book` and `book_position` are what place it in the book's table of contents.
