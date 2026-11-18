import path from "path"
import { QuartzTransformerPlugin } from "../types"
import { FilePath, slugifyFilePath } from "../../util/path"
import { loadMovedMap } from "../../util/movedPages"

// Automatic redirects for moved/renamed notes: reads git history (see
// util/movedPages.ts) and adds each earlier location of a note to its
// `aliases`, which the AliasRedirects emitter turns into redirect pages.
// Nothing is written to the notes. Old locations that are now a different
// live page are skipped.
let reported = false

export const MovedPages: QuartzTransformerPlugin = () => ({
  name: "MovedPages",
  markdownPlugins(ctx) {
    const { map, shallow } = loadMovedMap(ctx.argv.directory)
    const live = new Set<string>(ctx.allSlugs as string[])

    if (!reported) {
      reported = true
      const total = [...map.values()].reduce((n, l) => n + l.length, 0)
      console.log(
        `MovedPages: ${map.size} moved note(s), ${total} old location(s) found in git history` +
          (shallow ? " (WARNING: shallow clone, history incomplete)" : ""),
      )
    }

    return [
      () => (_tree, file) => {
        const fm: any = file.data.frontmatter
        const fp = file.data.filePath
        if (!fm || !fp) return
        const rel = path.posix.relative(ctx.argv.directory, fp)
        const olds = map.get(rel)
        if (!olds) return
        const dirRel = path.posix.dirname(rel)
        const mine = file.data.slug as string
        const existing: string[] = Array.isArray(fm.aliases)
          ? fm.aliases
          : fm.aliases
            ? [fm.aliases]
            : []
        const add: string[] = []
        for (const o of olds) {
          const slug = slugifyFilePath(o as FilePath)
          if (slug === mine || live.has(slug)) continue
          const alias = path.posix.relative(dirRel === "." ? "" : dirRel, slug)
          if (!existing.includes(alias) && !add.includes(alias)) add.push(alias)
        }
        if (add.length) {
          fm.aliases = [...existing, ...add]
        }
      },
    ]
  },
})
