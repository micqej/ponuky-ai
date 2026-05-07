export interface AppSettings {
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

export function getApiKeys(settings: AppSettings) {
  return {
    openai: settings.openaiKey || undefined,
    anthropic: settings.anthropicKey || undefined,
    google: settings.googleKey || undefined,
  }
}

function defaults(): AppSettings {
  return { openaiKey: '', anthropicKey: '', googleKey: '', provider: 'openai', model: 'gpt-4o-mini' }
}
