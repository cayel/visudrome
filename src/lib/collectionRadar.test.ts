import { describe, expect, it } from 'vitest'
import type { DecadeCount } from '../types/navidrome'
import type { DashboardData } from './dashboardTypes'
import {
  buildCollectionRadarInsights,
  buildCollectionRadarSearch,
  findWeakestDecade,
} from './collectionRadar'

function baseData(over: Partial<DashboardData> = {}): DashboardData {
  return {
    albumCount: 100,
    yearData: [],
    topArtists: [],
    topGenres: [],
    ratingSnapshot: { fullyRated: 80, partialRated: 10, unchecked: 10 },
    ...over,
  }
}

describe('findWeakestDecade', () => {
  it('retourne la décennie sous le seuil relatif à la médiane', () => {
    const decades: DecadeCount[] = [
      { decade: 1970, count: 40 },
      { decade: 1980, count: 38 },
      { decade: 1990, count: 5 },
      { decade: 2000, count: 35 },
    ]
    const weak = findWeakestDecade(decades)
    expect(weak?.decade).toBe(1990)
  })

  it('retourne null si une seule décennie non vide', () => {
    const decades: DecadeCount[] = [
      { decade: 1980, count: 10 },
      { decade: 1990, count: 0 },
    ]
    expect(findWeakestDecade(decades)).toBeNull()
  })
})

describe('buildCollectionRadarSearch', () => {
  it('construit la query attendue', () => {
    expect(buildCollectionRadarSearch({ rs: 'unchecked' })).toBe('/collection?rs=unchecked')
    expect(buildCollectionRadarSearch({ yf: '1990', yt: '1999' })).toBe('/collection?yf=1990&yt=1999')
  })
})

describe('buildCollectionRadarInsights', () => {
  it('priorise les albums non analysés pour les notes', () => {
    const data = baseData({ ratingSnapshot: { fullyRated: 50, partialRated: 0, unchecked: 3 } })
    const insights = buildCollectionRadarInsights(data, [])
    expect(insights[0]?.kind).toBe('ratings-unchecked')
    expect(insights[0]?.linkParams.rs).toBe('unchecked')
  })

  it('propose les notes partielles si rien d’unchecked', () => {
    const data = baseData({ ratingSnapshot: { fullyRated: 90, partialRated: 4, unchecked: 0 } })
    const insights = buildCollectionRadarInsights(data, [])
    expect(insights.some((i) => i.kind === 'ratings-partial')).toBe(true)
  })

  it('inclut une carte explore si aucun autre critère ne remplit (petite collection)', () => {
    const data = baseData({
      albumCount: 12,
      ratingSnapshot: { fullyRated: 12, partialRated: 0, unchecked: 0 },
    })
    const decades: DecadeCount[] = [{ decade: 2000, count: 12 }]
    const insights = buildCollectionRadarInsights(data, decades)
    expect(insights.some((i) => i.kind === 'explore')).toBe(true)
  })
})
