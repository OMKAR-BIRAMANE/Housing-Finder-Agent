# Chicago Affordable Housing Finder
## Project Documentation

---

## 1. Project Overview

The Chicago Affordable Housing Finder is an AI-powered smart relocation agent designed to help young professionals and low-income families find neighborhoods that are not just cheap, but genuinely livable. The core problem it solves is the disconnect between rent affordability and actual quality of life — many low-rent areas in Chicago are food deserts with no grocery stores or transit access.

The agent combines:
- **Static census data** (50 Chicago neighborhoods with rent, income, crime, and housing unit counts)
- **Live OpenStreetMap queries** (real-time amenity verification: grocery stores, train stations, pharmacies, bus stops)
- **Gemini AI reasoning** (natural language understanding and synthesis via LangChain ReAct pattern)

---

## 2. Architecture

### ReAct Agent Pattern
The agent uses the ReAct (Reasoning + Acting) loop:
1. **Reason** — The LLM thinks about what information it needs
2. **Act** — It calls a tool with specific inputs
3. **Observe** — It reads the tool's output
4. **Repeat** — Until it has enough information to answer

### Components

```
main.py                     Entry point — demo queries + interactive mode
agent/
  prompts.py                System prompt defining agent behavior
  tools.py                  Two LangChain tools (dataset search + OSM query)
  agent_runner.py           Agent builder and query runner
data/
  chicago_housing_metrics.csv   50-neighborhood dataset
```

---

## 3. Tools

### Tool 1: `search_affordable_neighborhoods(budget: int)`
- **Type**: Deterministic Python (no LLM)
- **Input**: Monthly rent budget in USD
- **Process**: Filters the CSV dataset, sorts by crime rate (ascending)
- **Output**: Formatted list of matching neighborhoods with key metrics

### Tool 2: `query_openstreetmap_amenities(zip_code: int)`
- **Type**: Live HTTP API call
- **Input**: Chicago ZIP code
- **Process**: Sends Overpass QL query to `overpass-api.de`, counts amenities within 1500m radius
- **Output**: Amenity counts + livability score (GOOD / FAIR / POOR)

#### Livability Score Logic
| Score | Condition |
|-------|-----------|
| GOOD  | Has grocery AND transit |
| FAIR  | Has grocery OR transit (not both) |
| POOR  | Has neither |

---

## 4. Dataset

50 Chicago neighborhoods covering:
- `Avg_Monthly_Rent_USD` — Average monthly rent
- `Median_Household_Income_USD` — Median household income
- `Crime_Rate_Per_10k` — Crimes per 10,000 residents
- `Affordable_Housing_Units_Available` — Units currently available

---

## 5. Running the Project

```bash
# Run demo queries
python main.py

# Run interactive mode
python main.py --interactive
```

Requires `GEMINI_API_KEY` set in Replit Secrets or `.env`.
