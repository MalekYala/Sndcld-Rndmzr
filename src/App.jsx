import { useEffect, useState, useRef } from 'react'
import Header from './components/Header.jsx'
import Controls from './components/Controls.jsx'
import Widget from './components/Widget.jsx'
import Status from './components/Status.jsx'
import History from './components/History.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { useRecentTracks } from './hooks/useRecentTracks.js'
import { searchLongMixes } from './lib/soundcloud.js'
import { initVisualizer } from './visualizer.js'

export default function App() {
  const [genre, setGenre] = useState('')
  const [currentTracks, setCurrentTracks] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [status, setStatus] = useState({ message: '', type: '' })
  const [loading, setLoading] = useState(false)
  const { entries, addTrack } = useRecentTracks()

  // recentIds we use for filtering — resets when pool exhausted
  const recentIdsRef = useRef(entries.map((e) => e.id))

  useEffect(() => {
    initVisualizer()
  }, [])

  useEffect(() => {
    recentIdsRef.current = entries.map((e) => e.id)
  }, [entries])

  function pickAndPlay(tracks) {
    let pool = tracks.filter((t) => !recentIdsRef.current.includes(t.id))
    if (pool.length === 0) {
      // all seen — reset memory, use full list
      recentIdsRef.current = []
      pool = tracks
    }
    const idx = Math.floor(Math.random() * pool.length)
    const track = pool[idx]
    setCurrentTrack(track)
    addTrack(track)
    setStatus({ message: '', type: '' })
  }

  async function handleShuffle() {
    if (!genre) return
    setStatus({ message: 'Searching for long mixes...', type: 'loading' })
    setLoading(true)
    setCurrentTrack(null)
    try {
      const tracks = await searchLongMixes(genre)
      setCurrentTracks(tracks)
      if (tracks.length === 0) {
        setStatus({ message: 'No long mixes found for this genre. Try another.', type: 'error' })
        setLoading(false)
        return
      }
      pickAndPlay(tracks)
    } catch (err) {
      console.error('Search failed:', err)
      setStatus({ message: 'Search failed. SoundCloud may be unavailable.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (currentTracks.length === 0) return
    pickAndPlay(currentTracks)
  }

  function handleHistoryPick(entry) {
    setCurrentTrack(entry)
    setStatus({ message: '', type: '' })
  }

  return (
    <>
      <ThemeToggle />
      <div className="app">
        <div className="container">
          <Header />
          <Controls
            genre={genre}
            setGenre={setGenre}
            onShuffle={handleShuffle}
            shuffleDisabled={!genre || loading}
          />
          {currentTrack && <Widget track={currentTrack} />}
          <Status message={status.message} type={status.type} />
          {currentTrack && (
            <button className="btn btn--next" id="next-btn" onClick={handleNext}>
              Next Random
            </button>
          )}
          <History entries={entries} onPick={handleHistoryPick} />
          <footer className="footer">
            <p>Powered by <a href="https://soundcloud.com" target="_blank" rel="noopener">SoundCloud</a></p>
          </footer>
        </div>
      </div>
    </>
  )
}
