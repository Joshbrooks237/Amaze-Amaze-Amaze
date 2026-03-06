document.addEventListener('DOMContentLoaded', () => {
  checkBackendStatus();
  checkCurrentPage();

  document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });

  document.getElementById('check-connection').addEventListener('click', () => {
    setStatus('backend', 'checking', 'Checking backend...');
    checkBackendStatus();
    checkCurrentPage();
  });
});

function checkBackendStatus() {
  fetch('http://localhost:3001/health')
    .then(res => res.json())
    .then(data => {
      setStatus('backend', 'online', `Backend online — ${data.resumeLoaded ? 'Resume loaded' : 'No resume uploaded'}`);
    })
    .catch(() => {
      setStatus('backend', 'offline', 'Backend offline — start server first');
    });
}

function checkCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url && tab.url.includes('indeed.com')) {
      const isJobPage = tab.url.includes('viewjob') || tab.url.includes('vjk=') || tab.url.includes('jk=');
      if (isJobPage) {
        setStatus('page', 'online', 'On Indeed job listing — ready!');
      } else {
        setStatus('page', 'offline', 'On Indeed, but not a job page');
      }
    } else {
      setStatus('page', 'offline', 'Not on Indeed — navigate to a job listing');
    }
  });
}

function setStatus(id, state, text) {
  const dot = document.getElementById(`${id}-dot`);
  const label = document.getElementById(`${id}-status`);
  dot.className = `status-dot ${state}`;
  label.textContent = text;
}
