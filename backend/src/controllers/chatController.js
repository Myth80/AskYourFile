import Chunk from "../models/Chunk.js";
import { embedText, askGemini } from "../services/geminiService.js";

export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    const queryEmbedding = await embedText(question);

    const results = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: "embedding_index",
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 100,
          limit: 5,
        },
      },
    ]);

    const context = results.map(r => r.text).join("\n\n");

    const prompt = `
Use the context below to answer the question.

Context:
${context}

Question:
${question}
`;

    const answer = await askGemini(prompt);

    res.json({ answer });
  } catch (err) {
    console.error("🔥 Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
console.log("🔍 Vector results:", results.length);
