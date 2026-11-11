import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  // a book group (Part, chapter, "to file" pen): index of its entries, then
  // the full text of everything beneath it, in book order
  afterBody: [Component.BookIndex(), Component.BookReader()],
  footer: Component.Footer({
    aboutPath: "/about",
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({ hideOnRoot: false, showCurrentPage: false }),
    Component.ArticleTitle(),
    Component.ContentMeta({ showReadingTime: false }),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.ModeWidget(),
    Component.Search(),
    Component.DesktopOnly(Component.BookAwareLeft()),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs({ hideOnRoot: false, showCurrentPage: false }), Component.ArticleTitle(), Component.ContentMeta({ showReadingTime: false })],
  left: [
    Component.PageTitle(),
    Component.ModeWidget(),
    Component.Search(),
    Component.DesktopOnly(Component.BookAwareLeft()),
  ],
  right: [],
}
