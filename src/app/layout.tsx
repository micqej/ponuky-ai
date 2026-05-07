import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ponuky AI — Generátor obsahu',
  description: 'AI generátor cenových ponúk, emailov, LinkedIn postov a ďalšieho obsahu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <nav className="no-print bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <span className="text-2xl">⚡</span>
              <span>Ponuky <span className="text-sky-600">AI</span></span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/history" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">História</a>
              <a href="/settings" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Nastavenia</a>
              <a href="/generator/custom" className="btn-primary text-sm py-2 px-4">
                + Vlastný prompt
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
