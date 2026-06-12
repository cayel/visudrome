import { useEffect, useState } from 'react'
import { buildConfigKey } from '../lib/cacheUtils'
import { getTopRatedAlbums } from '../lib/db/aggregates'
import {
  getInitialRatingProgress,
  loadTopRatedAlbums,
  readTopRatedAlbums,
} from '../lib/topAlbumsData'
import { getRatingSyncStats } from '../lib/sync/ratings'
import type { RatingSyncProgress } from '../lib/sync/types'
import type { NavidromeConfig, RatedAlbum } from '../types/navidrome'

interface UseTopRatedAlbumsResult {
  albums: RatedAlbum[]
  loading: boolean
  refreshing: boolean
  syncingRatings: boolean
  ratingProgress: RatingSyncProgress | null
  error: string | null
}

const EMPTY_TOP_ALBUMS_RESULT: UseTopRatedAlbumsResult = {
  albums: [],
  loading: false,
  refreshing: false,
  syncingRatings: false,
  ratingProgress: null,
  error: null,
}

export function useTopRatedAlbums(
  config: NavidromeConfig | null,
  refreshToken: number,
): UseTopRatedAlbumsResult {
  const [albums, setAlbums] = useState<RatedAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [syncingRatings, setSyncingRatings] = useState(false)
  const [ratingProgress, setRatingProgress] = useState<RatingSyncProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!config) return

    const activeConfig = config
    let cancelled = false
    const force = refreshToken > 0

    async function refreshAlbumSnapshot() {
      const snapshot = await getTopRatedAlbums(buildConfigKey(activeConfig))
      if (!cancelled) {
        setAlbums(snapshot)
      }
    }

    async function run() {
      setError(null)

      try {
        const cached = await readTopRatedAlbums(activeConfig)
        const stats = await getRatingSyncStats(buildConfigKey(activeConfig))
        const needsSync = force || stats.remaining > 0

        if (cached && !cancelled) {
          setAlbums(cached.albums)
          setLoading(false)
        } else if (!cancelled) {
          setLoading(true)
        }

        if (!needsSync) {
          if (!cancelled) {
            setSyncingRatings(false)
            setRatingProgress(null)
            setRefreshing(false)
          }
          return
        }

        if (!cancelled) {
          setRefreshing(Boolean(cached))
          setSyncingRatings(true)
          const initialProgress = await getInitialRatingProgress(activeConfig)
          setRatingProgress(
            initialProgress ?? {
              completed: stats.completed,
              total: stats.total,
            },
          )
        }

        await loadTopRatedAlbums(activeConfig, {
          force,
          onProgress: (progress) => {
            if (cancelled) return
            setRatingProgress(progress)
            if (progress.completed === 0 || progress.completed % 10 === 0 || progress.completed === progress.total) {
              void refreshAlbumSnapshot()
            }
          },
        })

        if (cancelled) return

        await refreshAlbumSnapshot()
        setError(null)
      } catch (err) {
        if (cancelled) return

        const message = err instanceof Error ? err.message : 'Impossible de charger les meilleurs disques'
        const fallback = await readTopRatedAlbums(activeConfig)
        if (fallback) {
          setAlbums(fallback.albums)
          setError(`${message}. Affichage des données locales.`)
        } else {
          setError(message)
          setAlbums([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setRefreshing(false)
          setSyncingRatings(false)
          setRatingProgress(null)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [config, refreshToken])

  if (!config) {
    return EMPTY_TOP_ALBUMS_RESULT
  }

  return {
    albums,
    loading,
    refreshing,
    syncingRatings,
    ratingProgress,
    error,
  }
}
