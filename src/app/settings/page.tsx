'use client'
import { useState, useEffect } from 'react'
import { AI_MODELS } from '@/lib/ai-providers'
import Link from 'next/link'

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [googleKey, setGoogleKey] = useState('')
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4o-mini')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('ponuky-ai-settings') || '{}')
    if (s.openaiKey) setOpenaiKey(s.openaiKey)
    if (s.anthropicKey) setAnthropicKey(s.anthropicKey)
    if (s.googleKey) setGoogleKey(s.googleKey)
    if (s.provider) setProvider(s.provider)
    if (s.model) setModel(s.model)
  }, [])

  const availableModels = AI_MODELS.filter(m => m.provider === provider)

  function save() {
    localStorage.setItem('ponuky-ai-settings', JSON.stringify({ openaiKey, anthropicKey, googleKey, provider, model }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-slate-400 hover:text-slate-700">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nastavenia</h1>
          <p className="text-slate-500 text-sm">API kľúče a predvolený AI model</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-sm">
        <strong>ℹ️ Ako to funguje:</strong> API kľúče zadáš tu — uložia sa v tvojom prehliadači a automaticky sa použijú pri každom generovaní. Nič viac nepotrebuješ nastavovať.
      </div>

      <div className="card p-6 space-y-6">
        {/* OpenAI */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <h3 className="font-semibold text-slate-900">OpenAI</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Odporúčané</span>
            {openaiKey && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Nastavený</span>}
          </div>
          <label className="block text-sm text-slate-600 mb-1">API kľúč</label>
          <input
            type="password"
            value={openaiKey}
            onChange={e => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
          />
          <p className="text-xs text-slate-400 mt-1">
            Najlacnejší: <strong>gpt-4o-mini</strong> — $0.15/1M tokenov.{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">Získaj kľúč →</a>
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* Anthropic */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧠</span>
            <h3 className="font-semibold text-slate-900">Anthropic (Claude)</h3>
            {anthropicKey && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Nastavený</span>}
          </div>
          <label className="block text-sm text-slate-600 mb-1">API kľúč</label>
          <input
            type="password"
            value={anthropicKey}
            onChange={e => setAnthropicKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
          />
          <p className="text-xs text-slate-400 mt-1">
            Najlacnejší: <strong>Claude Haiku</strong> — $0.25/1M tokenov.{' '}
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">Získaj kľúč →</a>
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* Google */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <h3 className="font-semibold text-slate-900">Google AI (Gemini)</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Free tier</span>
            {googleKey && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Nastavený</span>}
          </div>
          <label className="block text-sm text-slate-600 mb-1">API kľúč</label>
          <input
            type="password"
            value={googleKey}
            onChange={e => setGoogleKey(e.target.value)}
            placeholder="AIza..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
          />
          <p className="text-xs text-slate-400 mt-1">
            <strong>Gemini 1.5 Flash</strong> — $0.075/1M tokenov, free tier dostupný.{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">Získaj kľúč →</a>
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* Default model */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Predvolený AI model</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Provider</label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Model</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
              >
                {availableModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">
              {AI_MODELS.find(m => m.id === model)?.description} —
              vstup: <strong>${AI_MODELS.find(m => m.id === model)?.pricePerMInputTokens}/1M</strong> tokenov,
              výstup: <strong>${AI_MODELS.find(m => m.id === model)?.pricePerMOutputTokens}/1M</strong> tokenov
            </p>
          </div>
        </div>

        <button onClick={save} className="w-full btn-primary py-3">
          {saved ? '✓ Uložené!' : '💾 Uložiť nastavenia'}
        </button>
      </div>

      {/* Price comparison */}
      <div className="mt-6 card p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Porovnanie cien modelov</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="pb-2 font-medium">Model</th>
                <th className="pb-2 font-medium">Vstup /1M</th>
                <th className="pb-2 font-medium">Výstup /1M</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...AI_MODELS].sort((a, b) => a.pricePerMInputTokens - b.pricePerMInputTokens).map(m => (
                <tr key={m.id} className={m.id === model ? 'bg-sky-50' : ''}>
                  <td className="py-2 font-medium">{m.name}</td>
                  <td className="py-2 text-green-700">${m.pricePerMInputTokens}</td>
                  <td className="py-2 text-orange-700">${m.pricePerMOutputTokens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
