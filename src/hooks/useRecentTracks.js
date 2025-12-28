import { useState, useCallback } from 'react'

const STORAGE_KEY = 'sndcld_rndmzr_recent'
// localStorage cap at 20
const MAX_RECENT = 20

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to load recent tracks:', err)
    return []
  }
}

export function useRecentTracks() {
  const [entries, setEntries] = useState(() => load())

  const addTrack = useCallback((track) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== track.id)
      filtered.unshift({
        id: track.id,
        title: track.title,
        duration: track.duration,
        permalink_url: track.permalink_url,
      })
      const capped = filtered.slice(0, MAX_RECENT)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(capped))
      } catch (err) {
        console.error('Failed to save recent tracks:', err)
      }
      return capped
    })
  }, [])

  const resetRecent = useCallback(() => {
    // we don't wipe storage, just temporarily ignore for filtering
  }, [])

  return { entries, addTrack, resetRecent }
}
