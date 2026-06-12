import { describe, expect, it } from 'vitest'
import type { StoredAlbum } from './schema'
import {
  DEFAULT_ALBUM_SEARCH_FILTERS,
  filterStoredAlbums,
  matchesAlbumFilters,
  sortAlbumSearchResults,
  type AlbumSearchResult,
} from './search'

function createAlbum(overrides: Partial<StoredAlbum> = {}): StoredAlbum {
  return {
    key: 'cfg::1',
    id: '1',
    configKey: 'cfg',
    name: 'Abbey Road',
    artist: 'The Beatles',
    year: 1969,
    genres: ['Rock'],
    fullyRated: true,
    averageRating: 4.8,
    trackCount: 17,
    ratingCheckedAt: 1,
    ...overrides,
  }
}

describe('matchesAlbumFilters', () => {
  it('filtre par texte libre sur titre ou artiste', () => {
    const album = createAlbum()
    expect(matchesAlbumFilters(album, { ...DEFAULT_ALBUM_SEARCH_FILTERS, query: 'abbey' })).toBe(true)
    expect(matchesAlbumFilters(album, { ...DEFAULT_ALBUM_SEARCH_FILTERS, query: 'beatles' })).toBe(true)
    expect(matchesAlbumFilters(album, { ...DEFAULT_ALBUM_SEARCH_FILTERS, query: 'jazz' })).toBe(false)
  })

  it('filtre par genre et plage d’années', () => {
    const album = createAlbum()
    expect(matchesAlbumFilters(album, { ...DEFAULT_ALBUM_SEARCH_FILTERS, genre: 'Rock' })).toBe(true)
    expect(
      matchesAlbumFilters(album, { ...DEFAULT_ALBUM_SEARCH_FILTERS, yearFrom: 1970, yearTo: 1980 }),
    ).toBe(false)
  })

  it('filtre par état des notes', () => {
    const partial = createAlbum({ fullyRated: false, averageRating: undefined, ratingCheckedAt: 1 })
    const unchecked = createAlbum({ fullyRated: false, ratingCheckedAt: undefined })

    expect(
      matchesAlbumFilters(partial, { ...DEFAULT_ALBUM_SEARCH_FILTERS, ratingStatus: 'partial' }),
    ).toBe(true)
    expect(
      matchesAlbumFilters(unchecked, { ...DEFAULT_ALBUM_SEARCH_FILTERS, ratingStatus: 'unchecked' }),
    ).toBe(true)
  })
})

describe('filterStoredAlbums', () => {
  it('combine les filtres et le tri', () => {
    const albums = [
      createAlbum({ id: '1', key: 'cfg::1', artist: 'Zappa', name: 'Hot Rats', year: 1969 }),
      createAlbum({
        id: '2',
        key: 'cfg::2',
        artist: 'Beatles',
        name: 'Revolver',
        year: 1966,
        genres: ['Rock'],
      }),
      createAlbum({
        id: '3',
        key: 'cfg::3',
        artist: 'Beatles',
        name: 'Abbey Road',
        year: 1969,
        genres: ['Rock'],
      }),
    ]

    const results = filterStoredAlbums(albums, {
      ...DEFAULT_ALBUM_SEARCH_FILTERS,
      artist: 'Beatles',
      sort: 'year-asc',
    })

    expect(results.map((album) => album.id)).toEqual(['2', '3'])
  })
})

describe('sortAlbumSearchResults', () => {
  it('classe par note décroissante', () => {
    const albums: AlbumSearchResult[] = [
      { id: '1', name: 'A', artist: 'X', genres: [], fullyRated: true, averageRating: 4, trackCount: 10 },
      { id: '2', name: 'B', artist: 'X', genres: [], fullyRated: true, averageRating: 5, trackCount: 8 },
    ]

    expect(sortAlbumSearchResults(albums, 'rating-desc').map((album) => album.id)).toEqual(['2', '1'])
  })
})
