import type { NavidromeConfig } from '../types/navidrome'
import { buildConnectionFailureMessage, getConnectionPreflightError } from './connectionDiagnostics'
import { buildSubsonicAuthParams } from './subsonicAuth'
import { normalizeServerUrl } from './urlUtils'

const CLIENT_NAME = 'visudrome'
const API_VERSION = '1.16.1'
const PAGE_SIZE = 500

export const RATING_CONCURRENCY = 5

export interface AlbumLibraryRecord {
  id: string
  name: string
  artist: string
  artistId?: string
  year: number | null
  genres: string[]
  coverArt?: string
}

export interface AlbumRatingRecord {
  averageRating: number
  trackCount: number
  fullyRated: boolean
}

interface SubsonicAlbumListItem {
  id: string
  name?: string
  title?: string
  artist?: string
  artistId?: string
  coverArt?: string
  year?: number
  originalReleaseYear?: number
  genre?: string
  genres?: Array<string | { name?: string }>
}

interface SubsonicSong {
  userRating?: number
}

function buildApiUrl(config: NavidromeConfig, endpoint: string, params: Record<string, string> = {}): string {
  const base = normalizeServerUrl(config.serverUrl)
  const searchParams = new URLSearchParams({
    ...buildSubsonicAuthParams(config),
    v: API_VERSION,
    c: CLIENT_NAME,
    f: 'json',
    ...params,
  })
  return `${base}/rest/${endpoint}?${searchParams.toString()}`
}

async function subsonicRequest(
  config: NavidromeConfig,
  endpoint: string,
  params: Record<string, string> = {},
): Promise<Response> {
  const preflightError = getConnectionPreflightError(config.serverUrl)
  if (preflightError) {
    throw new Error(preflightError)
  }

  const url = buildApiUrl(config, endpoint, params)

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new Error(buildConnectionFailureMessage(config.serverUrl))
  }

  if (!response.ok) {
    throw new Error(`Erreur réseau (${response.status})`)
  }

  return response
}

function parseSubsonicError(payload: unknown): string | null {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'subsonic-response' in payload
  ) {
    const subsonic = (payload as { 'subsonic-response': { status?: string; error?: { message?: string } } })['subsonic-response']
    if (subsonic.status === 'failed') {
      return subsonic.error?.message ?? 'Authentification ou requête refusée'
    }
  }
  return null
}

export async function testConnection(config: NavidromeConfig): Promise<void> {
  const response = await subsonicRequest(config, 'ping.view')
  const payload = await response.json()
  const error = parseSubsonicError(payload)
  if (error) throw new Error(error)
}

async function fetchSubsonicJson(
  config: NavidromeConfig,
  endpoint: string,
  params: Record<string, string> = {},
): Promise<unknown> {
  const response = await subsonicRequest(config, endpoint, params)
  const payload = await response.json()
  const error = parseSubsonicError(payload)
  if (error) throw new Error(error)
  return payload
}

export function buildCoverArtUrl(config: NavidromeConfig, coverArtId: string, size = 120): string {
  return buildApiUrl(config, 'getCoverArt.view', { id: coverArtId, size: String(size) })
}

function parseAlbumListItems(payload: unknown): SubsonicAlbumListItem[] {
  if (typeof payload !== 'object' || payload === null || !('subsonic-response' in payload)) {
    return []
  }

  const response = (payload as { 'subsonic-response': { albumList2?: { album?: SubsonicAlbumListItem | SubsonicAlbumListItem[] } } })['subsonic-response']
  const album = response.albumList2?.album
  if (!album) return []
  return Array.isArray(album) ? album : [album]
}

function parseAlbumSongs(payload: unknown): SubsonicSong[] {
  if (typeof payload !== 'object' || payload === null || !('subsonic-response' in payload)) {
    return []
  }

  const response = (payload as { 'subsonic-response': { album?: { song?: SubsonicSong | SubsonicSong[] } } })['subsonic-response']
  const song = response.album?.song
  if (!song) return []
  return Array.isArray(song) ? song : [song]
}

function getOriginalReleaseYear(album: SubsonicAlbumListItem): number | null {
  const year = album.originalReleaseYear ?? album.year
  if (typeof year === 'number' && year > 0) return year
  return null
}

function getAlbumGenres(album: SubsonicAlbumListItem): string[] {
  if (album.genres?.length) {
    return album.genres
      .map((entry) => (typeof entry === 'string' ? entry : entry.name ?? ''))
      .map((genre) => genre.trim())
      .filter(Boolean)
  }

  if (!album.genre?.trim()) return []

  return album.genre
    .split(/[,;/|]/)
    .map((genre) => genre.trim())
    .filter(Boolean)
}

function toAlbumLibraryRecord(album: SubsonicAlbumListItem): AlbumLibraryRecord {
  return {
    id: album.id,
    name: album.name ?? album.title ?? 'Sans titre',
    artist: album.artist ?? 'Artiste inconnu',
    artistId: album.artistId,
    year: getOriginalReleaseYear(album),
    genres: getAlbumGenres(album),
    coverArt: album.coverArt,
  }
}

export async function fetchAlbumLibrary(config: NavidromeConfig): Promise<AlbumLibraryRecord[]> {
  const records: AlbumLibraryRecord[] = []
  let offset = 0
  let total = Number.POSITIVE_INFINITY

  while (offset < total) {
    const response = await subsonicRequest(config, 'getAlbumList2.view', {
      type: 'alphabeticalByName',
      size: String(PAGE_SIZE),
      offset: String(offset),
    })

    const totalHeader = response.headers.get('x-total-count')
    if (totalHeader) {
      const parsedTotal = parseInt(totalHeader, 10)
      if (!Number.isNaN(parsedTotal)) {
        total = parsedTotal
      }
    }

    const payload = await response.json()
    const error = parseSubsonicError(payload)
    if (error) throw new Error(error)

    const albums = parseAlbumListItems(payload)
    if (albums.length === 0) break

    records.push(...albums.map(toAlbumLibraryRecord))
    offset += albums.length
    if (albums.length < PAGE_SIZE) break
  }

  return records
}

function computeFullyRatedAverage(songs: SubsonicSong[]): number | null {
  if (songs.length === 0) return null

  let total = 0
  for (const song of songs) {
    const rating = song.userRating ?? 0
    if (rating <= 0) return null
    total += rating
  }

  return total / songs.length
}

export async function fetchAlbumRating(
  config: NavidromeConfig,
  albumId: string,
): Promise<AlbumRatingRecord | null> {
  const payload = await fetchSubsonicJson(config, 'getAlbum.view', { id: albumId })
  const songs = parseAlbumSongs(payload)
  const averageRating = computeFullyRatedAverage(songs)

  if (averageRating === null) {
    return songs.length > 0
      ? {
          averageRating: 0,
          trackCount: songs.length,
          fullyRated: false,
        }
      : null
  }

  return {
    averageRating,
    trackCount: songs.length,
    fullyRated: true,
  }
}
