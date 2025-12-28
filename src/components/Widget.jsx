import { useEffect, useRef } from 'react'
import { formatDuration } from '../lib/soundcloud.js'

export default function Widget({ track }) {
  const iframeRef = useRef(null)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600
  const height = isMobile ? 166 : 300
  const src =
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(track.permalink_url)}` +
    `&color=%23ff5500&auto_play=true&show_artwork=true` +
    `&visual=${isMobile ? 'false' : 'true'}`

  useEffect(() => {
    // nothing to bind yet — visualizer added later
  }, [track.id])

  return (
    <div id="widget-area" className="widget-area">
      <iframe
        ref={iframeRef}
        title="SoundCloud Player"
        width="100%"
        height={height}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={src}
      />
      <div className="track-info">{track.title} &middot; {formatDuration(track.duration)}</div>
    </div>
  )
}
