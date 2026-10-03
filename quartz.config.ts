import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "viz.counter.ink",
    pageTitlePrefix: "ted byfield > dataviz + its discontents > ",
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
      // TB CHANGED 2026-10-03: real site typography + color system,
      // ported from design-mockups/mockup-fonts.css (pass 1 of the
      // Quartz integration — fonts + color only, no layout changes yet).
      fontOrigin: "local",
      cdnCaching: true,
      typography: {
        header: "Gorton Digital Heavy",
        body: "Bitter",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f5f6f6",
          lightgray: "#d6d8d9",
          gray: "#767a7d",
          darkgray: "#15171a",
          dark: "#15171a",
          secondary: "#3e5c74",
          tertiary: "#6f8fa6",
          highlight: "rgba(62, 92, 116, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#1b1d1f",
          lightgray: "#33363a",
          gray: "#8b8f93",
          darkgray: "#e8e9ea",
          dark: "#e8e9ea",
          secondary: "#7fa6c0",
          tertiary: "#9cc0d6",
          highlight: "rgba(127, 166, 192, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        // "git" sits between frontmatter and filesystem: if a page's own
        // created/updated frontmatter is ever missing or stale, fall back
        // to the real last-commit date from git history rather than the
        // raw file mtime - a GitHub Actions checkout resets every file's
        // mtime to the moment of checkout, so "filesystem" alone would
        // show the same wrong date for every page in that case. This
        // needs full git history, which deploy.yml already fetches
        // (fetch-depth: 0).
        priority: ["frontmatter", "git", "filesystem"],
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
    filters: [Plugin.ExplicitPublish()],
    emitters: [
      Plugin.Changelog(),
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: false,
        enableRSS: true,
        rssLimit: 50,
        rssFullHtml: true,
      }),
      Plugin.Assets(),
      Plugin.Thumbnails(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
