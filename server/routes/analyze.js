import { Router } from 'express';
import { fetchTrackSets } from '../lib/ingest.js';
import { analyzeTaste } from '../lib/analyze.js';
import { loadProfile, saveProfile } from '../lib/profile.js';

const router = Router();

function requireAuth(req, res, next) {
  if (!req.spotifyTokens?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated with Spotify' });
  }
  next();
}

// POST /api/analyze — run weekly taste recap
router.post('/', requireAuth, async (req, res) => {
  try {
    const [{ recentTracks, overallTracks }, priorProfile] = await Promise.all([
      fetchTrackSets(req),
      loadProfile(),
    ]);

    const allTracks = [...recentTracks, ...overallTracks];
    if (allTracks.length === 0) {
      return res.status(422).json({ error: 'No Spotify listening history found. Try adding some tracks first.' });
    }

    const profile = await analyzeTaste(recentTracks, overallTracks, priorProfile);
    await saveProfile(profile);

    res.json({ profile });
  } catch (err) {
    console.error('analyze error:', err.message);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// GET /api/analyze/profile — return saved profile without re-running analysis
router.get('/profile', async (req, res) => {
  const profile = await loadProfile();
  if (!profile) return res.status(404).json({ error: 'No profile saved yet' });
  res.json({ profile });
});

export default router;
