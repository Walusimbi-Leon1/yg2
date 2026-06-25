#!/usr/bin/env bash
# stop.sh — Stop all services including the remote browser
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "╔══════════════════════════════════════════╗"
echo "║         🐾 Stopping Services              ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Stop remote browser
echo "🛑 Stopping remote browser..."
docker stop l4-browser 2>/dev/null && echo "   ✅ Browser stopped" || echo "   ⏸️  Browser not running"
echo ""

# Stop OpenClaw gateway
if command -v openclaw &>/dev/null; then
  echo "🛑 Stopping OpenClaw gateway..."
  openclaw gateway stop 2>/dev/null && echo "   ✅ Gateway stopped" || echo "   ⏸️  Gateway not running"
fi
echo ""

echo "✅ All services stopped"
