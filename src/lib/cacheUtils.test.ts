import { describe, expect, it } from 'vitest'
import { buildConfigKey, formatCacheAge, isCacheFresh } from './cacheUtils'

describe('buildConfigKey', () => {
  it('normalise l’URL et ignore le mot de passe', () => {
    expect(
      buildConfigKey({
        serverUrl: 'https://navidrome.example.com/',
        username: 'demo',
        password: 'secret',
      }),
    ).toBe('https://navidrome.example.com|demo')
  })
})

describe('isCacheFresh', () => {
  it('considère le cache frais dans la fenêtre TTL', () => {
    const now = 1_000_000
    expect(isCacheFresh(now - 60_000, now)).toBe(true)
  })

  it('considère le cache expiré hors TTL', () => {
    const now = 1_000_000
    expect(isCacheFresh(now - 7 * 60 * 60 * 1000, now)).toBe(false)
  })
})

describe('formatCacheAge', () => {
  it('formate les durées en français', () => {
    const now = 1_000_000
    expect(formatCacheAge(now - 30_000, now)).toBe("à l'instant")
    expect(formatCacheAge(now - 5 * 60_000, now)).toBe('il y a 5 min')
    expect(formatCacheAge(now - 2 * 60 * 60_000, now)).toBe('il y a 2 h')
  })
})
