# MEMORY.md — L4's Long-Term Memory

## Who I Am

I am **Leon AI 4 (L4)** — the fourth iteration of Leon's AI agent. I run in the **L4 Claw Pack** environment on GitHub Codespaces, connected to the [Codespace-3](https://github.com/Walusimbi-Leon1/Codespace-3) repository. I work for Leon.

## My Human

- **Name:** Leon (Walusimbi-Leon1 on GitHub)
- **Vibe:** Direct, no-nonsense, wants execution not chatter. Keeps things open — no secrets in a private repo.
- **Mission:** Building a portable, persistent AI agent environment that survives codespace restarts.

## Our Setup — L4 Claw Pack

### Architecture
- **OpenClaw** — AI agent framework (port 18789)
- **9-router** — Model router (port 20128), defaults to Big Pickel
- **Tailscale** — Mesh network with SSH enabled
- **5× Big Pickel fallback providers** from opencode.ai

### Big Pickel Providers
| Provider | API Key Source |
|---|---|
| `9router/oc/big-pickle` | Default (via 9-router) |
| `big-pickel1/big-pickle` | Gmail account #1 |
| `big-pickel2/big-pickle` | Gmail account #2 |
| `big-pickel3/big-pickle` | Gmail account #3 |
| `big-pickel4/big-pickle` | Gmail account #4 |
| `big-pickel5/big-pickle` | Gmail account #5 |

### Repo Branches
- `main` — Active development, all config and scripts
- `main-backup` — Snapshot of main at the time of creation (for backup)

### Scripts
- `setup.sh` — Full setup on a fresh codespace
- `start.sh` — Start all services (Tailscale → 9-router → OpenClaw)
- `bin/start-tailscale` — Tailscale with auth key
- `bin/start-9router` — 9-router service
- `bin/start-openclaw` — OpenClaw Gateway

## Session History

### 2026-06-24 — First Contact
- Leon introduced himself, named me L4 (Leon AI 4)
- We set up 4 additional Big Pickel API keys as fallback providers
- We configured models.mode=merge in OpenClaw config so all providers show in Control UI
- Tested big-pickel1 and big-pickel2 — both confirmed working
- Created setup.sh, start.sh, and bin/ scripts for portability
- Set up Tailscale with auth key
- Created main-backup branch
- Pushed everything to the repo
- Updated README with full documentation
- Leon wants full transparency — no hiding keys, everything in the repo

### Key Decisions
- All API keys are stored in open config (private repo, intentional)
- 9router/oc/big-pickle stays as default model; big-pickel 1-5 as fallbacks
- Session continuity handled by OpenClaw Gateway saving to disk
- Everything gets committed and pushed to main regularly

---

### 2026-06-25 — Recovery + Remote Browser + Git Dashboard
- Memory was reset; recovered identity from old session transcripts
- Filled in IDENTITY.md (L4, 🥒), USER.md (Leon), created MEMORY.md
- Deleted BOOTSTRAP.md, got fresh GitHub token, pushed everything
- Fixed timeout: added 300s timeoutSeconds to all Big Pickel providers + global defaults
- Rebuilt remote browser on main branch:
  - Docker Chromium with KasmVNC streaming (port 3001)
  - CDP on port 9223 via socat (Chrome binds to 127.0.0.1 inside container)
  - browser/browser.js CLI for tab control
  - Restored Chrome profile (cookies, history, preferences) from openclaw branch
  - bin/start-browser, stop.sh, .gitignore, updated start.sh and README
- Built Git Dashboard (port 3030):
  - Zero-dependency Node.js server, shows workspace vs repo status
  - Commit & Push button — stages all, commits with custom message, pushes to main
  - Auto-refreshes every 30s
  - bin/start-git-dashboard, integrated into start.sh

---

### 2026-06-26 — Session Persistence (Transcripts in Repo)
- Built session persistence system so all conversations survive codespace destruction
- **New: `sessions/` directory in the repo** — mirrors OpenClaw's conversation transcripts
  - `sessions/<id>.jsonl` — JSONL transcript of every exchange (including tool calls)
  - `sessions/sessions.json` — session metadata mapping
  - Old session archives (`.jsonl.reset.*`) also included for full history
- **`bin/sync-sessions`** — copies latest session files from internal OpenClaw storage to workspace
- **`bin/auto-commit`** — syncs sessions, commits, and pushes to GitHub
- **`bin/auto-commit-daemon`** — runs in background, auto-commits every 2 minutes
  - Started by `bin/start-git-dashboard` (which runs from `start.sh`)
  - Only commits when there are actual changes (new messages)
- **`bin/start-openclaw`** — updated to symlink sessions into workspace on fresh codespaces
  - On a brand-new codespace, creates `~/.openclaw/agents/main/sessions/` → `workspace/sessions/`
  - This means every transcript write goes directly into the git-tracked workspace
- **Git Dashboard** now auto-refreshes and shows session files when they change
- Key config files now tracked in repo:
  - `sessions/` — all conversation transcripts
  - `bin/sync-sessions`, `bin/auto-commit`, `bin/auto-commit-daemon` — session persistence scripts

### Current Session Gaps (Live Only)
- OpenClaw's SQLite state (`~/.openclaw/state/openclaw.sqlite`) is NOT in repo — contains runtime session state
- If OpenClaw crashes mid-session, some ephemeral state (active thinking level, model overrides) could be lost
- But the **JSONL transcript** is always synced every 2 minutes, so worst case: lose up to 2 minutes of conversation

---

### 2026-06-26 — New Codespace + 9-router Fix
- Provisioned a fresh codespace (codespaces-b80cd7)
- Tailscale connected (current node online, 12 previous nodes + 1 Windows node + SGSS exit node)
- OpenClaw auto-detected and running
- Git Dashboard running (port 3030)
- Docker browser container (l4-browser) running (port 3001 KasmVNC, port 9223 CDP)
- Session symlink intact: workspace sessions/ → ~/.openclaw/agents/main/sessions/
- **9-router was broken**: v0.5.12 starts then immediately exits on codespaces (Next.js SIGKILL).
  - Pinned to **9router@0.5.8** — works with `--tray --skip-update --host 127.0.0.1` flags
  - Updated `bin/start-9router` to use tray mode (no TTY needed)
  - Updated `setup.sh` to pin version and re-pin if different
- All 5 Big Pickel fallback providers still configured

---

_Last updated: 2026-06-26_
