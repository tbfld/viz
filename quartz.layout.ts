import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer({
      sortFn: (a, b) => {
        const nameOrderMap: Record<string, number> = {
          "home": 100,
          "about": 200,
          "projects": 300,
          "blog": 400,
          "contact": 500
          // Add more items as needed
        }

        let orderA = 0
        let orderB = 0

        if (a.file && a.file.slug) {
          orderA = nameOrderMap[a.file.slug] || 0
        } else if (a.name) {
          orderA = nameOrderMap[a.name] || 0
        }

        if (b.file && b.file.slug) {
          orderB = nameOrderMap[b.file.slug] || 0
        } else if (b.name) {
          orderB = nameOrderMap[b.name] || 0
        }

        return orderA - orderB
      }
    })),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer({
      sortFn: (a, b) => {
        const nameOrderMap: Record<string, number> = {
          "issues": 100,
          "minima": 200,
          "methods": 300,
          "maxima": 400,
          "images": 500,
          "glossary": 600,
          "bibliography": 800
          // Add more items as needed
        }

        let orderA = 0
        let orderB = 0

        if (a.file && a.file.slug) {
          orderA = nameOrderMap[a.file.slug] || 0
        } else if (a.name) {
          orderA = nameOrderMap[a.name] || 0
        }

        if (b.file && b.file.slug) {
          orderB = nameOrderMap[b.file.slug] || 0
        } else if (b.name) {
          orderB = nameOrderMap[b.name] || 0
        }

        return orderA - orderB
      }
    })),
  ],
  right: [],
}