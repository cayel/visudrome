import type { DecadeCount, YearCount } from '../types/navidrome'

export interface DominantYear {
  featuredYear: number
  otherYears: number[]
  count: number
}

export function getDecadeStart(year: number): number {
  return Math.floor(year / 10) * 10
}

export function formatDecadeRange(decade: number): string {
  return `${decade.toLocaleString('fr-FR')} – ${(decade + 9).toLocaleString('fr-FR')}`
}

export function getDominantYears(yearData: YearCount[]): DominantYear | null {
  if (yearData.length === 0) return null

  const maxCount = Math.max(...yearData.map((entry) => entry.count))
  const years = yearData
    .filter((entry) => entry.count === maxCount)
    .map((entry) => entry.year)
    .sort((a, b) => b - a)

  return {
    featuredYear: years[0],
    otherYears: years.slice(1),
    count: maxCount,
  }
}

export function aggregateByDecade(yearData: YearCount[]): DecadeCount[] {
  const decadeCounts = new Map<number, number>()

  for (const { year, count } of yearData) {
    const decade = getDecadeStart(year)
    decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + count)
  }

  return Array.from(decadeCounts.entries())
    .map(([decade, count]) => ({ decade, count }))
    .sort((a, b) => a.decade - b.decade)
}
