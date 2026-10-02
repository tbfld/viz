---
title: Auto timestamps (created / updated)
publish: false
disabled rules: [yaml-title]
---
Like the folder-note exclusions, this is vault-only reference — `content/templates/` is skipped by Quartz's build (`ignorePatterns`) and this note is `publish: false` besides.

## What's set up

**Linter** (community plugin, now enabled) rewrites frontmatter automatically:
- **"Lint on save"** is on — Linter runs every time you save a note, not just when you run it manually.
- Its **YAML Timestamp** rule fills `created` once (only if missing — it won't overwrite a date you set by hand) and refreshes `updated` on every save.
- Format for both was set to **`YYYY-MM-DD`** — date only, no time.

That's the whole mechanism for new/edited notes. You don't need a Templater field, a script, or anything else — saving the file is what triggers it.

**Note on the date-only choice:** older notes (anything from before this was set up, including every imported Instagram post) use `YYYY-MM-DD HH:mm` — date *and* time. Both formats parse fine everywhere that reads them (the site's date sorting, Linter itself), so there's no breakage — but two notes edited on the same day will now show an identical `updated` value with no way to tell which came first from the date alone. Not a problem unless you need that finer ordering somewhere; mentioning it so it's a deliberate choice, not a surprise.

## The site-side safety net

Independently, `quartz.config.ts`'s `CreatedModifiedDate` plugin now also falls back to **git history** if a page's frontmatter dates are ever missing or stale, before falling back to raw filesystem time (which is unreliable in CI — a GitHub Actions checkout resets every file's mtime to the moment of checkout). So even a note that somehow skips Linter still gets an accurate date on the live site, sourced from its actual last commit.

## Where the Linter settings actually live

`.obsidian/plugins/obsidian-linter/data.json` — not tracked in git (`.obsidian/` is gitignored), so it only exists on whatever Mac/device has this vault. If you ever need to see or change the exact rule config (format string, key names, which other rules are on), that's: **Settings → Linter → YAML Timestamp**.
