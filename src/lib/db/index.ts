import Dexie, { type Table } from 'dexie'
import type { GenreLink, StoredAlbum, SyncState } from './schema'

export class VisudromeDatabase extends Dexie {
  albums!: Table<StoredAlbum, string>
  syncState!: Table<SyncState, string>
  genreLinks!: Table<GenreLink, string>

  constructor() {
    super('visudrome')

    this.version(1).stores({
      albums: 'key, configKey, id, artist, year, fullyRated, averageRating, ratingCheckedAt',
      syncState: 'configKey',
      genreLinks: 'key, configKey, name',
    })
  }
}

export const db = new VisudromeDatabase()

export async function clearLocalDatabase(): Promise<void> {
  await db.transaction('rw', db.albums, db.syncState, db.genreLinks, async () => {
    await db.albums.clear()
    await db.syncState.clear()
    await db.genreLinks.clear()
  })
}

export async function clearConfigData(configKey: string): Promise<void> {
  await db.transaction('rw', db.albums, db.syncState, db.genreLinks, async () => {
    await db.albums.where('configKey').equals(configKey).delete()
    await db.genreLinks.where('configKey').equals(configKey).delete()
    await db.syncState.delete(configKey)
  })
}

export async function getSyncState(configKey: string): Promise<SyncState | undefined> {
  return db.syncState.get(configKey)
}
