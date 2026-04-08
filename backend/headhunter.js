require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = 3088;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// ── Load active profile ──
function getActiveProfile() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/profiles.json'), 'utf8'));
    const activeId = data.activeProfileId;
    return data.profiles.find(p => p.id === activeId) || data.profiles[0] || null;
  } catch { return null; }
}

// ── Load headhunter insights (if any saved) ──
const INSIGHTS_FILE = path.join(__dirname, 'data/headhunter-insights.json');
function loadInsights() {
  try { return JSON.parse(fs.readFileSync(INSIGHTS_FILE, 'utf8')); } catch { return null; }
}
function saveInsights(data) {
  fs.writeFileSync(INSIGHTS_FILE, JSON.stringify(data, null, 2));
}

// ── Headhunter Review Endpoint ──
app.post('/review', async (req, res) => {
  const profile = getActiveProfile();
  if (!profile) return res.status(400).json({ error: 'No active profile found' });

  const targetRole = req.body.targetRole || '';

  console.log(`[Headhunter] Reviewing resume for: ${profile.name}${targetRole ? ` targeting: ${targetRole}` : ''}`);

  const systemPrompt = `You are a headhunter with 20 years of experience placing candidates across industries including operations, logistics, property management, sales, customer service, hospitality, and tech. You have reviewed thousands of resumes and know exactly what gets people interviews and what gets them ignored.

Your job is to give an honest, specific, and actionable review. Not generic advice — real critique based on what's actually on this resume. Be direct. Be constructive. Think like someone who wants this person to succeed.`;

  const userPrompt = `Review this resume${targetRole ? ` for someone targeting: ${targetRole}` : ''}.

RESUME:
${profile.text}

Return a JSON object with this exact structure:
{
  "overallScore": <number 1-10>,
  "headline": "<one punchy sentence summarizing this candidate>",
  "strengths": [
    { "title": "...", "detail": "..." }
  ],
  "weaknesses": [
    { "title": "...", "detail": "..." }
  ],
  "gaps": [
    { "title": "...", "detail": "..." }
  ],
  "quickWins": [
    "specific actionable fix #1",
    "specific actionable fix #2",
    "specific actionable fix #3"
  ],
  "summaryRewrite": "<rewrite the professional summary as you would write it — 2-3 sentences, sharp and human>",
  "promptGuidance": "<1-2 sentences of guidance to give an AI resume builder about this candidate's biggest opportunity>"
}

Be specific. Reference actual companies, roles, and numbers from the resume. Don't give generic resume advice.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const raw = response.choices[0].message.content;
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const insights = JSON.parse(cleaned);
    insights.candidateName = profile.name;
    insights.profileId = profile.id;
    insights.targetRole = targetRole;
    insights.reviewedAt = new Date().toISOString();

    saveInsights(insights);

    // Also push to main optimizer
    try {
      const fetch = require('node-fetch');
      await fetch('http://localhost:3001/headhunter-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insights)
      });
      console.log('[Headhunter] Insights pushed to optimizer');
    } catch (e) {
      console.warn('[Headhunter] Could not push to optimizer:', e.message);
    }

    res.json({ success: true, insights });
  } catch (err) {
    console.error('[Headhunter] Review failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/insights', (req, res) => {
  const insights = loadInsights();
  if (!insights) return res.json({ insights: null });
  res.json({ insights });
});

// ── Simple UI ──
app.get('/', (req, res) => {
  const profile = getActiveProfile();
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Headhunter Review — Rio Brave</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; min-height: 100vh; padding: 32px 16px; }
    .container { max-width: 820px; margin: 0 auto; }
    h1 { font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
    .card { background: #1e2130; border: 1px solid #2d3148; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .card h2 { font-size: 16px; font-weight: 600; color: #a78bfa; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
    label { display: block; color: #94a3b8; font-size: 13px; margin-bottom: 6px; }
    input[type="text"] { width: 100%; background: #0f1117; border: 1px solid #2d3148; border-radius: 8px; padding: 10px 14px; color: #e2e8f0; font-size: 15px; outline: none; }
    input[type="text"]:focus { border-color: #7c3aed; }
    button { background: #7c3aed; color: #fff; border: none; border-radius: 8px; padding: 12px 28px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #6d28d9; }
    button:disabled { background: #4b5563; cursor: not-allowed; }
    .score-block { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .score-circle { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; border: 3px solid; flex-shrink: 0; }
    .score-high { border-color: #10b981; color: #10b981; }
    .score-mid  { border-color: #f59e0b; color: #f59e0b; }
    .score-low  { border-color: #ef4444; color: #ef4444; }
    .headline { font-size: 18px; font-weight: 600; color: #fff; line-height: 1.4; }
    .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .section-item { background: #0f1117; border-radius: 8px; padding: 14px; }
    .section-item strong { display: block; color: #e2e8f0; font-size: 14px; margin-bottom: 4px; }
    .section-item span { color: #94a3b8; font-size: 13px; line-height: 1.5; }
    .strengths strong { color: #10b981; }
    .weaknesses strong { color: #f87171; }
    .gaps strong { color: #f59e0b; }
    .quick-wins li { color: #a3e635; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #1e2130; line-height: 1.5; }
    .quick-wins li:last-child { border-bottom: none; }
    .summary-box { background: #0f1117; border-left: 3px solid #7c3aed; padding: 16px; border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0; font-style: italic; }
    .guidance-box { background: #0f1117; border-left: 3px solid #06b6d4; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid #ffffff44; border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px; vertical-align: middle; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .tag { display: inline-block; background: #1e2130; border: 1px solid #2d3148; border-radius: 99px; padding: 3px 10px; font-size: 12px; color: #94a3b8; margin: 2px; }
    .applied-badge { display: inline-flex; align-items: center; gap: 6px; background: #052e16; border: 1px solid #10b981; color: #10b981; padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600; }
    #results { display: none; }
    .meta { font-size: 12px; color: #4b5563; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🕵️ Headhunter Review</h1>
    <p class="subtitle">20 years of experience. Real talk. No fluff. — Active profile: <strong style="color:#a78bfa">${profile ? profile.name : 'None'}</strong></p>

    <div class="card">
      <h2>Run Review</h2>
      <label>Target Role (optional — e.g. "Route Sales Representative" or "Property Manager")</label>
      <input type="text" id="targetRole" placeholder="Leave blank for general review" />
      <br><br>
      <button id="reviewBtn" onclick="runReview()">Review My Resume</button>
      <span id="status" style="margin-left:16px; color:#94a3b8; font-size:13px;"></span>
    </div>

    <div id="results">
      <div class="card">
        <h2>Overall Assessment</h2>
        <div class="score-block">
          <div class="score-circle" id="scoreCircle">—</div>
          <div class="headline" id="headline">—</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:20px;">
        <div class="card strengths">
          <h2>Strengths</h2>
          <div id="strengths"></div>
        </div>
        <div class="card weaknesses">
          <h2>Weaknesses</h2>
          <div id="weaknesses"></div>
        </div>
        <div class="card gaps">
          <h2>Gaps</h2>
          <div id="gaps"></div>
        </div>
      </div>

      <div class="card">
        <h2>⚡ Quick Wins</h2>
        <ul class="quick-wins" id="quickWins"></ul>
      </div>

      <div class="card">
        <h2>Suggested Summary Rewrite</h2>
        <div class="summary-box" id="summaryRewrite">—</div>
      </div>

      <div class="card">
        <h2>Applied to Resume Builder</h2>
        <div class="guidance-box" id="promptGuidance">—</div>
        <div id="appliedBadge" style="margin-top:12px; display:none;">
          <span class="applied-badge">✓ Guidance applied to optimizer</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function runReview() {
      const btn = document.getElementById('reviewBtn');
      const status = document.getElementById('status');
      const targetRole = document.getElementById('targetRole').value.trim();

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Reviewing...';
      status.textContent = 'Consulting the headhunter...';
      document.getElementById('results').style.display = 'none';

      try {
        const resp = await fetch('/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetRole })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Review failed');

        renderResults(data.insights);
        status.textContent = '';
      } catch (err) {
        status.textContent = 'Error: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Review My Resume';
      }
    }

    function renderResults(ins) {
      document.getElementById('results').style.display = 'block';

      const score = ins.overallScore;
      const circle = document.getElementById('scoreCircle');
      circle.textContent = score;
      circle.className = 'score-circle ' + (score >= 7 ? 'score-high' : score >= 5 ? 'score-mid' : 'score-low');

      document.getElementById('headline').textContent = ins.headline;

      const renderSection = (id, items, cls) => {
        document.getElementById(id).innerHTML = (items || []).map(item =>
          \`<div class="section-item \${cls}"><strong>\${item.title}</strong><span>\${item.detail}</span></div>\`
        ).join('');
      };
      renderSection('strengths', ins.strengths, 'strengths');
      renderSection('weaknesses', ins.weaknesses, 'weaknesses');
      renderSection('gaps', ins.gaps, 'gaps');

      document.getElementById('quickWins').innerHTML = (ins.quickWins || []).map(w =>
        \`<li>→ \${w}</li>\`
      ).join('');

      document.getElementById('summaryRewrite').textContent = ins.summaryRewrite || '—';
      document.getElementById('promptGuidance').textContent = ins.promptGuidance || '—';
      document.getElementById('appliedBadge').style.display = 'flex';

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Load last review on page load
    fetch('/insights').then(r => r.json()).then(data => {
      if (data.insights) renderResults(data.insights);
    });
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`[Headhunter] Running on http://localhost:${PORT}`);
  console.log(`[Headhunter] Open your browser to review the active resume profile`);
});
