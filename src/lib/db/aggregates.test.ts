import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { RatedAlbum } from '../../types/navidrome'
import { buildAlbumKey } from './schema'
import { db } from './index'
import {
  getAlbumCount,
  getTopArtists,
  getTopRatedAlbums,
  getYearData,
  sortRatedAlbums,
} from './aggregates'

const CONFIG_KEY = 'https://navidrome.test|demo'

beforeEach(async () => {
  await db.albums.clear()
  await db.genreLinks.clear()
  await db.syncState.clear()
})

afterEach(async () => {
  await db.albums.clear()
  await db.genreLinks.clear()
  await db.syncState.clear()
})

describe('sortRatedAlbums', () => {
  it('classe par note puis par nombre de titres', () => {
    const albums: RatedAlbum[] = [
      { id: '1', name: 'B', artist: 'Artiste', averageRating: 4.5, trackCount: 8 },
      { id: '2', name: 'A', artist: 'Artiste', averageRating: 4.5, trackCount: 12 },
      { id: '3', name: 'C', artist: 'Artiste', averageRating: 5, trackCount: 3 },
    ]

    expect(sortRatedAlbums(albums).map((album) => album.id)).toEqual(['3', '2', '1'])
  })
})

describe('getAlbumCount', () => {
  it('compte les albums d’une configuration', async () => {
    await db.albums.bulkPut([
      {
        key: buildAlbumKey(CONFIG_KEY, '1'),
        id: '1',
        configKey: CONFIG_KEY,
        name: 'Album 1',
        artist: 'Artiste',
        genres: [],
        fullyRated: false,
      },
      {
        key: buildAlbumKey(CONFIG_KEY, '2'),
        id: '2',
        configKey: CONFIG_KEY,
        name: 'Album 2',
        artist: 'Artiste',
        genres: [],
        fullyRated: false,
      },
    ])

    expect(await getAlbumCount(CONFIG_KEY)).toBe(2)
  })
})

describe('getYearData', () => {
  it('agrège les albums par année', async () => {
    await db.albums.bulkPut([
      {
        key: buildAlbumKey(CONFIG_KEY, '1'),
        id: '1',
        configKey: CONFIG_KEY,
        name: 'Album 1',
        artist: 'Artiste',
        year: 1987,
        genres: [],
        fullyRated: false,
      },
      {
        key: buildAlbumKey(CONFIG_KEY, '2'),
        id: '2',
        configKey: CONFIG_KEY,
        name: 'Album 2',
        artist: 'Artiste',
        year: 1987,
        genres: [],
        fullyRated: false,
      },
      {
        key: buildAlbumKey(CONFIG_KEY, '3'),
        id: '3',
        configKey: CONFIG_KEY,
        name: 'Album 3',
        artist: 'Artiste',
        year: 1991,
        genres: [],
        fullyRated: false,
      },
    ])

    expect(await getYearData(CONFIG_KEY)).toEqual([
      { year: 1987, count: 2 },
      { year: 1991, count: 1 },
    ])
  })
})

describe('getTopArtists', () => {
  it('classe les artistes par nombre de disques', async () => {
    await db.albums.bulkPut([
      {
        key: buildAlbumKey(CONFIG_KEY, '1'),
        id: '1',
        configKey: CONFIG_KEY,
        name: 'Album 1',
        artist: 'Zappa',
        genres: [],
        fullyRated: false,
      },
      {
        key: buildAlbumKey(CONFIG_KEY, '2'),
        id: '2',
        configKey: CONFIG_KEY,
        name: 'Album 2',
        artist: 'Beatles',
        genres: [],
        fullyRated: false,
      },
      {
        key: buildAlbumKey(CONFIG_KEY, '3'),
        id: '3',
        configKey: CONFIG_KEY,
        name: 'Album 3',
        artist: 'Beatles',
        genres: [],
        fullyRated: false,
      },
    ])

    const topArtists = await getTopArtists(CONFIG_KEY)
    expect(topArtists[0]?.artist).toBe('Beatles')
    expect(topArtists[0]?.count).toBe(2)
  })
})

describe('getTopRatedAlbums', () => {
  it('ne retourne que les albums entièrement notés', async () => {
    await db.albums.bulkPut([
      {
        key: buildAlbumKey(CONFIG_KEY, '1'),
        id: '1',
        configKey: CONFIG_KEY,
        name: 'Noté',
        artist: 'Artiste',
        genres: [],
        fullyRated: true,
        averageRating: 4.8,
        trackCount: 10,
      },
      {
        key: buildAlbumKey(CONFIG_KEY, '2'),
        id: '2',
        configKey: CONFIG_KEY,
        name: 'Partiel',
        artist: 'Artiste',
        genres: [],
        fullyRated: false,
        averageRating: 5,
        trackCount: 8,
      },
    ])

    const topAlbums = await getTopRatedAlbums(CONFIG_KEY)
    expect(topAlbums).toHaveLength(1)
    expect(topAlbums[0]?.name).toBe('Noté')
  })
})
