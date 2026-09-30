---
title: Posts
---
Quick, dated entries — the reverse-chronological blog view of this project. Anything can start here: a short note, an image, a fragment. Filing a post into the book structure (adding it to a `2.x` section, indexing it) is a separate, later, optional step — never required to post.

To start a new one: use the "new-post" template (Templater), give it a title, write, attach an image with a normal Obsidian embed if you want one, and save. It does NOT publish by default — set `publish: true` in the frontmatter when you want it live.

## Adding a post to the book

By default a post only shows up here, in the reverse-chronological feed. To also place it in the book (the alternate, table-of-contents view), add two fields to its frontmatter:

- `book: true` — includes it in the book.
- `book_position: "<path>"` — a dot-separated position, e.g. `"2000.100.400"`.

Note: the default template's `order:` field is an old, unused leftover — it is **not** the book position and the book code never reads it. Use `book_position` (and quote it, since something like `2.1.1` isn't valid YAML as a bare number).

There is no fixed meaning per segment, and nothing hardcoded anywhere (not even in the site's code) — a book_position just nests however deep you want, and every node's label is simply that page's own title. So the structure below is today's content, not a rule:

| Position | Page |
| --- | --- |
| `0` | front matter |
| `1000` | Part I |
| `1000.100` | anecdata |
| `1000.200` | isotype |
| `2000` | Part II |
| `2000.100` | spaces |
| `2000.200` | fields |
| `2000.300` | bodies |
| `3000` | Part III |
| `3000.100` | worlds |
| `3000.200` | interiors |
| `3000.300` | ends |
| `4000` | back matter |

(Check the section/Part notes themselves under `2 main/` for the current numbers if this table ever goes stale — it's just a snapshot.)

A post about, say, spaces would get `book_position: "2000.100.100"` — under spaces, first in line. Leave gaps between siblings at every level (100 within a section, 1000 between the handful of top-level groups) so something can always be inserted later without renumbering anything else. "Part I/II/III" are placeholder names on ordinary pages, not a special mechanism — rename them, delete them, or add a Part IV at `1500` any time, purely by editing frontmatter.

Because it's a path, a whole cluster can be regrouped at once by changing a shared prefix (every entry starting `"2000.100."` → `"3000.100."` moves that whole group from spaces to worlds), and a prefix or range is also what a future "generate a PDF from this slice of the book" feature would select on.

The post stays exactly where it is on disk — nothing needs to move into the `2 main/` folders. `book` and `book_position` are what place it in the book's table of contents.
