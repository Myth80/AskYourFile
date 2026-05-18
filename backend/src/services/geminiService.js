import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================
   EMBEDDINGS
   ========================= */
export const embedText = async (text) => {
  const model = genAI.getGenerativeModel(
    { model: "text-embedding-latest" },
    { apiVersion: "v1" } // ✅ fix 404 error
  );
  const result = await model.embedContent(text);
  return result.embedding.values;
};

/* =========================
   ANSWERS
   ========================= */
export const askGemini = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest", // ✅ fix invalid model name
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};
