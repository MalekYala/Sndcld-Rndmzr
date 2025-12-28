import {
  SOUNDCLOUD_CLIENT_ID,
  SC_API_V2,
  MIN_MIX_DURATION_MS,
  SEARCH_LIMIT,
} from '../config/soundcloud.js'

// codetabs free CORS proxy. swap if it dies.
const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest='

export async function searchLongMixes(genre) {
  const offset = Math.floor(Math.random() * 100)
  const scUrl = new URL(`${SC_API_V2}/search/tracks`)
  scUrl.searchParams.set('q', genre)
  scUrl.searchParams.set('client_id', SOUNDCLOUD_CLIENT_ID)
  scUrl.searchParams.set('limit', String(SEARCH_LIMIT))
  scUrl.searchParams.set('offset', String(offset))
  scUrl.searchParams.set('filter.duration', 'epic')

  const proxied = `${CORS_PROXY}${encodeURIComponent(scUrl.toString())}`
  const res = await fetch(proxied)
  if (!res.ok) throw new Error(`SoundCloud API ${res.status}`)
  const data = await res.json()
  const tracks = data.collection || []
  return tracks.filter((t) => t.duration >= MIN_MIX_DURATION_MS)
}

export function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}:${String(s).padStart(2, '0')}`
}
