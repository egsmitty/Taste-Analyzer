import { useApp } from '../AppContext';

function nicheLabel(score) {
  if (score >= 80) return 'extremely underground';
  if (score >= 60) return 'pretty niche';
  if (score >= 40) return 'indie-leaning';
  if (score >= 20) return 'somewhat mainstream';
  return 'very mainstream';
}

function mainstreamLabel(score) {
  if (score >= 80) return 'top-chart listener';
  if (score >= 60) return 'mainstream-leaning';
  if (score >= 40) return 'middle of the road';
  if (score >= 20) return 'mostly under the radar';
  return 'deep cuts only';
}

function ScoreMeter({ value, label, description }) {
  return (
    <div className="score-meter">
      <div className="score-meter-header">
        <span className="score-meter-label">{label}</span>
        <span className="score-value">{value}</span>
      </div>
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${value}%` }} />
      </div>
      <p className="score-description">{description}</p>
    </div>
  );
}

export default function TasteProfileCard() {
  const { profile, loading, runAnalysis, fetchSuggestions } = useApp();

  if (loading.analyze) {
    return (
      <div className="card profile-card loading-card">
        <div className="spinner" />
        <p>Analyzing your taste...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card profile-card empty-card">
        <h2>Your Taste Profile</h2>
        <p>Hit analyze to see a breakdown of your listening habits — genres, obscurity, and what makes your taste yours.</p>
        <button className="btn btn-primary" onClick={() => runAnalysis()}>
          Analyze My Taste
        </button>
      </div>
    );
  }

  const handleRefresh = async () => {
    await runAnalysis();
    await fetchSuggestions();
  };

  return (
    <div className="card profile-card">
      <div className="profile-header">
        <div>
          <h2>Your Taste Profile</h2>
          {profile.updatedAt && (
            <span className="updated-at">
              Updated {new Date(profile.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={loading.analyze}>
          Refresh
        </button>
      </div>

      <div className="subgenre-badge">{profile.subgenre}</div>

      <p className="taste-summary">{profile.tasteSummary}</p>

      <div className="genre-tags">
        {profile.topGenres?.map((g) => (
          <span key={g} className="genre-tag">{g}</span>
        ))}
      </div>

      <div className="score-meters">
        <ScoreMeter
          value={profile.nicheScore}
          label="Niche Score"
          description={`${profile.nicheScore}/100 — ${nicheLabel(profile.nicheScore)}. Based on the average popularity of your tracks (Spotify rates each track 0–100; we invert it).`}
        />
        <ScoreMeter
          value={profile.popularityPercentile}
          label="Mainstream Score"
          description={`${profile.popularityPercentile}/100 — ${mainstreamLabel(profile.popularityPercentile)}. How chart-friendly your listening is overall.`}
        />
      </div>
    </div>
  );
}
