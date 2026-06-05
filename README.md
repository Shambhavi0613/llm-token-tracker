# LLM Token & Cost Tracker

A full-stack dashboard to track OpenAI and Anthropic API token usage and costs in real time. Built as a personal project to solve a real problem ? understanding exactly how much each LLM API call costs, in both USD and INR.

## Screenshots
> Add screenshots after running locally

## Features
- Real-time token counting using tiktoken
- Cost calculation in USD and INR
- Supports GPT-4o, GPT-4o Mini, Claude Sonnet 4
- Live cost calculator before making API calls
- Call history table with session labels and timestamps
- Per-model cost breakdown with visual bars
- Clean REST API built with FastAPI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, tiktoken, Pydantic, Uvicorn |
| Frontend | React 18, Redux Toolkit, Vite |
| Styling | CSS with responsive layout |

## Project Structure

llm-token-tracker/
??? backend/
?   ??? main.py          # FastAPI app ? all endpoints
?   ??? requirements.txt
??? frontend/
    ??? src/
    ?   ??? App.jsx          # Main dashboard
    ?   ??? api/index.js     # Backend API calls
    ?   ??? store/           # Redux state management
    ??? package.json
    ??? vite.config.js

## Run Locally

### Step 1 ? Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload

Backend runs on http://localhost:8000
API docs at http://localhost:8000/docs

### Step 2 ? Frontend
cd frontend
npm install
npm run dev

Frontend runs on http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| GET | /models | List all supported models with pricing |
| POST | /estimate | Calculate cost without logging |
| POST | /track | Log an API call and return cost breakdown |
| GET | /history | Get all logged calls |
| GET | /summary | Aggregate stats by model |
| DELETE | /history | Clear all logged calls |

## Example API Usage

Track a call:
POST /track
{
  "model": "gpt-4o",
  "input_tokens": 1500,
  "output_tokens": 500,
  "session_label": "booking flow"
}

Response:
{
  "status": "logged",
  "call": {
    "model": "gpt-4o",
    "total_tokens": 2000,
    "total_usd": 0.00001,
    "total_inr": 0.835
  }
}

## Supported Models and Pricing

| Model | Input per 1M tokens | Output per 1M tokens |
|-------|--------------------|--------------------|
| GPT-4o | .00 | .00 |
| GPT-4o Mini | .15 | .60 |
| Claude Sonnet 4 | .00 | .00 |

## Author

Shambhavi Shukla ? AI Developer
- GitHub: github.com/Shambhavi0613
- LinkedIn: linkedin.com/in/shambhavishukla
