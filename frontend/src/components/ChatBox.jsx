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
      <svg className="empty-icon" width="90" height="70" viewBox="0 0 90 70" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M23 19h55v34H67v8l-12-8H23z" fill="#ffc79e" transform="rotate(8 50 39)"/>
          <g transform="rotate(-6 38 30)">
            <path d="M9 10h59v38H34l-13 9v-9H9z" fill="#fff"/>
            <path d="M22 30c0-6 3-11 10-14l2 3c-4 2-6 5-7 8h8v12H22zm18 0c0-6 3-11 10-14l2 3c-4 2-6 5-7 8h8v12H40z" fill="currentColor" stroke="none"/>
          </g>
        </g>
      </svg>
      <p className="empty-title">{ready ? 'What would you like to know?' : 'Start with a document'}</p>
      {ready ? (
        <div className="suggestion-chips">
          {suggestions.map(question => (
            <button type="button" key={question} className="suggestion-chip" onClick={() => onSuggest(question)}>
              {question}
            </button>
          ))}
        </div>
      ) : (
        <p className="empty-sub">Upload a file to ask your first question.</p>
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
