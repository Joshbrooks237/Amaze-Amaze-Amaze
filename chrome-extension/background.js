chrome.runtime.onInstalled.addListener(() => {
  console.log('[Indeeeed] Extension installed successfully');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Indeeeed Background] Message received:', message);

  if (message.type === 'OPEN_DASHBOARD') {
    chrome.tabs.create({ url: 'http://localhost:3000' });
    sendResponse({ success: true });
  }

  if (message.type === 'CHECK_BACKEND') {
    fetch('http://localhost:3001/health')
      .then(res => res.json())
      .then(data => sendResponse({ online: true, data }))
      .catch(() => sendResponse({ online: false }));
    return true; // keep channel open for async response
  }

  return false;
});
