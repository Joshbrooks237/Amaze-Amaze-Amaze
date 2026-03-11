import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import ProfileSwitcher from './components/ProfileSwitcher';
import HistoryFeed from './components/HistoryFeed';
import StatusBar from './components/StatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import { checkHealth, getProfiles, getHistory } from './api';

const OptimizationDetail = lazy(() => import('./components/OptimizationDetail'));

function App() {
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterProfile, setFilterProfile] = useState('all');

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const refreshData = useCallback(async (signal) => {
    try {
      const health = await checkHealth();
      if (signal?.aborted) return;
      setBackendOnline(true);

      const profileData = await getProfiles();
      if (signal?.aborted) return;
      setProfiles(profileData.profiles || []);
      setActiveProfileId(profileData.activeProfileId);

      const hist = await getHistory();
      if (signal?.aborted) return;
      setHistory(Array.isArray(hist) ? hist : (hist?.history || []));
    } catch {
      if (!signal?.aborted) setBackendOnline(false);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refreshData(controller.signal);
    const interval = setInterval(() => refreshData(controller.signal), 30000);
    return () => { controller.abort(); clearInterval(interval); };
  }, [refreshData]);

  const safeHistory = Array.isArray(history) ? history : [];
  const filteredHistory = filterProfile === 'all'
    ? safeHistory
    : safeHistory.filter(h => h?.profileId === filterProfile);

  return (
    <div className="min-h-screen bg-surface">
      <StatusBar online={backendOnline} resumeLoaded={!!activeProfile} />

      <header className="border-b border-surface-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚀</span>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                  Indeeeed Optimizer
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  {activeProfile
                    ? <span>{activeProfile.emoji} Using <strong className="text-slate-300">{activeProfile.name}</strong>'s resume</span>
                    : 'AI-powered resume & cover letter tailoring'
                  }
                </p>
              </div>
            </div>
            {selectedId && (
              <button
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-surface-raised rounded-lg
                           border border-surface-overlay hover:bg-surface-overlay transition-colors"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !backendOnline ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Backend Offline</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-4">
              Cannot reach the backend API. Check the browser console for the API URL being used.
            </p>
            <p className="text-xs text-slate-500 font-mono bg-surface-raised inline-block px-3 py-1.5 rounded-lg">
              API: {process.env.REACT_APP_API_URL || 'http://localhost:3001 (env var not set)'}
            </p>
          </div>
        ) : selectedId ? (
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <OptimizationDetail
                optimizationId={selectedId}
                onBack={() => setSelectedId(null)}
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <ErrorBoundary>
                <ProfileSwitcher
                  profiles={profiles}
                  activeProfileId={activeProfileId}
                  onProfilesChanged={refreshData}
                />
              </ErrorBoundary>
            </div>
            <div className="lg:col-span-2">
              {profiles.length > 1 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-xs text-slate-500">Filter:</span>
                  <button
                    onClick={() => setFilterProfile('all')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filterProfile === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-surface-raised text-slate-400 border border-surface-overlay hover:text-slate-200'
                    }`}
                  >
                    All Profiles
                  </button>
                  {profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setFilterProfile(p.id)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        filterProfile === p.id
                          ? 'bg-primary text-white'
                          : 'bg-surface-raised text-slate-400 border border-surface-overlay hover:text-slate-200'
                      }`}
                    >
                      {p.emoji} {p.name}
                    </button>
                  ))}
                </div>
              )}
              <ErrorBoundary>
                <HistoryFeed
                  history={filteredHistory}
                  onSelect={setSelectedId}
                />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
