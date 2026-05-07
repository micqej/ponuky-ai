import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cenové ponuky',
  description: 'Profesionálny generátor cenových ponúk',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <header className="no-print bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-gray-900 tracking-tight">
              Cenové ponuky
            </a>
            <nav className="flex items-center gap-1">
              <a href="/historia" className="btn-ghost text-sm">História</a>
              <a href="/settings" className="btn-ghost text-sm">Nastavenia</a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
