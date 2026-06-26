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

## Railway (current host)

- **Host:** Railway Debian 12 container (2212c8370b61)
- **CPU:** 48 cores
- **Disk:** 2.9T (1.9T free)
- **RAM:** (unknown — no free command)
- **Tailscale IP:** 100.118.109.60
- **ttyd:** Port 8080 (web terminal, PID 1)
- **Start command:** `bash /workspaces/Codespace-3/start-railway.sh`
- **No Docker, no systemd** — services run via nohup

### Services
- **OpenClaw:** http://127.0.0.1:18789
- **9-router:** http://127.0.0.1:20128 (v0.5.8 — pinned, use `--host 127.0.0.1 --no-browser` flags)
- **Git Dashboard:** http://127.0.0.1:3030
- **Browser CDP:** http://127.0.0.1:9223
- **Browser CLI:** `cd /workspaces/Codespace-3/browser && node browser.js status`

## Related

- [Agent workspace](/concepts/agent-workspace)
