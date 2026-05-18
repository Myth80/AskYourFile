import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================
   EMBEDDINGS
   ========================= */
export const embedText = async (text) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-embedding-2",
  });

  const result = await model.embedContent(text);

  return result.embedding.values;
};

/* =========================
   ANSWERS
   ========================= */
export const askGemini = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.generateContent(prompt);

  return result.response.text();
};
