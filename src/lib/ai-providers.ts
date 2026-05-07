export type AIProvider = 'openai' | 'anthropic' | 'google'

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  pricePerMInputTokens: number  // USD per 1M input tokens
  pricePerMOutputTokens: number // USD per 1M output tokens
  maxTokens: number
  description: string
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    pricePerMInputTokens: 0.15,
    pricePerMOutputTokens: 0.60,
    maxTokens: 4096,
    description: 'Najlacnejší OpenAI — ideálny pre väčšinu úloh',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    pricePerMInputTokens: 2.50,
    pricePerMOutputTokens: 10.0,
    maxTokens: 4096,
    description: 'Výkonnejší OpenAI pre zložitejšie texty',
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku',
    provider: 'anthropic',
    pricePerMInputTokens: 0.25,
    pricePerMOutputTokens: 1.25,
    maxTokens: 4096,
    description: 'Najlacnejší Claude — rýchly a kvalitný',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet',
    provider: 'anthropic',
    pricePerMInputTokens: 3.0,
    pricePerMOutputTokens: 15.0,
    maxTokens: 8192,
    description: 'Výkonný Claude pre komplexné texty',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    pricePerMInputTokens: 0.075,
    pricePerMOutputTokens: 0.30,
    maxTokens: 4096,
    description: 'Najlacnejší model — free tier dostupný',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    pricePerMInputTokens: 1.25,
    pricePerMOutputTokens: 5.0,
    maxTokens: 8192,
    description: 'Výkonný Gemini pre dlhé texty',
  },
]

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(m => m.id === id)
}

export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return AI_MODELS.filter(m => m.provider === provider)
}

export function getCheapestModel(provider?: AIProvider): AIModel {
  const models = provider ? getModelsByProvider(provider) : AI_MODELS
  return models.reduce((a, b) =>
    a.pricePerMInputTokens < b.pricePerMInputTokens ? a : b
  )
}
