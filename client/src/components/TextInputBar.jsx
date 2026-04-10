import { useState } from 'react';
import { useApp } from '../AppContext';

export default function TextInputBar() {
  const [text, setText] = useState('');
  const { loading, fetchSuggestions } = useApp();
  const busy = loading.suggestions;

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSuggestions(text.trim() || null);
  };

  return (
    <form className="text-input-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What are you in the mood for?"
        disabled={busy}
        maxLength={300}
      />
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? 'Finding...' : 'Find me a song'}
      </button>
    </form>
  );
}
