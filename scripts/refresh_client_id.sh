#!/usr/bin/env bash
# scrapes a fresh client_id off soundcloud.com and writes it to .env
# run when search starts 401ing. they rotate it every couple weeks.
#
#   ./scripts/refresh_client_id.sh
#   ./scripts/refresh_client_id.sh --commit   (also commits + pushes)

set -eu

cd "$(dirname "$0")/.."

ENV_FILE=".env"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

html=$(curl -sfL -A "$UA" https://soundcloud.com/)

# the client_id is buried in one of the chunked JS bundles linked from the homepage
bundles=$(printf '%s\n' "$html" | grep -oE 'https://a-v2\.sndcdn\.com/assets/[^"]+\.js' | sort -u)

if [ -z "$bundles" ]; then
  echo "no sndcdn bundles in the homepage, did the markup change?" >&2
  exit 1
fi

client_id=
for url in $bundles; do
  hit=$(curl -sfL -A "$UA" "$url" \
    | grep -oE 'client_id[=:]"[A-Za-z0-9]{32}"' \
    | head -1 | grep -oE '[A-Za-z0-9]{32}' || true)
  if [ -n "$hit" ]; then
    client_id=$hit
    echo "got it from $(basename "$url")"
    break
  fi
done

if [ -z "$client_id" ]; then
  echo "no client_id in any bundle" >&2
  exit 1
fi

# sanity check before we clobber anything
code=$(curl -s -o /dev/null -w '%{http_code}' \
  "https://api-v2.soundcloud.com/search/tracks?q=test&client_id=${client_id}&limit=1")
if [ "$code" != "200" ]; then
  echo "api-v2 said $code, bailing" >&2
  exit 1
fi

old=
if [ -f "$ENV_FILE" ]; then
  old=$(grep -oE 'VITE_SOUNDCLOUD_CLIENT_ID=[A-Za-z0-9]+' "$ENV_FILE" | cut -d= -f2 || true)
fi

if [ "$old" = "$client_id" ]; then
  echo "already $client_id, nothing to do"
  exit 0
fi

# rewrite .env (or create it fresh)
if [ -f "$ENV_FILE" ] && grep -q '^VITE_SOUNDCLOUD_CLIENT_ID=' "$ENV_FILE"; then
  # portable in-place edit (gnu + bsd both happy)
  sed -i.bak -E "s|^VITE_SOUNDCLOUD_CLIENT_ID=.*|VITE_SOUNDCLOUD_CLIENT_ID=${client_id}|" "$ENV_FILE"
  rm -f "${ENV_FILE}.bak"
else
  echo "VITE_SOUNDCLOUD_CLIENT_ID=${client_id}" >> "$ENV_FILE"
fi

echo "${old:-<empty>} -> ${client_id}"
echo
echo "remember the GH Actions secret needs the new value too (Settings > Secrets > Actions)"

if [ "${1:-}" = "--commit" ]; then
  # .env is gitignored so there's nothing to commit here, but keep the flag working
  # for when we eventually track a sample value somewhere
  echo "(.env is gitignored, nothing to push)"
fi
