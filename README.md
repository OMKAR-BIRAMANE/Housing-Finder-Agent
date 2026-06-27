# Chicago Affordable Housing Finder

An AI agent that helps young professionals and low-income families find affordable, livable Chicago neighborhoods — combining static census data with live OpenStreetMap amenity queries.

## What It Does

Users describe their budget and needs in plain English. The agent:
1. Scans 50 Chicago neighborhoods to find ones within budget
2. Live-queries OpenStreetMap to verify grocery stores, train stations, and pharmacies nearby
3. Returns a ranked recommendation with real data backing it up

## Quick Start

### 1. Add your Gemini API key
Add `GEMINI_API_KEY` to your Replit Secrets (already configured if you're reading this in Replit).

Get a free key at: https://aistudio.google.com/app/apikey

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run demo queries
```bash
python main.py
```

### 4. Ask your own questions
```bash
python main.py --interactive
```

## Example Questions

- *"I can only afford $1,200/month and need to be near a train. Where should I live?"*
- *"What's the safest neighborhood in Chicago under $1,100/month for a family?"*
- *"I'm a grad student with $1,500/month — what are my best options?"*

## Project Structure

```
├── main.py                         Entry point
├── requirements.txt                Python dependencies
├── data/
│   └── chicago_housing_metrics.csv 50-neighborhood dataset
├── agent/
│   ├── tools.py                    Dataset search + OSM amenity tools
│   ├── agent_runner.py             LangChain ReAct agent builder
│   └── prompts.py                  System prompt
├── docs/
│   └── PROJECT_DOCUMENTATION.md   Full technical docs
└── results/
    └── sample_results.md           Pre-computed example outputs
```

## Stack

- **LangChain** — ReAct agent framework
- **Google Gemini 2.0 Flash** — LLM reasoning
- **OpenStreetMap Overpass API** — Live amenity data
- **pandas** — Dataset querying
- **colorama** — Terminal output formatting
