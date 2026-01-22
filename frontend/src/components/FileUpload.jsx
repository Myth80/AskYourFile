import { useState } from "react";
import { uploadFile, processFile } from "../services/api";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    try {
      setStatus("Uploading file...");

      /* 1️⃣ Upload */
      const { fileId, message } = await uploadFile(file);

      setStatus("Processing file (creating embeddings)...");

      /* 2️⃣ Process */
      await processFile(fileId);

      setStatus("✅ File uploaded & processed successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ File upload or processing failed");
    }
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
            {file ? file.name : "Click to select or drag a file"}
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
