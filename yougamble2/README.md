# YouGamble2 ⚽

**Premier League Pattern Analyzer — Custom IF→THEN Logic Engine**

2006–2026 · 20 seasons · 7,600+ matches

Analyzes historical Premier League goal patterns using custom `IF → THEN` logic rules.

## Live Demo

[https://walusimbi-leon1.github.io/yg2/](https://walusimbi-leon1.github.io/yg2/)

## Features

### 🔍 Pattern Analysis
- **10 built-in rules** covering scoring streaks, defensive patterns, draw patterns
- Run all rules instantly on any Premier League team
- See historical occurrence count, win rates, goal distributions

### 🔧 Custom Pattern Builder
Create your own IF→THEN rules:

| IF | THEN |
|---|---|
| Team scored `< 1 goal` in `3 consecutive` games | Analyze goals scored in 4th game |
| Team conceded `≥ 2 goals` in `2 consecutive` games | Analyze result in next match |
| Team `lost` `3 consecutive` games | Analyze outcome in 4th match |
| Total goals `≥ 4` in `2 consecutive` games | Analyze total goals in next match |

### 📊 Statistics per Pattern
- Occurrence count (how many times this pattern happened)
- Average goals scored/conceded in the next match
- Win / Draw / Loss rates
- Over 2.5 goals percentage
- Both teams scored percentage
- Goal distribution chart
- Recent occurrences with match details

### 💾 Saved Patterns
- Save your custom patterns to localStorage
- Reusable across teams
- Accessible from the "Saved Patterns" tab

### 📅 Match History
- Browse 20 years of Premier League matches for any team
- Filter by home/away/wins/losses/draws/goals

## How to Use

1. **Select a team** from the dropdown
2. Choose **season range** (default: all 20 seasons)
3. Click **Analyze Team**
4. Browse built-in pattern results
5. Go to **Pattern Builder** to create custom rules
6. **Save** patterns you find useful

## Legal

Pattern analysis tool for educational purposes. Sports outcomes are inherently unpredictable. Not financial advice.
