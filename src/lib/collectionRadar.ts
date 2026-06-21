import type { DecadeCount } from '../types/navidrome'
import type { DashboardData } from './dashboardTypes'

export type CollectionRadarInsightKind =
  | 'decade-gap'
  | 'ratings-unchecked'
  | 'ratings-partial'
  | 'explore'

export interface CollectionRadarInsight {
  id: string
  kind: CollectionRadarInsightKind
  title: string
  description: string
  /** Paramètres pour `/collection?…` */
  linkParams: Record<string, string>
}

const MAX_INSIGHTS = 4
const MIN_ALBUMS_DECADE = 28

function medianPositive(values: number[]): number {
  const sorted = [...values].filter((n) => n > 0).sort((a, b) => a - b)
  if (sorted.length === 0) return 0
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
}

/** Décennie la plus faible vs médiane des décennies non vides (seuil relatif). */
export function findWeakestDecade(decadeData: DecadeCount[]): DecadeCount | null {
  const nonEmpty = decadeData.filter((d) => d.count > 0)
  if (nonEmpty.length < 2) return null

  const med = medianPositive(nonEmpty.map((d) => d.count))
  if (med <= 0) return null

  const threshold = Math.max(1, Math.floor(med * 0.32))
  const candidates = nonEmpty.filter((d) => d.count <= threshold && d.count < med)
  if (candidates.length === 0) return null

  return candidates.reduce((best, d) => {
    if (d.count < best.count) return d
    if (d.count > best.count) return best
    return d.decade < best.decade ? d : best
  })
}

export function buildCollectionRadarSearch(linkParams: Record<string, string>): string {
  const p = new URLSearchParams()
  for (const [key, value] of Object.entries(linkParams)) {
    if (value !== undefined && value !== '') p.set(key, value)
  }
  const qs = p.toString()
  return qs ? `/collection?${qs}` : '/collection'
}

/**
 * Construit jusqu'à MAX_INSIGHTS cartes actionnables pour le dashboard.
 * `decadeData` doit correspondre à `data.yearData` (agrégation par décennie).
 */
export function buildCollectionRadarInsights(
  data: DashboardData,
  decadeData: DecadeCount[],
): CollectionRadarInsight[] {
  const insights: CollectionRadarInsight[] = []
  const { albumCount, ratingSnapshot } = data
  const { unchecked, partialRated } = ratingSnapshot

  if (albumCount === 0) return []

  if (unchecked > 0) {
    insights.push({
      id: 'ratings-unchecked',
      kind: 'ratings-unchecked',
      title: 'Notes à compléter',
      description: `${unchecked.toLocaleString('fr-FR')} album${unchecked > 1 ? 's' : ''} jamais analysé${unchecked > 1 ? 's' : ''} pour les notes des titres.`,
      linkParams: { rs: 'unchecked' },
    })
  } else if (partialRated > 0) {
    insights.push({
      id: 'ratings-partial',
      kind: 'ratings-partial',
      title: 'Notes incomplètes',
      description: `${partialRated.toLocaleString('fr-FR')} album${partialRated > 1 ? 's' : ''} avec analyse partielle des titres.`,
      linkParams: { rs: 'partial' },
    })
  }

  if (albumCount >= MIN_ALBUMS_DECADE) {
    const weak = findWeakestDecade(decadeData)
    if (weak) {
      const yf = String(weak.decade)
      const yt = String(weak.decade + 9)
      insights.push({
        id: `decade-${weak.decade}`,
        kind: 'decade-gap',
        title: 'Décennie la moins fournie',
        description: `${weak.decade.toLocaleString('fr-FR')} – ${(weak.decade + 9).toLocaleString('fr-FR')} : ${weak.count.toLocaleString('fr-FR')} disque${weak.count > 1 ? 's' : ''} (vs médiane plus haute sur d’autres décennies).`,
        linkParams: { yf, yt },
      })
    }
  }

  if (insights.length === 0 && albumCount >= 10) {
    insights.push({
      id: 'all-explore',
      kind: 'explore',
      title: 'Explorer la collection',
      description: `${albumCount.toLocaleString('fr-FR')} disques indexés — filtres par année, genre ou état des notes.`,
      linkParams: {},
    })
  }

  return insights.slice(0, MAX_INSIGHTS)
}
