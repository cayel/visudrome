import type { NavidromeConfig } from '../types/navidrome'

const LEGACY_STORAGE_KEY = 'visudrome-config'
const PROFILE_STORAGE_KEY = 'visudrome-profile'
const SESSION_STORAGE_KEY = 'visudrome-session'

interface StoredProfile {
  serverUrl: string
  username: string
}

interface StoredSession {
  password: string
}

function readStoredProfile(): StoredProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredProfile
    if (!parsed.serverUrl || !parsed.username) return null

    return parsed
  } catch {
    return null
  }
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed.password) return null

    return parsed
  } catch {
    return null
  }
}

function migrateLegacyConfig(): NavidromeConfig | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as NavidromeConfig
    if (!parsed.serverUrl || !parsed.username || !parsed.password) {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      return null
    }

    saveConfig(parsed)
    return parsed
  } catch {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    return null
  }
}

export function loadStoredProfile(): StoredProfile | null {
  return readStoredProfile()
}

export function hasStoredProfile(): boolean {
  return readStoredProfile() !== null
}

export function loadConfig(): NavidromeConfig | null {
  const migrated = migrateLegacyConfig()
  if (migrated) return migrated

  const profile = readStoredProfile()
  const session = readStoredSession()

  if (!profile || !session) return null

  return {
    serverUrl: profile.serverUrl,
    username: profile.username,
    password: session.password,
  }
}

export function saveConfig(config: NavidromeConfig): void {
  const profile: StoredProfile = {
    serverUrl: config.serverUrl.trim().replace(/\/+$/, ''),
    username: config.username.trim(),
  }

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ password: config.password }))
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}

export function clearConfig(): void {
  localStorage.removeItem(PROFILE_STORAGE_KEY)
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}
