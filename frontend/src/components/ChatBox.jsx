import { useEffect, useRef, useState } from 'react';
import { askQuestion } from '../services/api';

const suggestions = [
  'Summarize the key points',
  'What are the main conclusions?',
  'List the action items',
];

function EmptyState({ ready, onSuggest }) {
  return (
    <div className="empty-state">
      <svg className="empty-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M7 6h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14l-7 5v-5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 12h10M11 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p className="empty-title">{ready ? 'What would you like to know?' : 'Upload a file to begin'}</p>
      {ready ? (
        <div className="suggestion-chips">
          {suggestions.map(question => (
            <button type="button" key={question} className="suggestion-chip" onClick={() => onSuggest(question)}>
              {question}
            </button>
          ))}
        </div>
      ) : (
        <p className="empty-sub">Your questions and answers will appear here.</p>
      )}
    </div>
  );
}

export default function ChatBox({ fileId, onStatusChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    const log = scrollRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, busy]);

  async function handleSend() {
    const question = input.trim();
    if (!fileId || !question || requestRef.current) return;

    const request = new AbortController();
    requestRef.current = request;
    setBusy(true);
    setError('');
    setMessages(previous => [...previous, { role: 'user', content: question }]);
    setInput('');
    onStatusChange('thinking');

    try {
      const { answer } = await askQuestion(question, fileId, request.signal);
      if (request.signal.aborted) return;
      if (typeof answer !== 'string' || !answer.trim()) {
        throw new Error('No answer was returned. Please try again.');
      }
      setMessages(previous => [...previous, { role: 'assistant', content: answer }]);
    } catch (err) {
      if (request.signal.aborted) return;
      setMessages(previous => previous.slice(0, -1));
      setInput(question);
      setError(err.message);
    } finally {
      if (!request.signal.aborted) {
        requestRef.current = null;
        setBusy(false);
        onStatusChange('idle');
      }
    }
  }

  function selectSuggestion(question) {
    setInput(question);
    inputRef.current?.focus();
  }

  const canSend = fileId && input.trim() && !busy;
  return (
    <div className="chatbox">
      <div className={`messages-area ${messages.length ? '' : 'messages-area--empty'}`} ref={scrollRef} role="log" aria-label="Conversation">
        {messages.length === 0 && <EmptyState ready={!!fileId} onSuggest={selectSuggestion} />}
        {messages.map((message, i) => {
          const speaker = message.role === 'user' ? 'user' : 'ai';
          return (
            <div className={`msg-row msg-row--${speaker}`} key={i}>
              <div className={`bubble bubble--${speaker}`}>
                <span className="speaker">{speaker === 'user' ? 'You' : 'AskYourFile'}</span>
                {message.content}
              </div>
            </div>
          );
        })}
        {busy && <p className="thinking-label">Reading your document…</p>}
      </div>

      {error && <p className="chat-error" role="alert">{error}</p>}
      <form className="input-bar" onSubmit={event => { event.preventDefault(); handleSend(); }}>
        <textarea
          ref={inputRef}
          className="chat-input"
          aria-label="Question about your document"
          placeholder="Ask a question about your document…"
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              handleSend();
            }
          }}
          rows={2}
          disabled={!fileId}
          readOnly={busy}
        />
        <button
          type="submit"
          className={`send-btn ${canSend ? 'send-btn--active' : 'send-btn--disabled'}`}
          disabled={!canSend}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="m3 9 14-6-5 14-2.5-5.5L3 9Zm6.5 2.5L17 3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
