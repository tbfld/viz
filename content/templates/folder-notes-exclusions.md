---
title: Folder note exclusions
publish: false
---
Obsidian's **Folder Notes** plugin auto-creates a note for every folder it notices (using the vault-wide default template, `content/templates/yaml_headers.md`). That's useful for real section folders, but it's pure noise for folders that exist purely as storage — most notably `content/posts/ig-img/<media-id>/`, which gets a brand-new one every time a post imports (one per Instagram post, forever).

These auto-created notes already don't publish to the live site (the default template sets `publish: false`), but they still clutter the vault and the repo. The fix is the plugin's own **Exclude Folders** feature, which turns off auto-create per folder or per pattern.

## How to add an exclusion (GUI)

1. Obsidian → **Settings** → **Community plugins** → find **Folder Notes** → click its gear icon (or open its settings directly).
2. Go to the **Exclude folders** tab.
3. Click **+ Add new**.
4. Choose **Pattern** (covers a folder and everything matching it, including ones that don't exist yet - the right choice for anything that multiplies, like `ig-img`) or **Folder** (one specific folder only).
5. Set **Path** to the folder/pattern (see table below for the exact values to use).
6. Turn **on** "Disable auto create." Leave "Disable folder note" **off** unless you also want to block someone from manually turning that folder into a folder note later.
7. Save. Takes effect immediately - no restart needed.

## Current exclusions

| Path | Type | Why |
| --- | --- | --- |
| `posts/ig-img` | Pattern (with subfolders) | One new per-media-ID folder every Instagram import, forever. Never meant to have a real folder note. |

**When the site grows a new folder like this** (storage-only, auto-populated, not meant to be a real page) — add a row here, then add the matching entry in the plugin's Exclude Folders tab using the steps above. This table is the readable map of what's excluded and why; the plugin's own settings are what actually enforces it, so the two need to be kept in sync by hand.
