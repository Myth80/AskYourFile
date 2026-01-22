import os
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import uvicorn

app = FastAPI()

# Load model once at startup (important)
model = SentenceTransformer("all-MiniLM-L6-v2")

class TextRequest(BaseModel):
    text: str

@app.post("/embed")
def embed_text(req: TextRequest):
    embedding = model.encode(req.text).tolist()
    return {"embedding": embedding}

if __name__ == "__main__":
    port = int(os.environ.get("PYTHON_PORT", 8000))
    uvicorn.run(
        "app:app",
        host="127.0.0.1",   # 🔐 internal only
        port=port,
        log_level="info"
    )
