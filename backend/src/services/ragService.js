import Chunk from '../models/Chunk.js';

/**
 * Split text into overlapping chunks (Phase 3)
 */
export const chunkText = (text, size = 500, overlap = 50) => {
  if (overlap >= size) {
    throw new Error('overlap must be smaller than size');
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }

  return chunks;
};

/**
 * Compute cosine similarity between two vectors (Phase 4)
 */
export const cosineSimilarity = (a, b) => {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

/**
 * Retrieve top-K relevant chunks (Phase 4)
 */
export const getRelevantChunks = async (
  questionEmbedding,
  topK = 5,
  minScore = 0.2
) => {
  const chunks = await Chunk.find();

  const scored = chunks
    .map(chunk => ({
      text: chunk.text,
      score: cosineSimilarity(questionEmbedding, chunk.embedding)
    }))
    .filter(c => c.score >= minScore) // 🔴 KEY LINE
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
};
