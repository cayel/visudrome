import { describe, expect, it } from 'vitest'
import { normalizeServerUrl } from './urlUtils'

describe('normalizeServerUrl', () => {
  it('supprime les slashs de fin', () => {
    expect(normalizeServerUrl('https://navidrome.example.com/')).toBe(
      'https://navidrome.example.com',
    )
  })

  it('ajoute https si le schéma est absent', () => {
    expect(normalizeServerUrl('navidrome.example.com')).toBe('https://navidrome.example.com')
  })

  it('conserve http explicite', () => {
    expect(normalizeServerUrl('http://localhost:4533/')).toBe('http://localhost:4533')
  })
})
