import { useApp } from '../AppContext';

export default function SuggestionCard({ track, selected, onSelect }) {
  const { vote, votes } = useApp();
  const userVote = votes[track.spotifyId];

  return (
    <div className={`card suggestion-card ${selected ? 'selected' : ''} ${userVote === 'up' ? 'voted-up' : ''} ${userVote === 'down' ? 'voted-down' : ''}`}>
      <div className="suggestion-select" onClick={() => onSelect(track.spotifyId)}>
        <div className={`checkbox ${selected ? 'checked' : ''}`} />
      </div>

      {track.albumArt && (
        <img
          src={track.albumArt}
          alt={track.album}
          className="album-art"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}

      <div className="suggestion-info">
        <div className="suggestion-title">{track.title}</div>
        <div className="suggestion-artist">{track.artist}</div>
        <div className="suggestion-reason">{track.matchReason}</div>
        <div className="suggestion-meta">
          {track.genreTag && <span className="genre-tag-small">{track.genreTag}</span>}
        </div>
      </div>

      <div className="suggestion-actions">
        <button
          className={`vote-btn ${userVote === 'up' ? 'active-up' : ''}`}
          onClick={() => vote(track.spotifyId, 'up')}
          title="Love it"
        >
          ♥
        </button>
        <button
          className={`vote-btn ${userVote === 'down' ? 'active-down' : ''}`}
          onClick={() => vote(track.spotifyId, 'down')}
          title="Not for me"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
