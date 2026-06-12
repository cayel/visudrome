import type { NavidromeConfig } from '../../types/navidrome'
import { fetchAlbumRating, RATING_CONCURRENCY } from '../navidrome'
import { buildConfigKey } from '../cacheUtils'
import { db, getSyncState } from '../db'
import type { RatingSyncProgress } from './types'

interface SyncAlbumRatingsOptions {
  force?: boolean
  onProgress?: (progress: RatingSyncProgress) => void
}

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0

  async function worker() {
    while (index < items.length) {
      const current = items[index]
      index += 1
      await fn(current)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
}

export async function syncAlbumRatings(
  config: NavidromeConfig,
  options: SyncAlbumRatingsOptions = {},
): Promise<void> {
  const { force = false, onProgress } = options
  const configKey = buildConfigKey(config)
  const albums = await db.albums.where('configKey').equals(configKey).toArray()
  const targets = force
    ? albums
    : albums.filter((album) => album.ratingCheckedAt === undefined)

  if (targets.length === 0) {
    const previous = await getSyncState(configKey)
    const remaining = await countUncheckedRatings(configKey)

    if (previous && remaining === 0) {
      await db.syncState.put({
        ...previous,
        ratingsSyncedAt: previous.ratingsSyncedAt || Date.now(),
      })
    }

    onProgress?.({ completed: 0, total: 0 })
    return
  }

  const checkedAt = Date.now()
  let completed = 0

  onProgress?.({ completed: 0, total: targets.length })

  await mapWithConcurrency(targets, RATING_CONCURRENCY, async (album) => {
    const rating = await fetchAlbumRating(config, album.id)

    if (rating === null) {
      await db.albums.update(album.key, {
        fullyRated: false,
        ratingCheckedAt: checkedAt,
      })
    } else {
      await db.albums.update(album.key, {
        averageRating: rating.fullyRated ? rating.averageRating : undefined,
        trackCount: rating.trackCount,
        fullyRated: rating.fullyRated,
        ratingCheckedAt: checkedAt,
      })
    }

    completed += 1
    onProgress?.({ completed, total: targets.length })
  })

  const previous = await getSyncState(configKey)
  const remaining = await countUncheckedRatings(configKey)

  await db.syncState.put({
    configKey,
    librarySyncedAt: previous?.librarySyncedAt ?? checkedAt,
    ratingsSyncedAt: remaining === 0 ? checkedAt : (previous?.ratingsSyncedAt ?? 0),
    genresSyncedAt: previous?.genresSyncedAt ?? 0,
  })
}

export async function countUncheckedRatings(configKey: string): Promise<number> {
  return db.albums
    .where('configKey')
    .equals(configKey)
    .filter((album) => album.ratingCheckedAt === undefined)
    .count()
}

export async function getRatingSyncStats(
  configKey: string,
): Promise<{ total: number; completed: number; remaining: number }> {
  const total = await db.albums.where('configKey').equals(configKey).count()
  const remaining = await countUncheckedRatings(configKey)

  return {
    total,
    completed: total - remaining,
    remaining,
  }
}
