import axios from "axios";

const PYTHON_URL = "http://127.0.0.1:8000/embed";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const generateEmbedding = async (text, retries = 5) => {
  try {
    const res = await axios.post(PYTHON_URL, { text });
    return res.data.embedding;
  } catch (err) {
    if (retries > 0 && err.code === "ECONNREFUSED") {
      console.log("⏳ Python not ready, retrying...");
      await sleep(1000);
      return generateEmbedding(text, retries - 1);
    }
    throw err;
  }
};
