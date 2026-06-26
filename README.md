# 🐾 L4 Claw Pack — Portable AI Environment

> Your entire AI environment: OpenClaw agent, 9-router, Tailscale, remote browser, 5× Big Pickel fallback providers, and Git Dashboard.
> **Codespaces are temporary. The `main` branch is your home.**

---

## 🏠 What This Is

A self-contained AI agent workspace that runs on GitHub Codespaces. Everything you need to run L4 (Leon AI 4) with multiple Big Pickel model fallbacks from [opencode.ai](https://opencode.ai).

### What's inside:

- 🤖 **OpenClaw** — Your AI agent (L4), with memory, conversations, and identity
- 🌐 **9-router** — AI model router (port 20128), currently routing to Big Pickel
- 🖥️ **Remote Browser** — Docker Chromium with KasmVNC web streaming + CDP control (port 3001 / 9223)
- 🔗 **Tailscale** — Mesh network for secure access to all your nodes
- 🥒 **Big Pickel ×5** — 5 OpenCode Zen API accounts as fallback providers
- 📝 **Git Dashboard** — Web UI (port 3030) showing workspace vs repo status with Commit & Push
- 💬 **Session Persistence** — Every conversation transcript is tracked in the repo via `sessions/`

---

## 🚀 Quick Reference

### On a brand new Codespace (first time ever)

```bash
# 1. Clone (GitHub auto-clones to /workspaces/Codespace-3)
git clone https://github.com/Walusimbi-Leon1/Codespace-3.git
cd Codespace-3

# 2. Run full setup
chmod +x setup.sh && ./setup.sh

# 3. Start everything
./start.sh

# 4. Expose ports in Codespaces Ports panel:
#    - 18789 → OpenClaw Dashboard
#    - 20128 → 9-router API
#    - 3001  → Remote Browser (pass: changeme)
```

### Restarting the same Codespace (stopped & resumed)

```bash
cd /workspaces/Codespace-3
./start.sh
```

That's it. `start.sh` handles everything in order:

1. 🔗 **Session symlink** — Links OpenClaw transcripts to `workspace/sessions/` for git tracking
2. 🔗 **Tailscale** — Starts daemon, authenticates with auth key, enables SSH
3. 🌐 **9-router** — Starts on port 20128
4. 🖥️ **Remote Browser** — Docker Chromium with KasmVNC + SwiftShader GPU
5. 📝 **Git Dashboard** — Web UI on port 3030 for manual commit & push
6. 🤖 **OpenClaw Gateway** — Starts on port 18789

---

## ⚡ Services Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     /workspaces/Codespace-3                      │
│                         (Your Workspace)                         │
│                                                                  │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│   │   OpenClaw   │   │  9-router    │   │ Remote Browser   │   │
│   │   :18789     │◄──►│  :20128      │   │ :3001 / :9223    │   │
│   │   Big Pickel │   │  (Big Pickel)│   │ (SwiftShader GPU)│   │
│   │   fallbacks  │   │              │   │                  │   │
│   │   1-5        │   │              │   │                  │   │
│   └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘   │
│          │                  │                     │             │
│          ▼                  ▼                     ▼             │
│   ┌──────────────────────────────────────────────────────┐     │
│   │                      Tailscale                        │     │
│   │        (mesh network, SSH enabled, auth key set)      │     │
│   └──────────────────────────────────────────────────────┘     │
│                                                                  │
│   ┌──────────────────────────────────────────────────────┐     │
│   │                   Git Dashboard                       │     │
│   │        :3030 — Manual commit & push to GitHub         │     │
│   └──────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### Ports

| Port | Service | Access |
|------|---------|--------|
| **18789** | OpenClaw Dashboard | Codespaces Ports |
| **3001** | Remote Browser (KasmVNC web UI) | Codespaces Ports |
| **9223** | Chrome DevTools Protocol (CDP) | localhost |
| **20128** | 9-router API (OpenAI-compatible) | localhost or Tailscale |
| **3030** | Git Dashboard (manual commit & push) | localhost |

---

## 📋 All Commands

```bash
./start.sh              # Start all services in order
./setup.sh              # Full first-time setup (npm installs, etc.)

# Individual services:
./bin/start-tailscale   # Install + start daemon + authenticate + SSH
./bin/start-9router     # Start AI model router
./bin/start-browser     # Start Docker Chromium browser container
./bin/start-git-dashboard  # Start Git Dashboard (port 3030)
./bin/start-openclaw    # Start OpenClaw Gateway

# Session tools (manual):
./bin/sync-sessions     # Copy latest transcript files into workspace/sessions/
./bin/auto-commit       # Sync + commit + push to GitHub
```

---

## 💬 Session Persistence

All conversation transcripts live in `workspace/sessions/` in the repo. This means:

- **Every message** gets written into `sessions/<id>.jsonl` — the full transcript including tool calls
- **Your memory** (`MEMORY.md`, `memory/*.md`) is tracked in the repo
- **On a new codespace**, `start.sh` automatically symlinks OpenClaw's internal session storage → `workspace/sessions/`, so transcripts write directly into the git-tracked workspace from the first message
- **To push** new conversations to GitHub: open the Git Dashboard (`http://127.0.0.1:3030`) and click **Commit & Push**. Or use `git push` from the terminal.

### What's tracked in `workspace/sessions/`:

| File | What it is |
|------|------------|
| `<id>.jsonl` | Full conversation transcript (JSONL format) |
| `sessions.json` | Session metadata mapping |
| `<id>.jsonl.reset.*` | Archived transcripts from previous sessions |

---

## 🖥️ Remote Browser

A full Docker Chromium container with:

- **KasmVNC web streaming** — View and interact with the browser at `http://127.0.0.1:3001`
- **Chrome DevTools Protocol** — Programmatic control via `http://127.0.0.1:9223`
- **CLI tool** — `cd browser && node browser.js status` for tab management
- **SwiftShader GPU** — Software-rendered GPU compositing for smoother page rendering
- **Persistent profile** — Cookies, bookmarks, passwords stored in `browser/config/` (tracked in repo)

Browser restart is handled by `./start.sh` — container is recreated on every boot.

---

## 📝 Git Dashboard

A web UI at `http://127.0.0.1:3030` that shows:

- Current git branch, last commit, ahead/behind status
- List of modified, untracked, and staged files
- **Commit & Push** button — type a message, click to stage everything, commit, and push to GitHub

Use it to manually push session transcripts and memory updates to the repo. Nothing auto-pushes — you control when changes go up.

---

## 🗄️ Workspace Structure

```
/workspaces/Codespace-3/
├── AGENTS.md              # Agent behavior & rules
├── HEARTBEAT.md           # Heartbeat reminders
├── IDENTITY.md            # L4's name & avatar
├── MEMORY.md              # Long-term memory
├── README.md              # This file
├── SOUL.md                # Agent personality
├── TOOLS.md               # Local tool notes
├── USER.md                # About Leon
├── .gitignore             # Excludes caches, Chromium internals, node_modules
│
├── bin/                   # Service start scripts
├── browser/               # Remote browser CLI + config (Docker mount)
├── git-dashboard/         # Git Dashboard web server
├── sessions/              # Conversation transcripts (tracked in git)
├── memory/                # Daily notes & memory files
│
├── openclaw-config.json   # Full OpenClaw config with providers
├── setup.sh               # First-time setup
├── start.sh               # Start all services
└── stop.sh                # Graceful stop
```

---

## 🔄 Moving to a New Codespace

1. **Push everything:**
   ```bash
   cd /workspaces/Codespace-3
   git add -A && git commit -m "snapshot before move" && git push origin main
   ```

2. **On the new codespace:**
   ```bash
   # Git auto-clones to /workspaces/Codespace-3 — just run:
   chmod +x setup.sh && ./setup.sh
   ./start.sh
   ```

That's it. Your config, scripts, session history, memory, and browser profile all come back.

---

## 🔧 Troubleshooting

| Symptom | Fix |
|---------|-----|
| Can't reach OpenClaw | Expose **port 18789** in Codespaces Ports panel |
| 9-router offline | Check: `curl http://127.0.0.1:20128/v1/models` |
| Tailscale won't connect | Run `./bin/start-tailscale` manually |
| Browser won't start | Run `./bin/start-browser` to recreate the container |
| Browser stream blank | Expose **port 3001** in Codespaces Ports panel |
| Browser is slow | Close unused tabs. The container uses SwiftShader (software GPU) — heavy pages are CPU-bound |
| Browser CDP unavailable | Let Chrome finish starting (~30s). Check: `curl http://127.0.0.1:9223/json/version` |
| Need to switch Big Pickel provider | Change `model.primary` in OpenClaw Control UI or `openclaw-config.json` |
| `openclaw: command not found` | Run `npm install -g openclaw` |
| Session transcripts not showing in git | Run `./bin/sync-sessions` to copy latest from OpenClaw internal storage |
| Git Dashboard shows old workspace | Make sure it's running from `/workspaces/Codespace-3`. Restart: `./bin/start-git-dashboard` |

---

## 🔒 Security Notes

- This is a **private repository** (you're the only user)
- All API keys and auth tokens are stored in open config files intentionally
- Tailscale encrypts all traffic end-to-end
- CDP/DevTools ports should stay localhost-only
- Browser web UI password: `changeme` (set via `VNC_PASSWORD` env)
