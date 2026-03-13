import React, { memo, useCallback } from 'react';
import { List } from 'react-window';

const ROW_HEIGHT = 110;
const MAX_VISIBLE_HEIGHT = 700;

const ScoreBadge = memo(function ScoreBadge({ score, label }) {
  const safeScore = typeof score === 'number' ? score : 0;
  const color = safeScore >= 80 ? 'text-success' : safeScore >= 50 ? 'text-warning' : 'text-danger';
  return (
    <div className="text-center">
      <p className={`text-xl font-bold ${color}`}>{safeScore}%</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
});

const HistoryCard = memo(function HistoryCard({ item, onClick }) {
  if (!item || typeof item !== 'object') return null;

  const jobTitle = item?.jobTitle || 'Untitled Position';
  const companyName = item?.companyName || 'Unknown Company';
  const matchScore = typeof item?.matchScore === 'number' ? item.matchScore : 0;
  const optimizedAt = item?.optimizedAt ? new Date(item.optimizedAt) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-raised border border-surface-overlay rounded-xl p-5
                 hover:border-primary/40 hover:bg-surface-overlay/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-200 truncate group-hover:text-primary-light transition-colors">
            {jobTitle}
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">{companyName}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {optimizedAt && (
              <span className="text-[10px] text-slate-500">
                {optimizedAt.toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
            )}
            {item?.profileName && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20">
                {item?.profileEmoji || '📄'} {item.profileName}
              </span>
            )}
            {item?.tone && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-overlay text-slate-400">
                {item.tone}
              </span>
            )}
            {(item?.retryAttempts || 0) > 1 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-overlay text-slate-500">
                {item.retryAttempts} attempts
              </span>
            )}
            {item?.belowThreshold && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400 border border-yellow-600/30">
                ⚠ Low match
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <ScoreBadge score={matchScore} label="Match" />
          <span className="text-slate-600 group-hover:text-slate-400 transition-colors text-lg">→</span>
        </div>
      </div>
    </button>
  );
});

function RowComponent({ index, style, items, onSelect }) {
  const item = items?.[index];
  if (!item || typeof item !== 'object') return null;
  return (
    <div style={{ ...style, paddingBottom: 8 }}>
      <HistoryCard item={item} onClick={() => onSelect?.(item?.id)} />
    </div>
  );
}

function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object' && Array.isArray(val.history)) return val.history;
  return [];
}

export default function HistoryFeed({ history: rawHistory, onSelect }) {
  const items = ensureArray(rawHistory);

  const handleSelect = useCallback((id) => {
    if (id && onSelect) onSelect(id);
  }, [onSelect]);

  if (items.length === 0) {
    return (
      <div className="animate-fadeInUp">
        <h2 className="text-lg font-bold text-slate-200 mb-4">Optimized Applications</h2>
        <div className="bg-surface-raised border border-surface-overlay rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-slate-400">
            No optimizations yet. Visit an Indeed job listing and click "Optimize My Application" to get started.
          </p>
        </div>
      </div>
    );
  }

  const listHeight = Math.min(items.length * ROW_HEIGHT, MAX_VISIBLE_HEIGHT);

  return (
    <div className="animate-fadeInUp">
      <h2 className="text-lg font-bold text-slate-200 mb-4">
        Optimized Applications
        <span className="ml-2 text-sm font-normal text-slate-500">({items.length})</span>
      </h2>

      {items.length <= 10 ? (
        <div className="space-y-3">
          {items.map((item, i) => (
            <HistoryCard key={item?.id || i} item={item} onClick={() => handleSelect(item?.id)} />
          ))}
        </div>
      ) : (
        <List
          defaultHeight={listHeight}
          rowCount={items.length}
          rowHeight={ROW_HEIGHT}
          overscanCount={5}
          rowComponent={RowComponent}
          rowProps={{ items, onSelect: handleSelect }}
        />
      )}
    </div>
  );
}
