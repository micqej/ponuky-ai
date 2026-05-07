'use client'
import { useState, useEffect, useCallback } from 'react'
import { loadSettings, getApiKeys } from '@/lib/settings'
import type { Company, QuoteOption } from '@/lib/quote'
import Link from 'next/link'

const EMPTY_OPTION = (): QuoteOption => ({
  id: Math.random().toString(36).slice(2),
  title: '',
  price: 0,
  priceLabel: 'bez DPH',
  paymentTerms: '',
  deliveryTime: '',
  includes: [''],
})

interface ClientForm {
  name: string; address: string; ico: string; dic: string; email: string; phone: string
}

const EMPTY_CLIENT: ClientForm = { name: '', address: '', ico: '', dic: '', email: '', phone: '' }

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [client, setClient] = useState<ClientForm>(EMPTY_CLIENT)
  const [icoLoading, setIcoLoading] = useState(false)
  const [icoError, setIcoError] = useState('')
  const [context, setContext] = useState('')
  const [options, setOptions] = useState<QuoteOption[]>([EMPTY_OPTION()])
  const [generating, setGenerating] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const s = loadSettings()
    setCompanies(s.companies)
    if (s.companies.length === 1) setSupplierId(s.companies[0].id)
  }, [])

  const supplier = companies.find(c => c.id === supplierId)

  async function lookupIco() {
    if (client.ico.length < 6) return
    setIcoLoading(true); setIcoError('')
    try {
      const res = await fetch(`/api/ico?ico=${encodeURIComponent(client.ico)}`)
      const data = await res.json()
      if (data.error) { setIcoError(data.error); return }
      setClient(prev => ({
        ...prev,
        name: data.name || prev.name,
        address: data.address || prev.address,
        dic: data.dic || prev.dic,
      }))
    } catch {
      setIcoError('Chyba pri vyhľadávaní. Vyplňte ručne.')
    } finally {
      setIcoLoading(false)
    }
  }

  function updateOption(id: string, field: keyof QuoteOption, value: unknown) {
    setOptions(opts => opts.map(o => o.id === id ? { ...o, [field]: value } : o))
  }

  function updateInclude(optId: string, idx: number, val: string) {
    setOptions(opts => opts.map(o => {
      if (o.id !== optId) return o
      const includes = [...o.includes]
      includes[idx] = val
      return { ...o, includes }
    }))
  }

  function addInclude(optId: string) {
    setOptions(opts => opts.map(o => o.id === optId ? { ...o, includes: [...o.includes, ''] } : o))
  }

  function removeInclude(optId: string, idx: number) {
    setOptions(opts => opts.map(o => {
      if (o.id !== optId) return o
      const includes = o.includes.filter((_, i) => i !== idx)
      return { ...o, includes: includes.length ? includes : [''] }
    }))
  }

  const generate = useCallback(async () => {
    if (!supplier) { setError('Vyber dodávateľa v Nastaveniach.'); return }
    if (!client.name) { setError('Zadaj odberateľa.'); return }
    if (!options[0].title) { setError('Zadaj aspoň jednu možnosť.'); return }
    setError(''); setGenerating(true)

    try {
      const s = loadSettings()
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier,
          client,
          context,
          options,
          apiKeys: getApiKeys(s),
          provider: s.provider,
          model: s.model,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error)
      setPreviewHtml(data.html)

      // Save to history
      const history = JSON.parse(localStorage.getItem('ponuky-history') || '[]')
      history.unshift({
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        supplierName: supplier.name,
        clientName: client.name,
        html: data.html,
      })
      localStorage.setItem('ponuky-history', JSON.stringify(history.slice(0, 50)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Neznáma chyba')
    } finally {
      setGenerating(false)
    }
  }, [supplier, client, context, options])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

      {/* ── LEFT: FORM ──────────────────────────────────────────────── */}
      <div className="space-y-5 no-print">

        {/* Dodávateľ */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Dodávateľ</h2>
          {companies.length === 0 ? (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              Nemáš uloženú žiadnu firmu.{' '}
              <Link href="/settings" className="text-gray-900 font-medium underline underline-offset-2">
                Pridaj firmu v Nastaveniach →
              </Link>
            </div>
          ) : (
            <select
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              className="field"
            >
              <option value="">— Vyber firmu —</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          {supplier && (
            <p className="mt-2 text-xs text-gray-400">
              {supplier.address} · IČO {supplier.ico}
            </p>
          )}
        </section>

        {/* Odberateľ */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Odberateľ</h2>

          {/* IČO lookup */}
          <div className="mb-4">
            <label className="label">IČO (automatické vyhľadanie)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={client.ico}
                onChange={e => setClient(c => ({ ...c, ico: e.target.value.replace(/\D/g, '') }))}
                onKeyDown={e => e.key === 'Enter' && lookupIco()}
                placeholder="napr. 53196449"
                maxLength={8}
                className="field flex-1"
              />
              <button
                onClick={lookupIco}
                disabled={icoLoading || client.ico.length < 6}
                className="btn-dark disabled:opacity-40 whitespace-nowrap"
              >
                {icoLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                )}
                Vyhľadať
              </button>
            </div>
            {icoError && <p className="text-xs text-red-500 mt-1">{icoError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Názov firmy / meno *</label>
              <input type="text" value={client.name} onChange={e => setClient(c => ({ ...c, name: e.target.value }))} placeholder="napr. PMB - stav, s.r.o." className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Adresa</label>
              <input type="text" value={client.address} onChange={e => setClient(c => ({ ...c, address: e.target.value }))} placeholder="napr. Dulov 296, 018 52 Dulov" className="field" />
            </div>
            <div>
              <label className="label">DIČ</label>
              <input type="text" value={client.dic} onChange={e => setClient(c => ({ ...c, dic: e.target.value }))} placeholder="napr. 2120000000" className="field" />
            </div>
            <div>
              <label className="label">Telefón</label>
              <input type="text" value={client.phone} onChange={e => setClient(c => ({ ...c, phone: e.target.value }))} placeholder="+421 905 000 000" className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email</label>
              <input type="text" value={client.email} onChange={e => setClient(c => ({ ...c, email: e.target.value }))} placeholder="info@firma.sk" className="field" />
            </div>
          </div>
        </section>

        {/* Kontext pre AI */}
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Kontext pre AI</h2>
          <p className="text-xs text-gray-400 mb-3">Napíš pár viet — čo ponúkaš, prečo si píšete, čo zákazník chce. AI z toho napíše úvod.</p>
          <textarea
            rows={3}
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="napr. Zákazník nás kontaktoval ohľadom tvorby webstránky pre ich stavebnú firmu. Hovorili sme telefonicky, mám pre nich dve možnosti — WordPress web a statický web."
            className="field resize-none"
          />
        </section>

        {/* Možnosti */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Možnosti / položky</h2>
            <button onClick={() => setOptions(o => [...o, EMPTY_OPTION()])} className="btn-outline text-xs py-1.5 px-3">
              + Pridať možnosť
            </button>
          </div>

          <div className="space-y-5">
            {options.map((opt, optIdx) => (
              <div key={opt.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Možnosť {optIdx + 1}
                  </span>
                  {options.length > 1 && (
                    <button onClick={() => setOptions(o => o.filter(x => x.id !== opt.id))} className="text-gray-300 hover:text-red-400 transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="label">Názov *</label>
                    <input type="text" value={opt.title} onChange={e => updateOption(opt.id, 'title', e.target.value)} placeholder="napr. WordPress web" className="field bg-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Cena (€)</label>
                      <input type="number" value={opt.price || ''} onChange={e => updateOption(opt.id, 'price', Number(e.target.value))} placeholder="0" className="field bg-white" />
                    </div>
                    <div>
                      <label className="label">Typ ceny</label>
                      <select value={opt.priceLabel} onChange={e => updateOption(opt.id, 'priceLabel', e.target.value)} className="field bg-white">
                        <option>bez DPH</option>
                        <option>s DPH</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Platobné podmienky</label>
                      <input type="text" value={opt.paymentTerms} onChange={e => updateOption(opt.id, 'paymentTerms', e.target.value)} placeholder="napr. 50% záloha" className="field bg-white" />
                    </div>
                    <div>
                      <label className="label">Doba dodania</label>
                      <input type="text" value={opt.deliveryTime} onChange={e => updateOption(opt.id, 'deliveryTime', e.target.value)} placeholder="napr. 2–4 týždne" className="field bg-white" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Čo zahŕňa (bullet points)</label>
                    <div className="space-y-1.5">
                      {opt.includes.map((inc, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={inc}
                            onChange={e => updateInclude(opt.id, idx, e.target.value)}
                            placeholder={`Bod ${idx + 1}`}
                            className="field bg-white flex-1"
                          />
                          <button onClick={() => removeInclude(opt.id, idx)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addInclude(opt.id)} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                        + Pridať bod
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
            {(error.includes('kľúč') || error.includes('API')) && (
              <Link href="/settings" className="ml-2 underline font-medium">Nastavenia →</Link>
            )}
          </div>
        )}

        <button
          onClick={generate}
          disabled={generating}
          className="w-full btn-dark py-3 justify-center text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Generujem ponuku...
            </>
          ) : 'Vygenerovať cenovú ponuku'}
        </button>
      </div>

      {/* ── RIGHT: PREVIEW ──────────────────────────────────────────── */}
      <div className="sticky top-20">
        {previewHtml ? (
          <>
            <div className="flex items-center justify-between mb-3 no-print">
              <span className="text-sm font-medium text-gray-600">Náhľad</span>
              <div className="flex gap-2">
                <button onClick={generate} className="btn-outline text-xs py-1.5 px-3">
                  Regenerovať
                </button>
                <button onClick={() => window.print()} className="btn-dark text-xs py-1.5 px-3">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Tlačiť / PDF
                </button>
              </div>
            </div>
            <div
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </>
        ) : (
          <div className="card flex flex-col items-center justify-center py-20 text-gray-300">
            <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p className="text-sm">Náhľad ponuky sa zobrazí tu</p>
          </div>
        )}
      </div>
    </div>
  )
}
