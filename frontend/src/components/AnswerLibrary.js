import React, { useState, useCallback, memo } from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📋' },
  { id: 'motivation', label: 'Motivation', emoji: '🔥' },
  { id: 'experience', label: 'Experience', emoji: '💼' },
  { id: 'strengths', label: 'Strengths', emoji: '💪' },
  { id: 'conflict_resolution', label: 'Conflict', emoji: '🤝' },
  { id: 'salary', label: 'Salary', emoji: '💰' },
  { id: 'availability', label: 'Availability', emoji: '📅' },
  { id: 'why_this_company', label: 'Why Us', emoji: '🏢' },
  { id: 'skills', label: 'Skills', emoji: '🛠️' },
  { id: 'leadership', label: 'Leadership', emoji: '👑' },
  { id: 'teamwork', label: 'Teamwork', emoji: '🤜' },
  { id: 'weakness', label: 'Weakness', emoji: '🎯' },
  { id: 'other', label: 'Other', emoji: '📝' },
];

const CategoryBadge = memo(function CategoryBadge({ category }) {
  const cat = CATEGORIES.find(c => c.id === category) || CATEGORIES[CATEGORIES.length - 1];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary-light">
      {cat.emoji} {cat.label}
    </span>
  );
});

const AnswerCard = memo(function AnswerCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [item.answer]);

  const domain = item.pageContext?.url
    ? new URL(item.pageContext.url).hostname.replace('www.', '')
    : null;

  return (
    <div
      className={`bg-surface border border-slate-700/50 rounded-xl p-4 cursor-pointer transition-all hover:border-primary/30 ${expanded ? 'ring-1 ring-primary/20' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-semibold text-slate-200 leading-snug flex-1">
          "{item.question}"
        </p>
        <CategoryBadge category={item.category} />
      </div>

      <p className={`text-sm text-slate-400 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
        {item.answer}
      </p>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/30">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {item.profileEmoji && (
            <span>{item.profileEmoji} {item.profileName}</span>
          )}
          {domain && <span className="text-slate-600">🌐 {domain}</span>}
          {item.pageContext?.companyName && (
            <span>🏢 {item.pageContext.companyName}</span>
          )}
          <span>{new Date(item.generatedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          {item.versionsCount > 1 && (
            <span className="text-xs text-slate-600">v{item.selectedVersion + 1}/{item.versionsCount}</span>
          )}
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 rounded-md bg-slate-700/50 text-slate-400 hover:bg-primary/20 hover:text-primary-light transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function AnswerLibrary({ answers }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const items = Array.isArray(answers) ? answers : [];

  const filtered = items.filter(a => {
    if (activeCategory !== 'all' && a.category !== activeCategory) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      return a.question.toLowerCase().includes(s) || a.answer.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="animate-fadeInUp">
      <h2 className="text-lg font-bold text-slate-200 mb-4">
        Application Answers
        <span className="ml-2 text-sm font-normal text-slate-500">({items.length})</span>
      </h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search questions & answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-surface border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Answer list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-slate-400 text-sm">
            {items.length === 0
              ? 'No answers yet. Highlight a question on any website, right-click, and select "Answer with Rio Brave ✨"'
              : 'No answers match your filter.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <AnswerCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
