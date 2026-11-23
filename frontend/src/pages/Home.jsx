import FileUpload from '../components/FileUpload';
import ChatBox from '../components/ChatBox';
import { useState } from 'react';

function AnimatedOrb() {
  return (
    <div className="orb-container">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

function GridLines() {
  return (
    <div className="grid-lines" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid-line" style={{ '--delay': `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function StatusPill({ status }) {
  const states = {
    idle: { label: 'Awaiting file', dot: 'dot-idle' },
    ready: { label: 'Document ready', dot: 'dot-ready' },
    uploading: { label: 'Processing file…', dot: 'dot-active' },
    thinking: { label: 'Thinking…', dot: 'dot-thinking' },
  };
  const { label, dot } = states[status] || states.idle;

  return (
    <div className="status-pill" role="status">
      <span className={`status-dot ${dot}`} />
      <span className="status-label">{label}</span>
    </div>
  );
}

export default function Home() {
  const [aiStatus, setAiStatus] = useState('idle');
  const [fileId, setFileId] = useState(null);

  function selectFile(id) {
    setFileId(id);
    setAiStatus('idle');
  }

  return (
    <div className="home-root">
      <GridLines />
      <AnimatedOrb />

      {/* Header */}
      <header className="home-header">
        <div className="header-inner">
          <div className="brand-lockup">
            <div className="brand-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="26" height="26" rx="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 14h4l2-5 3 10 2-5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="brand-title">AskYourFile</h1>
          </div>
          <StatusPill status={aiStatus === 'idle' && fileId ? 'ready' : aiStatus} />
        </div>
        <p className="brand-subtitle">
          Drop a document. Ask anything. Get answers grounded in your content.
        </p>
      </header>

      {/* Main two-column layout */}
      <main className="home-content">
        <div className="panel panel--upload">
          <div className="panel-label">
            <span>Upload Document</span>
          </div>
          <FileUpload onFileChange={selectFile} onStatusChange={setAiStatus} />
        </div>

        <div className="panel panel--chat">
          <div className="panel-label">
            <span>Ask Questions</span>
          </div>
          <ChatBox key={fileId ?? 'empty'} fileId={fileId} onStatusChange={setAiStatus} />
        </div>
      </main>
    </div>
  );
}
