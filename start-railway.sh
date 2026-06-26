#!/usr/bin/env bash
set -euo pipefail

# start-railway.sh — Start all services on Railway
# 
# This should be set as the Railway start command:
#   bash /workspaces/Codespace-3/start-railway.sh
#
# Or run manually after SSHing in:
#   cd /workspaces/Codespace-3 && bash start-railway.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
START_TIME=$(date +%s)

echo "=================================================="
echo "  🐾 L4 Claw Pack — Railway Startup"
echo "  $(date)"
echo "=================================================="
echo ""

# ── GitHub Token for git pushes ──
GH_TOKEN=$(grep -oP 'ghp_\w+' "$SCRIPT_DIR/TOOLS.md" 2>/dev/null | head -1 || true)
if [ -n "$GH_TOKEN" ]; then
  export GITHUB_TOKEN="$GH_TOKEN"
fi

# ── Session storage link ──
SESSIONS_SRC="$HOME/.openclaw/agents/main/sessions"
SESSIONS_DST="$SCRIPT_DIR/sessions"
mkdir -p "$SESSIONS_DST"
mkdir -p "$(dirname "$SESSIONS_SRC")"
if [ -e "$SESSIONS_SRC" ] && [ ! -L "$SESSIONS_SRC" ]; then
  echo "   🔄 Migrating sessions directory to workspace..."
  cp -a "$SESSIONS_SRC/." "$SESSIONS_DST/" 2>/dev/null || true
  rm -rf "$SESSIONS_SRC"
fi
ln -sfn "$SESSIONS_DST" "$SESSIONS_SRC"
echo "   🔗 Sessions → $SESSIONS_DST"
echo ""

# ── Helper: start a service if not already running ──
ensure_running() {
  local name="$1"
  local pid_pattern="$2"
  local script="$3"

  if pgrep -f "$pid_pattern" >/dev/null 2>&1; then
    echo "   ✅ $name already running"
  elif [ -x "$script" ]; then
    echo "   🚀 Starting $name..."
    bash "$script"
  else
    echo "   ⚠️  $script not found, skipping $name"
  fi
}

# 1. Tailscale
ensure_running "Tailscale" "tailscaled" "$SCRIPT_DIR/bin/start-tailscale"
echo ""

# 2. 9-router
ensure_running "9-router" "9router" "$SCRIPT_DIR/bin/start-9router"
echo ""

# 3. Remote Browser (direct Chromium, no Docker)
ensure_running "Browser" "chromium.*headless" "$SCRIPT_DIR/bin/start-browser-railway"
echo ""

# 4. Git Dashboard
ensure_running "Git Dashboard" "git-dashboard" "$SCRIPT_DIR/bin/start-git-dashboard"
echo ""

# 5. OpenClaw Gateway
ensure_running "OpenClaw" "openclaw" "$SCRIPT_DIR/bin/start-openclaw"
echo ""

ELAPSED=$(( $(date +%s) - START_TIME ))
echo "=================================================="
echo "  ✅ All services started (${ELAPSED}s)"
echo "  📊 OpenClaw:    http://127.0.0.1:18789"
echo "  🌐 9-router:    http://127.0.0.1:20128 ($(curl -s http://127.0.0.1:20128/v1/models 2>/dev/null | python3 -c "import json,sys;d=json.load(sys.stdin);print(f'{len(d[\"data\"])} models')" 2>/dev/null || echo "? models"))"
echo "  🖥️  Browser CDP: http://127.0.0.1:9223"
echo "  📝 Git Dashboard: http://127.0.0.1:3030"
echo "  🔗 Tailscale:   $(tailscale ip -4 2>/dev/null || echo '?')"
echo "=================================================="
