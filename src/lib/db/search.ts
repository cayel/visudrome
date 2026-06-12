import type { StoredAlbum } from './schema'
import { db } from './index'

export type AlbumRatingStatus = 'all' | 'fully-rated' | 'partial' | 'unchecked'

export type AlbumSearchSort = 'artist' | 'name' | 'year-desc' | 'year-asc' | 'rating-desc'

export interface AlbumSearchFilters {
  query: string
  artist: string
  genre: string
  yearFrom?: number
  yearTo?: number
  minRating?: number
  ratingStatus: AlbumRatingStatus
  sort: AlbumSearchSort
}

export interface AlbumSearchResult {
  id: string
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

export interface AlbumSearchFacets {
  genres: string[]
  yearMin?: number
  yearMax?: number
  totalAlbums: number
}

export const DEFAULT_ALBUM_SEARCH_FILTERS: AlbumSearchFilters = {
  query: '',
  artist: '',
  genre: '',
  yearFrom: undefined,
  yearTo: undefined,
  minRating: undefined,
  ratingStatus: 'all',
  sort: 'artist',
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase('fr')
}

function includesText(haystack: string, needle: string): boolean {
  if (!needle) return true
  return normalizeText(haystack).includes(normalizeText(needle))
}

export function matchesAlbumFilters(album: StoredAlbum, filters: AlbumSearchFilters): boolean {
  const query = normalizeText(filters.query)
  if (query) {
    const inName = normalizeText(album.name).includes(query)
    const inArtist = normalizeText(album.artist).includes(query)
    if (!inName && !inArtist) return false
  }

  if (filters.artist && !includesText(album.artist, filters.artist)) {
    return false
  }

  if (filters.genre) {
    const genre = normalizeText(filters.genre)
    const hasGenre = album.genres.some((entry) => normalizeText(entry) === genre)
    if (!hasGenre) return false
  }

  if (filters.yearFrom !== undefined || filters.yearTo !== undefined) {
    if (album.year === undefined) return false
    if (filters.yearFrom !== undefined && album.year < filters.yearFrom) return false
    if (filters.yearTo !== undefined && album.year > filters.yearTo) return false
  }

  switch (filters.ratingStatus) {
    case 'fully-rated':
      if (!album.fullyRated || album.averageRating === undefined) return false
      break
    case 'partial':
      if (!album.ratingCheckedAt || album.fullyRated) return false
      break
    case 'unchecked':
      if (album.ratingCheckedAt !== undefined) return false
      break
    default:
      break
  }

  if (filters.minRating !== undefined) {
    if (!album.fullyRated || album.averageRating === undefined) return false
    if (album.averageRating < filters.minRating) return false
  }

  return true
}

export function sortAlbumSearchResults(
  albums: AlbumSearchResult[],
  sort: AlbumSearchSort,
): AlbumSearchResult[] {
  const sorted = [...albums]

  sorted.sort((a, b) => {
    switch (sort) {
      case 'name':
        return a.name.localeCompare(b.name, 'fr') || a.artist.localeCompare(b.artist, 'fr')
      case 'year-desc':
        return (b.year ?? -1) - (a.year ?? -1) || a.name.localeCompare(b.name, 'fr')
      case 'year-asc':
        return (a.year ?? Number.MAX_SAFE_INTEGER) - (b.year ?? Number.MAX_SAFE_INTEGER) ||
          a.name.localeCompare(b.name, 'fr')
      case 'rating-desc':
        return (
          (b.averageRating ?? -1) - (a.averageRating ?? -1) ||
          (b.trackCount ?? 0) - (a.trackCount ?? 0) ||
          a.name.localeCompare(b.name, 'fr')
        )
      case 'artist':
      default:
        return a.artist.localeCompare(b.artist, 'fr') || a.name.localeCompare(b.name, 'fr')
    }
  })

  return sorted
}

function toSearchResult(album: StoredAlbum): AlbumSearchResult {
  return {
    id: album.id,
    name: album.name,
    artist: album.artist,
    artistId: album.artistId,
    year: album.year,
    genres: album.genres,
    coverArt: album.coverArt,
    averageRating: album.averageRating,
    trackCount: album.trackCount,
    fullyRated: album.fullyRated,
    ratingCheckedAt: album.ratingCheckedAt,
  }
}

export function filterStoredAlbums(
  albums: StoredAlbum[],
  filters: AlbumSearchFilters,
): AlbumSearchResult[] {
  const filtered = albums.filter((album) => matchesAlbumFilters(album, filters)).map(toSearchResult)
  return sortAlbumSearchResults(filtered, filters.sort)
}

export async function searchAlbums(
  configKey: string,
  filters: AlbumSearchFilters,
): Promise<AlbumSearchResult[]> {
  const albums = await db.albums.where('configKey').equals(configKey).toArray()
  return filterStoredAlbums(albums, filters)
}

export async function getSearchFacets(configKey: string): Promise<AlbumSearchFacets> {
  const albums = await db.albums.where('configKey').equals(configKey).toArray()
  const genreSet = new Set<string>()
  let yearMin: number | undefined
  let yearMax: number | undefined

  for (const album of albums) {
    for (const genre of album.genres) {
      if (genre.trim()) genreSet.add(genre)
    }

    if (album.year !== undefined) {
      yearMin = yearMin === undefined ? album.year : Math.min(yearMin, album.year)
      yearMax = yearMax === undefined ? album.year : Math.max(yearMax, album.year)
    }
  }

  return {
    genres: Array.from(genreSet).sort((a, b) => a.localeCompare(b, 'fr')),
    yearMin,
    yearMax,
    totalAlbums: albums.length,
  }
}

export function hasActiveFilters(filters: AlbumSearchFilters): boolean {
  return (
    Boolean(filters.query.trim()) ||
    Boolean(filters.artist.trim()) ||
    Boolean(filters.genre.trim()) ||
    filters.yearFrom !== undefined ||
    filters.yearTo !== undefined ||
    filters.minRating !== undefined ||
    filters.ratingStatus !== 'all' ||
    filters.sort !== DEFAULT_ALBUM_SEARCH_FILTERS.sort
  )
}
