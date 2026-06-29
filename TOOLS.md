# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Tailscale Machines

### instance-20260629-070242 (newer, preferred for builds)
- **Tailscale IP:** 100.116.19.120
- **Host:** Ubuntu 26.04 LTS on GCP
- **CPU:** 4 cores, **RAM:** 15GB
- **Disk:** 8.6GB (6.5GB free)
- **Access:** `tailscale ssh 100.116.19.120`
- **SSH:** root access, no password needed

### 169-1
- **Tailscale IP:** 100.90.216.14
- **Host:** Ubuntu 22.04 (2 cores, 1.9GB RAM)
- **Access:** `tailscale ssh 100.90.216.14`

### CloudShell (AWS)
- **Tailscale IP:** 100.105.40.3
- **Host:** Amazon Linux 2023 on AWS eu-north-1
- **Access:** `tailscale ssh 100.105.40.3`
- **Note:** CloudShell ephemeral — may lose connection if session times out

### l4-cloud-vm (AWS EC2 - persistent)
- **Tailscale IP:** 100.114.90.6
- **Host:** Amazon Linux 2023 on AWS eu-north-1
- **Instance:** `i-0b8f5aaee1f2c7f71`
- **Type:** t3.micro (free tier)
- **Public IP:** 13.48.84.197
- **Access:** `tailscale ssh 100.114.90.6`
- **Note:** Should stay up 24/7 - persistent EC2 instance
- **Exit node:** Active — route traffic through it from any Tailscale client

## Railway (current host)

- **Host:** Railway Debian 12 container (c7149d1cf604)
- **CPU:** 48 cores
- **Disk:** 2.9T (1.9T free)
- **Tailscale IP:** 100.124.226.92
- **ttyd:** Port 8080 (web terminal, PID 1)
- **Start command:** Baked into Docker image via l4-railway repo entrypoint
- **No systemd** — services run via nohup from entrypoint
- **Docker image source:** https://github.com/Walusimbi-Leon1/l4-railway
- **Workspace repo:** https://github.com/Walusimbi-Leon1/Codespace-3

### Persistence (survives redeploy)
- **Workspace path:** `/workspaces/Codespace-3` → `/root/projects/Codespace-3` (symlink)
- **Sessions:** Symlinked to `$WORKDIR/sessions/` (git-tracked)
- **OpenClaw state:** Symlinked to `$WORKDIR/.openclaw-state/` (gitignored)
- **Railway Volume:** Auto-detected — if mounted, OpenClaw state goes to volume instead

### Actual workspace
- `/root/projects/Codespace-3` — the real git repo
- `/workspaces/Codespace-3` — symlink to real repo (for OpenClaw compatibility)

### Services
- **OpenClaw:** http://127.0.0.1:18789
- **9-router:** http://127.0.0.1:20128 (v0.5.8 — pinned, use `--host 127.0.0.1 --no-browser` flags)
- **Git Dashboard:** http://127.0.0.1:3030
- **Browser CDP:** http://127.0.0.1:9223
- **Browser CLI:** `cd /root/projects/Codespace-3/browser && node browser.js status`

## Related

- [Agent workspace](/concepts/agent-workspace)
