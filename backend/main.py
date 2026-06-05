import os
import json
import tiktoken
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

app = FastAPI(title="LLM Token & Cost Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PRICES = {
    "gpt-4o":                   {"input": 0.000005,   "output": 0.000015},
    "gpt-4o-mini":              {"input": 0.00000015, "output": 0.0000006},
    "claude-sonnet-4-20250514": {"input": 0.000003,   "output": 0.000015},
}

USD_TO_INR = 83.5

def count_tokens(text: str, model="gpt-4o") -> int:
    try:
        enc = tiktoken.encoding_for_model(model)
    except KeyError:
        enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))

def calculate_cost(model: str, input_tokens: int, output_tokens: int):
    key = model.split("/")[-1]
    p = PRICES.get(key)
    if not p:
        return None
    input_cost  = input_tokens  * p["input"]
    output_cost = output_tokens * p["output"]
    return {
        "input_cost_usd":  round(input_cost,  8),
        "output_cost_usd": round(output_cost, 8),
        "total_cost_usd":  round(input_cost + output_cost, 8),
        "total_cost_inr":  round((input_cost + output_cost) * USD_TO_INR, 4),
    }

call_log: List[dict] = []

class TrackRequest(BaseModel):
    model: str
    input_tokens: int
    output_tokens: int
    session_label: Optional[str] = "Unnamed session"

@app.get("/")
def root():
    return {"message": "LLM Token & Cost Tracker API", "version": "1.0.0"}

@app.get("/models")
def list_models():
    return {
        "models": [
            {"id": k, "label": k,
             "provider": "openai" if "gpt" in k else "anthropic",
             "input_price_per_1m":  v["input"]  * 1_000_000,
             "output_price_per_1m": v["output"] * 1_000_000}
            for k, v in PRICES.items()
        ],
        "usd_to_inr_rate": USD_TO_INR,
    }

@app.post("/estimate")
def estimate(model: str, input_tokens: int, output_tokens: int):
    cost = calculate_cost(model, input_tokens, output_tokens)
    if not cost:
        return {"error": f"Unknown model: {model}"}
    return {
        "model": model,
        "input_tokens":   input_tokens,
        "output_tokens":  output_tokens,
        "total_tokens":   input_tokens + output_tokens,
        "input_cost_usd":  cost["input_cost_usd"],
        "output_cost_usd": cost["output_cost_usd"],
        "total_usd":       cost["total_cost_usd"],
        "total_inr":       cost["total_cost_inr"],
    }

@app.post("/track")
def track_call(req: TrackRequest):
    cost = calculate_cost(req.model, req.input_tokens, req.output_tokens)
    if not cost:
        return {"error": f"Unknown model: {req.model}"}
    entry = {
        "id":            str(uuid.uuid4())[:8],
        "model":         req.model,
        "label":         req.model,
        "provider":      "openai" if "gpt" in req.model else "anthropic",
        "session_label": req.session_label,
        "input_tokens":  req.input_tokens,
        "output_tokens": req.output_tokens,
        "total_tokens":  req.input_tokens + req.output_tokens,
        "timestamp":     datetime.utcnow().isoformat() + "Z",
        "total_usd":     cost["total_cost_usd"],
        "total_inr":     cost["total_cost_inr"],
        "input_cost_usd":  cost["input_cost_usd"],
        "output_cost_usd": cost["output_cost_usd"],
    }
    call_log.append(entry)
    return {"status": "logged", "call": entry}

@app.get("/history")
def get_history(model: Optional[str] = None):
    data = list(reversed(call_log))
    if model:
        data = [c for c in data if c["model"] == model]
    return {"calls": data, "total": len(data)}

@app.get("/summary")
def get_summary():
    if not call_log:
        return {"total_calls": 0, "total_tokens": 0, "total_usd": 0,
                "total_inr": 0, "avg_cost_usd": 0, "by_model": {}}
    total_usd    = sum(c["total_usd"]    for c in call_log)
    total_tokens = sum(c["total_tokens"] for c in call_log)
    by_model = {}
    for c in call_log:
        m = c["model"]
        if m not in by_model:
            by_model[m] = {"label": c["label"], "provider": c["provider"],
                           "calls": 0, "tokens": 0, "cost_usd": 0.0}
        by_model[m]["calls"]    += 1
        by_model[m]["tokens"]   += c["total_tokens"]
        by_model[m]["cost_usd"] = round(by_model[m]["cost_usd"] + c["total_usd"], 8)
    for m in by_model:
        by_model[m]["cost_inr"] = round(by_model[m]["cost_usd"] * USD_TO_INR, 4)
    return {
        "total_calls":  len(call_log),
        "total_tokens": total_tokens,
        "total_usd":    round(total_usd, 8),
        "total_inr":    round(total_usd * USD_TO_INR, 4),
        "avg_cost_usd": round(total_usd / len(call_log), 8),
        "by_model":     by_model,
    }

@app.delete("/history")
def clear_history():
    call_log.clear()
    return {"status": "cleared"}
