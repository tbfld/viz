---
title: Folder note exclusions
publish: false
---
This note lives only in the vault — it's in `content/templates/`, which Quartz is configured to skip entirely (`ignorePatterns` in `quartz.config.ts`), and it's also marked `publish: false` like every folder note. It will never appear on the live site. It's a reference for future-you, not content.

## Background: what's a "folder note"?

In Obsidian, a **folder note** is a note that represents a folder itself — clicking the folder in the file list opens this note instead of just expanding the folder, and it can show a title, intro text, or (via this vault's "folder overview" setup) a live list of what's inside. The **Folder Notes** community plugin is what adds this feature.

Two of its settings matter here:
- **`autoCreate`** (on for this vault) — the plugin creates a folder note automatically for *every* folder it notices, using the vault-wide default template (`content/templates/yaml_headers.md`).
- **Exclude Folders** — a list of folders/patterns where the plugin should behave differently: skip auto-creating a note there, and/or block a folder note from existing there at all.

Auto-create is genuinely useful for the handful of real section folders (`2.1 anecdata`, `2.2 isotype`, etc.) — it's why those have a tidy folder note already. The problem is it fires for *every* folder with no exceptions by default, including ones that only exist as storage and will never be a real page. The worst offender: `content/posts/ig-img/<media-id>/` — the Instagram import script creates one of these per post, so auto-create has been spawning a new throwaway folder note every single time (40+ so far, and climbing forever as more posts import). Those stub notes were already fixed to `publish: false` in the last pass, so they never show up on the live site — but they still clutter the vault's file list and the repo's history, which is what this exclusion is meant to stop at the source.

## How to add an exclusion (GUI)

1. Obsidian → **Settings** → **Community plugins** → find **Folder Notes** → click its gear icon (or open its settings directly).
2. Go to the **Exclude folders** tab.
3. Click **+ Add new**.
4. Choose **Pattern** (covers a folder and everything matching it, including ones that don't exist yet — the right choice for anything that multiplies, like `ig-img`) or **Folder** (one specific folder only, doesn't follow subfolders created later).
5. Set **Path** to the folder/pattern (see the table below for the exact values already in use, and to record a new one).
6. Turn **on** "Disable auto create." Leave "Disable folder note" **off** unless you also want to block anyone from manually turning that folder into a folder note later — auto-create off just stops the automatic spam, it doesn't forbid a deliberate one.
7. Save. Takes effect immediately — no restart needed.

## Current exclusions

| Path | Type | Why |
| --- | --- | --- |
| `posts/ig-img` | Pattern (with subfolders) | One new per-media-ID folder every Instagram import, forever. Never meant to have a real folder note. |

**When the site grows a new folder like this** — storage-only, auto-populated by a script or a plugin, never meant to be a real page — add a row here, then add the matching entry in the plugin's Exclude Folders tab using the steps above. This table is the readable map of what's excluded and why; the plugin's own settings (stored in `.obsidian/plugins/folder-notes/data.json`, not tracked in git) are what actually enforce it, so the two have to be kept in sync by hand — there's no way to make the plugin read its exclusion list from this doc automatically.
