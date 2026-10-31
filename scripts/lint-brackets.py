#!/usr/bin/env python3
"""Lint the Obsidian/Quartz vault for unescaped "[" and other link-like mistakes.

Usage:  python3 scripts/lint-brackets.py [content_dir] [--strict]

ERRORS (exit 1, block the deploy):
  unclosed-wikilink      "[[" with no closing "]]" on the same line
  unresolved-wikilink    [[target]] / ![[file]] that matches no note or file
  undefined-reference    [text][ref] with no "[ref]: url" definition
  undefined-footnote     [^id] used but never defined
  empty-link-target      [text]()
  space-in-link-target   [text](a b)
  unexpanded-shorthand   [FB]/path or [INSTA]/path (use the full URL)

WARNINGS (printed, exit 0 unless --strict):
  stray-wikilink-close   "]]" with no "[["
  bare-numeric-note      [1] used as a footnote (use [^1] and "[^1]: text")
  unused-footnote        [^id]: defined but never referenced
  spaced-angle-url       < https://... > (spaces stop it being a link)
  frontmatter-bracket    "[" or "]" in title/extract/description (shows in previews)
  unbalanced-brackets    a paragraph with more "[" than "]" or vice versa

Skipped: templates/, private/, .obsidian/, and notes with draft: true or publish: false.
Code fences, inline code, HTML comments and $$math$$ are ignored.
Internal failures never block a deploy: if this script itself crashes it exits 0.
"""
import os
import re
import sys

SKIP_DIRS = {"templates", "private", ".obsidian"}
GITHUB = os.environ.get("GITHUB_ACTIONS") == "true"

ERRORS = {
    "unclosed-wikilink", "unresolved-wikilink", "undefined-reference",
    "undefined-footnote", "empty-link-target", "space-in-link-target",
    "unexpanded-shorthand",
}


def blank(m):
    return re.sub(r"[^\n]", " ", m.group(0))


def split_frontmatter(text):
    m = re.match(r"\A---[ \t]*\r?\n.*?\r?\n---[ \t]*(?:\r?\n|\Z)", text, flags=re.S)
    if not m:
        return "", text
    return m.group(0), text[m.end():]


def strip_code(t):
    t = re.sub(r"^([`~]{3,}).*?^\1[`~]*[ \t]*$", blank, t, flags=re.S | re.M)
    t = re.sub(r"<!--.*?-->", blank, t, flags=re.S)
    t = re.sub(r"\$\$.*?\$\$", blank, t, flags=re.S)
    t = re.sub(r"`[^`\n]*`", blank, t)
    return t


def collect(content):
    notes, others = [], []
    for d, dirs, fs in os.walk(content):
        for f in fs:
            full = os.path.join(d, f)
            rel = os.path.relpath(full, content).replace(os.sep, "/")
            (notes if f.lower().endswith(".md") else others).append(rel)
    return notes, others


def build_index(notes, others):
    stems, paths, names = set(), set(), set()
    for r in notes:
        low = r.lower()
        paths.add(low[:-3])
        stems.add(os.path.basename(low)[:-3])
        names.add(os.path.basename(low))
    for r in others:
        low = r.lower()
        paths.add(low)
        names.add(os.path.basename(low))
    return stems, paths, names


def resolves(target, stems, paths, names):
    key = target.strip().replace("\\", "/").lower().lstrip("./").lstrip("/")
    if not key:
        return True
    if key.endswith(".md"):
        key = key[:-3]
    if key in stems or key in paths or key in names:
        return True
    return any(p.endswith("/" + key) for p in paths)


def lint_file(rel, content, index, out):
    stems, paths, names = index
    text = open(os.path.join(content, rel), encoding="utf-8", errors="replace").read()
    fm, body = split_frontmatter(text)
    if re.search(r"^\s*draft:\s*true\b", fm, re.I | re.M) or re.search(r"^\s*publish:\s*false\b", fm, re.I | re.M):
        return
    path = os.path.join(os.path.basename(content), rel).replace(os.sep, "/")
    off = fm.count("\n")

    def add(line, rule, msg):
        out.append((path, line + off, rule, msg))

    # frontmatter fields that become titles / link previews
    for i, l in enumerate(fm.split("\n"), 1):
        if re.match(r"^(title|extract|description):", l) and re.search(r"[\[\]]", l.split(":", 1)[1]):
            out.append((path, i, "frontmatter-bracket", l.strip()[:100]))

    t = strip_code(body)
    lines = t.split("\n")
    refdefs = {m.group(1).lower() for m in re.finditer(r"^\s{0,3}\[([^\]^][^\]]*)\]:", t, flags=re.M)}
    fn_defs, fn_refs, fn_ref_lines = {}, set(), {}

    for i, l in enumerate(lines, 1):
        work = l
        # wikilinks / embeds
        for m in re.finditer(r"!?\[\[([^\]\n]*)\]\]", work):
            name = re.split(r"[|#^]", m.group(1))[0]
            if name.strip() and not resolves(name, stems, paths, names):
                add(i, "unresolved-wikilink", m.group(0)[:100])
        work = re.sub(r"!?\[\[[^\]\n]*\]\]", lambda m: " " * len(m.group(0)), work)
        if "[[" in work:
            add(i, "unclosed-wikilink", l.strip()[:100])
        elif "]]" in work and not re.search(r"\[\^[^\]]*\]\]", work):
            add(i, "stray-wikilink-close", l.strip()[:100])

        # footnote definitions / references
        dm = re.match(r"^(\s{0,3})\[\^([^\]\s]+)\]:", work)
        if dm:
            fn_defs[dm.group(2)] = i
            work = work[:dm.start(2) - 2] + " " * (dm.end() - dm.start(2) + 2) + work[dm.end():]
        for m in re.finditer(r"\[\^([^\]\s]+)\]", work):
            fn_refs.add(m.group(1))
            fn_ref_lines.setdefault(m.group(1), i)
        work = re.sub(r"\[\^[^\]\s]*\]", lambda m: " " * len(m.group(0)), work)

        # inline links
        for m in re.finditer(r"(?<![\[\\])\[([^\[\]\n]*)\]\(([^)\n]*)\)", work):
            url = m.group(2).strip()
            if not url:
                add(i, "empty-link-target", m.group(0)[:100])
            elif re.search(r"\s", url) and not (url.startswith("<") and url.endswith(">")) \
                    and not re.match(r"""^\S+\s+("[^"]*"|'[^']*')$""", url):
                add(i, "space-in-link-target", m.group(0)[:100])
        work2 = re.sub(r"\[[^\[\]\n]*\]\([^)\n]*\)", lambda m: " " * len(m.group(0)), work)

        # reference-style links
        for m in re.finditer(r"\[([^\[\]\n]+)\]\[([^\[\]\n]*)\]", work2):
            if (m.group(2) or m.group(1)).lower() not in refdefs:
                add(i, "undefined-reference", m.group(0)[:100])

        # shorthand placeholders, spaced angle URLs, bare numeric notes
        for m in re.finditer(r"(?<![\\\[])\[([A-Za-z]{2,8})\](?=/)", work2):
            add(i, "unexpanded-shorthand", m.group(0) + " ... (use the full URL)")
        if re.search(r"<\s+https?://[^>\s]+\s*>|<\s*https?://[^>\s]+\s+>", work2):
            add(i, "spaced-angle-url", l.strip()[:100])
        for m in re.finditer(r"(?<![\\\[])\[(\d{1,2})\](?![(\[:])", work2):
            if m.group(1) not in refdefs:
                add(i, "bare-numeric-note", m.group(0) + " ... (use [^n])")

    for ident, ln in fn_ref_lines.items():
        if ident not in fn_defs:
            add(ln, "undefined-footnote", "[^%s]" % ident)
    for ident, ln in fn_defs.items():
        if ident not in fn_refs:
            add(ln, "unused-footnote", "[^%s]:" % ident)

    # paragraph bracket balance
    para, start = [], 1
    for i, l in enumerate(lines + [""], 1):
        if l.strip():
            if not para:
                start = i
            para.append(l)
        elif para:
            p = "\n".join(para)
            p = re.sub(r"!?\[\[[^\]]*\]\]", "", p)
            p = re.sub(r"\[\^[^\]]*\]", "", p)
            p = re.sub(r"\[[^\[\]]*\]\([^)]*\)", "", p)
            if p.count("[") != p.count("]"):
                add(start, "unbalanced-brackets", "%d open / %d close: %s" % (p.count("["), p.count("]"), " ".join(p.split())[:70]))
            para = []


def main(argv):
    strict = "--strict" in argv
    args = [a for a in argv if not a.startswith("--")]
    content = args[0] if args else "content"
    if not os.path.isdir(content):
        print("lint-brackets: no such directory: %s" % content)
        return 0
    notes, others = collect(content)
    index = build_index(notes, others)
    out = []
    checked = 0
    for rel in sorted(notes):
        if set(rel.split("/")[:-1]) & SKIP_DIRS:
            continue
        lint_file(rel, content, index, out)
        checked += 1
    errs = [o for o in out if o[2] in ERRORS]
    warns = [o for o in out if o[2] not in ERRORS]
    for kind, items in (("error", errs), ("warning", warns)):
        for path, line, rule, msg in items:
            if GITHUB:
                print("::%s file=%s,line=%d,title=lint-brackets (%s)::%s" % (kind, path, line, rule, msg))
            else:
                print("%s:%d: %s [%s] %s" % (path, line, kind.upper(), rule, msg))
    print("lint-brackets: %d notes checked, %d error(s), %d warning(s)" % (checked, len(errs), len(warns)))
    return 1 if errs or (strict and warns) else 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except Exception as e:  # never let a bug in the linter block a deploy
        print("lint-brackets: internal error, skipping (%s: %s)" % (type(e).__name__, e))
        sys.exit(0)
