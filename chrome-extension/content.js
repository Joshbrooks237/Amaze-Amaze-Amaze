(function () {
  'use strict';

  const BACKEND_URL = 'http://localhost:3001';

  console.log('[Indeeeed] Content script loaded on:', window.location.href);

  // ── Detection: Are we on an Indeed job listing page? ──
  function isJobListingPage() {
    const url = window.location.href;
    const hasJobView = url.includes('/viewjob') || url.includes('vjk=') || url.includes('jk=');
    const hasJobContent = !!document.querySelector('[class*="jobsearch-JobComponent"]') ||
                          !!document.querySelector('[class*="jobsearch-ViewJobLayout"]') ||
                          !!document.querySelector('.jobsearch-JobInfoHeader-title') ||
                          !!document.querySelector('[data-testid="jobsearch-ViewJobLayout"]');
    return hasJobView || hasJobContent;
  }

  // ── Scraping Logic ──
  function scrapeJobData() {
    console.log('[Indeeeed] Starting job data scrape...');

    const title = extractJobTitle();
    const company = extractCompanyName();
    const description = extractJobDescription();
    const { skills, qualifications } = extractSkillsAndQualifications(description);

    const jobData = {
      jobTitle: title,
      companyName: company,
      fullDescription: description,
      requiredSkills: skills,
      preferredQualifications: qualifications,
      sourceUrl: window.location.href,
      scrapedAt: new Date().toISOString()
    };

    console.log('[Indeeeed] Scraped job data:', {
      title: jobData.jobTitle,
      company: jobData.companyName,
      descriptionLength: jobData.fullDescription.length,
      skillsCount: jobData.requiredSkills.length,
      qualsCount: jobData.preferredQualifications.length
    });

    return jobData;
  }

  function extractJobTitle() {
    const selectors = [
      'h1.jobsearch-JobInfoHeader-title',
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      'h1[class*="JobInfoHeader"]',
      '.jobsearch-JobInfoHeader-title-container h1',
      'h1.icl-u-xs-mb--xs',
      'h1'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim()) {
        console.log('[Indeeeed] Found job title via:', sel);
        return el.textContent.trim();
      }
    }
    return 'Unknown Title';
  }

  function extractCompanyName() {
    const selectors = [
      '[data-testid="inlineHeader-companyName"] a',
      '[data-testid="inlineHeader-companyName"]',
      'div.jobsearch-InlineCompanyRating a',
      'div.jobsearch-InlineCompanyRating div',
      '[class*="CompanyName"] a',
      '[data-company-name]',
      '.jobsearch-CompanyInfoContainer a'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim()) {
        console.log('[Indeeeed] Found company name via:', sel);
        return el.textContent.trim();
      }
    }
    return 'Unknown Company';
  }

  function extractJobDescription() {
    const selectors = [
      '#jobDescriptionText',
      '[id="jobDescriptionText"]',
      '.jobsearch-jobDescriptionText',
      '[class*="jobDescriptionText"]',
      '[data-testid="jobDescriptionText"]',
      '.jobsearch-JobComponent-description'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim()) {
        console.log('[Indeeeed] Found job description via:', sel);
        return el.textContent.trim();
      }
    }

    // Fallback: grab all text from the main content area
    const main = document.querySelector('main') || document.body;
    return main.textContent.substring(0, 8000).trim();
  }

  function extractSkillsAndQualifications(description) {
    const skills = [];
    const qualifications = [];
    const lines = description.split('\n').map(l => l.trim()).filter(Boolean);

    let currentSection = null;

    for (const line of lines) {
      const lower = line.toLowerCase();

      if (lower.includes('required') || lower.includes('requirements') ||
          lower.includes('must have') || lower.includes('minimum qualifications')) {
        currentSection = 'required';
        continue;
      }
      if (lower.includes('preferred') || lower.includes('nice to have') ||
          lower.includes('bonus') || lower.includes('desired') ||
          lower.includes('preferred qualifications')) {
        currentSection = 'preferred';
        continue;
      }
      if (lower.includes('responsibilities') || lower.includes('what you') ||
          lower.includes('about the role') || lower.includes('job description')) {
        currentSection = 'description';
        continue;
      }
      if (lower.includes('benefits') || lower.includes('perks') ||
          lower.includes('we offer') || lower.includes('compensation')) {
        currentSection = 'benefits';
        continue;
      }

      const isBullet = /^[\-\•\*\u2022\u25E6\u2023\u25AA]/.test(line) || /^\d+[\.\)]/.test(line);

      if (isBullet || (currentSection && line.length > 5 && line.length < 300)) {
        const cleanLine = line.replace(/^[\-\•\*\u2022\u25E6\u2023\u25AA\d\.\)]+\s*/, '').trim();
        if (!cleanLine) continue;

        if (currentSection === 'required') {
          skills.push(cleanLine);
        } else if (currentSection === 'preferred') {
          qualifications.push(cleanLine);
        }
      }
    }

    return { skills, qualifications };
  }

  // ── Toast Notifications ──
  function showToast(message, type = 'success', duration = 4000) {
    let toast = document.getElementById('indeeeed-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'indeeeed-toast';
      document.body.appendChild(toast);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.className = type;
    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }

  // ── Status Badge ──
  function showStatusBadge(text) {
    let badge = document.getElementById('indeeeed-status-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'indeeeed-status-badge';
      document.body.appendChild(badge);
    }
    badge.textContent = text;
    badge.classList.add('visible');
  }

  function hideStatusBadge() {
    const badge = document.getElementById('indeeeed-status-badge');
    if (badge) badge.classList.remove('visible');
  }

  // ── Floating Button ──
  function createOptimizeButton() {
    if (document.getElementById('indeeeed-optimize-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'indeeeed-optimize-btn';
    btn.innerHTML = `
      <span class="spinner"></span>
      <span class="btn-icon">🚀</span>
      <span class="btn-text">Optimize My Application</span>
    `;

    btn.addEventListener('click', handleOptimizeClick);
    document.body.appendChild(btn);
    console.log('[Indeeeed] Floating optimize button injected');
  }

  async function handleOptimizeClick() {
    const btn = document.getElementById('indeeeed-optimize-btn');
    const textSpan = btn.querySelector('.btn-text');

    console.log('[Indeeeed] Optimize button clicked');

    // Scrape job data
    const jobData = scrapeJobData();

    if (!jobData.fullDescription || jobData.fullDescription.length < 50) {
      showToast('Could not find enough job description text. Try scrolling down first.', 'error');
      return;
    }

    // Enter loading state
    btn.classList.add('loading');
    textSpan.textContent = 'Optimizing...';
    showStatusBadge('⏳ Sending to optimizer...');

    try {
      console.log('[Indeeeed] Sending job data to backend...');

      const response = await fetch(`${BACKEND_URL}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      console.log('[Indeeeed] Backend response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Indeeeed] Optimization result received:', {
        hasResume: !!result.resumePath,
        hasCoverLetter: !!result.coverLetterPath,
        keywordCount: result.keywords?.length
      });

      showToast('Resume & cover letter are ready! Open dashboard to download.', 'success', 5000);
      showStatusBadge('✅ Optimization complete');

    } catch (error) {
      console.error('[Indeeeed] Optimization failed:', error);

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        showToast('Cannot reach backend. Is the server running at localhost:3001?', 'error', 6000);
      } else if (error.message.includes('No master resume')) {
        showToast('Upload your resume first at http://localhost:3000', 'error', 6000);
      } else {
        showToast(`Optimization failed: ${error.message}`, 'error', 5000);
      }

      showStatusBadge('❌ Failed');
    } finally {
      btn.classList.remove('loading');
      textSpan.textContent = 'Optimize My Application';
      setTimeout(hideStatusBadge, 5000);
    }
  }

  // ── Initialization ──
  function init() {
    // Wait a beat for Indeed's dynamic content to load
    setTimeout(() => {
      if (isJobListingPage()) {
        console.log('[Indeeeed] Indeed job listing detected — injecting UI');
        createOptimizeButton();
        showStatusBadge('🟢 Job detected');
        setTimeout(hideStatusBadge, 3000);
      } else {
        console.log('[Indeeeed] Not a job listing page, skipping injection');
      }
    }, 1500);
  }

  // Handle SPA-style navigation (Indeed uses pushState)
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log('[Indeeeed] URL changed, re-checking page...');
      init();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  init();
})();
