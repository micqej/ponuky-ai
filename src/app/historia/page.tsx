'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HistoryItem {
  id: string; createdAt: string; supplierName: string; clientName: string; html: string
}

export default function HistoriaPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [selected, setSelected] = useState<HistoryItem | null>(null)

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('ponuky-history') || '[]'))
  }, [])

  function remove(id: string) {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    localStorage.setItem('ponuky-history', JSON.stringify(updated))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">História ponúk</h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => { if (confirm('Vymazať celú históriu?')) { setItems([]); localStorage.removeItem('ponuky-history'); setSelected(null) } }}
            className="btn-ghost text-red-400 hover:text-red-600 text-sm"
          >
            Vymazať všetko
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-gray-300">
          <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p className="text-sm mb-4">Zatiaľ žiadne vygenerované ponuky.</p>
          <Link href="/" className="btn-dark py-2 px-5 text-sm">Vytvoriť prvú ponuku</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* List */}
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`card p-4 cursor-pointer transition-all ${selected?.id === item.id ? 'border-gray-900 ring-1 ring-gray-900' : 'hover:border-gray-300'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{item.clientName}</div>
                    <div className="text-xs text-gray-400 truncate">{item.supplierName}</div>
                    <div className="text-xs text-gray-300 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); remove(item.id) }}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            {selected ? (
              <>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => window.print()} className="btn-dark text-sm py-2 px-4">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    Tlačiť / PDF
                  </button>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm" dangerouslySetInnerHTML={{ __html: selected.html }} />
              </>
            ) : (
              <div className="card flex items-center justify-center h-48 text-gray-300">
                <p className="text-sm">Klikni na ponuku vľavo</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
