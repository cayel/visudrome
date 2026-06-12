import type { NavidromeConfig } from '../types/navidrome'
import { isCacheFresh, buildConfigKey } from './cacheUtils'
import type { DashboardData } from './dashboardTypes'
import { buildDashboardData, hasStoredLibrary } from './db/aggregates'
import { getSyncState } from './db'
import { syncGenreLinks } from './sync/genres'
import { syncAlbumLibrary } from './sync/library'

export interface DashboardSyncResult {
  data: DashboardData
  syncedAt: number
}

export async function loadDashboardData(
  config: NavidromeConfig,
  options: { force?: boolean } = {},
): Promise<DashboardSyncResult> {
  const configKey = buildConfigKey(config)
  const syncState = await getSyncState(configKey)
  const hasLibrary = await hasStoredLibrary(configKey)
  const libraryFresh = Boolean(
    syncState && isCacheFresh(syncState.librarySyncedAt) && !options.force,
  )
  const genresFresh = Boolean(
    syncState && isCacheFresh(syncState.genresSyncedAt) && !options.force,
  )

  if (!libraryFresh || !hasLibrary) {
    await syncAlbumLibrary(config)
  }

  if (!genresFresh) {
    await syncGenreLinks(config)
  }

  const data = await buildDashboardData(configKey)
  const updatedSyncState = await getSyncState(configKey)

  return {
    data,
    syncedAt: updatedSyncState?.librarySyncedAt ?? Date.now(),
  }
}

export async function readDashboardData(config: NavidromeConfig): Promise<DashboardSyncResult | null> {
  const configKey = buildConfigKey(config)
  const hasLibrary = await hasStoredLibrary(configKey)
  if (!hasLibrary) return null

  const syncState = await getSyncState(configKey)
  const data = await buildDashboardData(configKey)

  return {
    data,
    syncedAt: syncState?.librarySyncedAt ?? Date.now(),
  }
}
