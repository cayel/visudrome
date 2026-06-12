export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'visudrome-theme'

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
    return null
  } catch {
    return null
  }
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme)
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}

export function getInitialTheme(): Theme {
  const stored = getStoredTheme()
  if (stored) return stored

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}
