const API_BASE = process.env.REACT_APP_API_URL || '';

console.log('[Indeeeed] API_BASE =', API_BASE || '(same origin)');

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

// ── Profile API ──

export async function getProfiles() {
  const res = await fetch(`${API_BASE}/profiles`);
  if (!res.ok) throw new Error(`Failed to load profiles: ${res.status}`);
  return res.json();
}

export async function createProfile(name, emoji, file) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('emoji', emoji);
  formData.append('resume', file);
  const res = await fetch(`${API_BASE}/profiles`, { method: 'POST', body: formData });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to create profile'); }
  return res.json();
}

export async function updateProfile(id, { name, emoji, file } = {}) {
  const formData = new FormData();
  if (name) formData.append('name', name);
  if (emoji) formData.append('emoji', emoji);
  if (file) formData.append('resume', file);
  const res = await fetch(`${API_BASE}/profiles/${id}`, { method: 'PUT', body: formData });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update profile'); }
  return res.json();
}

export async function deleteProfile(id) {
  const res = await fetch(`${API_BASE}/profiles/${id}`, { method: 'DELETE' });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to delete profile'); }
  return res.json();
}

export async function activateProfile(id) {
  const res = await fetch(`${API_BASE}/profiles/${id}/activate`, { method: 'POST' });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to activate profile'); }
  return res.json();
}

// ── Legacy Resume API ──

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await fetch(`${API_BASE}/upload-resume`, { method: 'POST', body: formData });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Upload failed'); }
  return res.json();
}

export async function getResumeInfo() {
  const res = await fetch(`${API_BASE}/resume`);
  if (res.status === 404) return null;
  return res.json();
}

// ── History API ──

export async function getHistory(profileId) {
  const url = profileId ? `${API_BASE}/history?profileId=${profileId}` : `${API_BASE}/history`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load history: ${res.status}`);
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
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Regeneration failed'); }
  return res.json();
}

export function getDownloadUrl(filePath) {
  return `${API_BASE}${filePath}`;
}

// ── Answer Library API ──

export async function getAnswers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.profileId) params.set('profileId', filters.profileId);
  if (filters.category) params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);
  const res = await fetch(`${API_BASE}/answers?${params}`);
  if (!res.ok) throw new Error('Failed to load answers');
  return res.json();
}

export async function regenerateAnswer(id) {
  const res = await fetch(`${API_BASE}/answers/${id}/regenerate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to regenerate');
  return res.json();
}
