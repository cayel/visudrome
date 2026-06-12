import { describe, expect, it, vi, afterEach } from 'vitest'
import { buildConnectionFailureMessage, getConnectionPreflightError } from './connectionDiagnostics'

describe('getConnectionPreflightError', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('signale le contenu mixte HTTP Navidrome + HTTPS Visudrome', () => {
    vi.stubGlobal('window', {
      location: { protocol: 'https:' },
    })

    expect(getConnectionPreflightError('http://192.168.1.10:4533')).toMatch(/contenu mixte/i)
  })

  it('avertit quand le schéma est omis sur une page HTTPS', () => {
    vi.stubGlobal('window', {
      location: { protocol: 'https:' },
    })

    expect(getConnectionPreflightError('navidrome.example.com')).toMatch(/HTTPS/)
  })

  it('ne bloque pas une URL HTTPS depuis une page HTTPS', () => {
    vi.stubGlobal('window', {
      location: { protocol: 'https:' },
    })

    expect(getConnectionPreflightError('https://navidrome.example.com')).toBeNull()
  })
})

describe('buildConnectionFailureMessage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('inclut l’origine Visudrome dans le message générique', () => {
    vi.stubGlobal('window', {
      location: { protocol: 'https:', origin: 'https://visudrome.vercel.app' },
    })

    expect(buildConnectionFailureMessage('https://music.example.com')).toContain(
      'https://visudrome.vercel.app',
    )
  })
})
