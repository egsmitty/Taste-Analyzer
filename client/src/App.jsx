import { useApp } from './AppContext';
import LoginButton from './components/LoginButton';
import TasteProfileCard from './components/TasteProfileCard';
import SuggestionsList from './components/SuggestionsList';
import TextInputBar from './components/TextInputBar';

export default function App() {
  const { authenticated, loading, logout, error } = useApp();

  if (loading.auth) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginButton />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">Taste Analyzer</span>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}
        <TasteProfileCard />
        <TextInputBar />
        <SuggestionsList />
      </main>
    </div>
  );
}
