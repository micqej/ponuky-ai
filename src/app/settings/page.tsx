'use client'
import { useState, useEffect } from 'react'
import { loadSettings, saveSettings } from '@/lib/settings'
import type { Company } from '@/lib/quote'
import Link from 'next/link'

const EMPTY_COMPANY = (): Omit<Company, 'id'> => ({
  name: '', brandName: '', address: '', ico: '', dic: '', email: '', phone: '', website: '',
})

const AI_MODELS = [
  { provider: 'openai',    id: 'gpt-4o-mini',              label: 'GPT-4o mini',       price: '$0.15/1M' },
  { provider: 'openai',    id: 'gpt-4o',                   label: 'GPT-4o',            price: '$2.50/1M' },
  { provider: 'anthropic', id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku',      price: '$0.25/1M' },
  { provider: 'anthropic', id: 'claude-sonnet-4-6',         label: 'Claude Sonnet',     price: '$3.00/1M' },
  { provider: 'google',    id: 'gemini-1.5-flash',          label: 'Gemini 1.5 Flash',  price: '$0.075/1M' },
  { provider: 'google',    id: 'gemini-1.5-pro',            label: 'Gemini 1.5 Pro',    price: '$1.25/1M' },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<'companies' | 'ai'>('companies')
  const [companies, setCompanies] = useState<Company[]>([])
  const [editing, setEditing] = useState<Company | null>(null)
  const [form, setForm] = useState(EMPTY_COMPANY())
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [googleKey, setGoogleKey] = useState('')
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4o-mini')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = loadSettings()
    setCompanies(s.companies)
    setOpenaiKey(s.openaiKey)
    setAnthropicKey(s.anthropicKey)
    setGoogleKey(s.googleKey)
    setProvider(s.provider)
    setModel(s.model)
  }, [])

  function startAdd() {
    setEditing({ id: '', ...EMPTY_COMPANY() })
    setForm(EMPTY_COMPANY())
  }

  function startEdit(c: Company) {
    setEditing(c)
    setForm({ name: c.name, brandName: c.brandName ?? '', address: c.address, ico: c.ico, dic: c.dic ?? '', email: c.email ?? '', phone: c.phone ?? '', website: c.website ?? '' })
  }

  function saveCompany() {
    if (!form.name || !form.ico) return
    const s = loadSettings()
    let updated: Company[]
    if (editing?.id) {
      updated = companies.map(c => c.id === editing.id ? { ...form, id: editing.id } : c)
    } else {
      updated = [...companies, { ...form, id: Date.now().toString() }]
    }
    setCompanies(updated)
    saveSettings({ ...s, companies: updated })
    setEditing(null)
  }

  function deleteCompany(id: string) {
    const updated = companies.filter(c => c.id !== id)
    const s = loadSettings()
    setCompanies(updated)
    saveSettings({ ...s, companies: updated })
  }

  function saveAI() {
    const s = loadSettings()
    saveSettings({ ...s, openaiKey, anthropicKey, googleKey, provider, model })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const availableModels = AI_MODELS.filter(m => m.provider === provider)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nastavenia</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(['companies', 'ai'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'companies' ? 'Moje firmy' : 'AI a API kľúče'}
          </button>
        ))}
      </div>

      {/* ── COMPANIES ─────────────────────────────────────────────────── */}
      {tab === 'companies' && (
        <div>
          {editing !== null ? (
            /* Company form */
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-5">
                {editing.id ? 'Upraviť firmu' : 'Nová firma'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Názov firmy *</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="napr. Brandrise s.r.o." className="field" />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Názov značky / logo text</label>
                    <input type="text" value={form.brandName} onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))} placeholder="napr. MONETICO (zobrazí sa veľkými písmenami v hlavičke)" className="field" />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Adresa</label>
                    <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="napr. Sokolovská 178/10, 040 11 Košice" className="field" />
                  </div>
                  <div>
                    <label className="label">IČO *</label>
                    <input type="text" value={form.ico} onChange={e => setForm(f => ({ ...f, ico: e.target.value }))} placeholder="napr. 53196449" className="field" />
                  </div>
                  <div>
                    <label className="label">DIČ</label>
                    <input type="text" value={form.dic} onChange={e => setForm(f => ({ ...f, dic: e.target.value }))} placeholder="napr. 2121313865" className="field" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="info@firma.sk" className="field" />
                  </div>
                  <div>
                    <label className="label">Telefón</label>
                    <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+421 900 000 000" className="field" />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Web</label>
                    <input type="text" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="firma.sk" className="field" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveCompany}
                  disabled={!form.name || !form.ico}
                  className="btn-dark py-2.5 px-6 disabled:opacity-40"
                >
                  Uložiť firmu
                </button>
                <button onClick={() => setEditing(null)} className="btn-outline py-2.5 px-5">
                  Zrušiť
                </button>
              </div>
            </div>
          ) : (
            /* Companies list */
            <div>
              {companies.length === 0 ? (
                <div className="card p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/>
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Zatiaľ nemáš pridanú žiadnu firmu.</p>
                  <button onClick={startAdd} className="btn-dark py-2.5 px-6">Pridať firmu</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map(c => (
                    <div key={c.id} className="card p-5 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        {c.brandName && <div className="text-xs text-gray-400 mt-0.5">Značka: {c.brandName}</div>}
                        <div className="text-sm text-gray-500 mt-1">{c.address}</div>
                        <div className="text-xs text-gray-400 mt-0.5">IČO: {c.ico}{c.dic ? ` | DIČ: ${c.dic}` : ''}</div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => startEdit(c)} className="btn-ghost text-xs">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                          </svg>
                          Upraviť
                        </button>
                        <button onClick={() => deleteCompany(c.id)} className="btn-ghost text-xs text-red-400 hover:text-red-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Zmazať
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={startAdd} className="btn-outline w-full py-3 justify-center">
                    + Pridať ďalšiu firmu
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── AI & API KEYS ─────────────────────────────────────────────── */}
      {tab === 'ai' && (
        <div className="space-y-5">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
            Kľúče sa uložia lokálne v prehliadači a automaticky sa použijú pri každom generovaní.
          </div>

          <div className="card p-6 space-y-5">
            {[
              { label: 'OpenAI', key: openaiKey, set: setOpenaiKey, placeholder: 'sk-...', hint: 'gpt-4o-mini — najlacnejší, odporúčané', link: 'https://platform.openai.com/api-keys' },
              { label: 'Anthropic (Claude)', key: anthropicKey, set: setAnthropicKey, placeholder: 'sk-ant-...', hint: 'Claude Haiku — alternatíva', link: 'https://console.anthropic.com/' },
              { label: 'Google Gemini', key: googleKey, set: setGoogleKey, placeholder: 'AIza...', hint: 'Gemini Flash — free tier dostupný', link: 'https://aistudio.google.com/app/apikey' },
            ].map(({ label, key, set, placeholder, hint, link }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">{label}</label>
                  {key && <span className="text-xs text-emerald-600 font-medium">✓ Nastavený</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={key}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="field flex-1 font-mono text-xs"
                  />
                  {key && (
                    <button onClick={() => set('')} className="btn-ghost text-gray-400 hover:text-red-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {hint} —{' '}
                  <a href={link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Získať kľúč</a>
                </p>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Predvolený model</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Provider</label>
                <select value={provider} onChange={e => { setProvider(e.target.value); setModel(AI_MODELS.find(m => m.provider === e.target.value)?.id || '') }} className="field">
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                </select>
              </div>
              <div>
                <label className="label">Model</label>
                <select value={model} onChange={e => setModel(e.target.value)} className="field">
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.label} ({m.price})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button onClick={saveAI} className="btn-dark w-full py-3 justify-center">
            {saved ? '✓ Uložené' : 'Uložiť nastavenia'}
          </button>
        </div>
      )}
    </div>
  )
}
