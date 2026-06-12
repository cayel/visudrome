import type { ArtistCount, GenreCount, YearCount } from '../types/navidrome'

export interface DashboardData {
  albumCount: number
  yearData: YearCount[]
  topArtists: ArtistCount[]
  topGenres: GenreCount[]
}
