import { useState } from 'react';
import { uploadFile } from '../services/api';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return;

    setStatus('Uploading...');
    const res = await uploadFile(file);
    setStatus(res.message || 'Uploaded');
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <label className="file-drop-area">
          <input
            type="file"
            className="hidden-file-input"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <div className="upload-icon">📁</div>
          <span className="file-name-display">
            {file ? file.name : 'Click to select or drag a file'}
          </span>
        </label>
        
        <button 
          className="upload-button" 
          onClick={handleUpload}
          disabled={!file}
        >
          Upload to Assistant
        </button>
        
        {status && <p className="status-message">{status}</p>}
      </div>
    </div>
  );
}