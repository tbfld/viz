#!/usr/bin/env python3
"""
Replace spaces with hyphens in every file/folder name under content/.

Why hyphens, not just "no spaces": Quartz's own URL slugifier
(quartz/util/path.ts, sluggify()) already converts spaces to hyphens when
building a page's live URL. Renaming the source file to use a hyphen
produces the *same* slug it already had -- so this is purely a filesystem/
git-level tidy-up, not something that changes any live URL, and needs no
redirects.

Safe to run repeatedly: if nothing has a space, it's a no-op. Uses `git mv`
so renames are tracked as renames (not delete+add) and keep their history.

Used two ways:
  - Run directly (as here) for a one-off cleanup pass.
  - Called by .github/workflows/normalize-filenames.yml on every push, as
    an ongoing backstop that catches anything added another way (a manual
    save from Obsidian on iOS/Mac, a future script, etc.) -- this is the
    routine itself; scripts/instagram_import.py was also fixed separately
    to never generate a space-containing filename in the first place, so
    this should rarely have anything to actually do.
"""
import re
import subprocess
import sys
from pathlib import Path

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content"


def sluggify_name(name: str) -> str:
    """Replace any run of whitespace with a single hyphen. Leaves
    everything else -- case, punctuation, the extension -- untouched."""
    return re.sub(r"\s+", "-", name)


def main() -> int:
    if not CONTENT_DIR.is_dir():
        print(f"No content/ directory at {CONTENT_DIR}", file=sys.stderr)
        return 1

    # Deepest paths first, so a directory's own rename never strands a
    # not-yet-processed child -- every descendant is renamed (using the
    # still-original, not-yet-renamed ancestor path) before its parent is.
    paths = [p for p in CONTENT_DIR.rglob("*") if " " in p.name]
    paths.sort(key=lambda p: len(p.parts), reverse=True)

    if not paths:
        print("No spaces found under content/ -- nothing to do.")
        return 0

    renamed = 0
    for old_path in paths:
        if not old_path.exists():
            continue  # defensive; shouldn't happen given the ordering above
        new_name = sluggify_name(old_path.name)
        if new_name == old_path.name:
            continue
        new_path = old_path.with_name(new_name)
        if new_path.exists():
            print(f"SKIP (target already exists): {old_path} -> {new_path}", file=sys.stderr)
            continue
        subprocess.run(["git", "mv", str(old_path), str(new_path)], check=True)
        print(f"{old_path.relative_to(CONTENT_DIR.parent)} -> {new_path.relative_to(CONTENT_DIR.parent)}")
        renamed += 1

    print(f"\nRenamed {renamed} path(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
