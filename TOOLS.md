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

## Credentials

### GitHub
- **Token:** `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`
- **Stored in:** `~/.git-credentials` + `~/.config/gh/hosts.yml` (gh auth)
- **Used for:** Git pushes to Codespace-3 repo, gh CLI operations
- **User:** Walusimbi-Leon1
- **Repo:** https://github.com/Walusimbi-Leon1/Codespace-3

### Setup (fresh codespace)
```bash
gh auth login --with-token <<< "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"
git config --global credential.helper store
echo "https://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@github.com" > ~/.git-credentials
```

## Related

- [Agent workspace](/concepts/agent-workspace)
