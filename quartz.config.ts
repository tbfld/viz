import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "🪴 Quartz 4.0",
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
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Atkinson Hyperlegible",
        body: "Hoefler Text",
        code: "Inconsolata",
      },
      colors: {
        lightMode: {
          light: "#eff1f5",      // Catppuccin Latte base
          lightgray: "#9ca0b0",  // Catppuccin Latte subtext0
          gray: "#7c7f93",       // Catppuccin Latte overlay1
          darkgray: "#4c4f69",   // Catppuccin Latte text
          dark: "#179299",       // Catppuccin Latte teal
          secondary: "#8839ef",  // Catppuccin Latte mauve
          tertiary: "#40a02b",   // Catppuccin Latte green
          highlight: "rgba(136, 57, 239, 0.15)",
          textHighlight: "#ea76cb88", // Catppuccin Latte pink with opacity
        },
        darkMode: {
          light: "#1e1e2e",      // Catppuccin Mocha base
          lightgray: "#6c7086",  // Catppuccin Mocha subtext0
          gray: "#7f849c",       // Catppuccin Mocha overlay1
          darkgray: "#cdd6f4",   // Catppuccin Mocha text
          dark: "#94e2d5",       // Catppuccin Mocha teal
          secondary: "#cba6f7",  // Catppuccin Mocha mauve
          tertiary: "#a6e3a1",   // Catppuccin Mocha green
          highlight: "rgba(203, 166, 247, 0.15)",
          textHighlight: "#f5c2e788", // Catppuccin Mocha pink with opacity
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