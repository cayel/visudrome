import { describe, expect, it } from 'vitest'
import { buildSubsonicToken } from './subsonicAuth'

describe('buildSubsonicToken', () => {
  it('calcule le token MD5 attendu par Subsonic', () => {
    expect(buildSubsonicToken('sesame', 'c19b2d')).toBe('26719a1196d2a940705a59634eb18eab')
  })
})
