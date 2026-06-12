import { lazy, Suspense, useState } from 'react'
import type { DecadeCount, YearCount } from '../types/navidrome'

const AlbumsByYearChart = lazy(async () => {
  const module = await import('./AlbumsByYearChart')
  return { default: module.AlbumsByYearChart }
})

const AlbumsByDecadeChart = lazy(async () => {
  const module = await import('./AlbumsByDecadeChart')
  return { default: module.AlbumsByDecadeChart }
})

type TemporalView = 'year' | 'decade'

interface TemporalDistributionChartProps {
  yearData: YearCount[]
  decadeData: DecadeCount[]
  loading: boolean
  error: string | null
}

const VIEW_LABELS: Record<TemporalView, { title: string; subtitle: string; toggle: string }> = {
  year: {
    title: 'Disques par année de sortie',
    subtitle: "Répartition selon l'année originale de sortie de chaque album.",
    toggle: 'Par année',
  },
  decade: {
    title: 'Disques par décennie',
    subtitle: "Répartition par tranche de dix ans selon l'année originale de sortie de chaque album.",
    toggle: 'Par décennie',
  },
}

function ChartModuleFallback() {
  return <div className="skeleton chart-skeleton" aria-label="Chargement du graphique" />
}

export function TemporalDistributionChart({
  yearData,
  decadeData,
  loading,
  error,
}: TemporalDistributionChartProps) {
  const [view, setView] = useState<TemporalView>('year')
  const labels = VIEW_LABELS[view]

  return (
    <article className="glass-panel chart-card">
      <div className="chart-card-toolbar">
        <div className="chart-card-heading">
          <h4 className="info-card-title">{labels.title}</h4>
          <p className="chart-subtitle">{labels.subtitle}</p>
        </div>

        <div className="chart-toggle" role="tablist" aria-label="Granularité du graphique">
          {(['year', 'decade'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={view === option}
              className={`chart-toggle-btn${view === option ? ' active' : ''}`}
              onClick={() => setView(option)}
            >
              {VIEW_LABELS[option].toggle}
            </button>
          ))}
        </div>
      </div>

      <Suspense fallback={<ChartModuleFallback />}>
        {view === 'year' ? (
          <AlbumsByYearChart data={yearData} loading={loading} error={error} />
        ) : (
          <AlbumsByDecadeChart data={decadeData} loading={loading} error={error} />
        )}
      </Suspense>
    </article>
  )
}
