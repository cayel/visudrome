import type { ArtistCount, GenreCount, YearCount } from '../types/navidrome'

/** Répartition albums / état analyse des notes (calculée en une passe sur la bibliothèque locale). */
export interface RatingSnapshot {
  fullyRated: number
  partialRated: number
  unchecked: number
}

export interface DashboardData {
  albumCount: number
  yearData: YearCount[]
  topArtists: ArtistCount[]
  topGenres: GenreCount[]
  ratingSnapshot: RatingSnapshot
}
