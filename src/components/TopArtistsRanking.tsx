import type { ArtistCount, NavidromeConfig } from '../types/navidrome'
import { buildNavidromeArtistUrl } from '../lib/navidromeUrls'
import { getRankingProgress } from '../lib/rankingProgress'
import { RankingRow } from './RankingRow'
import { RankingExpandButton } from './RankingExpandButton'
import { useRankingLimit } from '../hooks/useRankingLimit'

interface TopArtistsRankingProps {
  config: NavidromeConfig
  artists: ArtistCount[]
  loading: boolean
  error: string | null
}

export function TopArtistsRanking({ config, artists, loading, error }: TopArtistsRankingProps) {
  const { visibleItems, expanded, hasMore, total, toggle } = useRankingLimit(artists)
  const maxCount = artists[0]?.count ?? 0

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

  if (artists.length === 0) {
    return <p className="ranking-empty">Aucun artiste trouvé dans votre collection.</p>
  }

  return (
    <>
      <ol className="ranking-list">
        {visibleItems.map((entry, index) => (
          <RankingRow
            key={entry.artist}
            className="artist-ranking-row"
            href={entry.artistId ? buildNavidromeArtistUrl(config, entry.artistId) : undefined}
            progress={getRankingProgress(entry.count, maxCount)}
          >
            <span className="ranking-position">{index + 1}</span>

            <div className="ranking-info">
              <p className="ranking-album" title={entry.artist}>
                {entry.artist}
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
