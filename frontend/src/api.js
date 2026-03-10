const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await fetch(`${API_BASE}/upload-resume`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export async function getResumeInfo() {
  const res = await fetch(`${API_BASE}/resume`);
  if (res.status === 404) return null;
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`);
  return res.json();
}

export async function getOptimizationDetail(id) {
  const res = await fetch(`${API_BASE}/history/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function regenerateCoverLetter(optimizationId, tone, personalNote = '') {
  const res = await fetch(`${API_BASE}/regenerate-cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optimizationId, tone, personalNote }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Regeneration failed');
  }
  return res.json();
}

export function getDownloadUrl(filePath) {
  return `${API_BASE}${filePath}`;
}
