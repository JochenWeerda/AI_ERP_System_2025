from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import openai

router = APIRouter()

class CompletionRequest(BaseModel):
    prompt: str
    model: str = "gpt-3.5-turbo"
    max_tokens: int = 100

class EmbeddingRequest(BaseModel):
    text: str
    model: str = "text-embedding-ada-002"

@router.post("/completions")
async def generate_completion(req: CompletionRequest):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    openai.api_key = api_key
    try:
        resp = openai.ChatCompletion.create(
            model=req.model,
            messages=[{"role": "user", "content": req.prompt}],
            max_tokens=req.max_tokens,
        )
        text = resp.choices[0].message["content"]
        return {"completion": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/embeddings")
async def generate_embedding(req: EmbeddingRequest):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    openai.api_key = api_key
    try:
        resp = openai.Embedding.create(input=req.text, model=req.model)
        return {"embedding": resp["data"][0]["embedding"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
