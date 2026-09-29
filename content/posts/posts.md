---
title: Posts
---

Quick, dated entries — the reverse-chronological blog view of this project. Anything can start here: a short note, an image, a fragment. Filing a post into the book structure (adding it to a `2.x` section, indexing it) is a separate, later, optional step — never required to post.

To start a new one: use the "new-post" template (Templater), give it a title, write, attach an image with a normal Obsidian embed if you want one, and save. It does NOT publish by default — set `publish: true` in the frontmatter when you want it live.

## Adding a post to the book

By default a post only shows up here, in the reverse-chronological feed. To also place it in the book (the alternate, table-of-contents view), add two fields to its frontmatter:

- `book: true` — includes it in the book.
- `book_section: <name>` — which section it belongs to: one of `anecdata`, `isotype`, `spaces`, `fields`, `bodies`, `worlds`, `interiors`, `ends` (matching the section notes under `2 main/`), or `front matter` / `back matter`.

Optionally, `book_order: <number>` sets its position within that section (lower numbers come first); without it, entries in a section sort by title.

The post stays exactly where it is on disk — nothing needs to move into the `2 main/` folders. `book` and `book_section` are what place it in the book's table of contents.
