AskYourFile is a full-stack Retrieval-Augmented Generation (RAG) application that allows users to upload documents (PDF/TXT) and ask natural-language questions grounded strictly in the document content.

It combines document parsing, vector search, and Gemini AI to deliver accurate, non-hallucinated answers.

## Run locally

Use Node.js 22.12 or later. In `backend`, run `npm ci`, set `PORT=5000`, `MONGO_URI` and `GEMINI_API_KEY` in a local `.env`, then run `npm start`.

In a second terminal, run `npm ci` and `npm run dev` in `frontend`. Open the URL printed by Vite, choose a PDF or TXT file, and wait for **Document ready** before asking a question.

The development server forwards `/api` to the backend on port 5000. For a separately hosted frontend, set `VITE_BACKEND_URL` to the backend origin before building and allow the frontend origin in the backend's CORS configuration.
