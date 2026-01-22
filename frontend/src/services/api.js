const API_BASE_URL = import.meta.env.VITE_API_URL;

/* =========================
   FILE UPLOAD
   ========================= */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }

  // returns { message, fileId }
  return res.json();
};

/* =========================
   FILE PROCESSING
   ========================= */
export const processFile = async (fileId) => {
  const res = await fetch(
    `${API_BASE_URL}/api/files/process/${fileId}`,
    {
      method: "POST"
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Processing failed");
  }

  return res.json();
};

/* =========================
   CHAT
   ========================= */
export const askQuestion = async (question) => {
  const res = await fetch(`${API_BASE_URL}/api/chat/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Chat failed");
  }

  return res.json();
};
