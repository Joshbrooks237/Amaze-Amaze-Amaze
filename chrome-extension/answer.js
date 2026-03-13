(function () {
  'use strict';

  const API_URL = (typeof INDEEEED_CONFIG !== 'undefined' && INDEEEED_CONFIG.API_URL)
    ? INDEEEED_CONFIG.API_URL
    : 'https://application-application-app-production.up.railway.app';

  let previewBubble = null;
  let currentAnswerId = null;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GENERATE_ANSWER') {
      handleAnswerRequest(msg.question);
    }
  });

  function extractPageContext() {
    const url = window.location.href;
    let companyName = '';
    let roleTitle = '';

    // Try common selectors for company/role
    const companySelectors = [
      'meta[property="og:site_name"]',
      '[class*="company" i]', '[data-company]',
      '[class*="employer" i]', 'h1', '.company-name'
    ];
    for (const sel of companySelectors) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          const text = (el.getAttribute('content') || el.textContent || '').trim();
          if (text.length > 1 && text.length < 100) { companyName = text; break; }
        }
      } catch {}
    }

    const roleSelectors = [
      '[class*="job-title" i]', '[class*="jobTitle" i]',
      '[class*="position" i]', 'h1', 'h2'
    ];
    for (const sel of roleSelectors) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.textContent.trim();
          if (text.length > 2 && text.length < 150 && text !== companyName) { roleTitle = text; break; }
        }
      } catch {}
    }

    // Try to extract from page title
    if (!companyName) {
      const titleParts = document.title.split(/[|\-–—]/);
      if (titleParts.length > 1) companyName = titleParts[titleParts.length - 1].trim();
    }

    return { url, companyName, roleTitle };
  }

  function findNearestInputField() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    let node = range.startContainer;

    // Walk up and around to find the closest input/textarea
    for (let i = 0; i < 10; i++) {
      if (!node) break;
      const parent = node.parentElement || node;

      // Check siblings and nearby elements
      const candidates = parent.querySelectorAll('textarea, input[type="text"], input:not([type]), [contenteditable="true"], [role="textbox"]');
      for (const field of candidates) {
        if (field.offsetParent !== null) return field; // visible field
      }

      node = parent.parentElement;
    }

    // Broader search - find empty text fields on the page
    const allFields = document.querySelectorAll('textarea, input[type="text"], input:not([type]), [contenteditable="true"], [role="textbox"]');
    for (const field of allFields) {
      if (field.offsetParent !== null && !field.value && !field.textContent) return field;
    }

    return null;
  }

  function pasteIntoField(field, text) {
    if (!field) return false;

    try {
      if (field.getAttribute('contenteditable') === 'true' || field.getAttribute('role') === 'textbox') {
        field.focus();
        field.textContent = text;
        field.innerHTML = text;
      } else {
        field.focus();
        field.value = text;
      }

      // Trigger events for React/Angular/Vue forms
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      return true;
    } catch (err) {
      console.error('[Rio Brave] Paste failed:', err);
      return false;
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }

  function showToast(message, type = 'success') {
    const existing = document.getElementById('rio-brave-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'rio-brave-toast';
    toast.className = `rio-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function removePreview() {
    if (previewBubble) {
      previewBubble.remove();
      previewBubble = null;
    }
  }

  function showPreview(question, answer, answerId) {
    removePreview();
    currentAnswerId = answerId;
    retryCount = 0;

    const bubble = document.createElement('div');
    bubble.id = 'rio-brave-preview';
    bubble.innerHTML = `
      <div class="rio-header">
        <span class="rio-logo">✨</span>
        <span class="rio-title">Rio Brave</span>
        <button class="rio-close" title="Close">✕</button>
      </div>
      <div class="rio-question">${escapeHtml(question.length > 120 ? question.substring(0, 120) + '...' : question)}</div>
      <div class="rio-answer-container">
        <div class="rio-answer">${escapeHtml(answer)}</div>
      </div>
      <div class="rio-actions">
        <button class="rio-btn rio-btn-use">Use This ✓</button>
        <button class="rio-btn rio-btn-retry">Try Again ↻</button>
        <button class="rio-btn rio-btn-edit">Edit ✏️</button>
      </div>
    `;

    // Position near selection
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      bubble.style.top = (window.scrollY + rect.bottom + 12) + 'px';
      bubble.style.left = Math.max(16, Math.min(rect.left, window.innerWidth - 420)) + 'px';
    }

    document.body.appendChild(bubble);
    previewBubble = bubble;

    // Close button
    bubble.querySelector('.rio-close').addEventListener('click', removePreview);

    // Use This
    bubble.querySelector('.rio-btn-use').addEventListener('click', () => {
      const answerText = bubble.querySelector('.rio-answer').textContent;
      const field = findNearestInputField();
      const pasted = pasteIntoField(field, answerText);
      copyToClipboard(answerText);

      if (pasted) {
        showToast('Answer pasted successfully!');
      } else {
        showToast('Answer copied — paste with Cmd+V', 'info');
      }
      removePreview();
    });

    // Try Again
    bubble.querySelector('.rio-btn-retry').addEventListener('click', async () => {
      if (retryCount >= MAX_RETRIES) {
        showToast('Max retries reached', 'error');
        return;
      }
      retryCount++;
      const actionsEl = bubble.querySelector('.rio-actions');
      actionsEl.innerHTML = '<div class="rio-loading"><div class="rio-spinner"></div> Regenerating...</div>';

      try {
        const resp = await fetch(`${API_URL}/answers/${currentAnswerId}/regenerate`, { method: 'POST' });
        if (!resp.ok) throw new Error('Regeneration failed');
        const data = await resp.json();

        bubble.querySelector('.rio-answer').textContent = data.answer;
        actionsEl.innerHTML = `
          <button class="rio-btn rio-btn-use">Use This ✓</button>
          <button class="rio-btn rio-btn-retry">Try Again ↻ (${MAX_RETRIES - retryCount} left)</button>
          <button class="rio-btn rio-btn-edit">Edit ✏️</button>
        `;
        rebindActions(bubble, question);
      } catch (err) {
        showToast('Regeneration failed: ' + err.message, 'error');
        actionsEl.innerHTML = `
          <button class="rio-btn rio-btn-use">Use This ✓</button>
          <button class="rio-btn rio-btn-retry">Try Again ↻</button>
          <button class="rio-btn rio-btn-edit">Edit ✏️</button>
        `;
        rebindActions(bubble, question);
      }
    });

    // Edit
    bubble.querySelector('.rio-btn-edit').addEventListener('click', () => {
      const answerContainer = bubble.querySelector('.rio-answer-container');
      const currentText = bubble.querySelector('.rio-answer').textContent;
      answerContainer.innerHTML = `<textarea class="rio-edit-area">${escapeHtml(currentText)}</textarea>`;

      const actionsEl = bubble.querySelector('.rio-actions');
      actionsEl.innerHTML = `
        <button class="rio-btn rio-btn-use">Use Edited ✓</button>
        <button class="rio-btn rio-btn-cancel">Cancel</button>
      `;

      actionsEl.querySelector('.rio-btn-use').addEventListener('click', () => {
        const editedText = bubble.querySelector('.rio-edit-area').value;
        const field = findNearestInputField();
        const pasted = pasteIntoField(field, editedText);
        copyToClipboard(editedText);
        showToast(pasted ? 'Edited answer pasted!' : 'Edited answer copied — paste with Cmd+V', pasted ? 'success' : 'info');
        removePreview();
      });

      actionsEl.querySelector('.rio-btn-cancel').addEventListener('click', () => {
        answerContainer.innerHTML = `<div class="rio-answer">${escapeHtml(currentText)}</div>`;
        actionsEl.innerHTML = `
          <button class="rio-btn rio-btn-use">Use This ✓</button>
          <button class="rio-btn rio-btn-retry">Try Again ↻</button>
          <button class="rio-btn rio-btn-edit">Edit ✏️</button>
        `;
        rebindActions(bubble, question);
      });
    });
  }

  function rebindActions(bubble, question) {
    bubble.querySelector('.rio-btn-use')?.addEventListener('click', () => {
      const answerText = bubble.querySelector('.rio-answer').textContent;
      const field = findNearestInputField();
      const pasted = pasteIntoField(field, answerText);
      copyToClipboard(answerText);
      showToast(pasted ? 'Answer pasted!' : 'Answer copied — paste with Cmd+V', pasted ? 'success' : 'info');
      removePreview();
    });
    bubble.querySelector('.rio-btn-retry')?.addEventListener('click', async () => {
      if (retryCount >= MAX_RETRIES) { showToast('Max retries reached', 'error'); return; }
      retryCount++;
      const actionsEl = bubble.querySelector('.rio-actions');
      actionsEl.innerHTML = '<div class="rio-loading"><div class="rio-spinner"></div> Regenerating...</div>';
      try {
        const resp = await fetch(`${API_URL}/answers/${currentAnswerId}/regenerate`, { method: 'POST' });
        if (!resp.ok) throw new Error('Failed');
        const data = await resp.json();
        bubble.querySelector('.rio-answer').textContent = data.answer;
        actionsEl.innerHTML = `
          <button class="rio-btn rio-btn-use">Use This ✓</button>
          <button class="rio-btn rio-btn-retry">Try Again ↻ (${MAX_RETRIES - retryCount} left)</button>
          <button class="rio-btn rio-btn-edit">Edit ✏️</button>
        `;
        rebindActions(bubble, question);
      } catch (err) {
        showToast('Regeneration failed', 'error');
        actionsEl.innerHTML = `
          <button class="rio-btn rio-btn-use">Use This ✓</button>
          <button class="rio-btn rio-btn-retry">Try Again ↻</button>
          <button class="rio-btn rio-btn-edit">Edit ✏️</button>
        `;
        rebindActions(bubble, question);
      }
    });
    bubble.querySelector('.rio-btn-edit')?.addEventListener('click', () => {
      const answerContainer = bubble.querySelector('.rio-answer-container');
      const currentText = bubble.querySelector('.rio-answer').textContent;
      answerContainer.innerHTML = `<textarea class="rio-edit-area">${escapeHtml(currentText)}</textarea>`;
      const actionsEl = bubble.querySelector('.rio-actions');
      actionsEl.innerHTML = `
        <button class="rio-btn rio-btn-use">Use Edited ✓</button>
        <button class="rio-btn rio-btn-cancel">Cancel</button>
      `;
      actionsEl.querySelector('.rio-btn-use').addEventListener('click', () => {
        const editedText = bubble.querySelector('.rio-edit-area').value;
        const field = findNearestInputField();
        const pasted = pasteIntoField(field, editedText);
        copyToClipboard(editedText);
        showToast(pasted ? 'Edited answer pasted!' : 'Edited answer copied — paste with Cmd+V', pasted ? 'success' : 'info');
        removePreview();
      });
      actionsEl.querySelector('.rio-btn-cancel').addEventListener('click', () => {
        answerContainer.innerHTML = `<div class="rio-answer">${escapeHtml(currentText)}</div>`;
        actionsEl.innerHTML = `
          <button class="rio-btn rio-btn-use">Use This ✓</button>
          <button class="rio-btn rio-btn-retry">Try Again ↻</button>
          <button class="rio-btn rio-btn-edit">Edit ✏️</button>
        `;
        rebindActions(bubble, question);
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showLoadingBubble(question) {
    removePreview();

    const bubble = document.createElement('div');
    bubble.id = 'rio-brave-preview';
    bubble.innerHTML = `
      <div class="rio-header">
        <span class="rio-logo">✨</span>
        <span class="rio-title">Rio Brave</span>
        <button class="rio-close" title="Close">✕</button>
      </div>
      <div class="rio-question">${escapeHtml(question.length > 120 ? question.substring(0, 120) + '...' : question)}</div>
      <div class="rio-answer-container">
        <div class="rio-loading"><div class="rio-spinner"></div> Generating answer from your resume...</div>
      </div>
    `;

    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      bubble.style.top = (window.scrollY + rect.bottom + 12) + 'px';
      bubble.style.left = Math.max(16, Math.min(rect.left, window.innerWidth - 420)) + 'px';
    }

    bubble.querySelector('.rio-close').addEventListener('click', removePreview);
    document.body.appendChild(bubble);
    previewBubble = bubble;
  }

  async function handleAnswerRequest(question) {
    console.log('[Rio Brave] Generating answer for:', question.substring(0, 80));

    showLoadingBubble(question);
    const pageContext = extractPageContext();

    try {
      const resp = await fetch(`${API_URL}/answer-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, pageContext })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${resp.status}`);
      }

      const data = await resp.json();
      console.log('[Rio Brave] Answer received:', data.id, '[' + data.category + ']');

      if (data.similarPrevious) {
        console.log('[Rio Brave] Similar previous answer found:', data.similarPrevious.id);
      }

      showPreview(question, data.answer, data.id);
    } catch (err) {
      console.error('[Rio Brave] Failed:', err.message);
      removePreview();
      showToast('Failed: ' + err.message, 'error');
    }
  }

  // Close preview on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') removePreview();
  });
})();
