import React, { useState } from 'react';

const CATEGORY_LABELS = {
  technical_skill: { label: 'Technical Skills', icon: '⚙️', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  soft_skill: { label: 'Soft Skills', icon: '🤝', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  qualification: { label: 'Qualifications', icon: '🎓', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  industry_term: { label: 'Industry Terms', icon: '🏢', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

export default function KeywordPanel({ keywords = [], keywordDetails = [] }) {
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('all');

  const detailMap = {};
  for (const d of keywordDetails) {
    detailMap[d.keyword.toLowerCase()] = d;
  }

  const enriched = keywords.map(k => ({
    ...k,
    type: k.type || detailMap[k.keyword.toLowerCase()]?.type || 'keyword',
    inOriginal: detailMap[k.keyword.toLowerCase()]?.inOriginalResume ?? false,
    inTailored: detailMap[k.keyword.toLowerCase()]?.inTailoredResume ?? false,
  }));

  const singleKeywords = enriched.filter(k => k.type !== 'phrase');
  const phrases = enriched.filter(k => k.type === 'phrase');

  const viewItems = view === 'keywords' ? singleKeywords
    : view === 'phrases' ? phrases
    : enriched;

  const filtered = filter === 'all'
    ? viewItems
    : filter === 'gap'
      ? viewItems.filter(k => !k.inOriginal && k.inTailored)
      : filter === 'missing'
        ? viewItems.filter(k => !k.inTailored)
        : viewItems.filter(k => k.category === filter);

  const gapCount = viewItems.filter(k => !k.inOriginal && k.inTailored).length;
  const missingCount = viewItems.filter(k => !k.inTailored).length;

  const categories = [...new Set(viewItems.map(k => k.category))];

  const phraseMatchCount = phrases.filter(k => k.inTailored).length;
  const phraseOriginalCount = phrases.filter(k => k.inOriginal).length;

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          icon="✅"
          label="In Original Resume"
          count={enriched.filter(k => k.inOriginal).length}
          total={enriched.length}
          color="text-success"
        />
        <SummaryCard
          icon="🔧"
          label="Added by AI"
          count={enriched.filter(k => !k.inOriginal && k.inTailored).length}
          total={enriched.length}
          color="text-primary-light"
        />
        <SummaryCard
          icon="⚠️"
          label="Still Missing"
          count={enriched.filter(k => !k.inTailored).length}
          total={enriched.length}
          color={enriched.some(k => !k.inTailored) ? 'text-warning' : 'text-success'}
        />
        <SummaryCard
          icon="🔗"
          label="Phrases Matched"
          count={phraseMatchCount}
          total={phrases.length}
          color={phrases.length > 0 && phraseMatchCount === phrases.length ? 'text-success' : 'text-accent'}
        />
      </div>

      {/* Phrase Highlight Strip */}
      {phrases.length > 0 && (
        <div className="bg-surface-raised border border-accent/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🔗</span>
            <h3 className="text-sm font-bold text-accent">ATS Phrases</h3>
            <span className="text-xs text-slate-500">
              {phraseMatchCount}/{phrases.length} matched in tailored resume
              {phraseOriginalCount > 0 && ` (${phraseOriginalCount} were already in original)`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {phrases.map((p, i) => (
              <span
                key={i}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                  ${p.inTailored
                    ? 'bg-success/10 text-success border-success/30'
                    : p.inOriginal
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-danger/10 text-danger border-danger/30'
                  }`}
                title={`${p.keyword} — importance: ${p.importance}/10 | ${p.inOriginal ? 'in original' : 'not in original'} | ${p.inTailored ? 'in tailored' : 'missing from tailored'}`}
              >
                {p.inTailored ? '✓ ' : p.inOriginal ? '○ ' : '✗ '}
                {p.keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1 bg-surface-raised rounded-lg p-1 border border-surface-overlay">
          {[
            { key: 'all', label: `All (${enriched.length})` },
            { key: 'keywords', label: `Keywords (${singleKeywords.length})` },
            { key: 'phrases', label: `Phrases (${phrases.length})` },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => { setView(v.key); setFilter('all'); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${view === v.key ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label={`All (${viewItems.length})`} />
        <FilterButton active={filter === 'gap'} onClick={() => setFilter('gap')} label={`Gap Filled (${gapCount})`} />
        <FilterButton active={filter === 'missing'} onClick={() => setFilter('missing')} label={`Missing (${missingCount})`} />
        {categories.map(cat => (
          <FilterButton
            key={cat}
            active={filter === cat}
            onClick={() => setFilter(cat)}
            label={`${CATEGORY_LABELS[cat]?.icon || ''} ${CATEGORY_LABELS[cat]?.label || cat}`}
          />
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-raised border border-surface-overlay rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-overlay text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3">Term</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-center">Score</th>
              <th className="px-5 py-3 text-center">Original</th>
              <th className="px-5 py-3 text-center">Tailored</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((kw, i) => {
              const catStyle = CATEGORY_LABELS[kw.category] || { label: kw.category, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
              const isPhrase = kw.type === 'phrase';
              return (
                <tr key={i} className="border-b border-surface-overlay/50 hover:bg-surface-overlay/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-200">
                    {isPhrase && <span className="text-accent mr-1">&ldquo;</span>}
                    {kw.keyword}
                    {isPhrase && <span className="text-accent ml-0.5">&rdquo;</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${isPhrase ? 'bg-accent/10 text-accent border-accent/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                      {isPhrase ? 'Phrase' : 'Keyword'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${catStyle.color}`}>
                      {catStyle.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <ImportanceBar score={kw.importance} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    {kw.inOriginal ? <span className="text-success">✓</span> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {kw.inTailored ? <span className="text-success">✓</span> : <span className="text-danger">✗</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">No items match this filter.</div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, count, total, color }) {
  return (
    <div className="bg-surface-raised border border-surface-overlay rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>
        {count}<span className="text-sm text-slate-600">/{total}</span>
      </p>
    </div>
  );
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
        ${active
          ? 'bg-primary text-white'
          : 'bg-surface-raised text-slate-400 border border-surface-overlay hover:text-slate-200'
        }`}
    >
      {label}
    </button>
  );
}

function ImportanceBar({ score }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="w-16 h-1.5 bg-surface-overlay rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-500 w-4">{score}</span>
    </div>
  );
}
