import { execFileSync } from "child_process"

// Finds notes that have been moved or renamed, from git history, so the old
// URLs can redirect to the new ones without anyone maintaining a list.
//
// Every commit on the branch is replayed oldest -> newest. A rename (git's
// own detection, -M) records old path -> new path; chains (A -> B -> C)
// collapse so A and B both end up pointing at C. Because qublish bundles
// moves and edits into one commit, a delete + add of the same filename in a
// single commit also counts as a move, even if git's similarity check
// missed it. A real deletion drops the page's old URLs (nothing to redirect
// to); a path that is live again is never treated as an old location.
//
// Returns: current path -> every earlier path (relative to `contentDir`,
// with the .md extension) the same note has lived at.

export type MovedMap = Map<string, string[]>

type Change = { status: "R" | "D" | "A"; from: string; to: string }

const base = (p: string) => p.slice(p.lastIndexOf("/") + 1)

export function parseGitLog(log: string): Change[][] {
  const commits: Change[][] = []
  let cur: Change[] | null = null
  for (const line of log.split("\n")) {
    if (line.startsWith("\u0001")) {
      cur = []
      commits.push(cur)
      continue
    }
    if (!cur || !line) continue
    const parts = line.split("\t")
    const st = parts[0][0]
    if (st === "R" && parts.length >= 3) cur.push({ status: "R", from: parts[1], to: parts[2] })
    else if (st === "D" && parts.length >= 2) cur.push({ status: "D", from: parts[1], to: "" })
    else if (st === "A" && parts.length >= 2) cur.push({ status: "A", from: "", to: parts[1] })
    // M, C, T: no change of location
  }
  return commits
}

export function buildMovedMap(commitsOldestFirst: Change[][]): MovedMap {
  const old = new Map<string, Set<string>>() // current path -> earlier paths

  for (const changes of commitsOldestFirst) {
    // pair a delete with an add of the same filename in one commit (a move
    // plus edits that git declined to call a rename); only when unambiguous
    const dels = changes.filter((c) => c.status === "D")
    const adds = changes.filter((c) => c.status === "A")
    const moves: Change[] = changes.filter((c) => c.status === "R")
    for (const d of dels) {
      const sameD = dels.filter((x) => base(x.from) === base(d.from))
      const match = adds.filter((a) => base(a.to) === base(d.from))
      if (sameD.length === 1 && match.length === 1) {
        const a = match[0]
        if (adds.filter((x) => base(x.to) === base(a.to)).length === 1) {
          moves.push({ status: "R", from: d.from, to: a.to })
        }
      }
    }
    const moved = new Set(moves.map((m) => m.from))

    for (const m of moves) {
      const set = old.get(m.from) ?? new Set<string>()
      old.delete(m.from)
      set.add(m.from)
      const into = old.get(m.to)
      if (into) for (const p of into) set.add(p)
      set.delete(m.to)
      old.set(m.to, set)
    }
    for (const d of dels) if (!moved.has(d.from)) old.delete(d.from)
  }

  // a path that exists now is a live page, never a redirect source
  // An old path claimed by two different notes (reused for an unrelated note
  // later) is ambiguous, so it redirects nowhere.
  const claims = new Map<string, number>()
  for (const set of old.values()) for (const p of set) claims.set(p, (claims.get(p) ?? 0) + 1)
  const result: MovedMap = new Map()
  for (const [cur, set] of old) {
    const list = [...set].filter((p) => p !== cur && !old.has(p) && claims.get(p) === 1)
    if (list.length) result.set(cur, list)
  }
  return result
}

let cache: { dir: string; map: MovedMap; shallow: boolean } | null = null

export function loadMovedMap(contentDir: string): { map: MovedMap; shallow: boolean } {
  if (cache && cache.dir === contentDir) return cache
  let map: MovedMap = new Map()
  let shallow = false
  try {
    const git = (args: string[]) =>
      execFileSync("git", ["-C", contentDir, "-c", "core.quotepath=false", ...args], {
        encoding: "utf8",
        maxBuffer: 256 * 1024 * 1024,
        stdio: ["ignore", "pipe", "ignore"],
      })
    shallow = git(["rev-parse", "--is-shallow-repository"]).trim() === "true"
    const log = git([
      "log", "--reverse", "-M", "--relative", "--name-status",
      "--format=%x01%h", "--", "*.md",
    ])
    map = buildMovedMap(parseGitLog(log))
  } catch {
    // not a git checkout (or git missing): no redirects, build carries on
  }
  cache = { dir: contentDir, map, shallow }
  return cache
}
