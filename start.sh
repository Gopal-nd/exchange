#!/usr/bin/env bash
# Start all 5 apps: engín, backend, ws, web, bot
# Usage: ./start.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PIDS=()

cleanup() {
  echo ""
  echo "stopping services…"
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  echo "done"
}
trap cleanup EXIT INT TERM

start() {
  local name="$1"
  local dir="$2"
  local cmd="$3"
  echo "→ $name"
  (cd "$ROOT/$dir" && bun run $cmd) &
  PIDS+=($!)
}

echo "starting all 5 apps from $ROOT"
echo ""

start "1/5 engín   (matching)"  "apps/engin"   "dev"
sleep 0.5
start "2/5 backend (api :3000)" "apps/backend" "dev"
start "3/5 ws      (:3002)"     "apps/ws"      "dev"
start "4/5 web     (vite)"      "apps/web"     "dev"
sleep 1
start "5/5 bot     (mm)"        "apps/bot"     "mm"

echo ""
echo "running  pids: ${PIDS[*]}"
echo "  API   http://localhost:3000"
echo "  WS    ws://localhost:3002"
echo "  Web   http://localhost:5173"
echo "Ctrl+C to stop all"
echo ""

wait
