import axios from "axios";

const PYTHON_URL = "http://127.0.0.1:8000/embed";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const generateEmbedding = async (text, retries = 10) => {
  try {
    const res = await axios.post(PYTHON_URL, { text });
    return res.data.embedding;
  } catch (err) {
    if (
      retries > 0 &&
      (err.code === "ECONNREFUSED" || err.code === "ECONNRESET")
    ) {
      console.log("⏳ Python not ready yet, retrying...");
      await sleep(1500);
      return generateEmbedding(text, retries - 1);
    }

    throw new Error("Embedding service unavailable");
  }
};
