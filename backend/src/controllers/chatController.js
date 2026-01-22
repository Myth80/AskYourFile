import { generateEmbedding } from '../services/embeddingService.js';
import { getRelevantChunks } from '../services/ragService.js';
import { extractAnswer } from '../utils/extractAnswer.js';

export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // 1️⃣ Embed question (local)
    const questionEmbedding = await generateEmbedding(question);

    // 2️⃣ Retrieve relevant chunks
    const relevantChunks = await getRelevantChunks(
      questionEmbedding,
      3,
      0.2
    );

    if (relevantChunks.length === 0) {
      return res.json({
        answer: 'I don’t know based on the uploaded documents.',
        sources: []
      });
    }

    //  Build context
    const context = relevantChunks.map(c => c.text).join('\n');

    // 4️⃣ Deterministic extraction
    const extracted = extractAnswer(context, question);

    if (!extracted) {
      return res.json({
        answer: 'I don’t know based on the uploaded documents.',
        sources: []
      });
    }

    res.json({
      answer: extracted,
      sources: relevantChunks
    });
  } catch (err) {
  console.error('🔥 ERROR in /api/chat/ask:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
}

};
