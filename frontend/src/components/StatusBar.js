import React from 'react';

export default function StatusBar({ online, resumeLoaded }) {
  return (
    <div className="bg-surface-raised border-b border-surface-overlay px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${online ? 'bg-success shadow-[0_0_6px_theme(--color-success)]' : 'bg-danger shadow-[0_0_6px_theme(--color-danger)]'}`} />
          <span className="text-slate-400">
            Backend: {online ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${resumeLoaded ? 'bg-success shadow-[0_0_6px_theme(--color-success)]' : 'bg-warning shadow-[0_0_6px_theme(--color-warning)]'}`} />
          <span className="text-slate-400">
            Resume: {resumeLoaded ? 'Loaded' : 'Not uploaded'}
          </span>
        </div>
      </div>
    </div>
  );
}
