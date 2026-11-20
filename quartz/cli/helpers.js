import { isCancel, outro } from "@clack/prompts"
import chalk from "chalk"
import { contentCacheFolder } from "./constants.js"
import { spawnSync } from "child_process"
import fs from "fs"

export function escapePath(fp) {
  return fp
    .replace(/\\ /g, " ") // unescape spaces
    .replace(/^".*"$/, "$1")
    .replace(/^'.*"$/, "$1")
    .trim()
}

export function exitIfCancel(val) {
  if (isCancel(val)) {
    outro(chalk.red("Exiting"))
    process.exit(0)
  } else {
    return val
  }
}

export async function stashContentFolder(contentFolder) {
  // SAFETY: this deletes content/ and later replaces it with an older copy,
  // destroying anything saved there in between (pasted images, new folders,
  // edits). Blocked unless you deliberately opt in with QUARTZ_ALLOW_CONTENT_STASH=1
  // (and Obsidian is closed).
  if (process.env.QUARTZ_ALLOW_CONTENT_STASH !== "1") {
    throw new Error(
      "Refusing to " + "stash" + " content/: it can permanently delete files saved there meanwhile. Set QUARTZ_ALLOW_CONTENT_STASH=1 only with Obsidian closed.",
    )
  }
  await fs.promises.rm(contentCacheFolder, { force: true, recursive: true })
  await fs.promises.cp(contentFolder, contentCacheFolder, {
    force: true,
    recursive: true,
    verbatimSymlinks: true,
    preserveTimestamps: true,
  })
  await fs.promises.rm(contentFolder, { force: true, recursive: true })
}

export function gitPull(origin, branch) {
  const flags = ["--no-rebase", "--autostash", "-s", "recursive", "-X", "ours", "--no-edit"]
  const out = spawnSync("git", ["pull", ...flags, origin, branch], { stdio: "inherit" })
  if (out.stderr) {
    throw new Error(chalk.red(`Error while pulling updates: ${out.stderr}`))
  } else if (out.status !== 0) {
    throw new Error(chalk.red("Error while pulling updates"))
  }
}

export async function popContentFolder(contentFolder) {
  // SAFETY: this deletes content/ and later replaces it with an older copy,
  // destroying anything saved there in between (pasted images, new folders,
  // edits). Blocked unless you deliberately opt in with QUARTZ_ALLOW_CONTENT_STASH=1
  // (and Obsidian is closed).
  if (process.env.QUARTZ_ALLOW_CONTENT_STASH !== "1") {
    throw new Error(
      "Refusing to " + "restore" + " content/: it can permanently delete files saved there meanwhile. Set QUARTZ_ALLOW_CONTENT_STASH=1 only with Obsidian closed.",
    )
  }
  await fs.promises.rm(contentFolder, { force: true, recursive: true })
  await fs.promises.cp(contentCacheFolder, contentFolder, {
    force: true,
    recursive: true,
    verbatimSymlinks: true,
    preserveTimestamps: true,
  })
  await fs.promises.rm(contentCacheFolder, { force: true, recursive: true })
}
