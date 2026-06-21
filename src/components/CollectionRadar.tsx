import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { DecadeCount } from '../types/navidrome'
import type { DashboardData } from '../lib/dashboardTypes'
import { buildCollectionRadarInsights, buildCollectionRadarSearch } from '../lib/collectionRadar'

interface CollectionRadarProps {
  data: DashboardData | null | undefined
  decadeData: DecadeCount[]
  loading: boolean
  error: string | null | undefined
}

export function CollectionRadar({ data, decadeData, loading, error }: CollectionRadarProps) {
  const insights = useMemo(() => {
    if (!data || loading || error) return []
    return buildCollectionRadarInsights(data, decadeData)
  }, [data, decadeData, loading, error])

  if (!data || loading || error || insights.length === 0) return null

  return (
    <section className="dashboard-section" aria-labelledby="dashboard-section-radar">
      <header className="dashboard-section-header">
        <h3 id="dashboard-section-radar" className="dashboard-section-title">
          Radar collection
        </h3>
        <p className="dashboard-section-lead">
          Indices calculés localement — cliquez pour ouvrir la <strong>Collection</strong> avec filtres adaptés.
        </p>
      </header>

      <div className="radar-grid">
        {insights.map((insight) => (
          <Link
            key={insight.id}
            to={buildCollectionRadarSearch(insight.linkParams)}
            className="glass-panel radar-card"
          >
            <p className="radar-card-kind">{labelForKind(insight.kind)}</p>
            <h4 className="radar-card-title">{insight.title}</h4>
            <p className="radar-card-desc">{insight.description}</p>
            <span className="radar-card-cta">Ouvrir la collection →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function labelForKind(kind: string): string {
  switch (kind) {
    case 'decade-gap':
      return 'Temporal'
    case 'ratings-unchecked':
    case 'ratings-partial':
      return 'Notes'
    default:
      return 'Collection'
  }
}
