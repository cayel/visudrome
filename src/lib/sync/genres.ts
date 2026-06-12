import type { NavidromeConfig } from '../../types/navidrome'
import { fetchGenreIdByName } from '../navidromeApi'
import { buildConfigKey } from '../cacheUtils'
import { buildGenreLinkKey } from '../db/schema'
import { db, getSyncState } from '../db'

export async function syncGenreLinks(config: NavidromeConfig): Promise<void> {
  const configKey = buildConfigKey(config)

  try {
    const genreIdByName = await fetchGenreIdByName(config)
    const links = Array.from(genreIdByName.entries()).map(([name, genreId]) => ({
      key: buildGenreLinkKey(configKey, name),
      configKey,
      name,
      genreId,
    }))

    await db.transaction('rw', db.genreLinks, db.syncState, async () => {
      await db.genreLinks.where('configKey').equals(configKey).delete()
      if (links.length > 0) {
        await db.genreLinks.bulkPut(links)
      }

      const previous = await getSyncState(configKey)
      await db.syncState.put({
        configKey,
        librarySyncedAt: previous?.librarySyncedAt ?? 0,
        ratingsSyncedAt: previous?.ratingsSyncedAt ?? 0,
        genresSyncedAt: Date.now(),
      })
    })
  } catch {
    // Genre links are optional — rankings still work without Navidrome deep links.
  }
}
