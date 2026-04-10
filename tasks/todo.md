# Fix: Niche filtering + Try Again diversity

## Root causes

**Niche**: The candidate pool has no concept of popularity. "Niche country" resolves
a reference artist (probably a mainstream country track), searches that genre, and
returns whoever Spotify puts at the top — which are the most popular artists.
Ella Langley at 23M listeners has a Spotify track popularity of ~70+. She should
never appear for a "niche" prompt. Fix: detect niche-intent keywords and cap
candidates to `popularity < 50` before returning.

**Try Again same songs**: The random offset range is 0–20 with limit 15, so we're
sampling from positions 0–34. Adjacent offsets share most of their tracks (offset 3
and offset 5 overlap by 12 tracks). We never leave the top popularity tier.
Fix: widen offset range to 0–200 — Spotify supports up to 1000 — so different
calls land in fundamentally different catalog sections and repeats become very rare.

## Todo

- [x] 1. Add `isNichePrompt(prompt)` — detects niche/underground/obscure/rare/deep cut keywords
- [x] 2. In `searchCandidates`, filter candidates to `popularity < 30` when niche intent detected (rare, unheard)
- [x] 3. Widen random offset range from `* 20` to `* 200` for near-zero Try Again repeats

## Review
- `isNichePrompt()` added above `trackInvolvesArtist` — regex covers niche, underground, obscure, rare, deep cut, hidden gem, unknown, undiscovered, indie, off the radar
- `nicheMode` flag set once from `userPrompt` before any search, applied in both the reference-artist return path and the profile-fallback return path — filters `popularity < 30`
- Offset range widened from `* 20` to `* 200` — with Spotify supporting up to 1000 offset, 200 possible starting positions × limit 15 means near-zero overlap between calls

## Files
- `server/lib/suggestions.js` only
