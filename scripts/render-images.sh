#!/usr/bin/env bash
# Renders the social images with headless Microsoft Edge (Windows, Git Bash).
#   docs/og.png                 1200x630  Open Graph and Twitter card
#   assets/social-preview.png   1280x640  GitHub social preview
# Usage: bash scripts/render-images.sh
set -euo pipefail
cd "$(dirname "$0")/.."
EDGE="${EDGE:-/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe}"
ROOT="$(pwd -W 2>/dev/null || pwd)"
render() {
  timeout 60 "$EDGE" --headless=new --disable-gpu --hide-scrollbars --window-size="$3" \
    --screenshot="$ROOT/$2" "file:///$ROOT/scripts/templates/$1" 2>/dev/null || true
  echo "rendered $2"
}
render og.html docs/og.png 1200,630
render social-preview.html assets/social-preview.png 1280,640
