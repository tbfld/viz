# Instagram import pipeline — one-time setup

Automatically pulls new posts from your Instagram account (@quasiviz) into
`content/posts/` as new blog posts, on a schedule, entirely in GitHub Actions
(no Mac required, works from iOS). Runs every 6 hours; token refreshes itself
weekly. First run backfills your whole history, in batches of ~40 posts per
run so it doesn't overload the API or create one giant commit.

## What you need to do once (all in a browser, on any device)

### 1. Create a Meta developer app

1. Go to https://developers.facebook.com/apps and log in with the Facebook/
   Meta account linked to your Instagram.
2. Click **Create App** → choose **Other** → **Consumer** (or whichever
   option leads to "Instagram" as a product — Meta renames these
   occasionally, pick whatever gets you to adding Instagram).
3. Name it something like "viz-counter-ink-import". You don't need a
   business, a privacy policy URL, or anything public-facing — this app
   will only ever access your own account.
		👉🏼 IG2VCI

### 2. Add the Instagram product

1. In the app dashboard, find **Instagram** in the left sidebar → **Add**.
2. Choose **API setup with Instagram Login** (this is the free, read-only
   successor to the old "Basic Display API" — works with a regular personal
   account, no Business/Creator conversion needed).
3. Under **Instagram Testers** (or similarly named — Meta moves this around),
   add your own Instagram account (@quasiviz) as a tester.
4. Open Instagram on your phone → Settings → Apps and Websites → Tester
   Invites (or you'll get a notification) → accept the invite from your new
   app. This step is what lets the app read your account without Meta's
   public App Review process — you're only ever authorizing yourself.

### 3. Generate the access token

Meta's dashboard has a "Generate Token" button for testers under the
Instagram product's setup page once you're accepted as a tester — use that
rather than building the OAuth redirect flow by hand. It gives you a
**short-lived** token directly.

Then exchange it for a **long-lived** token (60 days, refreshable) by
visiting this URL in your browser, filling in your own values:

```
https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=<YOUR_APP_SECRET>&access_token=<SHORT_LIVED_TOKEN>
```

(App secret is on the app dashboard's **App Settings → Basic** page.) The
response is JSON with `access_token` — that's your long-lived token.

While you're on that setup page, also note your **Instagram User ID**
(sometimes shown as `user_id` or `ig_id` right next to the token tool).

### 4. Create a GitHub PAT for secret rotation

The weekly token-refresh job needs to update this repo's own secret, which
the default Actions token isn't allowed to do. Create a narrow one:

1. GitHub.com → your avatar → **Settings** → **Developer settings** →
   **Fine-grained tokens** → **Generate new token**.
2. Resource owner: yourself. Repository access: **Only select repositories**
   → this repo only.
3. Permissions → Repository permissions → **Secrets** → **Read and write**.
   That's the only permission it needs.
4. Generate it and copy the token (starts with `github_pat_`).

### 5. Add the three GitHub secrets

In this repo: **Settings → Secrets and variables → Actions → New repository
secret**, add:

| Name              | Value                             |
| ----------------- | --------------------------------- |
| `IG_ACCESS_TOKEN` | the long-lived token from step 3  |
| `IG_USER_ID`      | the Instagram user ID from step 3 |
| `GH_SECRETS_PAT`  | the fine-grained PAT from step 4  |
|                   |                                   |

### 6. Kick it off

Actions tab → **Import new Instagram posts** → **Run workflow**. Watch the
run; check `content/posts/` afterward for new files, and `scripts/instagram_state.json`
(tracks which media IDs are already imported, so nothing repeats).

After that, it just runs on its own. The token-refresh workflow keeps
`IG_ACCESS_TOKEN` alive indefinitely without you touching it again.

## Current limitations (flagging on purpose, not hiding them)

- **Video / Reels aren't hosted.** A post is created with the thumbnail
  image (if IG provides one) plus a "view on Instagram" link, rather than
  downloading and hosting the video file. Hosting video well (transcoding,
  storage cost, players) is a separate design decision — ask if you want
  that built out.
- **Image captions/credits are plain text for now** — the caption becomes
  the post body, with "Originally posted on Instagram" + a link at the
  bottom. No dedicated caption/credit layout component yet; that's the
  broader "image handling design" work still on the list.
- **No `book_position` is set automatically** — imported posts land in the
  blog feed only, same as any other post. File them into the book by hand
  if/when you want one in there, same as always.
