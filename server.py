import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent.agent_runner import run_query

app = FastAPI(title="Chicago Housing Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str
    success: bool


class HealthResponse(BaseModel):
    status: str


@app.get("/api/healthz", response_model=HealthResponse)
def health():
    return {"status": "ok"}


@app.post("/api/agent/query", response_model=QueryResponse)
def agent_query(req: QueryRequest):
    try:
        answer = run_query(req.question)
        return {"answer": answer, "success": True}
    except Exception as e:
        return {"answer": str(e), "success": False}


@app.get("/api/agent/neighborhoods")
def get_neighborhoods():
    import pandas as pd
    df = pd.read_csv("data/chicago_housing_metrics.csv")
    df["Zip_Code"] = df["Zip_Code"].astype(int)
    return df.to_dict(orient="records")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8090))
    uvicorn.run(app, host="0.0.0.0", port=port)
