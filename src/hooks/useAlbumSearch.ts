import { useEffect, useState } from 'react'
import { buildConfigKey } from '../lib/cacheUtils'
import {
  DEFAULT_ALBUM_SEARCH_FILTERS,
  getSearchFacets,
  searchAlbums,
  type AlbumSearchFacets,
  type AlbumSearchFilters,
  type AlbumSearchResult,
} from '../lib/db/search'
import { hasStoredLibrary } from '../lib/db/aggregates'
import type { NavidromeConfig } from '../types/navidrome'

interface UseAlbumSearchResult {
  filters: AlbumSearchFilters
  setFilters: (next: AlbumSearchFilters) => void
  resetFilters: () => void
  results: AlbumSearchResult[]
  facets: AlbumSearchFacets | null
  loading: boolean
  ready: boolean
  error: string | null
}

export function useAlbumSearch(config: NavidromeConfig | null): UseAlbumSearchResult {
  const [filters, setFilters] = useState<AlbumSearchFilters>(DEFAULT_ALBUM_SEARCH_FILTERS)
  const [results, setResults] = useState<AlbumSearchResult[]>([])
  const [facets, setFacets] = useState<AlbumSearchFacets | null>(null)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!config) return

    let cancelled = false
    const configKey = buildConfigKey(config)

    async function loadFacets() {
      try {
        const hasLibrary = await hasStoredLibrary(configKey)
        if (!hasLibrary) {
          if (!cancelled) {
            setFacets(null)
            setReady(false)
            setResults([])
            setError(null)
            setLoading(false)
          }
          return
        }

        const nextFacets = await getSearchFacets(configKey)
        if (cancelled) return

        setFacets(nextFacets)
        setReady(true)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setFacets(null)
        setReady(false)
        setError(err instanceof Error ? err.message : 'Impossible de charger la collection locale')
        setLoading(false)
      }
    }

    void loadFacets()

    return () => {
      cancelled = true
    }
  }, [config])

  useEffect(() => {
    if (!config || !ready) return

    let cancelled = false
    const configKey = buildConfigKey(config)

    const timer = window.setTimeout(async () => {
      setLoading(true)

      try {
        const nextResults = await searchAlbums(configKey, filters)
        if (cancelled) return

        setResults(nextResults)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setResults([])
        setError(err instanceof Error ? err.message : 'Impossible de filtrer la collection')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [config, filters, ready])

  function resetFilters() {
    setFilters(DEFAULT_ALBUM_SEARCH_FILTERS)
  }

  if (!config) {
    return {
      filters,
      setFilters,
      resetFilters,
      results: [],
      facets: null,
      loading: false,
      ready: false,
      error: null,
    }
  }

  return {
    filters,
    setFilters,
    resetFilters,
    results,
    facets,
    loading,
    ready,
    error,
  }
}
