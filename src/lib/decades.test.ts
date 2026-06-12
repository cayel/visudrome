import { describe, expect, it } from 'vitest'
import {
  aggregateByDecade,
  formatDecadeRange,
  getDecadeStart,
  getDominantYears,
} from './decades'

describe('getDecadeStart', () => {
  it('retourne le début de décennie', () => {
    expect(getDecadeStart(1987)).toBe(1980)
    expect(getDecadeStart(2000)).toBe(2000)
    expect(getDecadeStart(1999)).toBe(1990)
  })
})

describe('formatDecadeRange', () => {
  it('formate une plage de dix ans', () => {
    const formatted = formatDecadeRange(1980)
    expect(formatted.replace(/\D/g, '')).toBe('19801989')
  })
})

describe('getDominantYears', () => {
  it('retourne null pour une liste vide', () => {
    expect(getDominantYears([])).toBeNull()
  })

  it('retourne l’année la plus fréquente', () => {
    expect(
      getDominantYears([
        { year: 1987, count: 3 },
        { year: 1988, count: 5 },
        { year: 1990, count: 2 },
      ]),
    ).toEqual({
      featuredYear: 1988,
      otherYears: [],
      count: 5,
    })
  })

  it('liste les ex-aequo par année décroissante', () => {
    expect(
      getDominantYears([
        { year: 1987, count: 4 },
        { year: 1991, count: 4 },
        { year: 1983, count: 4 },
      ]),
    ).toEqual({
      featuredYear: 1991,
      otherYears: [1987, 1983],
      count: 4,
    })
  })
})

describe('aggregateByDecade', () => {
  it('agrège les années par décennie', () => {
    expect(
      aggregateByDecade([
        { year: 1987, count: 2 },
        { year: 1989, count: 3 },
        { year: 1991, count: 1 },
      ]),
    ).toEqual([
      { decade: 1980, count: 5 },
      { decade: 1990, count: 1 },
    ])
  })
})
