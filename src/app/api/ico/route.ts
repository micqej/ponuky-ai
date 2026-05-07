import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const ico = req.nextUrl.searchParams.get('ico')?.replace(/\D/g, '')
  if (!ico || ico.length < 6) {
    return NextResponse.json({ error: 'Zadaj platné IČO (min. 6 číslic).' }, { status: 400 })
  }

  try {
    // Slovak Register of Legal Entities (RPO) — Štatistický úrad SR
    const rpoRes = await fetch(
      `https://rpo.statistics.sk/rpo/api/v0/subject/${ico}`,
      { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }
    )

    if (rpoRes.ok) {
      const data = await rpoRes.json()
      const name = data?.fullName || data?.name
      const addr = data?.address
      if (name) {
        return NextResponse.json({
          name,
          address: addr ? formatAddress(addr) : '',
          dic: data?.taxId || '',
        })
      }
    }

    // Fallback: ORSR website scrape
    const orsr = await fetchOrsr(ico)
    if (orsr) return NextResponse.json(orsr)

    return NextResponse.json({ error: 'Firma nenájdená. Vyplňte údaje ručne.' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Chyba pri vyhľadávaní. Vyplňte údaje ručne.' }, { status: 500 })
  }
}

function formatAddress(addr: Record<string, string>): string {
  const parts = [addr.street, addr.buildingNumber, addr.postalCode, addr.municipality].filter(Boolean)
  return parts.join(' ')
}

async function fetchOrsr(ico: string): Promise<{ name: string; address: string } | null> {
  try {
    const res = await fetch(
      `https://www.orsr.sk/hladaj_ico.asp?ICO=${ico}&SID=6`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html; charset=windows-1250' },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null

    const buf = await res.arrayBuffer()
    // ORSR returns windows-1250 encoding
    const text = new TextDecoder('windows-1250').decode(buf)

    // Extract company name from table
    const nameMatch = text.match(/Obchodné meno[\s\S]{0,200}?<td[^>]*>\s*([^<]+)/)
      ?? text.match(/<b>([^<]+(s\.r\.o\.|a\.s\.|k\.s\.|v\.o\.s\.)[^<]*)<\/b>/i)
    const name = nameMatch?.[1]?.trim()

    if (!name) return null

    // Extract address
    const addrMatch = text.match(/Sídlo[\s\S]{0,300}?<td[^>]*>([\s\S]{0,400}?)<\/td>/)
    const rawAddr = addrMatch?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || ''

    return { name, address: rawAddr }
  } catch {
    return null
  }
}
