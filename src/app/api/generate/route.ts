import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userPrompt, provider, model } = await req.json()

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json({ error: 'Chýba prompt' }, { status: 400 })
    }

    const selectedProvider = provider || process.env.DEFAULT_AI_PROVIDER || 'openai'

    let result: string

    if (selectedProvider === 'anthropic') {
      result = await generateAnthropic(systemPrompt, userPrompt, model)
    } else if (selectedProvider === 'google') {
      result = await generateGoogle(systemPrompt, userPrompt, model)
    } else {
      result = await generateOpenAI(systemPrompt, userPrompt, model)
    }

    return NextResponse.json({ result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Neznáma chyba'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function generateOpenAI(system: string, user: string, model?: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY nie je nastavený')

  const selectedModel = model || process.env.DEFAULT_AI_MODEL || 'gpt-4o-mini'

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenAI chyba: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function generateAnthropic(system: string, user: string, model?: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY nie je nastavený')

  const selectedModel = model || process.env.DEFAULT_AI_MODEL || 'claude-haiku-4-5-20251001'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: selectedModel,
      system,
      messages: [{ role: 'user', content: user }],
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Anthropic chyba: ${res.status}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

async function generateGoogle(system: string, user: string, model?: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY nie je nastavený')

  const selectedModel = model || process.env.DEFAULT_AI_MODEL || 'gemini-1.5-flash'

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Google AI chyba: ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
