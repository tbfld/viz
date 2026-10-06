import { Root } from "hast"
import { visit } from "unist-util-visit"
import { QuartzEmitterPlugin } from "../types"
import { FilePath, FullSlug, joinSegments } from "../../util/path"
import { write } from "./helpers"
import { getDate } from "../../components/Date"
import DepGraph from "../../depgraph"
import { parseLooseDate } from "../../util/dates"
import { THUMBNAIL_SIZES, thumbnailDestName, isThumbnailableImage } from "../../util/thumbnails"

interface ChangelogEntry {
  title: string
  slug: string
  created: string | null
  updated: string | null
  wordCount: number
  isNew: boolean
  firstParagraph: string
  // URLs of the first image in the post, resized by the Thumbnails emitter
  // (see util/thumbnails.ts). null when the post has no image. Keyed by
  // pixel size so any consumer (the blog index today, something else later)
  // can pick the size it wants without a second build-time change.
  thumbnails: Record<number, string> | null
}

/** `new Date(someUnparseableString)` doesn't throw — it silently produces an
 * Invalid Date, which only blows up later, on `.toISOString()`. A single
 * unparseable `created`/`updated` value (an old note's "2026-10-04-Sun-2:50pm"
 * timestamp format, say) used to crash this entire emitter and take out the
 * whole build. Treat an invalid date the same way the rest of the pipeline
 * already treats a missing one. */
function safeISOString(date: Date | null): string | null {
  if (!date || isNaN(date.getTime())) return null
  return date.toISOString()
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length
}

function getFirstParagraph(text: string): string {
  const paragraphs = text.split(/\n\n+/)
  for (const p of paragraphs) {
    const trimmed = p.trim()
    if (trimmed.length > 0) {
      // Strip markdown formatting for cleaner preview
      return trimmed
        .replace(/^#+\s+/gm, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .substring(0, 200)
    }
  }
  return ""
}

/** Find the `src` of the first <img> in a rendered post, if any. By the time
 * emitters run, CrawlLinks has already resolved it to the final browser-
 * facing URL (handles the vault-root-relative-slug quirk, "shortest" link
 * resolution, etc.), so we can use it as-is. */
function getFirstImageSrc(tree: Root): string | null {
  let found: string | null = null
  visit(tree, "element", (node) => {
    if (found) return
    if (node.tagName === "img" && typeof node.properties?.src === "string") {
      found = node.properties.src
    }
  })
  return found
}

function getThumbnails(firstImageSrc: string | null): Record<number, string> | null {
  if (!firstImageSrc || !isThumbnailableImage(firstImageSrc)) return null
  const thumbs: Record<number, string> = {}
  for (const size of THUMBNAIL_SIZES) {
    thumbs[size] = thumbnailDestName(firstImageSrc, size)
  }
  return thumbs
}

export const Changelog: QuartzEmitterPlugin = () => {
  return {
    name: "Changelog",
    async getDependencyGraph(ctx, content, _resources) {
      const graph = new DepGraph<FilePath>()

      for (const [_, file] of content) {
        const sourcePath = file.data.filePath!
        const outputPath = joinSegments(ctx.argv.output, "changelog.json") as FilePath
        graph.addEdge(sourcePath, outputPath)
      }

      return graph
    },
    async emit(ctx, content, _resources) {
      const entries: ChangelogEntry[] = []

      for (const [tree, file] of content) {
        // Skip the index (blog) and changelog pages themselves
        if (file.data.slug === "index" || file.data.slug === "changelog") {
          continue
        }

        const text = file.data.text ?? ""
        const frontmatter = file.data.frontmatter
        const slug = file.data.slug!
        const title = frontmatter?.title ?? file.data.filename ?? "Untitled"

        // Get dates
        const createdDate = frontmatter?.created
          ? parseLooseDate(frontmatter.created)
          : null
        const updatedDate = getDate(ctx.cfg.configuration, file.data) ?? new Date()

        // Determine if new (created within last 24 hours)
        const now = new Date()
        const isNew =
          createdDate && !isNaN(createdDate.getTime())
            ? now.getTime() - createdDate.getTime() < 24 * 60 * 60 * 1000
            : false

        const firstImageSrc = getFirstImageSrc(tree)

        // `extract` is a hand-written override for the blog-view teaser —
        // useful for a post whose auto-extracted first paragraph (an
        // Instagram caption, say) isn't a good teaser, or one you want to
        // improve after the fact without touching the post body. Falls
        // back to the auto-extracted paragraph when absent, so most posts
        // never need to set it.
        const rawExtract = frontmatter?.extract
        const extract = typeof rawExtract === "string" ? rawExtract.trim() : ""
        const teaser = extract.length > 0 ? extract : getFirstParagraph(text)

        entries.push({
          title,
          slug: slug ?? "",
          created: safeISOString(createdDate),
          updated: safeISOString(updatedDate),
          wordCount: countWords(text),
          isNew,
          firstParagraph: teaser,
          thumbnails: getThumbnails(firstImageSrc),
        })
      }

      // Sort by updated date, newest first
      entries.sort((a, b) => {
        const dateA = a.updated ? new Date(a.updated).getTime() : 0
        const dateB = b.updated ? new Date(b.updated).getTime() : 0
        return dateB - dateA
      })

      const emitted: FilePath[] = []
      emitted.push(
        await write({
          ctx,
          content: JSON.stringify(entries, null, 2),
          slug: "changelog" as FullSlug,
          ext: ".json",
        }),
      )

      return emitted
    },
    getQuartzComponents: () => [],
  }
}
