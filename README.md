# Indeeeed — AI Job Application Optimizer

Full-stack application that scrapes Indeed job listings and uses GPT-4o to tailor your resume and cover letter for each application.

## Architecture

```
chrome-extension/   → Manifest V3 Chrome Extension (Indeed scraper)
backend/            → Node.js + Express API (OpenAI integration, DOCX generation)
frontend/           → React + Tailwind CSS dashboard
```

## Quick Start

### 1. Set your OpenAI API key

```bash
export OPENAI_API_KEY=sk-your-key-here
```

### 2. Start the backend

```bash
cd backend
npm install
npm start
# → runs on http://localhost:3001
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm start
# → runs on http://localhost:3000
```

### 4. Install the Chrome Extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `chrome-extension/` folder
4. Navigate to any Indeed job listing page

## Usage

1. **Upload your resume** via the dashboard at http://localhost:3000
2. **Browse Indeed** and open any job listing
3. **Click "Optimize My Application"** (floating button on Indeed)
4. **View results** in the dashboard — side-by-side resume comparison, highlighted cover letter, keyword gap analysis
5. **Download** tailored resume and cover letter as DOCX files

## Tech Stack

- **Chrome Extension**: Manifest V3, Vanilla JS
- **Backend**: Node.js, Express, OpenAI SDK, mammoth, pdfplumber, docx
- **Frontend**: React, Tailwind CSS v4
- **AI**: OpenAI GPT-4o
- **Storage**: Local filesystem (no database)
