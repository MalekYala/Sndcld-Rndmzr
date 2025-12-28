import { formatDuration } from '../lib/soundcloud.js'

export default function History({ entries, onPick }) {
  if (!entries.length) return null
  return (
    <section id="history" className="history">
      <h2>Recently played</h2>
      <ul className="history-list" id="history-list">
        {entries.map((e) => (
          <li
            key={e.id}
            className="history-item"
            onClick={() => onPick(e)}
          >
            <span className="history-item__title">{e.title}</span>
            <span className="history-item__duration">{formatDuration(e.duration)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
