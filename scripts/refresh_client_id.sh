#!/usr/bin/env bash
# refresh_client_id.sh — scrape the current public SoundCloud client_id from
# the soundcloud.com JS bundles and patch src/config/soundcloud.js in place.
#
# Run this when the GH Pages build starts returning 401s ("Search failed").
# SoundCloud rotates the public client_id every few weeks.
#
# Usage:
#   ./scripts/refresh_client_id.sh           # patch + show diff
#   ./scripts/refresh_client_id.sh --commit  # patch, commit, push to all remotes
#
set -euo pipefail

cd "$(dirname "$0")/.."

CONFIG_FILE="src/config/soundcloud.js"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

echo "[1/3] Fetching soundcloud.com homepage..."
HTML=$(curl -sfL -A "$UA" https://soundcloud.com/)

# SC ships several numbered JS bundles; the client_id lives in one of them.
# Grab every <script src="https://a-v2.sndcdn.com/assets/*.js"> URL and grep them.
BUNDLES=$(printf '%s\n' "$HTML" | grep -oE 'https://a-v2\.sndcdn\.com/assets/[^"]+\.js' | sort -u)

if [[ -z "$BUNDLES" ]]; then
  echo "ERROR: no sndcdn.com bundle URLs found in homepage HTML." >&2
  exit 1
fi

echo "[2/3] Scanning $(echo "$BUNDLES" | wc -l) bundles for client_id..."
CLIENT_ID=""
for url in $BUNDLES; do
  ID=$(curl -sfL -A "$UA" "$url" | grep -oE 'client_id[=:]"[A-Za-z0-9]{32}"' | head -1 | grep -oE '[A-Za-z0-9]{32}' || true)
  if [[ -n "$ID" ]]; then
    CLIENT_ID="$ID"
    echo "      found in $(basename "$url"): $CLIENT_ID"
    break
  fi
done

if [[ -z "$CLIENT_ID" ]]; then
  echo "ERROR: could not extract client_id from any bundle." >&2
  exit 1
fi

# Verify it actually works against api-v2 before writing it.
echo "[3/3] Verifying client_id against api-v2..."
HTTP=$(curl -s -o /dev/null -w '%{http_code}' \
  "https://api-v2.soundcloud.com/search/tracks?q=test&client_id=${CLIENT_ID}&limit=1")
if [[ "$HTTP" != "200" ]]; then
  echo "ERROR: client_id returned HTTP $HTTP from api-v2 — not patching." >&2
  exit 1
fi
echo "      OK (HTTP 200)"

OLD=$(grep -oE "SOUNDCLOUD_CLIENT_ID = '[^']+'" "$CONFIG_FILE" | grep -oE "'[^']+'" | tr -d "'")
if [[ "$OLD" == "$CLIENT_ID" ]]; then
  echo "No change — client_id is already $CLIENT_ID."
  exit 0
fi

# Portable in-place sed (works on GNU + BSD)
sed -i.bak -E "s|SOUNDCLOUD_CLIENT_ID = '[^']+'|SOUNDCLOUD_CLIENT_ID = '${CLIENT_ID}'|" "$CONFIG_FILE"
rm -f "${CONFIG_FILE}.bak"

echo
echo "Patched $CONFIG_FILE:"
echo "  old: $OLD"
echo "  new: $CLIENT_ID"
echo
git --no-pager diff -- "$CONFIG_FILE"

if [[ "${1:-}" == "--commit" ]]; then
  echo
  echo "Committing and pushing to all remotes..."
  git add "$CONFIG_FILE"
  git commit -m "Refresh SoundCloud client_id ($OLD -> $CLIENT_ID)"
  for remote in $(git remote); do
    echo "  -> $remote"
    git push "$remote" HEAD || echo "     (push to $remote failed, continuing)"
  done
fi
