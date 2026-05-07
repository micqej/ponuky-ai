'use client'
import { useState } from 'react'
import { TEMPLATES, CATEGORIES } from '@/lib/templates'
import Link from 'next/link'

const COLOR_CLASSES: Record<string, string> = {
  blue:   'bg-blue-50 border-blue-200 hover:border-blue-400',
  purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
  green:  'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
  sky:    'bg-sky-50 border-sky-200 hover:border-sky-400',
  orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
  teal:   'bg-teal-50 border-teal-200 hover:border-teal-400',
  indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
  violet: 'bg-violet-50 border-violet-200 hover:border-violet-400',
  amber:  'bg-amber-50 border-amber-200 hover:border-amber-400',
  rose:   'bg-rose-50 border-rose-200 hover:border-rose-400',
  slate:  'bg-slate-50 border-slate-200 hover:border-slate-400',
  yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
  cyan:   'bg-cyan-50 border-cyan-200 hover:border-cyan-400',
  red:    'bg-red-50 border-red-200 hover:border-red-400',
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>('Všetky')
  const [search, setSearch] = useState('')

  const allCategories = ['Všetky', ...CATEGORIES.filter(c => c !== 'Vlastný')]

  const filtered = TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'Všetky' || t.category === activeCategory
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          AI Generátor obsahu
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Cenové ponuky, emaily, LinkedIn posty, produktové popisy — vygeneruj profesionálny obsah za sekúndy.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Hľadaj šablónu..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        />
        <Link href="/generator/custom" className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
          <span>✏️</span> Vlastný prompt
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              activeCategory === cat
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(template => (
          <Link
            key={template.id}
            href={`/generator/${template.id}`}
            className={`block p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
              COLOR_CLASSES[template.color] || COLOR_CLASSES.slate
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{template.icon}</span>
              <span className="text-xs font-medium bg-white/70 px-2 py-1 rounded-full text-slate-500 border border-slate-200">
                {template.category}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1 group-hover:text-sky-700 transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-slate-500 leading-snug">
              {template.description}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                template.outputFormat === 'pdf' ? 'bg-red-100 text-red-700' :
                template.outputFormat === 'html' ? 'bg-purple-100 text-purple-700' :
                'bg-green-100 text-green-700'
              }`}>
                {template.outputFormat === 'pdf' ? '📄 PDF' :
                 template.outputFormat === 'html' ? '🌐 HTML' : '📝 Text'}
              </span>
            </div>
          </Link>
        ))}

        {/* Custom card */}
        <Link
          href="/generator/custom"
          className="block p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-sky-400 bg-white/50 hover:bg-sky-50/50 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-3xl">🎯</span>
            <span className="text-xs font-medium bg-white/70 px-2 py-1 rounded-full text-slate-500 border border-slate-200">
              Vlastný
            </span>
          </div>
          <h3 className="font-bold text-slate-900 mb-1 group-hover:text-sky-700 transition-colors">
            Vlastný prompt
          </h3>
          <p className="text-sm text-slate-500 leading-snug">
            Napíš alebo nahraj vlastný AI prompt pre čokoľvek čo potrebuješ.
          </p>
        </Link>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>Žiadna šablóna sa nenašla. Skús iný výraz alebo vytvor vlastný prompt.</p>
        </div>
      )}

      {/* Stats bar */}
      <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200 flex flex-wrap gap-8 justify-center text-center">
        <div>
          <div className="text-2xl font-bold text-sky-600">{TEMPLATES.length + 1}</div>
          <div className="text-sm text-slate-500">Šablón</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-sky-600">3</div>
          <div className="text-sm text-slate-500">AI provideri</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-sky-600">6</div>
          <div className="text-sm text-slate-500">AI modely</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-sky-600">PDF + Email + Social</div>
          <div className="text-sm text-slate-500">Výstupné formáty</div>
        </div>
      </div>
    </div>
  )
}
