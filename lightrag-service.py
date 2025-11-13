#!/usr/bin/env python3
import sys
import json
import asyncio
from lightrag.lightrag import LightRAG
from lightrag.llm import ollama_model_complete, ollama_embedding
from lightrag.utils import EmbeddingFunc

# Configure LightRAG with Ollama
rag = LightRAG(
    working_dir="./lightrag_cache",
    llm_model_func=ollama_model_complete,
    llm_model_name="qwen2.5:7b",
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: ollama_embedding(texts, embed_model="nomic-embed-text")
    )
)

async def insert_course_content(content):
    await rag.ainsert(content)

async def query_course(question):
    return await rag.aquery(question)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python lightrag-service.py <action> <data>")
        sys.exit(1)
    
    action = sys.argv[1]
    data = sys.argv[2]
    
    if action == "insert":
        asyncio.run(insert_course_content(data))
        print("Content inserted successfully")
    elif action == "query":
        result = asyncio.run(query_course(data))
        print(json.dumps({"result": result}))