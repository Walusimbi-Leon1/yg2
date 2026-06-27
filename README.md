# 🐾 L4 Claw Pack — Portable AI Agent Environment

> Your entire AI environment: OpenClaw agent, 9-router, Tailscale, remote browser, Big Pickel fallback providers, and Git Dashboard.  
> **Servers are rented. The git repo is your home.**

---

## 📖 What This Is

A self-contained, portable AI agent workspace that runs on **GitHub Codespaces** or **Railway**. Everything you need to run L4 (Leon AI 4) with multiple Big Pickel model fallbacks from [opencode.ai](https://opencode.ai).

### What's inside

- 🤖 **OpenClaw** — AI agent framework with memory, conversations, and tool use
- 🌐 **9-router** — AI model router (port 20128) routing to Big Pickel API
- 🖥️ **Remote Browser** — Chromium with DevTools Protocol for agent browsing (port 9223, plus KasmVNC on port 3001 in Codespace mode)
- 🔗 **Tailscale** — Mesh network for secure SSH access to all nodes
- 🥒 **Big Pickel ×5** — 5 opencode.ai Zen API accounts as fallback providers
- 📝 **Git Dashboard** — Web UI (port 3030) for manual commit & push
- 💬 **Session Persistence** — Every conversation transcript tracked in the repo

---

## 🏠 Two Deployment Options

| | **Railway** (Current 🚄) | **GitHub Codespace** |
|---|---|---|
| **Runtime** | 24/7 permanent | Ephemeral (dies on stop) |
| **Cost** | Paid (but 48 cores, 2.9T disk) | Free credits |
| **Browser** | Direct Chromium + nohup | Docker Chromium + KasmVNC |
| **Init** | `railway-entrypoint.sh` (Docker CMD) | `start.sh` / `setup.sh` |
| **Startup** | Clone+pull repo → symlink → start services | `./start.sh` |
| **Persistence** | Railway Volume + git push | git push before shutdown |

---

## 🚀 Quick Start

### Option A: Railway (Current Host)

1. **Fork or clone this repo** to your GitHub account
2. Create a new Railway project → **Deploy from GitHub repo**
3. Add a **Dockerfile** path deployment (select `Codespace-3` repo, `Dockerfile` in root)
4. Set these **Environment Variables** in your Railway project:

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | GitHub personal access token (with `repo` scope) for `git clone/pull` |
| `USERNAME` | ttyd web terminal username (default: `admin`) |
| `PASSWORD` | ttyd web terminal password |
| `PORT` | ttyd port (default: `8080` — Railway auto-assigns to `PORT`) |

5. **(Optional)** Attach a **Railway Volume** — if one is mounted (at any known path like `/railway` or `/data`), the entrypoint automatically stores OpenClaw's SQLite state there instead of in the workspace. This means even longer runtime state survives restart.

6. Deploy — the entrypoint handles everything:
   ```
   - Installs nvm + Node.js 22 (via nvm)
   - Installs openclaw + 9router (globally via npm)
   - Clones (or pulls) the repo
   - Sets up the workspace symlink (/workspaces/Codespace-3 → the repo)
   - Symlinks OpenClaw state for persistence
   - Symlinks sessions/ into git-tracked workspace
   - Starts 9-router → OpenClaw → Git Dashboard → ttyd terminal
   ```

### Option B: GitHub Codespace

1. Create a new Codespace from this repo
2. Run setup (first time ever):
   ```bash
   chmod +x setup.sh && ./setup.sh
   ```
3. Start everything:
   ```bash
   ./start.sh
   ```
4. Expose ports in the Codespaces Ports panel:
   - `18789` → OpenClaw Control UI
   - `20128` → 9-router API
   - `3001` → Remote Browser (KasmVNC, password: `changeme`)
   - `3030` → Git Dashboard

---

## 📁 Workspace Structure

```
/workspaces/Codespace-3/
├── AGENTS.md              # Agent behavior & rules
├── HEARTBEAT.md           # Heartbeat task configuration
├── IDENTITY.md            # Agent identity (name, avatar, vibe)
├── MEMORY.md              # Long-term curated memory
├── SOUL.md                # Agent personality & tone
├── TOOLS.md               # Local environment notes
├── USER.md                # About the human
├── README.md              # This file
│
├── Dockerfile             # Railway Docker image definition
├── railway-entrypoint.sh  # Railway boot script (Docker CMD, 209 lines)
├── start-railway.sh       # Railway service start (manual SSH use)
├── setup.sh               # First-time setup (Codespace)
├── start.sh               # Start all services (Codespace)
├── stop.sh                # Graceful stop (Codespace)
├── openclaw-config.json   # Full OpenClaw config (providers, models, etc.)
├── .gitignore             # Excludes node_modules, caches, etc.
│
├── bin/                   # Individual service start scripts
│   ├── start-tailscale    # Tailscale daemon + auth
│   ├── start-9router      # AI model router (v0.5.8)
│   ├── start-browser      # Docker Chromium (Codespace)
│   ├── start-browser-railway  # Direct Chromium (Railway)
│   ├── start-git-dashboard    # Git Dashboard (port 3030)
│   ├── start-openclaw     # OpenClaw Gateway (port 18789)
│   ├── sync-sessions      # Copy transcripts → workspace
│   └── auto-commit        # Sync & commit sessions
│
├── browser/               # Remote browser CLI + persistent profile
│   ├── browser.js          # Tab management CLI
│   ├── config/             # Chrome profile (cookies, history, etc.)
│   └── ...                 # Debug & utility scripts
│
├── git-dashboard/         # Git Dashboard server (zero-dependency Node.js)
│   └── server.js
│
├── sessions/              # Conversation transcripts (git-tracked)
│   ├── sessions.json       # Session metadata
│   ├── <id>.jsonl          # Full conversation JSONL
│   └── *.reset.*           # Archived older sessions
│
├── memory/                # Daily notes & memory files
│   ├── 2026-06-25.md
│   └── 2026-06-26.md
│
└── .openclaw-state/       # OpenClaw SQLite state (gitignored, persisted)
    ├── openclaw.sqlite
    ├── openclaw.sqlite-shm
    └── openclaw.sqlite-wal
```

---

## 🔄 Restart & Persistence

### How restart recovery works

Every deployment or container restart triggers `railway-entrypoint.sh`, which:

1. **Installs dependencies** (nvm, Node 22, openclaw, 9router) if missing — idempotent, fast on re-runs
2. **Clones or pulls** the repo — picks up the latest committed changes
3. **Repairs the workspace symlink** — ensures `/workspaces/Codespace-3` → the real repo path
4. **Restores OpenClaw state** — symlinks `~/.openclaw/state` to either:
   - A **Railway Volume** (if mounted) — survives any restart
   - The workspace `.openclaw-state/` directory (gitignored, but persists across deploys on Railway's overlay filesystem)
5. **Syncs sessions** — OpenClaw's session storage is symlinked to `workspace/sessions/`, which is tracked in git
6. **Starts services** — 9-router → OpenClaw → Git Dashboard → ttyd terminal (foreground)

### What survives a restart

| Data | Survives without Volume | Survives with Volume |
|------|:----------------------:|:--------------------:|
| All git-tracked files (scripts, config, README, etc.) | ✅ Committed | ✅ Committed |
| Session transcripts (sessions/<id>.jsonl) | ✅ Git-tracked | ✅ Git-tracked |
| OpenClaw SQLite state (tool history, config) | ⚠️ Overlay FS (may survive if not reclaimed) | ✅ On volume |
| Your memory files (MEMORY.md, memory/*.md) | ✅ Git-tracked | ✅ Git-tracked |
| Chrome browser profile | ✅ In browser/config/ (git-tracked) | ✅ (same) |

### Pushing before a deploy

```bash
cd /workspaces/Codespace-3
git add -A
git commit -m "snapshot before deploy"
git push origin main
```

Or use the **Git Dashboard** at `http://127.0.0.1:3030`.

---

## 💬 Session Persistence

All conversation transcripts live in `workspace/sessions/` in the repo. This means:

- **Every message** gets written into `sessions/<id>.jsonl` — the full transcript including tool calls
- **Your memory** (`MEMORY.md`, `memory/*.md`) is tracked in the repo
- **On startup**, the entrypoint symlinks OpenClaw's internal session storage → `workspace/sessions/`, so transcripts write directly into the git-tracked workspace
- **To push** new conversations to GitHub: open the Git Dashboard (`http://127.0.0.1:3030`) and click **Commit & Push**, or run `git push` from the terminal

### Session file reference

| File | What it is |
|------|------------|
| `<id>.jsonl` | Full conversation transcript (JSONL format) |
| `sessions.json` | Session metadata mapping |
| `<id>.jsonl.reset.*` | Archived transcripts from previous sessions |
| `<id>.trajectory.jsonl` | Runtime tool-call trajectory (internal) |

---

## 🥒 Big Pickel Provider Setup

The system routes through 5 opencode.ai Zen API accounts as fallback providers. The default is `9router/oc/big-pickle` (routed through 9-router), with `big-pickel1` through `big-pickel5` as direct connection fallbacks.

### Adding/updating providers

Edit `openclaw-config.json`:

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "9router": {
        "baseUrl": "http://127.0.0.1:20128/v1",
        "apiKey": "your-9router-key",
        "api": "openai-completions",
        "models": [{"id": "oc/big-pickle", "name": "big-pickle"}]
      },
      "big-pickel1": {
        "baseUrl": "https://opencode.ai/zen/v1",
        "apiKey": "sk-...",
        "api": "openai-completions",
        "models": [{"id": "big-pickle", "name": "big-pickle"}]
      }
      // ... up to big-pickel5
    }
  }
}
```

> **Note:** All API keys are stored in open config (private repo). The `models.mode = "merge"` setting shows all providers in the OpenClaw Control UI.

---

## 🖥️ Remote Browser

### Railway (Direct Chromium)

- **What:** Headless Chromium installed via `apt`, no Docker
- **CDP:** Port 9223 (Chrome DevTools Protocol)
- **CLI:** `cd browser && node browser.js status`
- **Start:** `./bin/start-browser-railway`

### Codespace (Docker Chromium)

- **What:** Full Docker Chromium container with KasmVNC web streaming
- **KasmVNC UI:** Port 3001 (viewable in Codespace Ports, password: `changeme`)
- **CDP:** Port 9223
- **SwiftShader GPU:** Software-rendered GPU compositing
- **Persistent profile:** `browser/config/` tracked in repo
- **Start:** `./bin/start-browser`

---

## 📝 Git Dashboard

A zero-dependency Node.js web UI at `http://127.0.0.1:3030`.

**Features:**
- Current branch, last commit, ahead/behind status
- Modified, untracked, and staged file lists
- **Commit & Push** — type a message, click to stage, commit, and push

Nothing auto-pushes on Railway — you control when changes go up.  
On Codespaces, there was an `auto-commit-daemon` (every 2 minutes) — now removed in Railway mode.

---

## ⚙️ Service Ports

| Port | Service | Railway | Codespace |
|------|---------|---------|-----------|
| **8080** | ttyd (web terminal) | ✅ Front door | ❌ |
| **18789** | OpenClaw Gateway | ✅ loopback | ✅ Ports panel |
| **20128** | 9-router API | ✅ loopback | ✅ Ports panel |
| **3001** | Remote Browser (KasmVNC) | ❌ | ✅ Ports panel |
| **9223** | Chrome DevTools Protocol | ✅ loopback | ✅ loopback |
| **3030** | Git Dashboard | ✅ loopback | ✅ loopback |

---

## 🔧 All Commands

```bash
# ── General ──
./start.sh                    # Start all services (Codespace)
./setup.sh                    # Full first-time setup (Codespace)
./stop.sh                     # Graceful stop (Codespace)
./start-railway.sh            # Start all services (Railway, manual)

# ── Individual Services ──
./bin/start-tailscale         # Install + start daemon + authenticate + SSH
./bin/start-9router           # Start AI model router (port 20128)
./bin/start-browser           # Start Docker Chromium (Codespace)
./bin/start-browser-railway   # Start direct Chromium (Railway)
./bin/start-git-dashboard     # Start Git Dashboard (port 3030)
./bin/start-openclaw          # Start OpenClaw Gateway (port 18789)

# ── Session Tools ──
./bin/sync-sessions           # Copy latest transcripts into sessions/
./bin/auto-commit             # Sync + commit + push to GitHub
```

---

## 🚄 Railway-Specific Details

### Dockerfile

The `Dockerfile` builds an image with:
- Debian Bookworm base
- ttyd (web terminal)
- nvm + Node.js 22 (symlinked to `/usr/local/bin`)
- OpenClaw + 9router@0.5.8 (global npm packages)
- Entrypoint: `railway-entrypoint.sh`

> **Building:** The GitHub Actions workflow in the `l4-railway` repo (`https://github.com/Walusimbi-Leon1/l4-railway`) builds and pushes to ghcr.io. However, **the simpler approach is to deploy the repo directly** — Railway supports Dockerfile-based deployments natively, so the `docker-publish.yml` workflow is optional.

### Environment Variables (Railway)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | No | `8080` | ttyd web terminal port |
| `USERNAME` | No | `admin` | ttyd login username |
| `PASSWORD` | No | `changeme` | ttyd login password |
| `GITHUB_TOKEN` | **Yes** | — | Personal access token (repo scope) for `git clone` |

### Volumes

If you attach a Railway Volume, the entrypoint auto-detects it at common mount points (`/railway`, `/data`, `/volumes`). OpenClaw's SQLite state (`~/.openclaw/state/`) gets symlinked to the volume, ensuring runtime state survives any restart.

---

## 🖥️ GitHub Codespace-Specific Details

### First-time setup on a new Codespace

```bash
# The repo auto-clones to /workspaces/Codespace-3
cd /workspaces/Codespace-3

# Full setup
chmod +x setup.sh && ./setup.sh

# Start everything
./start.sh
```

### Restarting a stopped Codespace

```bash
cd /workspaces/Codespace-3
./start.sh
```

### Startup order (start.sh)

1. Symlink sessions directory (`~/.openclaw/agents/main/sessions` → `workspace/sessions/`)
2. Tailscale daemon + auth key + SSH
3. 9-router (port 20128)
4. Remote Browser (Docker Chromium + KasmVNC)
5. Git Dashboard (port 3030)
6. OpenClaw Gateway (port 18789)

---

## 🔄 Starting a Fresh Project from Scratch

If you want to **start your own project** (not continue with L4):

### 1. Fork the repo or create a new one

```bash
git clone https://github.com/yourname/your-project.git
cd your-project
```

### 2. Set up the workspace files

Copy the essential structure from this repo:

```bash
# Core agent identity
cp -r AGENTS.md SOUL.md USER.md IDENTITY.md MEMORY.md HEARTBEAT.md TOOLS.md

# Scripts
cp -r bin/ setup.sh start.sh start-railway.sh stop.sh

# Git Dashboard (optional)
cp -r git-dashboard/

# Railway (optional)
cp Dockerfile railway-entrypoint.sh

# Config
cp openclaw-config.json

# Browser (optional)
cp -r browser/

# Session tracking
mkdir -p sessions memory
```

### 3. Customize for your project

- **`openclaw-config.json`** — Replace API keys, provider URLs, and model IDs with your own
- **`railway-entrypoint.sh`** — Update `REPO_TOKEN` logic, workspace path if different
- **`TOOLS.md`** — Document your own environment specifics
- **`IDENTITY.md`** — Set your agent's name, vibe, and emoji
- **`USER.md`** — Document who you're helping
- **`MEMORY.md`** — Start building your agent's long-term memory

### 4. Deploy

```bash
# Push to GitHub
git add -A && git commit -m "initial setup" && git push

# Either deploy on Railway (Dockerfile-based project)
# Or run on a Codespace
```

---

## 🔧 Troubleshooting

| Symptom | Fix |
|---------|-----|
| **OpenClaw unreachable** | Expose **port 18789** in Codespace Ports panel, or verify on Railway: `curl http://127.0.0.1:18789/health` |
| **9-router offline** | Check: `curl http://127.0.0.1:20128/v1/models` |
| **Tailscale won't connect** | Run `./bin/start-tailscale` manually. Check auth key is valid. |
| **Browser won't start** | Railway: `./bin/start-browser-railway` / Codespace: `./bin/start-browser` |
| **Browser CDP unavailable** | Let Chromium finish starting (~30s). Check: `curl http://127.0.0.1:9223/json/version` |
| **Browser stream blank (Codespace)** | Expose **port 3001** in Ports panel |
| **Git Dashboard wrong workspace** | Set `GIT_DASHBOARD_WORKSPACE=/workspaces/Codespace-3` |
| **Session transcripts not showing in git** | Run `./bin/sync-sessions` to copy latest |
| **`openclaw: command not found`** | Run `npm install -g openclaw` |
| **`9router: command not found`** | Run `npm install -g 9router@0.5.8` |
| **Railway deploy fails at `npm install`** | The Dockerfile symlinks node to `/usr/local/bin`. If builds fail, check the entrypoint works without the Docker image (use repo-direct deploy) |
| **Entrypoint can't clone repo** | Set `GITHUB_TOKEN` environment variable in Railway project settings |
| **On restart, sessions are missing** | Did you push? `git push origin main` before stopping |
| **OpenClaw state lost on restart** | Attach a Railway Volume — or push sessions (which are git-tracked) manually before restart |

---

## 🔒 Security

- This repo is **private** — only you have access
- API keys and tokens are stored in open config **intentionally** (transparency over black-box)
- Tailscale encrypts all traffic end-to-end
- CDP/DevTools ports are localhost-only
- ttyd terminal (Railway) requires username/password auth
- OpenClaw gateway binds to loopback only

---

## 🗺️ Architecture Diagram (Railway)

```
┌────────────────────────────────────────────────────────────────────┐
│                    Railway Container                               │
│                                                                     │
│   ttyd (:8080) — web terminal (entrypoint, foreground, keeps alive) │
│                                                                     │
│   ┌─────────────┐   ┌─────────────┐   ┌──────────────────────┐   │
│   │  OpenClaw   │   │  9-router   │   │  Chromium Headless   │   │
│   │  :18789     │◄──►│  :20128     │   │  CDP :9223           │   │
│   │  (agent)    │   │  (models)   │   │  (remote browser)    │   │
│   └──────┬──────┘   └──────┬──────┘   └──────────────────────┘   │
│          │                  │                                       │
│          ▼                  ▼                                       │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │                     Git Dashboard :3030                   │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │             Tailscale (mesh VPN, SSH enabled)             │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                     │
│   Persistence:                                                     │
│     sessions/     → git-tracked (committed manually)               │
│     .openclaw-state/ → symlinked from ~/.openclaw/state            │
│       → Railway Volume (if attached) OR workspace dir              │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Related

- **Source repo:** [https://github.com/Walusimbi-Leon1/Codespace-3](https://github.com/Walusimbi-Leon1/Codespace-3)
- **Docker deploy repo:** [https://github.com/Walusimbi-Leon1/l4-railway](https://github.com/Walusimbi-Leon1/l4-railway)
- **OpenClaw:** [https://github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
- **9-router:** [https://github.com/9hacks/9router](https://github.com/9hacks/9router)
- **opencode.ai:** [https://opencode.ai](https://opencode.ai)
