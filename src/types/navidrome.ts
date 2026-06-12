export interface NavidromeConfig {
  serverUrl: string
  username: string
  password: string
}

export interface NavidromeStats {
  albumCount: number
}

export interface YearCount {
  year: number
  count: number
}

export interface DecadeCount {
  decade: number
  count: number
}

export interface RatedAlbum {
  id: string
  name: string
  artist: string
  averageRating: number
  trackCount: number
  coverArt?: string
}

export interface ArtistCount {
  artist: string
  count: number
  artistId?: string
}

export interface GenreCount {
  genre: string
  count: number
  genreId?: string
}
