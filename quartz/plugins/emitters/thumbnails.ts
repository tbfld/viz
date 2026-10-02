import { FilePath, joinSegments, slugifyFilePath } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import { glob } from "../../util/glob"
import DepGraph from "../../depgraph"
import { Argv } from "../../util/ctx"
import { QuartzConfig } from "../../cfg"
import { THUMBNAIL_SIZES, thumbnailDestName, isThumbnailableImage } from "../../util/thumbnails"

// Generates small, fixed-size (square, cropped) thumbnails for every image
// under content/ at build time, using the same source-file glob as the
// Assets emitter. Thumbnails are build output only — never committed to the
// repo — so they're always in sync with whatever images currently exist and
// never need manual regeneration or cache-busting.
//
// Naming: for a source image that Assets would copy to `foo/bar.jpg`, this
// writes `foo/bar-160.jpg` and `foo/bar-300.jpg` alongside it (see
// util/thumbnails.ts for the one shared naming function both this emitter
// and the Changelog emitter use, so they can never drift out of sync).

const filesToThumbnail = async (argv: Argv, cfg: QuartzConfig) => {
  const fps = await glob("**", argv.directory, ["**/*.md", ...cfg.configuration.ignorePatterns])
  return fps.filter((fp) => isThumbnailableImage(fp))
}

export const Thumbnails: QuartzEmitterPlugin = () => {
  return {
    name: "Thumbnails",
    getQuartzComponents() {
      return []
    },
    async getDependencyGraph(ctx, _content, _resources) {
      const { argv, cfg } = ctx
      const graph = new DepGraph<FilePath>()

      const fps = await filesToThumbnail(argv, cfg)

      for (const fp of fps) {
        const ext = path.extname(fp)
        const src = joinSegments(argv.directory, fp) as FilePath
        const name = slugifyFilePath(fp as FilePath, true) + ext

        for (const size of THUMBNAIL_SIZES) {
          const dest = joinSegments(argv.output, thumbnailDestName(name, size)) as FilePath
          graph.addEdge(src, dest)
        }
      }

      return graph
    },
    async emit({ argv, cfg }, _content, _resources): Promise<FilePath[]> {
      const fps = await filesToThumbnail(argv, cfg)
      const res: FilePath[] = []

      for (const fp of fps) {
        const ext = path.extname(fp)
        const src = joinSegments(argv.directory, fp) as FilePath
        const name = slugifyFilePath(fp as FilePath, true) + ext

        for (const size of THUMBNAIL_SIZES) {
          const destName = thumbnailDestName(name, size) as FilePath
          const dest = joinSegments(argv.output, destName) as FilePath
          const dir = path.dirname(dest)
          await fs.promises.mkdir(dir, { recursive: true })

          try {
            await sharp(src).resize(size, size, { fit: "cover" }).toFile(dest)
            res.push(dest)
          } catch (err) {
            // Don't fail the whole build over one unreadable/corrupt image —
            // report it clearly in the build log and keep going, same spirit
            // as the Instagram importer's "don't crash on one bad post" rule.
            console.error(`[Thumbnails] failed to generate ${size}px thumbnail for ${src}: ${err}`)
          }
        }
      }

      return res
    },
  }
}
