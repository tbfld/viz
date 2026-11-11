import { QuartzTransformerPlugin } from "../types"

declare module "vfile" {
  interface DataMap {
    hasImage: boolean
  }
}

// Records whether a note's body embeds an image, as file.data.hasImage, so
// list-like components (the book group index) can show it without
// re-inspecting rendered HTML. Looks at the source: ![[x.jpg]], ![alt](x.png),
// or an <img> tag.
const IMG_EXT = "(?:png|jpe?g|gif|webp|svg|avif|bmp|tiff?)"
const WIKI = new RegExp(`!\\[\\[[^\\]]*\\.${IMG_EXT}(?:[|#][^\\]]*)?\\]\\]`, "i")
const MD = new RegExp(`!\\[[^\\]]*\\]\\([^)]*\\.${IMG_EXT}(?:[?#][^)]*)?\\)`, "i")

export const ImageFlag: QuartzTransformerPlugin = () => ({
  name: "ImageFlag",
  markdownPlugins() {
    return [
      () => (_tree, file) => {
        const body = String(file.value).replace(/^---\n[\s\S]*?\n---\n/, "")
        file.data.hasImage = WIKI.test(body) || MD.test(body) || /<img\s/i.test(body)
      },
    ]
  },
})
