import { NextRequest, NextResponse } from 'next/server'
import type { Company, QuoteOption } from '@/lib/quote'

interface ClientForm {
  name: string; address: string; ico: string; dic: string; email: string; phone: string
}

export async function POST(req: NextRequest) {
  try {
    const { supplier, client, context, options, apiKeys, provider, model } = await req.json() as {
      supplier: Company
      client: ClientForm
      context: string
      options: QuoteOption[]
      apiKeys: Record<string, string>
      provider: string
      model: string
    }

    // 1. Generate intro text via AI
    const intro = await generateIntro({ supplier, client, context, options, apiKeys, provider, model })

    // 2. Build HTML quote
    const html = buildQuoteHtml({ supplier, client, intro, options })

    return NextResponse.json({ html })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Chyba' }, { status: 500 })
  }
}

// ── AI call ────────────────────────────────────────────────────────────────

async function generateIntro(params: {
  supplier: Company; client: ClientForm; context: string
  options: QuoteOption[]; apiKeys: Record<string, string>; provider: string; model: string
}): Promise<string> {
  const { supplier, client, context, options, apiKeys, provider, model } = params

  const system = `Si profesionálny obchodný asistent. Píšeš úvod cenovej ponuky v slovenčine, formálnym ale príjemným tónom.
Úvod má byť 2–4 vety. Oslovuj zákazníka v 3. osobe množného čísla (Váš, Vám, Vás). Píš len samotný text, bez uvodzoviek.`

  const user = `Dodávateľ: ${supplier.name}
Odberateľ: ${client.name}
${context ? `Kontext: ${context}` : ''}
Možnosti: ${options.map((o, i) => `Možnosť ${i + 1}: ${o.title} — ${o.price} € ${o.priceLabel}`).join('; ')}

Napíš úvod cenovej ponuky.`

  const selectedProvider = provider || 'openai'
  const apiKey = apiKeys?.[selectedProvider]

  if (selectedProvider === 'anthropic' && apiKey) {
    return callAnthropic(system, user, model || 'claude-haiku-4-5-20251001', apiKey)
  } else if (selectedProvider === 'google' && apiKey) {
    return callGoogle(system, user, model || 'gemini-1.5-flash', apiKey)
  } else if (apiKey) {
    return callOpenAI(system, user, model || 'gpt-4o-mini', apiKey)
  } else {
    // No API key — return generic intro
    return `Ďakujeme za Váš záujem o naše služby. Na základe Vášho záujmu sme pre Vás pripravili ${options.length > 1 ? `${options.length} možnosti` : 'nasledujúcu ponuku'}. V prípade otázok nás neváhajte kontaktovať.`
  }
}

async function callOpenAI(system: string, user: string, model: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: 300,
      temperature: 0.7,
    }),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e?.error?.message || `OpenAI chyba ${res.status}`)
  }
  return (await res.json()).choices?.[0]?.message?.content ?? ''
}

async function callAnthropic(system: string, user: string, model: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, system, messages: [{ role: 'user', content: user }], max_tokens: 300 }),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e?.error?.message || `Anthropic chyba ${res.status}`)
  }
  return (await res.json()).content?.[0]?.text ?? ''
}

async function callGoogle(system: string, user: string, model: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    }
  )
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e?.error?.message || `Google chyba ${res.status}`)
  }
  return (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ── HTML builder ───────────────────────────────────────────────────────────

function buildQuoteHtml(params: {
  supplier: Company; client: ClientForm; intro: string; options: QuoteOption[]
}): string {
  const { supplier, client, intro, options } = params
  const date = new Date().toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const supplierLines = [
    supplier.address,
    [supplier.ico && `IČO: ${supplier.ico}`, supplier.dic && `DIČ: ${supplier.dic}`].filter(Boolean).join(' | '),
    [supplier.email, supplier.website].filter(Boolean).join(' | '),
  ].filter(Boolean)

  const clientLines = [
    client.address,
    client.phone,
    client.email,
  ].filter(Boolean)

  const optionCards = options.map((opt, i) => `
    <div style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:8px;padding:24px;flex:1;min-width:0;">
      <div style="font-size:11px;font-weight:600;color:#999;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">MOŽNOSŤ ${i + 1}</div>
      <div style="font-size:20px;font-weight:700;color:#111;margin-bottom:6px;">${opt.title}</div>
      <div style="font-size:28px;font-weight:800;color:#111;margin-bottom:2px;">${opt.price.toLocaleString('sk-SK')} €</div>
      <div style="font-size:12px;color:#888;margin-bottom:16px;">${opt.priceLabel}</div>
      ${opt.paymentTerms ? `<div style="margin-bottom:6px;"><span style="font-size:12px;font-weight:600;color:#333;">Platba: </span><span style="font-size:12px;color:#555;">${opt.paymentTerms}</span></div>` : ''}
      ${opt.deliveryTime ? `<div style="margin-bottom:14px;"><span style="font-size:12px;font-weight:600;color:#333;">Doba dodania: </span><span style="font-size:12px;color:#555;">${opt.deliveryTime}</span></div>` : ''}
      ${opt.includes.filter(Boolean).length ? `
        <div style="border-top:1px solid #e5e5e5;padding-top:14px;margin-top:4px;">
          <div style="font-size:12px;font-weight:600;color:#333;margin-bottom:8px;">Čo zahŕňa:</div>
          ${opt.includes.filter(Boolean).map(inc => `
            <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px;">
              <span style="color:#111;font-size:12px;margin-top:1px;">✓</span>
              <span style="font-size:13px;color:#444;line-height:1.4;">${inc}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('')

  return `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111;max-width:800px;margin:0 auto;">

  <!-- Header -->
  <div style="background:#111;color:#fff;padding:24px 32px;display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <div style="font-size:26px;font-weight:800;letter-spacing:-0.5px;">${supplier.brandName || supplier.name.split(' ')[0].toUpperCase()}</div>
      <div style="font-size:12px;color:#aaa;margin-top:2px;">${supplier.name}${supplier.website ? ` | ${supplier.website}` : ''}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:18px;font-weight:700;letter-spacing:0.05em;">CENOVÁ PONUKA</div>
      <div style="font-size:12px;color:#aaa;margin-top:2px;">Dátum: ${date}</div>
    </div>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,#e63946,#e63946 50%,#222 50%);"></div>

  <!-- Supplier / Client -->
  <div style="padding:28px 32px;display:flex;gap:40px;border-bottom:1px solid #eee;">
    <div style="flex:1;">
      <div style="font-size:10px;font-weight:700;color:#999;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">DODÁVATEĽ</div>
      <div style="font-size:15px;font-weight:700;margin-bottom:4px;">${supplier.name}</div>
      ${supplierLines.map(l => `<div style="font-size:12px;color:#555;line-height:1.6;">${l}</div>`).join('')}
    </div>
    <div style="flex:1;">
      <div style="font-size:10px;font-weight:700;color:#999;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">ODBERATEĽ</div>
      <div style="font-size:15px;font-weight:700;margin-bottom:4px;">${client.name}</div>
      ${clientLines.map(l => `<div style="font-size:12px;color:#555;line-height:1.6;">${l}</div>`).join('')}
    </div>
  </div>

  <!-- Intro -->
  <div style="padding:24px 32px 20px;font-size:13px;line-height:1.7;color:#333;border-bottom:1px solid #eee;">
    ${intro}
  </div>

  <!-- Options -->
  <div style="padding:24px 32px;">
    <div style="display:flex;gap:16px;flex-wrap:wrap;">
      ${optionCards}
    </div>
  </div>

  ${options.length > 1 ? `
  <!-- Note -->
  <div style="padding:0 32px 24px;font-size:12px;color:#666;line-height:1.6;">
    Obe možnosti zahŕňajú profesionálne vypracovanie. Ceny sú uvedené ${options[0].priceLabel}. V prípade záujmu alebo otázok nás neváhajte kontaktovať.
  </div>
  ` : ''}

  <!-- Footer -->
  <div style="border-top:1px solid #eee;padding:16px 32px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:11px;color:#888;">${supplier.name}${supplier.address ? ` | ${supplier.address}` : ''}${supplier.ico ? ` | IČO: ${supplier.ico}` : ''}</div>
    <div style="font-size:11px;color:#888;">${[supplier.website, supplier.email].filter(Boolean).join(' | ')}</div>
  </div>

</div>`
}
