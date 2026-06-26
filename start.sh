#!/usr/bin/env bash
set -euo pipefail

# start.sh - Start all services on an existing codespace
# Runs: Tailscale → 9-router → Remote Browser → OpenClaw Gateway
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
START_TIME=$(date +%s)

echo "=================================================="
echo "  🐾 L4 Claw Pack - Starting Services"
echo "  $(date)"
echo "=================================================="
echo ""

# ── Session storage link ──
# Link OpenClaw's internal sessions dir to the workspace so transcripts
# are tracked in git. Safe to run every time.
SESSIONS_SRC="$HOME/.openclaw/agents/main/sessions"
SESSIONS_DST="$SCRIPT_DIR/sessions"
mkdir -p "$SESSIONS_DST"
mkdir -p "$(dirname "$SESSIONS_SRC")"
if [ -e "$SESSIONS_SRC" ] && [ ! -L "$SESSIONS_SRC" ]; then
  # Real directory exists — migrate to symlink
  echo "   🔄 Migrating sessions directory to workspace..."
  cp -a "$SESSIONS_SRC/." "$SESSIONS_DST/" 2>/dev/null || true
  rm -rf "$SESSIONS_SRC"
elif [ ! -e "$SESSIONS_SRC" ]; then
  # Doesn't exist — create symlink
  :
fi
ln -sfn "$SESSIONS_DST" "$SESSIONS_SRC"
echo "   🔗 Sessions → $SESSIONS_DST"
echo ""

# 1. Tailscale
if [ -x "$SCRIPT_DIR/bin/start-tailscale" ]; then
  "$SCRIPT_DIR/bin/start-tailscale"
  echo ""
else
  echo "⚠️  bin/start-tailscale not found, skipping..."
  echo ""
fi

# 2. 9-router
if [ -x "$SCRIPT_DIR/bin/start-9router" ]; then
  "$SCRIPT_DIR/bin/start-9router"
  echo ""
else
  echo "⚠️  bin/start-9router not found, skipping..."
  echo ""
fi

# 3. Remote Browser (Docker Chromium + VNC + CDP)
if [ -x "$SCRIPT_DIR/bin/start-browser" ]; then
  "$SCRIPT_DIR/bin/start-browser"
  echo ""
else
  echo "⚠️  bin/start-browser not found, skipping..."
  echo ""
fi

# 4. Git Dashboard
if [ -x "$SCRIPT_DIR/bin/start-git-dashboard" ]; then
  "$SCRIPT_DIR/bin/start-git-dashboard"
  echo ""
fi

# 5. OpenClaw Gateway
if [ -x "$SCRIPT_DIR/bin/start-openclaw" ]; then
  "$SCRIPT_DIR/bin/start-openclaw"
  echo ""
fi

ELAPSED=$(( $(date +%s) - START_TIME ))
echo "=================================================="
echo "  ✅ All services started (${ELAPSED}s)"
echo "  📊 Dashboard: http://127.0.0.1:18789"
echo "  🌐 9-router:  http://127.0.0.1:20128"
echo "  🖥️  Browser UI: http://127.0.0.1:3001 (pass: changeme)"
echo "  🔌 Browser CDP: http://127.0.0.1:9223"
echo "  📝 Git Dashboard: http://127.0.0.1:3030"
echo "=================================================="
