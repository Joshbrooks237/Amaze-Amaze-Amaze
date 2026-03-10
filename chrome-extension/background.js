importScripts('config.js');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Indeeeed] Extension installed successfully');
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
