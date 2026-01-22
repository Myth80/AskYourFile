import axios from "axios";

const PYTHON_EMBED_URL = "http://127.0.0.1:8000/embed";

export const generateEmbedding = async (text) => {
  const res = await axios.post(PYTHON_EMBED_URL, { text });
  return res.data.embedding;
};
