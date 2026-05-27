import { useState, useRef, useCallback } from 'react';

function FileIcon({ type }) {
  const colors = {
    pdf: '#f05',
    docx: '#2b7be7',
    txt: '#888',
    default: '#5b8af5',
  };
  const ext = type?.split('/')[1] || 'default';
  const color = colors[ext] || colors.default;
  const label = ext.toUpperCase().slice(0, 4);

  return (
    <div className="file-icon" style={{ '--file-color': color }}>
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="24" height="38" rx="3" fill="none" stroke="var(--file-color)" strokeWidth="1.5" opacity="0.5"/>
        <path d="M25 1L31 7V39a1 1 0 01-1 1H6" stroke="var(--file-color)" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <path d="M25 1v6h6" stroke="var(--file-color)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
      <span className="file-ext-label" style={{ color }}>{label}</span>
    </div>
  );
}

function UploadProgress({ progress, fileName }) {
  return (
    <div className="upload-progress-card">
      <div className="progress-header">
        <FileIcon type="application/pdf" />
        <div className="progress-info">
          <span className="progress-filename">{fileName}</span>
          <span className="progress-pct">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="progress-label">
        {progress < 100 ? 'Uploading & indexing…' : 'Processing complete'}
      </span>
    </div>
  );
}

function FilePreviewCard({ file, onRemove }) {
  const sizeMB = (file.size / 1024 / 1024).toFixed(2);

  return (
    <div className="file-preview-card">
      <div className="fp-left">
        <FileIcon type={file.type} />
        <div className="fp-info">
          <span className="fp-name">{file.name}</span>
          <span className="fp-meta">{sizeMB} MB · Ready</span>
        </div>
      </div>
      <button className="fp-remove" onClick={onRemove} aria-label="Remove file">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      <span className="fp-ready-dot" aria-hidden="true" />
    </div>
  );
}

export default function FileUpload({ onStatusChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (f) => {
    if (!f) return;
    setFile(null);
    setUploading(true);
    setProgress(0);
    onStatusChange?.('uploading');

    // Simulate upload + indexing progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 14 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          setFile(f);
          onStatusChange?.('idle');
        }, 600);
      }
      setProgress(p);
    }, 180);

    // Replace with actual upload: await uploadToServer(f)
  }, [onStatusChange]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onInput = (e) => { const f = e.target.files[0]; if (f) handleFile(f); };

  if (uploading) {
    return (
      <div className="upload-outer">
        <UploadProgress progress={progress} fileName="document.pdf" />
        <style>{uploadStyles}</style>
      </div>
    );
  }

  if (file) {
    return (
      <div className="upload-outer">
        <FilePreviewCard file={file} onRemove={() => setFile(null)} />
        <button className="replace-btn" onClick={() => inputRef.current?.click()}>
          Replace file
        </button>
        <input type="file" ref={inputRef} style={{ display: 'none' }} onChange={onInput}
          accept=".pdf,.doc,.docx,.txt,.md" />
        <style>{uploadStyles}</style>
      </div>
    );
  }

  return (
    <div className="upload-outer">
      <div
        className={`drop-zone ${dragOver ? 'drop-zone--over' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload file"
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={onInput}
          accept=".pdf,.doc,.docx,.txt,.md"
        />

        <div className="dz-icon" aria-hidden="true">
          <div className="dz-icon-ring dz-icon-ring--outer" />
          <div className="dz-icon-ring dz-icon-ring--inner" />
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 20V10M9 15l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 22h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4"/>
          </svg>
        </div>

        <p className="dz-main">
          {dragOver ? 'Drop to upload' : 'Drop your file here'}
        </p>
        <p className="dz-sub">or click to browse · PDF, DOCX, TXT</p>

        <div className="dz-formats" aria-hidden="true">
          {['PDF', 'DOCX', 'TXT', 'MD'].map(f => (
            <span key={f} className="fmt-badge">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
