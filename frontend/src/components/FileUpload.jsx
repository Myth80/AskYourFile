import { useRef, useState } from 'react';
import { processFile, uploadFile } from '../services/api';

function FileIcon({ file }) {
  const label = file.name.split('.').pop().toUpperCase();

  return (
    <span className="file-icon" aria-hidden="true">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 1h17l8 8v28a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Z"/>
        <path d="M21 1v8h8"/>
      </svg>
      <span className="file-ext-label">{label}</span>
    </span>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadProgress({ file, phase }) {
  return (
    <div className="upload-progress-card" role="status">
      <div className="progress-header">
        <FileIcon file={file} />
        <div className="progress-info">
          <span className="progress-filename">{file.name}</span>
          <span className="progress-label">
            {phase === 'uploading' ? 'Uploading file…' : 'Indexing document…'}
          </span>
        </div>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill progress-fill--indeterminate" />
      </div>
    </div>
  );
}

function FilePreviewCard({ file, onRemove }) {
  return (
    <div className="file-preview-card">
      <div className="fp-left" role="status">
        <FileIcon file={file} />
        <div className="fp-info">
          <span className="fp-name">{file.name}</span>
          <span className="fp-meta">{formatSize(file.size)} · Ready</span>
        </div>
      </div>
      <button type="button" className="fp-remove" onClick={onRemove} aria-label="Remove file">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

export default function FileUpload({ onFileChange, onStatusChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const busyRef = useRef(false);

  async function handleFile(file, existingId = null) {
    if (!file || busyRef.current) return;
    if (!/\.(pdf|txt)$/i.test(file.name)) {
      setError('Choose a PDF or TXT file.');
      return;
    }
    if (file.size === 0) {
      setError('This file is empty. Choose a file that contains text.');
      return;
    }

    busyRef.current = true;
    setError('');
    onFileChange(null);
    onStatusChange('uploading');
    let fileId = existingId;
    try {
      if (!fileId) {
        setSelection({ file, phase: 'uploading' });
        const uploaded = await uploadFile(file);
        fileId = uploaded.fileId;
        if (!fileId) throw new Error('The upload could not be confirmed. Try again.');
      }
      setSelection({ file, phase: 'indexing' });
      const { chunksCreated } = await processFile(fileId);
      if (chunksCreated === 0) {
        setSelection(null);
        setError('No readable text was found. Choose a text file or a PDF with selectable text.');
        return;
      }
      if (!Number.isInteger(chunksCreated) || chunksCreated < 1) {
        throw new Error('Indexing could not be confirmed. Try again.');
      }
      setSelection({ file, phase: 'ready' });
      onFileChange(fileId);
    } catch (err) {
      setSelection({ file, fileId, phase: 'failed' });
      setError(err.message || 'The document could not be prepared. Try again.');
    } finally {
      busyRef.current = false;
      onStatusChange('idle');
    }
  }

  function removeFile() {
    setSelection(null);
    setError('');
    onFileChange(null);
  }

  function onInput(event) {
    const file = event.target.files[0];
    event.target.value = '';
    handleFile(file);
  }

  function onDrop(event) {
    event.preventDefault();
    setDragOver(false);
    handleFile(event.dataTransfer.files[0]);
  }

  const busy = selection?.phase === 'uploading' || selection?.phase === 'indexing';
  const browse = () => inputRef.current?.click();

  return (
    <div
      className="upload-outer"
      onDragOver={event => { event.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <input type="file" hidden ref={inputRef} accept=".pdf,.txt" onChange={onInput} disabled={busy} />
      {busy ? (
        <UploadProgress file={selection.file} phase={selection.phase} />
      ) : selection?.phase === 'ready' ? (
        <>
          <FilePreviewCard file={selection.file} onRemove={removeFile} />
          <button type="button" className="replace-btn" onClick={browse}>Replace file</button>
        </>
      ) : (
        <button
          type="button"
          className={`drop-zone ${dragOver ? 'drop-zone--over' : ''}`}
          onClick={browse}
          aria-label="Choose a file to upload (PDF or TXT)"
        >
          <svg className="dz-icon" width="96" height="76" viewBox="0 0 96 76" fill="none" aria-hidden="true">
            <g stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" transform="rotate(-5 48 40)">
              <path d="M10 26h20l6 6h43v33H10z" fill="#fff"/>
              <path d="M28 38V9h29l10 10v22z" fill="#fff"/>
              <path d="M57 9v10h10M35 23h17m-17 6h24"/>
              <path d="M9 37h29l5-4h44l-9 32H14z" fill="#d5ff39"/>
              <path d="M53 44h22l-2 8H51z" fill="#fff"/>
              <path d="M57 48h11" strokeWidth="1.2"/>
            </g>
          </svg>
          <span className="dz-main">{dragOver ? 'Drop to upload' : 'Drop a file here'}</span>
          <span className="dz-browse">Choose a file</span>
        </button>
      )}
      {error && <p className="upload-error" role="alert">{error}</p>}
      {selection?.phase === 'failed' && (
        <button type="button" className="replace-btn" onClick={() => handleFile(selection.file, selection.fileId)}>
          Retry {selection.file.name}
        </button>
      )}
    </div>
  );
}
