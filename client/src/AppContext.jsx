import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [topPick, setTopPick] = useState(null);
  const [runnersUp, setRunnersUp] = useState([]);
  const [votes, setVotes] = useState({}); // { spotifyId: 'up' | 'down' }
  const [loading, setLoading] = useState({ auth: true, analyze: false, suggestions: false });
  const [error, setError] = useState(null);

  // Check auth on mount and after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      sessionStorage.setItem('authToken', token);
      window.history.replaceState({}, '', '/');
    } else if (params.get('error')) {
      window.history.replaceState({}, '', '/');
    }
    api.authStatus()
      .then(({ authenticated }) => {
        setAuthenticated(authenticated);
        if (authenticated) loadSavedProfile();
      })
      .catch(() => {})
      .finally(() => setLoading((l) => ({ ...l, auth: false })));
  }, []);

  const loadSavedProfile = useCallback(async () => {
    try {
      const { profile } = await api.getProfile();
      setProfile(profile);
    } catch {
      // No saved profile yet — that's fine
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    setLoading((l) => ({ ...l, analyze: true }));
    setError(null);
    try {
      const { profile } = await api.analyze();
      setProfile(profile);
      return profile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading((l) => ({ ...l, analyze: false }));
    }
  }, []);

  const fetchSuggestions = useCallback(async (userText) => {
    setLoading((l) => ({ ...l, suggestions: true }));
    setError(null);
    try {
      const { topPick, runnersUp } = await api.getSuggestions(userText);
      setTopPick(topPick ?? null);
      setRunnersUp(runnersUp ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((l) => ({ ...l, suggestions: false }));
    }
  }, []);

  const vote = useCallback(async (spotifyId, direction) => {
    const prev = votes[spotifyId];
    const next = prev === direction ? null : direction; // toggle off
    setVotes((v) => ({ ...v, [spotifyId]: next }));
    try {
      await api.submitFeedback(spotifyId, next);
    } catch {
      // Feedback endpoint may not exist yet — fail silently in UI
    }
  }, [votes]);

  const logout = useCallback(async () => {
    await api.logout();
    setAuthenticated(false);
    setProfile(null);
    setTopPick(null);
    setRunnersUp([]);
    setVotes({});
  }, []);

  return (
    <AppContext.Provider value={{
      authenticated, profile, topPick, runnersUp, votes, loading, error,
      runAnalysis, fetchSuggestions, vote, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
