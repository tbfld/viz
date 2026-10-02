---
title: Image storage & naming conventions
publish: false
created: 2026-10-02
updated: 2026-10-02
disabled rules: [yaml-title]
---
This note lives only in the vault — it's in `content/templates/`, which Quartz is configured to skip entirely (`ignorePatterns` in `quartz.config.ts`), and it's marked `publish: false`. It will never appear on the live site. It's a reference for future-you, not content.

## The principle: don't make folders do two jobs

A folder path can only encode *one* hierarchy. But you want to find an image by the post it belongs to, *and* by its theme/subject, *and* by roughly when it was made — three different hierarchies. Trying to force all three into folder structure means either duplicating files across folders or constantly fighting the structure. So the three jobs are split:

- **Folder location** — just enough to keep things physically tidy. Answers "where does this file live."
- **Filename** — carries date and size-variant metadata at a glance, in Finder, in a path, in a script. Answers "what/when is this."
- **Tags / frontmatter** (same mechanism as `book`/`book_position`) — answers "what's this related to," and scales to many-to-many relationships a folder tree can't.

## Where images live

**Instagram-imported images — untouched, bot-managed.** `content/posts/ig-img/<media-id>/img-N.jpg`. Don't rename or move these; `instagram_import.py` owns this folder.

**Images for a manually-written post.** `content/posts/img/<post-filename>/` — one folder per post, named to match the post's own filename, holding only that post's own images. Open the post's folder, see its images; nothing to cross-reference.

**Shared / reference images — not tied to a single post.** `content/4-images/<theme>/` — book figures and recurring research images, organized by subject the same way `AT_DB/03.images_etc/` already is (`isotype/`, `neurath/`, `marey/`, etc.) — reusing a structure you already trust rather than inventing a new one. An image relevant to more than one post or section lives here once and gets tagged/linked from wherever it's used, rather than being duplicated into multiple post folders.

Both `content/posts/img/` and `content/4-images/` are excluded from Folder Notes' auto-create (see `folder-notes-exclusions.md`), so creating a new per-post or per-theme subfolder never spawns a throwaway stub note.

## Filename pattern

```
YYMMDD-descriptive-name[-fpo].ext
```

- **`YYMMDD`** — matches the date style the Instagram imports already use (`260824`, `261001`, …), so everything sorts consistently in Finder regardless of source. This is the image's own date (when it was made/captured/prepared), not necessarily the post's publish date.
- **`descriptive-name`** — your own call, hyphens rather than spaces (URL-safe, and far less annoying in Terminal/scripts — spaces need quoting everywhere). Quartz would slugify spaces anyway on publish, so this just keeps the *source* filename matching what you'll eventually see in a URL. **As of 2026-10-02 this isn't just a filename convention — it's enforced vault-wide**: see the new "No spaces, anywhere" section below.
- **`-fpo`** *(optional)* — "for position only": a placeholder you've dropped in while the real asset isn't ready yet. No suffix at all means "this is the final, full-resolution master" — the common case, so it costs you nothing to type for finished images. When the final version is ready, just rename (drop `-fpo`) and nothing else needs to change, since the markdown reference only needs updating if the filename itself changes.

Examples: `261002-marey-chronophotograph.jpg` (final), `261005-neurath-isotype-grid-fpo.png` (placeholder, final version still to come).

**Note there's no `hires`/`thumb` suffix to type.** That's deliberate — see below.

## Thumbnails are generated, not stored

As of 2026-10-02, the Quartz build generates resized thumbnails automatically (`quartz/plugins/emitters/thumbnails.ts`, using `sharp`, which was already a build dependency) for every image under `content/`, at 160px and 300px square (cropped). They're pure build output — regenerated fresh on every push, never committed to the repo — so:

- You only ever upload/author the one full-resolution image.
- There's never a `-thumb` file to name, misplace, or forget to regenerate after replacing the original.
- The blog index (`content/index.md`, via `quartz/static/js/blog-feed.js`) shows the first image in each post at 160px; the 300px size exists for a future, more visual layout without needing another build change.

If build time ever becomes a problem as the image count grows, the fix is adding a cache keyed on file hash — not something needed yet at this scale.

## No spaces, anywhere (added 2026-10-02)

This isn't limited to images — **every** path under `content/` now gets its spaces replaced with hyphens, automatically. Two mechanisms, both live:

1. **`scripts/normalize_filenames.py`** — a standalone script that walks `content/` and `git mv`s anything with a space in its name to the hyphenated version. Run once (2026-10-02) to clean up the whole existing vault, including the book skeleton (`1 front matter` → `1-front-matter`, `2.4 fields` → `2.4-fields`, etc.) and all the Instagram posts. This was safe to do retroactively because Quartz's own URL slugifier already turns spaces into hyphens when building a page's live URL — so renaming the *source* file's spaces to hyphens produces the exact same URL it already had. No redirects needed, nothing broke.
2. **`.github/workflows/normalize-filenames.yml`** — runs the same script on every push to `v4`, as an ongoing backstop. If anything with a space ever gets added again (a manual save from Obsidian, a future script), it gets fixed automatically and pushed back within a build cycle — you never have to remember to do this by hand.

Also fixed at the source: `instagram_import.py`'s filename generation used to produce `260824 ig <slug>.md` (two literal spaces); it now writes `260824-ig-<slug>.md` directly, so new imports never need the backstop to fix them.

Page **titles** (the YAML `title:` field, what's actually displayed) are completely unaffected by any of this — only the underlying file/folder names changed.

## Credits / rights

Not addressed by this doc — the footer already states `images © their respective owners` sitewide. A per-image credit/attribution field (frontmatter or a sidecar) is part of the still-open "image handling design" pass (captions, credits, layout), not yet built.
