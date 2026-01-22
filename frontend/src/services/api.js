const API_BASE_URL = import.meta.env.VITE_API_URL;


export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    body: formData
  });

  return res.json();
};

export const askQuestion = async (question) => {
  const res = await fetch(`${API_BASE_URL}/api/chat/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question })
  });

  return res.json();
};
