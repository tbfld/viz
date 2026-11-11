import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { QuartzTransformerPlugin } from "../types"

// Derives `book` and `book_position` from the folder a page sits in, so
// moving a file (e.g. by drag-and-drop in Obsidian) is the whole act of
// filing it -- nothing to edit.
//
// Rule: a page with no book_position of its own, whose folder has a folder
// note (<dir>/<dir-name>.md) that has `book: true` and a `book_position`,
// gets that position plus a sequence number: folder position + ".010",
// ".020", ... in filename order (filenames start with a date, so that is
// chronological). Nothing is written to disk; it's recomputed every build.
//
// An explicit book_position on the page always wins (that's how to pin an
// exact spot or order) and is by itself enough to put the page in the book
// (no separate `book: true` needed); `book: false` opts a page out. Only the page's
// immediate folder is consulted, so every folder that should hold derived
// pages needs its own folder note with a position.
//
// Also: a note in a "to-file" folder (or imported from Instagram, i.e. has
// ig_media_id) keeps answering at its old URL, /posts/<name>, via the
// AliasRedirects emitter, so filing a note never 404s links made while it
// still lived in posts/. Folder notes are skipped.
const STEP = 10

function readFrontmatter(fp: string): Record<string, any> | null {
  try {
    return matter(fs.readFileSync(fp, "utf8")).data
  } catch {
    return null
  }
}

const hasPosition = (v: unknown) =>
  (typeof v === "string" || typeof v === "number") && String(v).trim() !== ""

export const FolderBookPosition: QuartzTransformerPlugin = () => ({
  name: "FolderBookPosition",
  markdownPlugins(ctx) {
    // fresh per build, so a moved file is picked up by the next build
    const siblingCache = new Map<string, string[]>()

    // filenames in `dir` that take a derived position, in order
    const derivedSiblings = (dir: string, folderNote: string): string[] => {
      let list = siblingCache.get(dir)
      if (list) return list
      list = fs
        .readdirSync(dir)
        .filter((n) => n.endsWith(".md") && path.join(dir, n) !== folderNote)
        .filter((n) => {
          const fm = readFrontmatter(path.join(dir, n))
          if (!fm) return false
          if (fm.book === false || fm.publish === false || fm.draft === true) return false
          return !hasPosition(fm.book_position)
        })
        .sort()
      siblingCache.set(dir, list)
      return list
    }

    return [
      // keep the pre-filing /posts/<name> URL working
      () => (_tree, file) => {
        const fm: any = file.data.frontmatter
        const fp = file.data.filePath
        if (!fm || !fp) return
        const dirRel = path.posix.relative(ctx.argv.directory, path.posix.dirname(fp))
        const segs = dirRel.split("/").filter(Boolean)
        const name = path.posix.basename(fp, ".md")
        if (segs[segs.length - 1] === name) return // folder note
        const filed = segs.some((s) => s.includes("to-file")) || fm.ig_media_id != null
        if (!filed || segs[0] === "posts") return
        const leaf = String(file.data.slug ?? name).split("/").pop()!
        const alias = path.posix.relative(dirRel, `posts/${leaf}`)
        const existing = Array.isArray(fm.aliases) ? fm.aliases : fm.aliases ? [fm.aliases] : []
        if (!existing.includes(alias)) fm.aliases = [...existing, alias]
      },
      () => (_tree, file) => {
        const fm: any = file.data.frontmatter
        if (!fm || fm.book === false) return
        // a book_position of its own is enough to put a page in the book
        if (hasPosition(fm.book_position)) {
          fm.book = true
          return
        }

        const fp = file.data.filePath!
        const full = path.isAbsolute(fp) ? fp : path.join(file.cwd, fp)
        const dir = path.dirname(full)
        const folderNote = path.join(dir, path.basename(dir) + ".md")
        if (full === folderNote || !fs.existsSync(folderNote)) return

        const parent = readFrontmatter(folderNote)
        if (!parent || parent.book !== true || !hasPosition(parent.book_position)) return

        const idx = derivedSiblings(dir, folderNote).indexOf(path.basename(full))
        if (idx < 0) return

        fm.book = true
        fm.book_position = `${String(parent.book_position).trim()}.${String((idx + 1) * STEP).padStart(3, "0")}`
      },
    ]
  },
})
