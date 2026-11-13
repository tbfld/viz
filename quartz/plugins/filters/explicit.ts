import { QuartzFilterPlugin } from "../types"

export const ExplicitPublish: QuartzFilterPlugin = () => ({
  name: "ExplicitPublish",
  shouldPublish(_ctx, [_tree, vfile]) {
    const publish = vfile.data?.frontmatter?.publish
    if (publish === true || publish === "true") return true

    // TB ADDED 2026-11-12: `publish: preview` marks a note that should render
    // in a LOCAL preview only. It counts as published only when the build is
    // started with QUARTZ_PREVIEW=1 (the "local preview" shell command sets
    // it). The GitHub Actions deploy never sets it, so a preview note that
    // gets committed and pushed (qublish, `quartz sync`, iOS) still stays off
    // the live site. To publish for real, change it to `publish: true`.
    return publish === "preview" && process.env.QUARTZ_PREVIEW === "1"
  },
})
