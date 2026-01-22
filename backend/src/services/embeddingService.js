import axios from "axios";

const PYTHON_BASE_URL = process.env.PYTHON_EMBEDDING_URL;

if (!PYTHON_BASE_URL) {
  throw new Error("PYTHON_EMBEDDING_URL is not defined");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const generateEmbedding = async (text, retries = 5) => {
  try {
    const res = await axios.post(
      `${PYTHON_BASE_URL}/embed`,
      { text },
      { timeout: 20000 }
    );

    return res.data.embedding;
  } catch (err) {
    if (
      retries > 0 &&
      (err.code === "ECONNREFUSED" ||
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT")
    ) {
      console.log("⏳ Embedding service not ready, retrying...");
      await sleep(1500);
      return generateEmbedding(text, retries - 1);
    }

    console.error(err.message);
    throw new Error("Embedding service unavailable");
  }
};
