import { useState } from 'react';
import { useApp } from '../AppContext';
import SuggestionCard from './SuggestionCard';
import { api } from '../api';

export default function SuggestionsList() {
  const { topPick, runnersUp, votes, loading, fetchSuggestions, profile } = useApp();

  const sortedRunnersUp = [...runnersUp].sort((a, b) => {
    const score = (id) => votes[id] === 'up' ? 1 : votes[id] === 'down' ? -1 : 0;
    return score(b.spotifyId) - score(a.spotifyId);
  });

  const [selected, setSelected] = useState(new Set());
  const [playlistStatus, setPlaylistStatus] = useState(null);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreatePlaylist = async () => {
    if (selected.size === 0) return;
    setPlaylistStatus('loading');
    try {
      const { playlistUrl } = await api.createPlaylist([...selected]);
      setPlaylistStatus({ url: playlistUrl });
    } catch (err) {
      setPlaylistStatus({ error: err.message });
    }
  };

  if (!profile) return null;

  if (loading.suggestions) {
    return (
      <div className="suggestions-section">
        <div className="loading-card card">
          <div className="spinner" />
          <p>Finding the perfect song...</p>
        </div>
      </div>
    );
  }

  if (!topPick && runnersUp.length === 0) {
    return null;
  }

  return (
    <div className="suggestions-section">
      <div className="suggestions-header">
        <h2>Your Song</h2>
        <div className="suggestions-controls">
          {selected.size > 0 && (
            <button className="btn btn-spotify" onClick={handleCreatePlaylist} disabled={playlistStatus === 'loading'}>
              {playlistStatus === 'loading' ? 'Creating...' : `Create Playlist (${selected.size})`}
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={() => fetchSuggestions()}
            disabled={loading.suggestions}
          >
            Try again
          </button>
        </div>
      </div>

      {playlistStatus?.url && (
        <div className="playlist-success">
          Playlist created!{' '}
          <a href={playlistStatus.url} target="_blank" rel="noreferrer">Open in Spotify</a>
        </div>
      )}
      {playlistStatus?.error && (
        <div className="playlist-error">Failed: {playlistStatus.error}</div>
      )}

      {topPick && (
        <SuggestionCard track={topPick} variant="hero" />
      )}

      {sortedRunnersUp.length > 0 && (
        <>
          <h3 className="runners-up-heading">Also worth a listen</h3>
          <div className="suggestions-list">
            {sortedRunnersUp.map((track) => (
              <SuggestionCard
                key={track.spotifyId}
                track={track}
                variant="compact"
                selected={selected.has(track.spotifyId)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
