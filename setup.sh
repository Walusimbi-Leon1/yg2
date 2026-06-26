#!/usr/bin/env bash
set -euo pipefail

# setup.sh - Full setup for a BRAND NEW codespace
# Run this once after cloning:
#   git clone https://github.com/Walusimbi-Leon1/Codespace-3.git
#   cd Codespace-3
#   chmod +x setup.sh && ./setup.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
START_TIME=$(date +%s)

echo "=================================================="
echo "  🐾 L4 Claw Pack - Setup"
echo "  Setting up a fresh codespace..."
echo "  $(date)"
echo "=================================================="
echo ""

# ── Step 1: Prerequisites ──────────────────────────────────
echo "📦 Step 1/6: Checking prerequisites..."

# Node.js & npm
if ! command -v node &>/dev/null; then
  echo "  ❌ Node.js not found. Install it first."
  exit 1
fi
echo "  ✅ Node.js $(node -v)"

if ! command -v npm &>/dev/null; then
  echo "  ❌ npm not found."
  exit 1
fi
echo "  ✅ npm $(npm -v)"

# Git
if ! command -v git &>/dev/null; then
  echo "  ❌ Git not found."
  exit 1
fi
echo "  ✅ Git $(git --version | awk '{print $3}')"

# Set pull.rebase to false for clean pulls
git config pull.rebase false 2>/dev/null || true
echo "  ✅ Git pull.rebase = false"

echo ""

# ── Step 2: Global npm packages ────────────────────────────
echo "📦 Step 2/6: Checking global npm packages..."

# OpenClaw
if ! command -v openclaw &>/dev/null; then
  echo "  Installing OpenClaw..."
  npm install -g openclaw@latest
else
  echo "  ✅ OpenClaw $(openclaw --version | head -1 | grep -oP '[\d]+\.[\d]+\.[\d]+' || echo "installed")"
fi

# 9-router
if ! command -v 9router &>/dev/null; then
  echo "  Installing 9-router..."
  npm install -g 9router@latest
else
  echo "  ✅ 9-router $(9router --version 2>/dev/null || echo "installed")"
fi

echo ""

# ── Step 3: OpenClaw config ────────────────────────────────
echo "📦 Step 3/6: Setting up OpenClaw config..."

mkdir -p ~/.openclaw

if [ -f "$SCRIPT_DIR/openclaw-config.json" ]; then
  cp "$SCRIPT_DIR/openclaw-config.json" ~/.openclaw/openclaw.json
  echo "  ✅ Config copied from workspace"
else
  echo "  ⚠️  No openclaw-config.json in workspace - skipping"
fi

echo ""

# ── Step 4: Tailscale ──────────────────────────────────────
echo "📦 Step 4/6: Setting up Tailscale..."

if [ -x "$SCRIPT_DIR/bin/start-tailscale" ]; then
  "$SCRIPT_DIR/bin/start-tailscale"
else
  echo "  ⚠️  bin/start-tailscale not found - skipping"
fi

echo ""

# ── Step 5: Make scripts executable ────────────────────────
echo "📦 Step 5/6: Making scripts executable..."

chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null || true
chmod +x "$SCRIPT_DIR"/bin/* 2>/dev/null || true
echo "  ✅ Scripts are executable"

echo ""

# ── Session storage link ──
# Pre-link OpenClaw's sessions dir to workspace so transcripts
# are tracked in git from the first message.
SESSIONS_SRC="$HOME/.openclaw/agents/main/sessions"
SESSIONS_DST="$SCRIPT_DIR/sessions"
mkdir -p "$SESSIONS_DST"
mkdir -p "$(dirname "$SESSIONS_SRC")"
if [ -e "$SESSIONS_SRC" ] && [ ! -L "$SESSIONS_SRC" ]; then
  echo "  🔄 Migrating sessions directory to workspace..."
  cp -a "$SESSIONS_SRC/." "$SESSIONS_DST/" 2>/dev/null || true
  rm -rf "$SESSIONS_SRC"
fi
ln -sfn "$SESSIONS_DST" "$SESSIONS_SRC"
echo "  🔗 Sessions linked → $SESSIONS_DST"

echo ""

# ── Step 6: Verify ─────────────────────────────────────────
echo "📦 Step 6/6: Verification..."

echo "  Node:    $(node -v)"
echo "  npm:     $(npm -v)"
echo "  OpenClaw: $(openclaw --version | head -1 || echo "check")"
echo "  9-router: $(9router --version 2>/dev/null || echo "check")"

echo ""

ELAPSED=$(( $(date +%s) - START_TIME ))
echo "=================================================="
echo "  ✅ Setup complete (${ELAPSED}s)"
echo ""
echo "  Next steps:"
echo "    1. Run  ./start.sh     to start all services"
echo "    2. Expose ports in Codespaces Ports panel:"
echo "       - 18789 → OpenClaw Dashboard"
echo "       - 20128 → 9-router API"
echo "=================================================="
