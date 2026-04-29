# AI-Powered QA Automation Platform

An end-to-end QA system that combines **AI-driven test generation**, **Playwright execution**, and **AI-based failure analysis**, with a **visual dashboard** for insights.

---

## Overview

This project demonstrates a **closed-loop QA automation system**:

Requirement
   ↓
AI generates Playwright tests
   ↓
Tests execute via Playwright
   ↓
Failures captured as structured data
   ↓
AI analyzes failures (root cause + fix)
   ↓
Results visualized in a dashboard

## AI Test Generator (test-generator)
Converts natural language requirements → Playwright tests
Enforces:
- Page Object Model (POM)
- Fixtures
- Hooks (e.g. login deduplication)
- Data separation (users vs domain data)
- Uses structured prompts and JSON outputs
- Includes custom validation layer to guarantee architecture correctness

## AI Failure Analyzer (flaky-analyzer)
- Parses Playwright test results
- Extracts failure context:
-- Test name
-- Spec file
-- Project/browser
- Uses AI to determine:
-- Failure type (timeout, locator, assertion, etc.)
-- Likely root cause
-- Flaky vs real failure
-- Suggested fix
-- Recommended code changes

## One-Command Execution

Run the full pipeline:

npm run qa:run

This will:

1. Execute Playwright tests
2. Analyze failures with AI
3. Generate a report
4. Update the UI automatically

## Project Structure

ai-quality-engine/
 ├── test-generator/        # AI test generation + Playwright tests
 │   ├── src/
 │   ├── generated/
 │   └── playwright.config.ts
 │
 ├── flaky-analyzer/        # Failure analysis + UI
 │   ├── src/
 │   │   ├── services/      # AI service
 │   │   ├── utils/         # parsers
 │   │   ├── validators/    # validation logic
 │   │   └── types/
 │   ├── ui/                # Dashboard (HTML + JS)
 │   └── analysis-report.json
 │
 └── package.json           # Root orchestration scripts

 ## Setup

 - Install dependencies
cd test-generator && npm install
cd ../flaky-analyzer && npm install
cd ..

-  Add OpenAI API key
Add OpenAI API key
OPENAI_API_KEY=your_api_key_here

- Run the system
npm run qa:run

- Launch the dashboard
cd flaky-analyzer
npx serve ui

- Open:
http://localhost:3000
