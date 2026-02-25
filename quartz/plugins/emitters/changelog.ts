import { QuartzEmitterPlugin } from "../types"
import { FilePath, FullSlug, joinSegments } from "../../util/path"
import { write } from "./helpers"
import { getDate } from "../../components/Date"
import DepGraph from "../../depgraph"

interface ChangelogEntry {
  title: string
  slug: string
  created: string | null
  updated: string | null
  wordCount: number
  isNew: boolean
  firstParagraph: string
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

      for (const [_, file] of content) {
        // Skip the index page itself
        if (file.data.slug === "index") {
          continue
        }
        
        const text = file.data.text ?? ""
        const frontmatter = file.data.frontmatter
        const slug = file.data.slug!
        const title = frontmatter?.title ?? file.data.filename ?? "Untitled"

        // Get dates
        const createdDate = frontmatter?.created 
          ? new Date(frontmatter.created as string)
          : null
        const updatedDate = getDate(ctx.cfg.configuration, file.data) ?? new Date()

        // Determine if new (created within last 24 hours)
        const now = new Date()
        const isNew = createdDate 
          ? (now.getTime() - createdDate.getTime()) < 24 * 60 * 60 * 1000
          : false

        entries.push({
          title,
          slug: slug ?? "",
          created: createdDate?.toISOString() ?? null,
          updated: updatedDate?.toISOString() ?? null,
          wordCount: countWords(text),
          isNew,
          firstParagraph: getFirstParagraph(text),
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
