import { buildCoverArtUrl } from '../lib/navidrome'
import { buildNavidromeAlbumUrl } from '../lib/navidromeUrls'
import type { CollectionViewMode } from '../lib/collectionView'
import type { AlbumSearchResult } from '../lib/db/search'
import type { NavidromeConfig } from '../types/navidrome'

interface AlbumSearchResultsProps {
  config: NavidromeConfig
  albums: AlbumSearchResult[]
  loading: boolean
  error: string | null
  hasActiveFilters: boolean
  viewMode: CollectionViewMode
}

function CoverPlaceholder({ className = 'ranking-cover' }: { className?: string }) {
  return (
    <div className={`${className} ranking-cover-placeholder`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    </div>
  )
}

function formatRating(value: number): string {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function formatGenres(genres: string[]): string {
  if (genres.length === 0) return 'Genre inconnu'
  return genres.join(', ')
}

function AlbumCover({
  config,
  album,
  size,
  className,
}: {
  config: NavidromeConfig
  album: AlbumSearchResult
  size: number
  className: string
}) {
  if (album.coverArt) {
    return (
      <img
        src={buildCoverArtUrl(config, album.coverArt, size)}
        alt=""
        className={className}
        loading="lazy"
      />
    )
  }

  return <CoverPlaceholder className={className} />
}

function CollectionListView({ config, albums }: { config: NavidromeConfig; albums: AlbumSearchResult[] }) {
  return (
    <ol className="collection-list">
      {albums.map((album) => (
        <li key={album.id} className="collection-item">
          <a
            href={buildNavidromeAlbumUrl(config, album.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="collection-row collection-row-interactive"
          >
            <AlbumCover config={config} album={album} size={120} className="ranking-cover" />

            <div className="collection-info">
              <p className="ranking-album" title={album.name}>
                {album.name}
              </p>
              <p className="ranking-artist" title={album.artist}>
                {album.artist}
              </p>
              <p className="collection-meta">
                {album.year ? `${album.year} · ` : ''}
                {formatGenres(album.genres)}
              </p>
            </div>

            <div className="collection-badge">
              {album.fullyRated && album.averageRating !== undefined ? (
                <>
                  <p className="collection-rating metallic-text">{formatRating(album.averageRating)}</p>
                  <p className="collection-rating-label">/ 5 · {album.trackCount ?? 0} titres</p>
                </>
              ) : album.ratingCheckedAt ? (
                <p className="collection-rating-label">Notes incomplètes</p>
              ) : (
                <p className="collection-rating-label">Non analysé</p>
              )}
            </div>
          </a>
        </li>
      ))}
    </ol>
  )
}

function CollectionMosaicView({ config, albums }: { config: NavidromeConfig; albums: AlbumSearchResult[] }) {
  return (
    <ol className="collection-mosaic">
      {albums.map((album) => (
        <li key={album.id} className="collection-mosaic-item">
          <a
            href={buildNavidromeAlbumUrl(config, album.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="collection-mosaic-card"
            title={`${album.name} — ${album.artist}`}
          >
            <div className="collection-mosaic-cover-wrap">
              <AlbumCover config={config} album={album} size={280} className="collection-mosaic-cover" />
              {album.fullyRated && album.averageRating !== undefined && (
                <span className="collection-mosaic-rating">{formatRating(album.averageRating)}</span>
              )}
            </div>
            <div className="collection-mosaic-info">
              <p className="collection-mosaic-title">{album.name}</p>
              <p className="collection-mosaic-artist">{album.artist}</p>
            </div>
          </a>
        </li>
      ))}
    </ol>
  )
}

export function AlbumSearchResults({
  config,
  albums,
  loading,
  error,
  hasActiveFilters,
  viewMode,
}: AlbumSearchResultsProps) {
  if (loading && albums.length === 0) {
    if (viewMode === 'mosaic') {
      return (
        <div className="collection-mosaic collection-mosaic-loading" aria-label="Chargement des résultats">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="collection-mosaic-skeleton skeleton" />
          ))}
        </div>
      )
    }

    return (
      <div className="collection-loading" aria-label="Chargement des résultats">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="collection-row skeleton collection-row-skeleton" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="alert alert-error">{error}</p>
  }

  if (albums.length === 0) {
    return (
      <p className="collection-empty">
        {hasActiveFilters
          ? 'Aucun disque ne correspond à ces filtres.'
          : 'Aucun album dans la collection locale.'}
      </p>
    )
  }

  if (viewMode === 'mosaic') {
    return <CollectionMosaicView config={config} albums={albums} />
  }

  return <CollectionListView config={config} albums={albums} />
}
