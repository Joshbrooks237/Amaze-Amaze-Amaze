# Indeeeed — The Most Excellent Job Application Optimizer

> *"Dude... getting a job is like... a most heinous ordeal. But what if, like, an AI could make your resume totally non-bogus?"*
> — Ted "Theodore" Logan

Greetings, most outstanding future employees of the world.

So okay, here's the deal. Me and — well, just me — I was sitting in the phone booth and I thought: "Whoa. What if every time you apply for a job, a robot brain rewrites your resume so it sounds like you're the EXACT person they're looking for?" And then I was like: "Excellent."

**Indeeeed** is a full-stack, AI-powered job application optimizer that scrapes Indeed job listings, pulls out the keywords the robots are scanning for, and rewrites your resume and cover letter to be most triumphant.

It is, dare I say... excellent.

---

## How It Works (Station!)

```
  YOU ──► Indeed Job Page ──► Chrome Extension scrapes it
                                      │
                                      ▼
                              Backend (Node.js) ──► GPT-4o
                                      │
                              ┌───────┼───────┐
                              ▼       ▼       ▼
                          Keywords  Resume  Cover Letter
                              │       │       │
                              └───────┼───────┘
                                      ▼
                            React Dashboard (most bodacious)
                                      │
                                      ▼
                              Download DOCX files
                              Get the job
                              Party on, dudes
```

---

## The Excellent Adventure (Setup)

### Step 1: The Key to the Future

You need an OpenAI API key. It's like the key to the phone booth, but for AI.

```bash
export OPENAI_API_KEY=sk-your-key-here
```

No key, no ride. Most non-triumphant.

### Step 2: Fire Up the Backend (The Phone Booth)

```bash
cd backend
npm install
npm start
# Runs on http://localhost:3001
# If it says "server running" — excellent!
# If it doesn't — bogus!
```

### Step 3: Fire Up the Frontend (The Dashboard of Destiny)

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
# A most outstanding dashboard appears
```

### Step 4: Load the Chrome Extension (The Time-Traveling Scraper)

1. Go to `chrome://extensions` — don't be afraid, it's not the iron maiden
2. Turn on **Developer mode** (top right corner, dude)
3. Click **Load unpacked** → point it at the `chrome-extension/` folder
4. Navigate to Indeed. Find a job. Any job. Even if it says "requires experience" — whoa.

---

## Usage (Be Excellent to Your Resume)

1. **Upload your master resume** at the dashboard. PDF or DOCX. Just drag it in there like an air guitar solo.

2. **Go to Indeed** and find a job listing. The extension will detect it and go *"Whoa, this is a job page."*

3. **Click the floating button** that says "Optimize My Application." It's blue. It's round. It's most inviting.

4. **Wait for the AI** — it's doing three things at once, which is like, way more than I usually do:
   - Extracting the top 20 ATS keywords (the secret code the hiring robots look for)
   - Rewriting your resume to naturally include those keywords (without lying — we're not rufus-level dishonest)
   - Writing a cover letter that sounds like YOU but, like, a version of you that really has it together

5. **Check the dashboard** — you'll see:
   - Your original resume next to the tailored one (side by side, most excellent comparison)
   - The cover letter with all the keywords highlighted in yellow (like a highlighter, but digital)
   - A keyword gap analyzer showing what was missing (knowledge is power, Bill)
   - A match score (higher number = more triumphant)

6. **Download** your tailored resume and cover letter as DOCX files. They even have a footer that says what job they were optimized for. Professional!

7. **Choose your vibe** for the cover letter:
   - **Professional** — like wearing a suit to the interview
   - **Confident** — like knowing the answer before they ask
   - **Conversational** — like talking to a most excellent friend who happens to be hiring

---

## The Architecture (or, What's Inside the Phone Booth)

```
Indeeeed/
├── chrome-extension/     ← The time-traveling scraper
│   ├── manifest.json       (tells Chrome what we're about)
│   ├── content.js          (scrapes Indeed like a most diligent student)
│   ├── background.js       (the behind-the-scenes dude)
│   ├── popup.html/js       (the little window that pops up)
│   └── styles.css          (makes everything look non-bogus)
│
├── backend/              ← The phone booth (where the magic happens)
│   ├── server.js           (the brains of the operation)
│   ├── docxGenerator.js    (turns AI words into Word documents)
│   └── package.json        (the ingredients list)
│
├── frontend/             ← The Dashboard of Destiny
│   └── src/
│       ├── App.js                (the main stage)
│       ├── api.js                (talks to the phone booth)
│       └── components/
│           ├── ResumeUpload.js      (drag, drop, rock)
│           ├── HistoryFeed.js       (all your excellent optimizations)
│           ├── OptimizationDetail.js (the deep dive, dude)
│           ├── KeywordPanel.js      (the gap analyzer of truth)
│           └── StatusBar.js         (are we online? whoa.)
│
└── README.md             ← You are here. Excellent.
```

---

## Tech Stack (The Instruments of Rock)

| Thing | What It Does |
|-------|-------------|
| **Chrome Extension** (Manifest V3) | Scrapes Indeed like a most studious scholar |
| **Node.js + Express** | The backend. The engine. The phone booth motor. |
| **OpenAI GPT-4o** | The AI brain. Smarter than both of us combined. Way smarter. |
| **mammoth** | Reads DOCX resumes (not the animal, the library) |
| **pdfplumber** | Reads PDF resumes (via Python, because sometimes you need a buddy) |
| **docx** | Creates beautiful Word documents with bold keywords and footers |
| **React** | The frontend framework. Makes things appear on screen. Most visual. |
| **Tailwind CSS** | Makes everything look dark and sleek and professional |

---

## Important Rules (The Wyld Stallyns Code of Conduct)

- Your master resume is **NEVER overwritten**. We always make new copies. That's just, like, being excellent to past-you.
- Every AI call has error handling. If something breaks, you get a real message, not just *"bogus."*
- Console logs at every step. If something goes wrong, you can see exactly where the time-space continuum broke.
- The `.env` file with your API key is gitignored. We're not *that* bogus.
- Mobile responsive. Because sometimes you're job hunting on your phone in the Circle K parking lot.

---

## Troubleshooting (When Things Get Most Heinous)

**"Backend offline"** — Did you run `npm start` in the backend folder? Did you set your API key? No? Bogus.

**"No master resume uploaded"** — Go to the dashboard and upload one first. The AI can't optimize what it doesn't have, dude.

**"Could not find enough job description text"** — Scroll down on the Indeed page. Sometimes the description loads late. It's a patience thing.

**"OpenAI API quota exceeded"** — You've used up your credits. Time to add more at platform.openai.com. Or, like, wait until next month.

---

## The Philosophy

> *"Be excellent to each other."*
> — Abraham Lincoln (via Bill & Ted)

> *"Be excellent to your resume."*
> — This app

Every person deserves a most outstanding shot at getting hired. The ATS robots shouldn't stop bodacious candidates from getting through. This app levels the playing field so your resume speaks the language the machines want to hear, while still keeping everything 100% true to who you are.

No lies. No fake experience. Just your real self, presented in the most excellent way possible.

---

**Party on, dudes. And go get that job.**

*Station!*
