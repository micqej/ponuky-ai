'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HistoryItem {
  id: string
  templateId: string
  templateName: string
  icon: string
  result: string
  provider: string
  model: string
  createdAt: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selected, setSelected] = useState<HistoryItem | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('ponuky-ai-history') || '[]')
    setHistory(h)
  }, [])

  function remove(id: string) {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem('ponuky-ai-history', JSON.stringify(updated))
    if (selected?.id === id) setSelected(null)
  }

  function clearAll() {
    if (!confirm('Vymazať celú históriu?')) return
    setHistory([])
    localStorage.removeItem('ponuky-ai-history')
    setSelected(null)
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-700">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">História generovaní</h1>
            <p className="text-slate-500 text-sm">{history.length} záznamov uložených lokálne</p>
          </div>
        </div>
        {history.length > 0 && (
          <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700">
            🗑 Vymazať všetko
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-400 mb-4">História je prázdna. Vygeneruj niečo!</p>
          <Link href="/" className="btn-primary">← Vybrať šablónu</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* List */}
          <div className="space-y-2">
            {history.map(item => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`card p-4 cursor-pointer transition-all ${selected?.id === item.id ? 'border-sky-400 bg-sky-50' : 'hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="font-medium text-sm text-slate-900 truncate max-w-[150px]">
                      {item.templateName}
                    </span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); remove(item.id) }}
                    className="text-slate-300 hover:text-red-500 text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {item.result.replace(/<[^>]+>/g, '').substring(0, 60)}...
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">{item.model}</span>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('sk-SK')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selected.icon}</span>
                    <div>
                      <h2 className="font-bold text-slate-900">{selected.templateName}</h2>
                      <p className="text-xs text-slate-400">
                        {selected.model} · {new Date(selected.createdAt).toLocaleString('sk-SK')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copy(selected.result)} className="btn-secondary text-sm py-1.5 px-3">
                      {copied ? '✓' : '📋'} Kopírovať
                    </button>
                    <button onClick={() => window.print()} className="btn-secondary text-sm py-1.5 px-3">
                      🖨️ PDF
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 max-h-[600px] overflow-y-auto">
                  {selected.result.includes('<') ? (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selected.result }} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                      {selected.result}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-6 flex items-center justify-center h-64 text-slate-300">
                <div className="text-center">
                  <div className="text-4xl mb-2">👈</div>
                  <p>Vyber záznam zo zoznamu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
