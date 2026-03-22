importScripts('config.js');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Indeeeed] Extension installed successfully');
  chrome.contextMenus.create({
    id: 'answer-with-rio-brave',
    title: 'Answer with Rio Brave ✨',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'optimize-with-rio-brave',
    title: 'Optimize with Rio Brave ✨',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'make-resume-rio-brave',
    title: 'Rio Brave — Make Resume & Cover Letter',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'fill-all-rio-brave',
    title: 'Fill All Fields with Rio Brave ✨',
    contexts: ['page']
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Indeeeed Background] Message received:', message);

  if (message.type === 'OPEN_DASHBOARD') {
    chrome.tabs.create({ url: INDEEEED_CONFIG.DASHBOARD_URL });
    sendResponse({ success: true });
  }

  if (message.type === 'CHECK_BACKEND') {
    fetch(`${INDEEEED_CONFIG.API_URL}/health`)
      .then(res => res.json())
      .then(data => sendResponse({ online: true, data }))
      .catch(() => sendResponse({ online: false }));
    return true;
  }

  return false;
});

// ── Rio Brave: Highlight-to-Answer ──
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'answer-with-rio-brave' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'GENERATE_ANSWER',
      question: info.selectionText
    });
  }
  if (info.menuItemId === 'optimize-with-rio-brave' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'OPTIMIZE_TEXT',
      text: info.selectionText
    });
  }
  if (info.menuItemId === 'make-resume-rio-brave' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'MAKE_RESUME',
      text: info.selectionText
    });
  }
  if (info.menuItemId === 'fill-all-rio-brave') {
    chrome.tabs.sendMessage(tab.id, { type: 'FILL_ALL_FIELDS' });
  }
});
