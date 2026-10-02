// Shared helpers for build-time image thumbnailing.
//
// Thumbnails are generated at build time (see plugins/emitters/thumbnails.ts)
// and are never committed to the repo — they're regenerated fresh on every
// build, the same way the Assets emitter copies full-size images. Anything
// that needs to *display* a thumbnail (e.g. the blog-feed JS) derives the
// thumbnail's URL from the full-size image's URL using `thumbnailDestName`
// below, so there is exactly one place that defines the naming scheme.

// this file must be isomorphic (used by both Node-side emitters and
// potentially client-side JS later), so no Node-only imports here.

/** Thumbnail sizes generated for every image, in pixels (square, cropped). */
export const THUMBNAIL_SIZES = [160, 300] as const
export type ThumbnailSize = (typeof THUMBNAIL_SIZES)[number]

/**
 * Given an image's filename or URL path (e.g. "posts/img/my-post/photo.jpg"
 * or "photo.jpg"), return the corresponding thumbnail filename/path for a
 * given size (e.g. "posts/img/my-post/photo-160.jpg"). Works the same way
 * whether given a bare filename (used by the emitter, which generates one
 * thumbnail file per size next to each source image) or a full slug/URL
 * (used by the changelog emitter to compute the <img> src browsers will
 * fetch).
 */
export function thumbnailDestName(nameOrPath: string, size: ThumbnailSize | number): string {
  const lastDot = nameOrPath.lastIndexOf(".")
  if (lastDot === -1) {
    // no extension we can recognize — just append, better than silently
    // pointing at a thumbnail that was never generated
    return `${nameOrPath}-${size}`
  }
  const base = nameOrPath.slice(0, lastDot)
  const ext = nameOrPath.slice(lastDot)
  return `${base}-${size}${ext}`
}

/** Image extensions we generate thumbnails for. Keep in sync with the
 * `IMAGE_EXTS` check in plugins/emitters/thumbnails.ts if you add one. */
export const THUMBNAILABLE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"])

export function isThumbnailableImage(filePathOrUrl: string): boolean {
  const lastDot = filePathOrUrl.lastIndexOf(".")
  if (lastDot === -1) return false
  const ext = filePathOrUrl.slice(lastDot).toLowerCase()
  return THUMBNAILABLE_EXTS.has(ext)
}
