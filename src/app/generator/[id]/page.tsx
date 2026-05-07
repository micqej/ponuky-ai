'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TEMPLATES } from '@/lib/templates'
import { AI_MODELS } from '@/lib/ai-providers'
import { loadSettings, getApiKeys } from '@/lib/settings'
import Link from 'next/link'

export default function GeneratorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const template = TEMPLATES.find(t => t.id === id)

  const [values, setValues] = useState<Record<string, string>>({})
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4o-mini')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const s = loadSettings()
    setProvider(s.provider)
    setModel(s.model)
  }, [])

  const availableModels = AI_MODELS.filter(m => m.provider === provider)

  useEffect(() => {
    const first = availableModels[0]
    if (first && !availableModels.find(m => m.id === model)) setModel(first.id)
  }, [provider])

  if (!template) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Šablóna nenájdená.</p>
        <Link href="/" className="btn-primary">← Späť na dashboard</Link>
      </div>
    )
  }

  function buildPrompt() {
    let prompt = template!.userPromptTemplate
    for (const [key, val] of Object.entries(values)) {
      prompt = prompt.replaceAll(`{{${key}}}`, val || `[${key}]`)
    }
    return prompt
  }

  async function generate() {
    setError('')
    setResult('')
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: template!.systemPrompt,
          userPrompt: buildPrompt(),
          provider,
          model,
          apiKeys: getApiKeys(loadSettings()),
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Chyba generovania')
      setResult(data.result)

      // Save to history
      const history = JSON.parse(localStorage.getItem('ponuky-ai-history') || '[]')
      history.unshift({
        id: Date.now().toString(),
        templateId: template!.id,
        templateName: template!.name,
        icon: template!.icon,
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

  function copyToClipboard() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function printPDF() {
    window.print()
  }

  const isHTML = template.outputFormat === 'html' || template.outputFormat === 'pdf'

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors no-print">←</Link>
        <span className="text-3xl">{template.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{template.name}</h1>
          <p className="text-slate-500 text-sm">{template.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="no-print">
          <div className="card p-6 mb-4">
            <h2 className="font-semibold text-slate-900 mb-4">Vyplň údaje</h2>
            <div className="space-y-4">
              {template.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={values[field.key] || ''}
                      onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={values[field.key] || ''}
                      onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                    >
                      <option value="">-- vyber --</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={values[field.key] || ''}
                      onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Settings */}
          <div className="card p-6 mb-4">
            <h2 className="font-semibold text-slate-900 mb-4">AI nastavenia</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Provider</label>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                >
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} (${m.pricePerMInputTokens}/1M)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {AI_MODELS.find(m => m.id === model)?.description}
            </p>
          </div>

          <button
            onClick={generate}
            disabled={loading}
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
            ) : (
              <> ⚡ Generovať</>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <strong>Chyba:</strong> {error}
              {(error.includes('kľúč') || error.includes('API')) && (
                <div className="mt-2">
                  <Link href="/settings" className="underline font-medium">Nastav API kľúče v Nastaveniach →</Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Result */}
        <div>
          <div className="card p-6 min-h-[400px] flex flex-col print-content">
            <div className="flex items-center justify-between mb-4 no-print">
              <h2 className="font-semibold text-slate-900">Výsledok</h2>
              {result && (
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="btn-secondary text-sm py-1.5 px-3">
                    {copied ? '✓ Skopírované' : '📋 Kopírovať'}
                  </button>
                  {(template.outputFormat === 'pdf') && (
                    <button onClick={printPDF} className="btn-secondary text-sm py-1.5 px-3">
                      🖨️ PDF
                    </button>
                  )}
                </div>
              )}
            </div>

            {result ? (
              <div ref={resultRef} className="flex-1">
                {isHTML ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                    {result}
                  </pre>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <div className="text-5xl mb-3">{template.icon}</div>
                <p className="text-sm">Vyplň údaje a klikni Generovať</p>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-3 flex gap-2 no-print">
              <button
                onClick={generate}
                className="flex-1 btn-secondary text-sm py-2"
              >
                🔄 Regenerovať
              </button>
              <button
                onClick={() => router.push('/history')}
                className="btn-secondary text-sm py-2 px-4"
              >
                📚 História
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
