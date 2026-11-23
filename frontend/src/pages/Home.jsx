import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ChatBox from '../components/ChatBox';

const statusLabels = {
  idle: 'Awaiting file',
  ready: 'Document ready',
  uploading: 'Processing file…',
  thinking: 'Thinking…',
};

export default function Home() {
  const [aiStatus, setAiStatus] = useState('idle');
  const [fileId, setFileId] = useState(null);
  const status = aiStatus === 'idle' && fileId ? 'ready' : aiStatus;

  function selectFile(id) {
    setFileId(id);
    setAiStatus('idle');
  }

  return (
    <div className="home-root">
      <header className="home-header">
        <h1 className="brand-title">AskYour<em>File</em></h1>
        <div className="header-detail">
          <p className="brand-subtitle">A conversation with your documents.</p>
          <div className={`status-pill status-pill--${status}`} role="status">
            <span className="status-dot" aria-hidden="true" />
            {statusLabels[status]}
          </div>
        </div>
      </header>

      <main className="home-content">
        <section className="panel panel--upload" aria-labelledby="document-heading">
          <header className="panel-heading">
            <h2 id="document-heading">Your document</h2>
            <span className="format-label">PDF / TXT</span>
          </header>
          <FileUpload onFileChange={selectFile} onStatusChange={setAiStatus} />
        </section>

        <section className="panel panel--chat" aria-labelledby="chat-heading">
          <header className="panel-heading">
            <h2 id="chat-heading">Conversation</h2>
          </header>
          <ChatBox key={fileId ?? 'empty'} fileId={fileId} onStatusChange={setAiStatus} />
        </section>
      </main>
    </div>
  );
}
