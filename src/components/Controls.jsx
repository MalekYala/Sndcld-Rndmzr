import { GENRES } from '../config/soundcloud.js'

export default function Controls({ genre, setGenre, onShuffle, shuffleDisabled }) {
  return (
    <div className="controls">
      <select
        className="genre-select"
        id="genre-select"
        aria-label="Choose a genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
      >
        <option value="" disabled>Pick a genre...</option>
        {GENRES.map((g) => (
          <option key={g.value} value={g.value}>{g.label}</option>
        ))}
      </select>
      <button
        className="btn btn--shuffle"
        id="shuffle-btn"
        disabled={shuffleDisabled}
        onClick={onShuffle}
      >
        Shuffle
      </button>
    </div>
  )
}
