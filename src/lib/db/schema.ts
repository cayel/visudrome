export interface StoredAlbum {
  key: string
  id: string
  configKey: string
  name: string
  artist: string
  artistId?: string
  year?: number
  genres: string[]
  coverArt?: string
  averageRating?: number
  trackCount?: number
  fullyRated: boolean
  ratingCheckedAt?: number
}

export interface SyncState {
  configKey: string
  librarySyncedAt: number
  ratingsSyncedAt: number
  genresSyncedAt: number
}

export interface GenreLink {
  key: string
  configKey: string
  name: string
  genreId: string
}

export function buildAlbumKey(configKey: string, albumId: string): string {
  return `${configKey}::${albumId}`
}

export function buildGenreLinkKey(configKey: string, genreName: string): string {
  return `${configKey}::${genreName}`
}
