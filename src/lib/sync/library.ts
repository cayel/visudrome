import type { NavidromeConfig } from '../../types/navidrome'
import { fetchAlbumLibrary } from '../navidrome'
import { buildConfigKey } from '../cacheUtils'
import { buildAlbumKey } from '../db/schema'
import { db, getSyncState } from '../db'

export async function syncAlbumLibrary(config: NavidromeConfig): Promise<number> {
  const configKey = buildConfigKey(config)
  const records = await fetchAlbumLibrary(config)
  const existingAlbums = await db.albums.where('configKey').equals(configKey).toArray()
  const existingByKey = new Map(existingAlbums.map((album) => [album.key, album]))
  const incomingKeys = new Set<string>()

  const nextAlbums = records.map((record) => {
    const key = buildAlbumKey(configKey, record.id)
    incomingKeys.add(key)
    const existing = existingByKey.get(key)

    return {
      key,
      id: record.id,
      configKey,
      name: record.name,
      artist: record.artist,
      artistId: record.artistId,
      year: record.year ?? undefined,
      genres: record.genres,
      coverArt: record.coverArt,
      averageRating: existing?.averageRating,
      trackCount: existing?.trackCount,
      fullyRated: existing?.fullyRated ?? false,
      ratingCheckedAt: existing?.ratingCheckedAt,
    }
  })

  await db.transaction('rw', db.albums, db.syncState, async () => {
    await db.albums.bulkPut(nextAlbums)

    const staleKeys = existingAlbums
      .map((album) => album.key)
      .filter((key) => !incomingKeys.has(key))

    if (staleKeys.length > 0) {
      await db.albums.bulkDelete(staleKeys)
    }

    const previous = await getSyncState(configKey)
    await db.syncState.put({
      configKey,
      librarySyncedAt: Date.now(),
      ratingsSyncedAt: previous?.ratingsSyncedAt ?? 0,
      genresSyncedAt: previous?.genresSyncedAt ?? 0,
    })
  })

  return nextAlbums.length
}
