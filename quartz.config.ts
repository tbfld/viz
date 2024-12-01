import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "viz.counter.ink",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "viz.counter.ink",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    generateSocialImages: false,
    theme: {
      fontOrigin: "local", // Changed from googleFonts
      cdnCaching: true,
      typography: {
        header: "Atkinson Hyperlegible",
        body: "Hoefler Text",
        code: "Inconsolata",
      },
      colors: {
        lightMode: {
          light: "#eff1f5",      // Base background
          lightgray: "#404040",  // H2
          gray: "#595959",       // H3
          darkgray: "#737373",   // H4
          dark: "#262626",       // Darkest - for all text
          secondary: "#808080",  // 50% gray for outlines
          tertiary: "#595959",   // Mid-range
          highlight: "rgba(38, 38, 38, 0.1)",  // 10% of dark color
          textHighlight: "#262626", // H1 - Darkest
        },
        darkMode: {
          light: "#1e1e2e",      // Dark mode base
          lightgray: "#404040",  // H2
          gray: "#595959",       // H3
          darkgray: "#737373",   // H4
          dark: "#262626",       // Darkest - for all text
          secondary: "#808080",  // 50% gray for outlines
          tertiary: "#595959",   // Mid-range
          highlight: "rgba(38, 38, 38, 0.1)",  // 10% of dark color
          textHighlight: "#262626", // H1 - Darkest
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config