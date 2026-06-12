import { useCallback, useEffect, useState } from 'react'
import { buildConfigKey, formatCacheAge, isCacheFresh } from '../lib/cacheUtils'
import { getSyncState } from '../lib/db'
import { loadDashboardData, readDashboardData } from '../lib/dashboardData'
import type { DashboardData } from '../lib/dashboardTypes'
import type { NavidromeConfig } from '../types/navidrome'

interface UseDashboardDataResult {
  data: DashboardData | null
  loading: boolean
  refreshing: boolean
  error: string | null
  cachedAt: number | null
  cacheLabel: string | null
  refreshToken: number
  refresh: () => void
}

const EMPTY_DASHBOARD_RESULT: Omit<UseDashboardDataResult, 'refreshToken' | 'refresh'> = {
  data: null,
  loading: false,
  refreshing: false,
  error: null,
  cachedAt: null,
  cacheLabel: null,
}

export function useDashboardData(config: NavidromeConfig | null): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cachedAt, setCachedAt] = useState<number | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!config) return

    const activeConfig = config
    let cancelled = false
    const force = refreshToken > 0

    async function run() {
      setError(null)

      try {
        const configKey = buildConfigKey(activeConfig)
        const syncState = await getSyncState(configKey)
        const cached = await readDashboardData(activeConfig)
        const libraryFresh = Boolean(
          syncState && isCacheFresh(syncState.librarySyncedAt) && !force,
        )

        if (cached && !cancelled) {
          setData(cached.data)
          setCachedAt(cached.syncedAt)
          setLoading(false)
        } else if (!cancelled) {
          setLoading(true)
        }

        if (libraryFresh && cached) {
          if (!cancelled) {
            setRefreshing(false)
          }
          return
        }

        if (!cancelled) {
          setRefreshing(Boolean(cached))
        }

        const next = await loadDashboardData(activeConfig, { force })
        if (cancelled) return

        setData(next.data)
        setCachedAt(next.syncedAt)
        setError(null)
      } catch (err) {
        if (cancelled) return

        const message = err instanceof Error ? err.message : 'Impossible de charger le dashboard'
        const cached = await readDashboardData(activeConfig)
        if (cached) {
          setData(cached.data)
          setCachedAt(cached.syncedAt)
          setError(`${message}. Affichage des données locales.`)
        } else {
          setError(message)
          setData(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [config, refreshToken])

  if (!config) {
    return {
      ...EMPTY_DASHBOARD_RESULT,
      refreshToken,
      refresh,
    }
  }

  const cacheLabel = cachedAt ? formatCacheAge(cachedAt) : null

  return {
    data,
    loading,
    refreshing,
    error,
    cachedAt,
    cacheLabel,
    refreshToken,
    refresh,
  }
}
