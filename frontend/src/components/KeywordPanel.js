import React, { useState } from 'react';

const CATEGORY_LABELS = {
  technical_skill: { label: 'Technical Skills', icon: '⚙️', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  soft_skill: { label: 'Soft Skills', icon: '🤝', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  qualification: { label: 'Qualifications', icon: '🎓', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  industry_term: { label: 'Industry Terms', icon: '🏢', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

export default function KeywordPanel({ keywords = [], keywordDetails = [] }) {
  const [filter, setFilter] = useState('all');

  const detailMap = {};
  for (const d of keywordDetails) {
    detailMap[d.keyword.toLowerCase()] = d;
  }

  const enriched = keywords.map(k => ({
    ...k,
    inOriginal: detailMap[k.keyword.toLowerCase()]?.inOriginalResume ?? false,
    inTailored: detailMap[k.keyword.toLowerCase()]?.inTailoredResume ?? false,
  }));

  const filtered = filter === 'all'
    ? enriched
    : filter === 'gap'
      ? enriched.filter(k => !k.inOriginal && k.inTailored)
      : filter === 'missing'
        ? enriched.filter(k => !k.inTailored)
        : enriched.filter(k => k.category === filter);

  const gapCount = enriched.filter(k => !k.inOriginal && k.inTailored).length;
  const missingCount = enriched.filter(k => !k.inTailored).length;

  const categories = [...new Set(keywords.map(k => k.category))];

  return (
    <div className="space-y-5">
      {/* Gap Analysis Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          count={gapCount}
          total={enriched.length}
          color="text-primary-light"
        />
        <SummaryCard
          icon="⚠️"
          label="Still Missing"
          count={missingCount}
          total={enriched.length}
          color={missingCount > 0 ? 'text-warning' : 'text-success'}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label={`All (${enriched.length})`} />
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

      {/* Keyword List */}
      <div className="bg-surface-raised border border-surface-overlay rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-overlay text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3">Keyword</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-center">Score</th>
              <th className="px-5 py-3 text-center">Original</th>
              <th className="px-5 py-3 text-center">Tailored</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((kw, i) => {
              const catStyle = CATEGORY_LABELS[kw.category] || { label: kw.category, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
              return (
                <tr key={i} className="border-b border-surface-overlay/50 hover:bg-surface-overlay/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-200">{kw.keyword}</td>
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
          <div className="p-8 text-center text-sm text-slate-500">No keywords match this filter.</div>
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
