import type { Company } from './quote'

export interface AppSettings {
  companies: Company[]
  openaiKey: string
  anthropicKey: string
  googleKey: string
  provider: string
  model: string
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return defaults()
  try {
    return { ...defaults(), ...JSON.parse(localStorage.getItem('ponuky-ai-settings') || '{}') }
  } catch {
    return defaults()
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem('ponuky-ai-settings', JSON.stringify(s))
}

export function getApiKeys(s: AppSettings) {
  return {
    openai: s.openaiKey || undefined,
    anthropic: s.anthropicKey || undefined,
    google: s.googleKey || undefined,
  }
}

function defaults(): AppSettings {
  return {
    companies: [],
    openaiKey: '',
    anthropicKey: '',
    googleKey: '',
    provider: 'openai',
    model: 'gpt-4o-mini',
  }
}
