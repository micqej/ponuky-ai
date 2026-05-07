'use client'
import { useState, useEffect } from 'react'
import { AI_MODELS } from '@/lib/ai-providers'
import Link from 'next/link'

const PROMPT_EXAMPLES = [
  { label: 'Cenová ponuka (vlastná)', system: 'Si profesionálny obchodný asistent. Píšeš formálne cenové ponuky v slovenčine.', user: 'Vytvor cenovú ponuku pre zákazníka...' },
  { label: 'Predajný email', system: 'Si expert na B2B predajné emaily v slovenčine. Píšeš krátke, presvedčivé emaily.', user: 'Napíš predajný email pre...' },
  { label: 'Prázdny (začni odznova)', system: '', user: '' },
]

export default function CustomGeneratorPage() {
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4o-mini')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ponuky-ai-settings')
    if (saved) {
      const s = JSON.parse(saved)
      if (s.provider) setProvider(s.provider)
      if (s.model) setModel(s.model)
    }
    const savedPrompts = localStorage.getItem('ponuky-ai-custom-prompts')
    if (savedPrompts) {
      const p = JSON.parse(savedPrompts)
      if (p.system) setSystemPrompt(p.system)
      if (p.user) setUserPrompt(p.user)
    }
  }, [])

  const availableModels = AI_MODELS.filter(m => m.provider === provider)

  useEffect(() => {
    const first = availableModels[0]
    if (first && !availableModels.find(m => m.id === model)) setModel(first.id)
  }, [provider])

  function savePrompts() {
    localStorage.setItem('ponuky-ai-custom-prompts', JSON.stringify({ system: systemPrompt, user: userPrompt }))
  }

  async function generate() {
    if (!userPrompt.trim()) { setError('Zadaj prompt'); return }
    setError('')
    setResult('')
    setLoading(true)
    savePrompts()
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: systemPrompt || 'Si užitočný asistent. Odpovedaj v slovenčine.',
          userPrompt,
          provider,
          model,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Chyba generovania')
      setResult(data.result)

      const history = JSON.parse(localStorage.getItem('ponuky-ai-history') || '[]')
      history.unshift({
        id: Date.now().toString(),
        templateId: 'custom',
        templateName: 'Vlastný prompt',
        icon: '🎯',
        result: data.result,
        provider,
        model,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem('ponuky-ai-history', JSON.stringify(history.slice(0, 100)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Neznáma chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-slate-400 hover:text-slate-700">←</Link>
        <span className="text-3xl">🎯</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vlastný prompt</h1>
          <p className="text-slate-500 text-sm">Napíš ľubovoľný AI prompt alebo vyber zo vzoriek</p>
        </div>
      </div>

      {/* Quick examples */}
      <div className="flex gap-2 flex-wrap mb-6">
        <span className="text-sm text-slate-500 self-center">Vzorky:</span>
        {PROMPT_EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => { setSystemPrompt(ex.system); setUserPrompt(ex.user) }}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-400 hover:text-sky-700 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Prompts */}
        <div className="space-y-4">
          <div className="card p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              System Prompt
              <span className="ml-2 text-xs font-normal text-slate-400">(správanie AI — nepovinné)</span>
            </label>
            <textarea
              rows={5}
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="napr. Si profesionálny copywriter v slovenčine. Píšeš krátke, presvedčivé texty..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none font-mono"
            />
          </div>

          <div className="card p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              User Prompt <span className="text-red-500">*</span>
              <span className="ml-2 text-xs font-normal text-slate-400">(čo má AI spraviť)</span>
            </label>
            <textarea
              rows={8}
              value={userPrompt}
              onChange={e => setUserPrompt(e.target.value)}
              placeholder="napr. Napíš cenovú ponuku pre zákazníka ABC s.r.o. na databázu 4000 stavebných firiem za 79,99 €..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none"
            />
          </div>

          {/* AI Settings */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">AI nastavenia</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                >
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (${m.pricePerMInputTokens}/1M)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !userPrompt.trim()}
            className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generujem...
              </>
            ) : '⚡ Generovať'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <strong>Chyba:</strong> {error}
              {error.includes('API') && (
                <div className="mt-2"><Link href="/settings" className="underline">Nastav API kľúče →</Link></div>
              )}
            </div>
          )}
        </div>

        {/* Right: Result */}
        <div>
          <div className="card p-6 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Výsledok</h2>
              {result && (
                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="btn-secondary text-sm py-1.5 px-3">
                  {copied ? '✓ Skopírované' : '📋 Kopírovať'}
                </button>
              )}
            </div>
            {result ? (
              <pre className="flex-1 whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed overflow-auto">
                {result}
              </pre>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-sm">Výsledok sa zobrazí tu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
