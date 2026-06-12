import type { NavidromeConfig } from '../types/navidrome'
import { normalizeServerUrl } from './urlUtils'

function buildHashUrl(config: NavidromeConfig, path: string, query?: Record<string, string>): string {
  const base = normalizeServerUrl(config.serverUrl)
  const search = query ? `?${new URLSearchParams(query).toString()}` : ''
  return `${base}/#${path}${search}`
}

export function buildNavidromeAlbumUrl(config: NavidromeConfig, albumId: string): string {
  return buildHashUrl(config, `/album/${albumId}/show`)
}

export function buildNavidromeArtistUrl(config: NavidromeConfig, artistId: string): string {
  return buildHashUrl(config, `/artist/${artistId}/show`)
}

export function buildNavidromeGenreAlbumsUrl(config: NavidromeConfig, genreId: string): string {
  return buildHashUrl(config, '/album', {
    filter: JSON.stringify({ genre_id: [genreId] }),
    displayedFilters: JSON.stringify({ genre_id: true }),
  })
}
