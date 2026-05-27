import { useState, useRef, useEffect } from 'react';

/* ── Animated typing dots ──────────────────────────────────────── */
function ThinkingIndicator({ phase }) {
  return (
    <div className="thinking-row">
      <div className="ai-avatar" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
          <rect x="1" y="1" width="26" height="26" rx="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 14h4l2-5 3 10 2-5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="thinking-bubble">
        {phase === 'thinking' ? (
          <>
            <span className="think-label">Thinking</span>
            <span className="think-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </span>
          </>
        ) : (
          <>
            <span className="think-label">Generating</span>
            <span className="gen-bar">
              <span className="gen-fill" />
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Single message bubble ─────────────────────────────────────── */
function Message({ msg, isNew }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`msg-row ${isUser ? 'msg-row--user' : 'msg-row--ai'} ${isNew ? 'msg-row--new' : ''}`}>
      {!isUser && (
        <div className="ai-avatar" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
            <rect x="1" y="1" width="26" height="26" rx="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 14h4l2-5 3 10 2-5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div className={`bubble ${isUser ? 'bubble--user' : 'bubble--ai'}`}>
        {msg.content}
        {msg.sources && msg.sources.length > 0 && (
          <div className="source-chips">
            {msg.sources.map((s, i) => (
              <span key={i} className="source-chip">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2" y="1" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 5h6M5 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────────── */
function EmptyState() {
  const suggestions = [
    'Summarize the key points',
    'What are the main conclusions?',
    'List all action items',
    'Explain the methodology',
  ];
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
          <path d="M10 16c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.5"/>
        </svg>
      </div>
      <p className="empty-title">Upload a file to begin</p>
      <p className="empty-sub">Then try asking…</p>
      <div className="suggestion-chips">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="suggestion-chip"
            style={{ '--chip-delay': `${i * 80}ms` }}
            onClick={() => {
              const input = document.getElementById('chat-input');
              if (input) { input.value = s; input.focus(); }
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main ChatBox ──────────────────────────────────────────────── */
export default function ChatBox({ onStatusChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [aiPhase, setAiPhase] = useState(null); // null | 'thinking' | 'generating'
  const [newMsgIdx, setNewMsgIdx] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiPhase]);

  async function handleSend() {
    const text = input.trim();
    if (!text || aiPhase) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setNewMsgIdx(messages.length);
    setInput('');

    // Thinking phase
    setAiPhase('thinking');
    onStatusChange?.('thinking');
    await new Promise(r => setTimeout(r, 1400 + Math.random() * 800));

    // Generating phase
    setAiPhase('generating');
    onStatusChange?.('generating');
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));

    // Mock AI response — replace with real RAG call
    const aiMsg = {
      role: 'assistant',
      content: 'Based on the document, here is what I found: the content covers the key concepts you asked about. The relevant sections mention this topic in the context of the broader analysis.',
      sources: ['Page 3', 'Page 7'],
    };
    setMessages(prev => [...prev, aiMsg]);
    setNewMsgIdx(messages.length + 1);
    setAiPhase(null);
    onStatusChange?.('idle');

    setTimeout(() => setNewMsgIdx(null), 800);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="chatbox">
      {/* Messages area */}
      <div className={`messages-area ${isEmpty ? 'messages-area--empty' : ''}`} ref={scrollRef}>
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} isNew={newMsgIdx === i} />
            ))}
            {aiPhase && <ThinkingIndicator phase={aiPhase} />}
          </>
        )}
      </div>

      {/* Input bar */}
      <div className={`input-bar ${aiPhase ? 'input-bar--busy' : ''}`}>
        <textarea
          id="chat-input"
          ref={inputRef}
          className="chat-input"
          placeholder="Ask a question about your document…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={!!aiPhase}
        />
        <button
          className={`send-btn ${(!input.trim() || aiPhase) ? 'send-btn--disabled' : 'send-btn--active'}`}
          onClick={handleSend}
          disabled={!input.trim() || !!aiPhase}
          aria-label="Send message"
        >
          {aiPhase ? (
            <span className="send-spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
