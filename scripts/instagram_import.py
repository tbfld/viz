#!/usr/bin/env python3
"""
Pull new posts from Instagram (via the Instagram API with Instagram Login,
graph.instagram.com) and write each one as a new blog post under content/posts/.

Requires env vars:
  IG_ACCESS_TOKEN   - long-lived Instagram user access token
  IG_USER_ID        - the Instagram user id the token belongs to

State (which media IDs have already been imported) lives in
scripts/instagram_state.json, committed alongside the generated posts so the
next run knows what's new.
"""
import json
import os
import re
import sys
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

import requests

API_VERSION = "v21.0"
GRAPH_BASE = f"https://graph.instagram.com/{API_VERSION}"
REPO_ROOT = Path(__file__).resolve().parent.parent
STATE_PATH = REPO_ROOT / "scripts" / "instagram_state.json"
POSTS_DIR = REPO_ROOT / "content" / "posts"
IMG_DIR = POSTS_DIR / "ig-img"

# Safety valve: cap how many NEW posts we create in one run. Backfilling a
# large history happens automatically over several scheduled runs instead of
# one giant run (avoids hammering the API and creating one enormous commit).
MAX_PER_RUN = int(os.environ.get("IG_MAX_PER_RUN", "40"))

FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url}"


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"imported_ids": []}


def save_state(state: dict) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")


def fetch_all_media(access_token: str, user_id: str) -> list[dict]:
    """Fetch every media item for the account, oldest-last (IG returns newest-first);
    we reverse so posts are created in chronological order."""
    items = []
    url = f"{GRAPH_BASE}/{user_id}/media?" + urlencode(
        {"fields": FIELDS, "access_token": access_token, "limit": 50}
    )
    while url:
        resp = requests.get(url, timeout=30)
        if not resp.ok:
            # Print Instagram's actual error body - the status code alone
            # (what raise_for_status() gives) isn't enough to diagnose.
            print(f"Instagram API error {resp.status_code}: {resp.text}", file=sys.stderr)
        resp.raise_for_status()
        data = resp.json()
        items.extend(data.get("data", []))
        url = data.get("paging", {}).get("next")
        if url:
            time.sleep(0.5)  # be polite; 200 req/hr limit
    items.reverse()  # oldest first
    return items


def slugify(text: str, max_words: int = 6) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    words = re.findall(r"[a-zA-Z0-9]+", text.lower())[:max_words]
    return "-".join(words) if words else ""


def ig_timestamp_to_quartz(ts: str) -> str:
    # IG timestamps look like 2026-09-15T14:22:03+0000
    dt = datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S%z").astimezone(timezone.utc)
    return dt.strftime("%Y-%m-%d %H:%M")


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    dest.write_bytes(resp.content)


def yaml_escape(text: str) -> str:
    return text.replace('"', '\\"').replace("\n", " ").strip()


def build_post(item: dict) -> tuple[str, str]:
    """Returns (filename, file_contents)."""
    media_id = item["id"]
    caption = (item.get("caption") or "").strip()
    permalink = item.get("permalink", "")
    created = ig_timestamp_to_quartz(item["timestamp"])
    date_prefix = created[2:10].replace("-", "")  # YYMMDD

    first_line = caption.split("\n", 1)[0] if caption else ""
    title = (first_line[:70] + "…") if len(first_line) > 70 else first_line
    title = title or f"Instagram post {created[:10]}"
    slug = slugify(first_line) or media_id[-8:]
    filename = f"{date_prefix} ig {slug}.md"

    media_type = item.get("media_type", "IMAGE")
    post_img_dir = IMG_DIR / media_id
    body_media_lines = []

    if media_type == "VIDEO":
        # Not hosting video yet (storage/bandwidth tradeoff) - link out instead,
        # and pull a thumbnail if IG gave us one so the post isn't bare.
        thumb = item.get("thumbnail_url")
        if thumb:
            img_path = post_img_dir / "thumb.jpg"
            download(thumb, img_path)
            rel = f"ig-img/{media_id}/thumb.jpg"
            body_media_lines.append(f"![{yaml_escape(title)}]({rel})")
        body_media_lines.append(f"\n🎥 Video — [view on Instagram]({permalink})")
    else:
        # IMAGE or CAROUSEL_ALBUM
        children = item.get("children", {}).get("data", [item]) if media_type == "CAROUSEL_ALBUM" else [item]
        for i, child in enumerate(children, start=1):
            if child.get("media_type") == "VIDEO":
                continue  # skip video slides within a carousel for now
            media_url = child.get("media_url")
            if not media_url:
                continue
            img_path = post_img_dir / f"img-{i}.jpg"
            download(media_url, img_path)
            rel = f"ig-img/{media_id}/img-{i}.jpg"
            body_media_lines.append(f"![{yaml_escape(title)}]({rel})")

    body = "\n\n".join(body_media_lines)
    if caption:
        body = f"{caption}\n\n{body}" if body else caption
    body += f"\n\n*Originally posted on [Instagram]({permalink}).*\n"

    frontmatter = f"""---
title: "{yaml_escape(title)}"
aliases:
description:
extract: "{yaml_escape(first_line[:160])}"
images: "true"
created: {created}
updated: {created}
order:
author: Ted Byfield
draft: false
publish: true
book: false
book_position:
ig_media_id: "{media_id}"
ig_permalink: "{permalink}"
---

"""
    return filename, frontmatter + body


def main() -> int:
    access_token = os.environ.get("IG_ACCESS_TOKEN")
    user_id = os.environ.get("IG_USER_ID")
    if not access_token or not user_id:
        print("IG_ACCESS_TOKEN and IG_USER_ID must be set", file=sys.stderr)
        return 1

    state = load_state()
    imported = set(state["imported_ids"])

    print("Fetching media list from Instagram…")
    media = fetch_all_media(access_token, user_id)
    new_items = [m for m in media if m["id"] not in imported]
    print(f"{len(media)} total media items, {len(new_items)} not yet imported.")

    batch = new_items[:MAX_PER_RUN]
    if not batch:
        print("Nothing new to import.")
        return 0

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    created_files = []
    for item in batch:
        try:
            filename, contents = build_post(item)
        except Exception as e:
            print(f"Skipping {item['id']}: {e}", file=sys.stderr)
            continue
        out_path = POSTS_DIR / filename
        out_path.write_text(contents)
        created_files.append(out_path)
        imported.add(item["id"])
        print(f"Created {out_path.relative_to(REPO_ROOT)}")

    state["imported_ids"] = sorted(imported)
    save_state(state)

    remaining = len(new_items) - len(batch)
    if remaining > 0:
        print(f"{remaining} more not-yet-imported items left; will continue on the next scheduled run.")

    # Emit a summary GitHub Actions can use for the commit message
    gh_output = os.environ.get("GITHUB_OUTPUT")
    if gh_output:
        with open(gh_output, "a") as f:
            f.write(f"count={len(created_files)}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
