import type { ArtistCount, GenreCount, RatedAlbum, YearCount } from '../../types/navidrome'
import type { DashboardData } from '../dashboardTypes'
import { db } from './index'

const TOP_ARTISTS_LIMIT = 20
const TOP_GENRES_LIMIT = 20
const TOP_RATED_LIMIT = 50

export function sortRatedAlbums(albums: RatedAlbum[]): RatedAlbum[] {
  return [...albums].sort(
    (a, b) =>
      b.averageRating - a.averageRating ||
      b.trackCount - a.trackCount ||
      a.name.localeCompare(b.name, 'fr'),
  )
}

export async function getAlbumCount(configKey: string): Promise<number> {
  return db.albums.where('configKey').equals(configKey).count()
}

export async function getYearData(configKey: string): Promise<YearCount[]> {
  const albums = await db.albums.where('configKey').equals(configKey).toArray()
  const yearCounts = new Map<number, number>()

  for (const album of albums) {
    if (album.year) {
      yearCounts.set(album.year, (yearCounts.get(album.year) ?? 0) + 1)
    }
  }

  return Array.from(yearCounts.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year)
}

export async function getTopArtists(configKey: string): Promise<ArtistCount[]> {
  const albums = await db.albums.where('configKey').equals(configKey).toArray()
  const artistCounts = new Map<string, { count: number; artistId?: string }>()

  for (const album of albums) {
    const current = artistCounts.get(album.artist) ?? { count: 0 }
    artistCounts.set(album.artist, {
      count: current.count + 1,
      artistId: album.artistId ?? current.artistId,
    })
  }

  return Array.from(artistCounts.entries())
    .map(([artist, entry]) => ({ artist, count: entry.count, artistId: entry.artistId }))
    .sort((a, b) => b.count - a.count || a.artist.localeCompare(b.artist, 'fr'))
    .slice(0, TOP_ARTISTS_LIMIT)
}

export async function getTopGenres(configKey: string): Promise<GenreCount[]> {
  const albums = await db.albums.where('configKey').equals(configKey).toArray()
  const genreLinks = await db.genreLinks.where('configKey').equals(configKey).toArray()
  const genreIdByName = new Map(genreLinks.map((link) => [link.name, link.genreId]))
  const genreCounts = new Map<string, number>()

  for (const album of albums) {
    for (const genre of album.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1)
    }
  }

  return Array.from(genreCounts.entries())
    .map(([genre, count]) => ({
      genre,
      count,
      genreId: genreIdByName.get(genre),
    }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre, 'fr'))
    .slice(0, TOP_GENRES_LIMIT)
}

export async function getTopRatedAlbums(configKey: string): Promise<RatedAlbum[]> {
  const albums = await db.albums
    .where('configKey')
    .equals(configKey)
    .filter((album) => album.fullyRated && album.averageRating !== undefined)
    .toArray()

  return sortRatedAlbums(
    albums.map((album) => ({
      id: album.id,
      name: album.name,
      artist: album.artist,
      averageRating: album.averageRating!,
      trackCount: album.trackCount ?? 0,
      coverArt: album.coverArt,
    })),
  ).slice(0, TOP_RATED_LIMIT)
}

export async function buildDashboardData(configKey: string): Promise<DashboardData> {
  const [albumCount, yearData, topArtists, topGenres] = await Promise.all([
    getAlbumCount(configKey),
    getYearData(configKey),
    getTopArtists(configKey),
    getTopGenres(configKey),
  ])

  return {
    albumCount,
    yearData,
    topArtists,
    topGenres,
  }
}

export async function hasStoredLibrary(configKey: string): Promise<boolean> {
  const count = await getAlbumCount(configKey)
  return count > 0
}
