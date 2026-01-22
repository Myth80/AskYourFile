import fetch from 'node-fetch';

const HF_API_KEY = process.env.HF_API_KEY;

// Stable, instruction-tuned model
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

export const generateAnswer = async (context, question) => {
  const prompt = `
You are an AI assistant.
Answer ONLY using the context below.
If the answer is not present, say:
"I don’t know based on the uploaded documents."

Context:
${context}

Question:
${question}
`;

  const response = await fetch(
    `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.2,
          return_full_text: false
        }
      })
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data[0]?.generated_text || 'I don’t know based on the uploaded documents.';
};
