import mongoose from "mongoose";
import Chunk from "../models/Chunk.js";
import { embedText, askGemini } from "../services/geminiService.js";

function cosineSimilarity(vector, queryVector, queryNorm) {
  if (!Array.isArray(vector) || vector.length !== queryVector.length) return NaN;

  let dotProduct = 0;
  let squaredNorm = 0;
  for (let i = 0; i < vector.length; i++) {
    dotProduct += vector[i] * queryVector[i];
    squaredNorm += vector[i] * vector[i];
  }
  return dotProduct / (Math.sqrt(squaredNorm) * queryNorm);
}

export const askQuestion = async (req, res) => {
  try {
    const { question, fileId } = req.body ?? {};
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question required" });
    }
    if (!mongoose.isObjectIdOrHexString(fileId)) {
      return res.status(400).json({ error: "A valid file ID is required" });
    }

    const chunks = await Chunk.find({ fileId }, "text embedding").lean();
    if (!chunks.length) {
      return res.status(422).json({ error: "This file has no indexed text to answer questions from." });
    }

    const queryVector = await embedText(question.trim());
    const queryNorm = Math.hypot(...queryVector);
    if (!Number.isFinite(queryNorm) || queryNorm === 0) {
      throw new Error("Question embedding is invalid");
    }

    // Processing stores at most 20 chunks per document.
    const matches = chunks
      .map(chunk => ({
        text: chunk.text,
        score: cosineSimilarity(chunk.embedding, queryVector, queryNorm),
      }))
      .filter(match => match.text?.trim() && Number.isFinite(match.score))
      .sort((first, second) => second.score - first.score)
      .slice(0, 5);
    if (!matches.length) {
      return res.status(422).json({ error: "This file has no usable indexed text. Try uploading it again." });
    }

    const context = matches.map(match => match.text).join("\n\n");
    const prompt = `Answer the question using only the document excerpts below. If the excerpts do not contain the answer, say so.

Context:
${context}

Question:
${question.trim()}
`;

    const answer = await askGemini(prompt);

    res.json({ answer });
  } catch (err) {
    console.error("🔥 Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
