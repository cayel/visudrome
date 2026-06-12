import { buildCoverArtUrl } from '../lib/navidrome'
import { buildNavidromeAlbumUrl } from '../lib/navidromeUrls'
import type { NavidromeConfig, RatedAlbum } from '../types/navidrome'
import { getRankingProgress } from '../lib/rankingProgress'
import { RankingRow } from './RankingRow'
import { RankingExpandButton } from './RankingExpandButton'
import { useRankingLimit } from '../hooks/useRankingLimit'

interface TopAlbumsRankingProps {
  config: NavidromeConfig
  albums: RatedAlbum[]
  loading: boolean
  error: string | null
}

function formatRating(value: number): string {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function RatingStars({ rating }: { rating: number }) {
  const filledStars = Math.round(rating)

  return (
    <div className="rating-stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={`rating-star${index < filledStars ? ' rating-star-full' : ''}`}>
          ★
        </span>
      ))}
    </div>
  )
}

function CoverPlaceholder() {
  return (
    <div className="ranking-cover ranking-cover-placeholder" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    </div>
  )
}

export function TopAlbumsRanking({ config, albums, loading, error }: TopAlbumsRankingProps) {
  const { visibleItems, expanded, hasMore, total, toggle } = useRankingLimit(albums)
  const maxRating = albums[0]?.averageRating ?? 0

  if (loading) {
    return (
      <div className="ranking-loading" aria-label="Chargement du classement">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="ranking-row skeleton ranking-row-skeleton" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="alert alert-error">{error}</p>
  }

  if (albums.length === 0) {
    return (
      <p className="ranking-empty">
        Aucun disque entièrement noté dans votre collection. Notez tous les titres d&apos;un album pour qu&apos;il
        apparaisse ici.
      </p>
    )
  }

  return (
    <>
      <ol className="ranking-list">
        {visibleItems.map((album, index) => (
          <RankingRow
            key={album.id}
            href={buildNavidromeAlbumUrl(config, album.id)}
            progress={getRankingProgress(album.averageRating, maxRating)}
          >
            <span className="ranking-position">{index + 1}</span>

            {album.coverArt ? (
              <img
                src={buildCoverArtUrl(config, album.coverArt, 120)}
                alt=""
                className="ranking-cover"
                loading="lazy"
              />
            ) : (
              <CoverPlaceholder />
            )}

            <div className="ranking-info">
              <p className="ranking-album" title={album.name}>
                {album.name}
              </p>
              <p className="ranking-artist" title={album.artist}>
                {album.artist}
              </p>
              <p className="ranking-tracks">
                {album.trackCount} {album.trackCount === 1 ? 'titre noté' : 'titres notés'}
              </p>
            </div>

            <div className="ranking-score">
              <p className="ranking-value metallic-text">{formatRating(album.averageRating)}</p>
              <RatingStars rating={album.averageRating} />
              <p className="ranking-max">/ 5</p>
            </div>
          </RankingRow>
        ))}
      </ol>
      <RankingExpandButton total={total} expanded={expanded} hasMore={hasMore} onToggle={toggle} />
    </>
  )
}
