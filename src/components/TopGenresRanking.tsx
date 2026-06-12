import type { GenreCount, NavidromeConfig } from '../types/navidrome'
import { buildNavidromeGenreAlbumsUrl } from '../lib/navidromeUrls'
import { getRankingProgress } from '../lib/rankingProgress'
import { RankingRow } from './RankingRow'
import { RankingExpandButton } from './RankingExpandButton'
import { useRankingLimit } from '../hooks/useRankingLimit'

interface TopGenresRankingProps {
  config: NavidromeConfig
  genres: GenreCount[]
  loading: boolean
  error: string | null
}

export function TopGenresRanking({ config, genres, loading, error }: TopGenresRankingProps) {
  const { visibleItems, expanded, hasMore, total, toggle } = useRankingLimit(genres)
  const maxCount = genres[0]?.count ?? 0

  if (loading) {
    return (
      <div className="ranking-loading" aria-label="Chargement du classement">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="ranking-row artist-ranking-row skeleton ranking-row-skeleton" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="alert alert-error">{error}</p>
  }

  if (genres.length === 0) {
    return <p className="ranking-empty">Aucun genre renseigné dans votre collection.</p>
  }

  return (
    <>
      <ol className="ranking-list">
        {visibleItems.map((entry, index) => (
          <RankingRow
            key={entry.genre}
            className="artist-ranking-row"
            href={entry.genreId ? buildNavidromeGenreAlbumsUrl(config, entry.genreId) : undefined}
            progress={getRankingProgress(entry.count, maxCount)}
          >
            <span className="ranking-position">{index + 1}</span>

            <div className="ranking-info">
              <p className="ranking-album" title={entry.genre}>
                {entry.genre}
              </p>
            </div>

            <div className="ranking-score">
              <p className="ranking-value metallic-text">{entry.count.toLocaleString('fr-FR')}</p>
              <p className="ranking-max">{entry.count === 1 ? 'disque' : 'disques'}</p>
            </div>
          </RankingRow>
        ))}
      </ol>
      <RankingExpandButton total={total} expanded={expanded} hasMore={hasMore} onToggle={toggle} />
    </>
  )
}
