const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

async function post(path, options, fallback) {
  let response;
  try {
    response = await fetch(`${baseUrl}/api${path}`, { method: 'POST', ...options });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Could not reach AskYourFile. Check your connection and try again.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || fallback);
  return data;
}

export function uploadFile(file) {
  const body = new FormData();
  body.append('file', file);
  return post('/files/upload', { body }, 'Upload failed. Please try again.');
}

export function processFile(fileId) {
  return post(`/files/process/${encodeURIComponent(fileId)}`, {}, 'Indexing failed. Please try again.');
}

export function askQuestion(question, fileId, signal) {
  return post('/chat/ask', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, fileId }),
    signal,
  }, 'Could not get an answer. Please try again.');
}
