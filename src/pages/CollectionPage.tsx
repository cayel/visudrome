import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNavidrome } from '../context/NavidromeContext'
import { AlbumSearchResults } from '../components/AlbumSearchResults'
import { CollectionViewToggle } from '../components/CollectionViewToggle'
import { useAlbumSearch } from '../hooks/useAlbumSearch'
import {
  getStoredCollectionViewMode,
  saveCollectionViewMode,
  type CollectionViewMode,
} from '../lib/collectionView'
import {
  hasActiveFilters,
  type AlbumRatingStatus,
  type AlbumSearchFilters,
  type AlbumSearchSort,
} from '../lib/db/search'

const RATING_STATUS_OPTIONS: Array<{ value: AlbumRatingStatus; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'fully-rated', label: 'Entièrement notés' },
  { value: 'partial', label: 'Notes incomplètes' },
  { value: 'unchecked', label: 'Non analysés' },
]

const SORT_OPTIONS: Array<{ value: AlbumSearchSort; label: string }> = [
  { value: 'artist', label: 'Artiste (A → Z)' },
  { value: 'name', label: 'Album (A → Z)' },
  { value: 'year-desc', label: 'Année ↓' },
  { value: 'year-asc', label: 'Année ↑' },
  { value: 'rating-desc', label: 'Note ↓' },
]

function parseOptionalYear(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

function parseOptionalRating(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function hasAdvancedFilters(filters: AlbumSearchFilters): boolean {
  return (
    Boolean(filters.artist.trim()) ||
    Boolean(filters.genre.trim()) ||
    filters.yearFrom !== undefined ||
    filters.yearTo !== undefined ||
    filters.minRating !== undefined ||
    filters.ratingStatus !== 'all'
  )
}

function getActiveFilterLabels(filters: AlbumSearchFilters): string[] {
  const labels: string[] = []

  if (filters.artist.trim()) labels.push(`Artiste : ${filters.artist.trim()}`)
  if (filters.genre.trim()) labels.push(`Genre : ${filters.genre.trim()}`)
  if (filters.yearFrom !== undefined || filters.yearTo !== undefined) {
    const from = filters.yearFrom ?? '…'
    const to = filters.yearTo ?? '…'
    labels.push(`Années : ${from}–${to}`)
  }
  if (filters.minRating !== undefined) labels.push(`Note ≥ ${filters.minRating}`)
  if (filters.ratingStatus !== 'all') {
    const option = RATING_STATUS_OPTIONS.find((entry) => entry.value === filters.ratingStatus)
    if (option) labels.push(option.label)
  }

  return labels
}

export function CollectionPage() {
  const { config } = useNavidrome()
  const [searchParams] = useSearchParams()
  const radarHydrated = useRef(false)
  const { filters, setFilters, resetFilters, results, facets, loading, ready, error } = useAlbumSearch(config)
  const filtersActive = useMemo(() => hasActiveFilters(filters), [filters])
  const advancedActive = useMemo(() => hasAdvancedFilters(filters), [filters])
  const activeLabels = useMemo(() => getActiveFilterLabels(filters), [filters])
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [viewMode, setViewMode] = useState<CollectionViewMode>(() => getStoredCollectionViewMode())

  useEffect(() => {
    if (radarHydrated.current) return
    const rs = searchParams.get('rs')
    const yf = searchParams.get('yf')
    const yt = searchParams.get('yt')
    const g = searchParams.get('g')
    const hasRadarParams = Boolean(
      rs || (yf && yf.trim()) || (yt && yt.trim()) || (g && g.trim()),
    )
    if (!hasRadarParams) return

    radarHydrated.current = true

    const patch: Partial<AlbumSearchFilters> = {}
    if (rs === 'unchecked' || rs === 'partial' || rs === 'fully-rated') {
      patch.ratingStatus = rs
    }
    const yFrom = yf ? parseOptionalYear(yf) : undefined
    const yTo = yt ? parseOptionalYear(yt) : undefined
    if (yFrom !== undefined) patch.yearFrom = yFrom
    if (yTo !== undefined) patch.yearTo = yTo
    if (g && g.trim()) {
      const trimmed = g.trim()
      try {
        patch.genre = decodeURIComponent(trimmed)
      } catch {
        // Séquence % invalide dans l'URL : on n'applique pas le filtre genre.
      }
    }

    setFilters((prev) => ({ ...prev, ...patch }))
    if (patch.genre || patch.yearFrom !== undefined || patch.yearTo !== undefined) {
      queueMicrotask(() => {
        setAdvancedOpen(true)
      })
    }
  }, [searchParams, setFilters])

  function handleViewModeChange(mode: CollectionViewMode) {
    setViewMode(mode)
    saveCollectionViewMode(mode)
  }

  if (!config) return null

  return (
    <div className="collection-layout page-enter">
      <header className="page-header collection-page-header">
        <h2 className="page-title metallic-text">Collection</h2>
        {ready && facets && (
          <p className="page-subtitle">
            {facets.totalAlbums.toLocaleString('fr-FR')} disques locaux
            {filtersActive
              ? ` · ${results.length.toLocaleString('fr-FR')} résultat${results.length > 1 ? 's' : ''}`
              : ''}
          </p>
        )}
      </header>

      {!ready && !loading && (
        <p className="alert alert-info collection-empty-state">
          Aucune bibliothèque locale. Ouvrez le dashboard et laissez la synchronisation se terminer, ou cliquez sur
          Actualiser.
        </p>
      )}

      {ready && facets && (
        <section className="glass-panel collection-panel" aria-label="Collection filtrée">
          <div className="collection-toolbar">
            <label className="collection-search">
              <span className="sr-only">Recherche</span>
              <input
                type="search"
                className="field-input field-input-compact"
                placeholder="Titre ou artiste…"
                value={filters.query}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              />
            </label>

            <label className="collection-sort">
              <span className="sr-only">Tri</span>
              <select
                className="field-input field-input-compact"
                value={filters.sort}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    sort: event.target.value as AlbumSearchSort,
                  })
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <CollectionViewToggle value={viewMode} onChange={handleViewModeChange} />

            <button
              type="button"
              className={`btn-ghost collection-advanced-toggle${advancedOpen ? ' active' : ''}`}
              aria-expanded={advancedOpen}
              onClick={() => setAdvancedOpen((open) => !open)}
            >
              Filtres{advancedActive ? ' •' : ''}
            </button>

            {filtersActive && (
              <button type="button" className="btn-ghost" onClick={resetFilters}>
                Effacer
              </button>
            )}

            {loading && <span className="section-status-badge collection-loading-badge">Filtrage…</span>}
          </div>

          {advancedOpen && (
            <div className="collection-advanced-filters">
              <label className="collection-filter-field">
                <span className="sr-only">Artiste</span>
                <input
                  type="text"
                  className="field-input field-input-compact"
                  placeholder="Artiste"
                  value={filters.artist}
                  onChange={(event) => setFilters({ ...filters, artist: event.target.value })}
                />
              </label>

              <label className="collection-filter-field">
                <span className="sr-only">Genre</span>
                <input
                  type="text"
                  className="field-input field-input-compact"
                  list="collection-genres"
                  placeholder="Genre"
                  value={filters.genre}
                  onChange={(event) => setFilters({ ...filters, genre: event.target.value })}
                />
                <datalist id="collection-genres">
                  {facets.genres.map((genre) => (
                    <option key={genre} value={genre} />
                  ))}
                </datalist>
              </label>

              <label className="collection-filter-field">
                <span className="sr-only">Année minimum</span>
                <input
                  type="number"
                  className="field-input field-input-compact"
                  min={facets.yearMin ?? 1900}
                  max={facets.yearMax ?? 2100}
                  placeholder={facets.yearMin ? `Depuis ${facets.yearMin}` : 'Année min.'}
                  value={filters.yearFrom ?? ''}
                  onChange={(event) =>
                    setFilters({ ...filters, yearFrom: parseOptionalYear(event.target.value) })
                  }
                />
              </label>

              <label className="collection-filter-field">
                <span className="sr-only">Année maximum</span>
                <input
                  type="number"
                  className="field-input field-input-compact"
                  min={facets.yearMin ?? 1900}
                  max={facets.yearMax ?? 2100}
                  placeholder={facets.yearMax ? `Jusqu’à ${facets.yearMax}` : 'Année max.'}
                  value={filters.yearTo ?? ''}
                  onChange={(event) => setFilters({ ...filters, yearTo: parseOptionalYear(event.target.value) })}
                />
              </label>

              <label className="collection-filter-field">
                <span className="sr-only">Note minimale</span>
                <input
                  type="number"
                  className="field-input field-input-compact"
                  min={1}
                  max={5}
                  step={0.1}
                  placeholder="Note min."
                  value={filters.minRating ?? ''}
                  onChange={(event) =>
                    setFilters({ ...filters, minRating: parseOptionalRating(event.target.value) })
                  }
                />
              </label>

              <label className="collection-filter-field">
                <span className="sr-only">État des notes</span>
                <select
                  className="field-input field-input-compact"
                  value={filters.ratingStatus}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      ratingStatus: event.target.value as AlbumRatingStatus,
                    })
                  }
                >
                  {RATING_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {!advancedOpen && advancedActive && activeLabels.length > 0 && (
            <div className="collection-active-filters" aria-label="Filtres actifs">
              {activeLabels.map((label) => (
                <span key={label} className="collection-filter-chip">
                  {label}
                </span>
              ))}
            </div>
          )}

          <AlbumSearchResults
            config={config}
            albums={results}
            loading={loading}
            error={error}
            hasActiveFilters={filtersActive}
            viewMode={viewMode}
          />
        </section>
      )}
    </div>
  )
}
