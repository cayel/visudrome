import { describe, expect, it } from 'vitest'
import { getDecadeBarColor } from './chartColors'

describe('getDecadeBarColor', () => {
  const baseColor = '#4f6cb0'

  it('retourne la couleur de base si une seule barre', () => {
    expect(getDecadeBarColor(baseColor, 0, 1)).toBe(baseColor)
  })

  it('retourne la couleur de base si la couleur est invalide', () => {
    expect(getDecadeBarColor('invalid', 0, 3)).toBe('invalid')
  })

  it('varie la teinte selon la position', () => {
    const first = getDecadeBarColor(baseColor, 0, 3)
    const middle = getDecadeBarColor(baseColor, 1, 3)
    const last = getDecadeBarColor(baseColor, 2, 3)

    expect(first).toMatch(/^#[0-9a-f]{6}$/i)
    expect(middle).toMatch(/^#[0-9a-f]{6}$/i)
    expect(last).toMatch(/^#[0-9a-f]{6}$/i)
    expect(new Set([first, middle, last]).size).toBeGreaterThan(1)
  })
})
