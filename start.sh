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
