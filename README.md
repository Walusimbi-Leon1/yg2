# 🐾 L4 Claw Pack — Portable AI Environment

> Your entire AI environment: OpenClaw agent, 9-router, Tailscale, remote browser, 5x Big Pickel fallback providers, and Git Dashboard.
> **Codespaces are temporary. The `main` branch is your home.**

---

## 🏠 What This Is

A self-contained AI agent workspace that runs on GitHub Codespaces. Everything you need to run L4 (Leon AI 4) with multiple Big Pickel model fallbacks from [opencode.ai](https://opencode.ai).

### What's inside:

- 🤖 **OpenClaw** — Your AI agent (L4), with memory, conversations, and identity
- 🌐 **9-router** — AI model router (port 20128), currently routing to Big Pickel
- 🖥️ **Remote Browser** — Docker Chromium with KasmVNC web streaming + CDP control
- 🔗 **Tailscale** — Mesh network for secure access to all your nodes
- 🥒 **Big Pickel x5** — 5 OpenCode Zen API accounts as fallback providers:
  - `big-pickel1/big-pickle` — Account #1
  - `big-pickel2/big-pickle` — Account #2
  - `big-pickel3/big-pickle` — Account #3
  - `big-pickel4/big-pickle` — Account #4
  - `big-pickel5/big-pickle` — Account #5

---

## 🚀 Quick Reference

### On a fresh Codespace (first time ever)

```bash
# 1. Clone
git clone https://github.com/Walusimbi-Leon1/Codespace-3.git
cd Codespace-3

# 2. Run full setup
chmod +x setup.sh && ./setup.sh

# 3. Start everything
./start.sh

# 4. Expose ports in Codespaces Ports panel:
#    - 3001  → Remote Browser (web UI, pass: changeme)
#    - 18789 → OpenClaw Dashboard
#    - 20128 → 9-router API
```

### Restarting the same Codespace (stopped & resumed)

```bash
cd Codespace-3
./start.sh
```

That's it. `start.sh` handles all three services:
1. 🔗 Tailscale — starts daemon, authenticates with auth key, enables SSH
2. 🌐 9-router — starts on port 20128
3. 🤖 OpenClaw — starts Gateway on port 18789

---

## ⚡ Services Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Your Codespace                          │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│   │   OpenClaw   │  │  9-router    │  │ Remote Browser   │  │
│   │   :18789     │◄─►│  :20128      │  │ :3001 / :9223    │  │
│   │   Big Pickel │  │  (Big Pickel) │  │ (KasmVNC + CDP)  │  │
│   │   fallbacks  │  │              │  │                  │  │
│   │   1-5        │  │              │  │                  │  │
│   └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│          │                 │                    │            │
│          ▼                 ▼                    ▼            │
│   ┌────────────────────────────────────────────────────┐    │
│   │                   Tailscale                         │    │
│   │       (mesh network, SSH enabled, auth key set)     │    │
│   └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Ports

| Port | Service | Access |
|------|---------|--------|
| **18789** | OpenClaw Dashboard | Codespaces Ports |
| **20128** | 9-router API (OpenAI-compatible) | localhost or Tailscale |

---

## 📋 All Commands

### Service lifecycle (run from workspace root)

```bash
./start.sh              # Start all services in order
```

### Individual services

```bash
./bin/start-tailscale   # Install + start daemon + authenticate + SSH
./bin/start-9router     # Start AI model router
./bin/start-openclaw    # Start OpenClaw Gateway
```

---

## 📦 What Gets Synced to the Repo

Everything is pushed to the `main` branch of this repo:

- ✅ **OpenClaw config** — All providers (9router + big-pickel 1-5)
- ✅ **Workspace files** — AGENTS.md, SOUL.md, MEMORY.md, USER.md, TOOLS.md, IDENTITY.md
- ✅ **Setup & start scripts** — `setup.sh`, `start.sh`, `bin/*`
- ✅ **Session continuity** — Conversations persist across codespace restarts

---

## 🔄 Rolling Over to a New Codespace

When you eventually move to a new Codespace:

1. **On the old codespace:** Push any pending changes:
   ```bash
   cd Codespace-3
   git add -A && git commit -m "pre-move snapshot" && git push origin main
   ```

2. **On the new codespace:**
   ```bash
   git clone https://github.com/Walusimbi-Leon1/Codespace-3.git
   cd Codespace-3
   chmod +x setup.sh && ./setup.sh   # Full setup
   ./start.sh                         # Start everything
   ```

---

## 🔧 Troubleshooting

| Symptom | Fix |
|---------|-----|
| Can't reach OpenClaw | Expose **port 18789** in Codespaces Ports panel |
| 9-router offline | Check: `curl http://127.0.0.1:20128/v1/models` |
| Tailscale won't connect | Run `./bin/start-tailscale` manually |
| Remote browser won't start | Check Docker: `docker logs l4-browser`. Pull: `docker pull linuxserver/chromium:latest` |
| Browser CDP unavailable | Browser starts in ~30s. Check: `curl http://127.0.0.1:9223/json/version` |
| Browser stream blank | Expose **port 3001** in Codespaces Ports panel |
| Need to switch Big Pickel provider | Change `model.primary` in Control UI or config |
| `openclaw: command not found` | Run `npm install -g openclaw` |
| Session lost after restart | Should persist — Gateway saves to disk |

---

## 🔒 Security Notes

- This is a **private repository** (you're the only user)
- All API keys and auth tokens are stored in open config files intentionally
- Tailscale encrypts all traffic end-to-end
- CDP/DevTools ports should stay localhost-only
- Browser web UI password: `changeme` (set via `VNC_PASSWORD` env)

---

## 🗺️ Roadmap (Coming Soon)

- 💰 Money Printer
- 📝 Auto-sync cron jobs
