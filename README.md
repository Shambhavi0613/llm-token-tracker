# LLM Token & Cost Tracker

A full-stack dashboard to track OpenAI and Anthropic API token usage and costs in real time. Built as a personal project to solve a real problem ? understanding exactly how much each LLM API call costs, in both USD and INR.

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

## Run Locally

### Backend
`ash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
`
Backend runs on http://localhost:8000

### Frontend
`ash
cd frontend
npm install
npm run dev
`
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

## Supported Models

| Model | Input per 1M tokens | Output per 1M tokens |
|-------|--------------------|--------------------|
| GPT-4o | USD 5.00 | USD 15.00 |
| GPT-4o Mini | USD 0.15 | USD 0.60 |
| Claude Sonnet 4 | USD 3.00 | USD 15.00 |

## Author

Shambhavi Shukla ? AI Developer
- GitHub: github.com/Shambhavi0613
- LinkedIn: linkedin.com/in/shambhavishukla
