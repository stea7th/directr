# The Directr Second Brain — 30-Minute Obsidian Setup

Built for one person: a solo founder shipping Directr (an AI short-form content tool) while also being a creator who posts on TikTok, Reels, and Shorts.

Your ideas leak in three specific places:

1. **Hook ideas** hit you at random — in the shower, mid-scroll, while editing — and die in your camera roll or a notes app you never reopen.
2. **Product decisions** (why you picked Supabase SSR over auth-helpers, why the worker polls every 3 seconds, why you compressed to 720x1280) live only in your head and in commit messages called "Update page.tsx". Six weeks later you re-debate decisions you already made.
3. **User feedback and marketing learnings** (which hook converted, what the waitlist signups said, why someone churned) scatter across DMs, Stripe emails, and memory.

This vault fixes all three. It is not a generic second brain — every folder, template, and habit below maps to a workflow you already have.

## Why Obsidian

Plain text Markdown files on your own machine. No database, no subscription required, no company that can sunset your notes. Three properties matter:

- **Permanent** — the files outlive any app, including Obsidian itself.
- **Fast** — capture in under two seconds, which is the difference between a hook idea saved and a hook idea lost.
- **Connectable** — wikilinks turn notes into a network, so the hook pattern you logged in March surfaces automatically when you script a video in July.

Bonus for you specifically: because it's a folder of Markdown, Claude can read and write your vault directly through MCP. Your second brain becomes queryable by the same AI you're building products with.

## The 30-Minute Setup

Five stages, ~6 minutes each.

### Stage 1: Download and First Vault (6 min)

1. Download from [obsidian.md](https://obsidian.md) — free, no account needed.
2. Install, open, click **Create New Vault**.
3. Name it `DIRECTR-BRAIN` (or clone this repo's `vault/` folder and choose **Open folder as vault** — the structure and templates in this folder are ready to use as-is).
4. Put it somewhere plain like `~/Documents`. Skip auto-sync folders unless you deliberately want cloud backup.

### Stage 2: Essential Settings (6 min)

Open Settings (`Cmd+,` / `Ctrl+,`):

1. **Files and Links → Use Wikilinks: on.** This powers the whole linking system.
2. **Files and Links → Default location for new notes: `00 CAPTURE`.** Every new note lands in the inbox. Zero filing decisions at capture time — critical when the thing you're capturing is a hook idea with a 10-second half-life.
3. **Editor → Spellcheck: on.** Your notes feed your content scripts; typos propagate.
4. **Appearance → theme.** Minimal or Things if you want cleaner; default is fine.

### Stage 3: The Folder Structure (6 min)

Five folders. This repo's `vault/` already contains them:

- **`00 CAPTURE`** — the inbox. Raw hook ideas, bug notes typed mid-debug, screenshots of user DMs, anything. Nothing lives here permanently.
- **`01 NOTES`** — permanent notes in your own words. Hook patterns that work, product principles, positioning insights, architecture decisions. The atoms of the brain.
- **`02 PROJECTS`** — one subfolder per active project. You start with two: **Directr Product** (the app: features, bugs, worker pipeline, billing) and **Directr Content Engine** (your own posting: scripts, experiments, what converted).
- **`03 RESOURCES`** — reference material: your hook library, tech stack reference, competitor notes, pricing research.
- **`04 ARCHIVE`** — shipped features, killed experiments, outdated research, plus the `TEMPLATES` folder. Nothing gets deleted; everything gets archived.

### Stage 4: First Notes (6 min)

Already created in this vault:

- `01 NOTES/START HERE.md` — your home base. Update the project list as things ship.
- `01 NOTES/Hooks Are Retention Devices.md` — an example permanent note on a concept at the core of Directr.
- `00 CAPTURE/2026-07-13 capture example.md` — shows what a raw capture looks like before processing.

Read them, then replace/extend with your own thinking.

### Stage 5: Three Plugins (6 min)

Settings → Community Plugins → Turn on → Browse:

1. **Dataview** — query the vault like a database. One query lists every open bug across the vault, every hook tagged `#hook/tested` with its result, every note touched this week.
2. **Templater** — auto-applies the right template by folder: new note in `02 PROJECTS` gets the feature spec, new note in the content folder gets the script template. Point it at `04 ARCHIVE/TEMPLATES`.
3. **Calendar** — click a date, get that day's note. Your daily note is the capture hub for standup-with-yourself: what shipped, what broke, what you posted, what the numbers did.

Done. ~30 minutes.

## The Three Habits That Make It Compound

### Habit 1: Capture at the speed of a hook

Every idea goes into Obsidian the moment it exists. `Cmd+N`, type, done. On your phone, use the Obsidian mobile app or your default notes app with a hard rule: transfer to `00 CAPTURE` same day. A hook idea you didn't write down is a video you never post.

### Habit 2: Evening processing (5 min)

For each note in `00 CAPTURE` ask:

1. **Worth keeping?** Delete cold takes without guilt.
2. **Where does it live?** Hook idea → `03 RESOURCES/Hook Library.md`. Bug → a bug note in `02 PROJECTS/Directr Product`. Insight about why something worked → its own permanent note in `01 NOTES`.
3. **What does it connect to?** Add at least one `[[wikilink]]` before you close it. This question is the whole system.

### Habit 3: Weekly review (15 min, Sunday)

- Empty `00 CAPTURE` — process or delete anything older than a week.
- For each active project, write one line: where does it actually stand? For Directr Product that's "what's blocking the next ship"; for the Content Engine that's "what did the last 7 days of posts do."
- Open 2–3 recent permanent notes and add one link you missed.

## The Linking System

`[[Note Name]]` creates a link; the backlink panel shows every note that points back. This is what makes it a brain instead of a filing cabinet.

Three rules:

1. **Link when you reference.** Writing a script that uses a pattern from `[[Hooks Are Retention Devices]]`? Link it, don't just use it.
2. **Link when you process.** No note leaves `00 CAPTURE` without at least one connection. No permanent note is an island.
3. **Link when you review.** Weekly, open five random notes and connect them to something recent.

The payoff: open your note on hooks and the backlinks show every script that used the idea, every user-feedback note that validated it, and every product decision it drove. That's positioning research you never had to do deliberately.

## Templates (in `04 ARCHIVE/TEMPLATES`)

Six templates, one per recurring workflow:

| Template | For | Lives in |
|---|---|---|
| Daily Note | Founder standup-with-yourself | daily notes |
| Content Script | A short-form video from hook to CTA | Content Engine project |
| Feature Spec | Anything you're about to build in Directr | Directr Product project |
| Bug Report | Anything broken, from repro to fix commit | Directr Product project |
| User Feedback | Every signal from a real user | Directr Product project |
| Ship Log | What went out, and what happened after | either project |

Configure Templater to apply them by folder so note creation costs zero decisions.

## Search: anything in under 10 seconds

- `Cmd+Shift+F` — full-text search across every note. Use when you remember a phrase ("that user who said the captions were the reason they paid").
- `Cmd+O` — quick switcher. Use when you know the note exists.
- Backlinks panel — use when you want everything connected to a concept.

## Connecting Claude

Your vault is a folder of Markdown, so Claude can operate on it directly via the Filesystem MCP.

Install Claude Desktop, then edit:

- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/DIRECTR-BRAIN"
      ]
    }
  }
}
```

Restart Claude Desktop and test: *"Read my START HERE note and tell me what you find."*

Then it gets interesting for you specifically:

- *"Read my Hook Library and my last five Ship Logs. Which hook patterns correlate with the posts that performed?"*
- *"Read every User Feedback note tagged #churn. What's the common thread?"*
- *"Draft three Content Scripts using patterns from my Hook Library that I haven't used in the last month."*
- *"Summarize every open Bug Report in Directr Product, ordered by user impact."*

You're building an AI that fixes creators' hooks. This vault becomes the training data for fixing your own.

## Day 30

The structure doesn't change. The network does: 30–50 permanent notes, a hook library with tested/untested patterns, a bug and feature trail for Directr, a script for every post with its results attached, and backlinks tying them together.

You start scripting a video and three notes from six weeks ago surface because you linked them once. You debate a product decision and find you already decided it — with reasons.

Start it today. The vault in this folder is already built — open it in Obsidian and make the first capture.
