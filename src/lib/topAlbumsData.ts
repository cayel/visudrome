import type { NavidromeConfig, RatedAlbum } from '../types/navidrome'
import { buildConfigKey } from './cacheUtils'
import { getTopRatedAlbums } from './db/aggregates'
import { getSyncState } from './db'
import { syncAlbumLibrary } from './sync/library'
import { getRatingSyncStats, syncAlbumRatings } from './sync/ratings'
import type { RatingSyncProgress } from './sync/types'

export interface TopAlbumsSyncResult {
  albums: RatedAlbum[]
  syncedAt: number
  isComplete: boolean
}

export interface LoadTopRatedOptions {
  force?: boolean
  onProgress?: (progress: RatingSyncProgress) => void
}

export async function loadTopRatedAlbums(
  config: NavidromeConfig,
  options: LoadTopRatedOptions = {},
): Promise<TopAlbumsSyncResult> {
  const configKey = buildConfigKey(config)
  const syncState = await getSyncState(configKey)

  if (!syncState?.librarySyncedAt) {
    await syncAlbumLibrary(config)
  }

  const { remaining } = await getRatingSyncStats(configKey)
  const shouldSync = Boolean(options.force) || remaining > 0

  if (shouldSync) {
    await syncAlbumRatings(config, {
      force: options.force ?? false,
      onProgress: options.onProgress,
    })
  }

  const albums = await getTopRatedAlbums(configKey)
  const updatedSyncState = await getSyncState(configKey)
  const stats = await getRatingSyncStats(configKey)

  return {
    albums,
    syncedAt: updatedSyncState?.ratingsSyncedAt || updatedSyncState?.librarySyncedAt || Date.now(),
    isComplete: stats.remaining === 0,
  }
}

export async function readTopRatedAlbums(config: NavidromeConfig): Promise<TopAlbumsSyncResult | null> {
  const configKey = buildConfigKey(config)
  const stats = await getRatingSyncStats(configKey)

  if (stats.total === 0) return null
  if (stats.completed === 0 && stats.remaining === stats.total) return null

  const syncState = await getSyncState(configKey)
  const albums = await getTopRatedAlbums(configKey)

  return {
    albums,
    syncedAt: syncState?.ratingsSyncedAt || syncState?.librarySyncedAt || Date.now(),
    isComplete: stats.remaining === 0,
  }
}

export async function getInitialRatingProgress(config: NavidromeConfig): Promise<RatingSyncProgress | null> {
  const configKey = buildConfigKey(config)
  const stats = await getRatingSyncStats(configKey)

  if (stats.total === 0 || stats.remaining === 0) return null
  if (stats.completed === 0 && stats.remaining === stats.total) return null

  return {
    completed: stats.completed,
    total: stats.total,
  }
}
