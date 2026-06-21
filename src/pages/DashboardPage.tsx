import { useMemo } from 'react'
import { TemporalDistributionChart } from '../components/TemporalDistributionChart'
import { TopArtistsRanking } from '../components/TopArtistsRanking'
import { TopGenresRanking } from '../components/TopGenresRanking'
import { TopAlbumsRanking } from '../components/TopAlbumsRanking'
import { RatingSyncProgressBar } from '../components/RatingSyncProgressBar'
import { CollectionRadar } from '../components/CollectionRadar'
import { useNavidrome } from '../context/NavidromeContext'
import { aggregateByDecade, getDominantYears } from '../lib/decades'
import { useDashboardData } from '../hooks/useDashboardData'
import { useTopRatedAlbums } from '../hooks/useTopRatedAlbums'

function VinylIcon() {
  return (
    <svg className="vinyl-icon" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle className="vinyl-outer" cx="36" cy="36" r="34" strokeWidth="1.5" />
      <circle className="vinyl-groove" cx="36" cy="36" r="28" strokeWidth="0.75" />
      <circle className="vinyl-groove" cx="36" cy="36" r="22" strokeWidth="0.75" />
      <circle className="vinyl-groove" cx="36" cy="36" r="16" strokeWidth="0.75" />
      <circle className="vinyl-label" cx="36" cy="36" r="10" />
      <circle className="vinyl-center" cx="36" cy="36" r="3" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="vinyl-icon" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <rect className="vinyl-outer" x="14" y="18" width="44" height="40" rx="6" strokeWidth="1.5" />
      <path className="vinyl-groove" d="M14 30h44" strokeWidth="1.5" />
      <path className="vinyl-groove" d="M26 14v8M46 14v8" strokeWidth="1.5" strokeLinecap="round" />
      <circle className="vinyl-label" cx="36" cy="44" r="8" />
    </svg>
  )
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`refresh-icon${spinning ? ' refresh-icon-spinning' : ''}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5V6H10"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DashboardPage() {
  const { config } = useNavidrome()
  const { data, loading, refreshing, error, cacheLabel, refresh, refreshToken } = useDashboardData(config)
  const {
    albums: topAlbums,
    loading: topAlbumsLoading,
    refreshing: topAlbumsRefreshing,
    syncingRatings,
    ratingProgress,
    error: topAlbumsError,
  } = useTopRatedAlbums(config, refreshToken)

  const dominantYears = useMemo(() => getDominantYears(data?.yearData ?? []), [data?.yearData])
  const decadeData = useMemo(() => aggregateByDecade(data?.yearData ?? []), [data?.yearData])
  const isInitialLoading = loading && !data
  const sectionError = data ? null : error
  const isTopAlbumsInitialLoading = topAlbumsLoading && topAlbums.length === 0 && !ratingProgress
  const isRefreshing = refreshing || topAlbumsRefreshing || syncingRatings

  const hostname = config
    ? (() => {
        try {
          const normalized = /^https?:\/\//i.test(config.serverUrl)
            ? config.serverUrl
            : `https://${config.serverUrl}`
          return new URL(normalized).hostname
        } catch {
          return config.serverUrl
        }
      })()
    : ''

  return (
    <div className="page-enter">
      <header className="page-header dashboard-header">
        <div>
          <p className="page-intro">
            Vue d&apos;ensemble de votre collection sur <strong>{hostname}</strong>
          </p>
        </div>

        <div className="dashboard-toolbar">
          {cacheLabel && (
            <p className="cache-badge">
              {isRefreshing ? 'Actualisation…' : `Données ${cacheLabel}`}
            </p>
          )}
          <button
            type="button"
            className="btn-ghost dashboard-refresh"
            onClick={refresh}
            disabled={isRefreshing || isInitialLoading}
          >
            <RefreshIcon spinning={isRefreshing} />
            Actualiser
          </button>
        </div>
      </header>

      {error && data && <p className="alert alert-error dashboard-cache-alert">{error}</p>}

      <div className="dashboard-grid">
        <article className="glass-panel stat-card">
          <div className="stat-card-header">
            <p className="stat-label">Collection</p>
            <VinylIcon />
          </div>

          {isInitialLoading ? (
            <div className="stat-card-body stat-loading" aria-label="Chargement">
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-caption" />
            </div>
          ) : sectionError ? (
            <div className="stat-card-body">
              <p className="alert alert-error">{sectionError}</p>
            </div>
          ) : (
            <div className="stat-card-body">
              <p className="stat-value metallic-text">{data?.albumCount.toLocaleString('fr-FR')}</p>
              <p className="stat-caption">
                {data?.albumCount === 1 ? 'disque dans votre collection' : 'disques dans votre collection'}
              </p>
            </div>
          )}
        </article>

        <article className="glass-panel stat-card">
          <div className="stat-card-header">
            <p className="stat-label">Année la plus représentée</p>
            <CalendarIcon />
          </div>

          {isInitialLoading ? (
            <div className="stat-card-body stat-loading" aria-label="Chargement">
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-caption" />
            </div>
          ) : sectionError ? (
            <div className="stat-card-body">
              <p className="alert alert-error">{sectionError}</p>
            </div>
          ) : dominantYears ? (
            <div className="stat-card-body">
              <div className="stat-value-group">
                <p className="stat-value metallic-text">
                  {dominantYears.featuredYear.toLocaleString('fr-FR')}
                </p>
                {dominantYears.otherYears.length > 0 && (
                  <p className="stat-value-secondary">
                    {dominantYears.otherYears.map((year) => year.toLocaleString('fr-FR')).join(' · ')}
                  </p>
                )}
              </div>
              <p className="stat-caption">
                {dominantYears.count}{' '}
                {dominantYears.count === 1 ? 'disque dans la collection' : 'disques dans la collection'}
              </p>
            </div>
          ) : (
            <div className="stat-card-body">
              <p className="stat-caption">Aucune année de sortie renseignée dans votre collection.</p>
            </div>
          )}
        </article>
      </div>

      <CollectionRadar data={data ?? undefined} decadeData={decadeData} loading={isInitialLoading} error={sectionError} />

      {config && (
        <section className="dashboard-section dashboard-section-top-albums" aria-labelledby="dashboard-section-top-albums">
          <article className="glass-panel chart-card chart-card-standalone">
            <div className="chart-card-toolbar">
              <div className="chart-card-heading">
                <h4 id="dashboard-section-top-albums" className="info-card-title">
                  Meilleurs disques
                </h4>
                <p className="chart-subtitle">
                  Classement par moyenne des notes de chaque titre. Seuls les disques dont tous les titres sont notés
                  sont inclus.
                </p>
              </div>
              {topAlbumsRefreshing && !ratingProgress && (
                <p className="section-status-badge" aria-live="polite">
                  Actualisation…
                </p>
              )}
            </div>

            {ratingProgress && <RatingSyncProgressBar progress={ratingProgress} />}

            {topAlbumsError && topAlbums.length > 0 && (
              <p className="alert alert-error section-inline-alert">{topAlbumsError}</p>
            )}

            <TopAlbumsRanking
              config={config}
              albums={topAlbums}
              loading={isTopAlbumsInitialLoading}
              error={topAlbums.length > 0 ? null : topAlbumsError}
            />
          </article>
        </section>
      )}

      <section className="dashboard-section" aria-labelledby="dashboard-section-temporal">
        <header className="dashboard-section-header">
          <h3 id="dashboard-section-temporal" className="dashboard-section-title">
            Répartition temporelle
          </h3>
        </header>

        <div className="dashboard-charts-grid">
          <TemporalDistributionChart
            yearData={data?.yearData ?? []}
            decadeData={decadeData}
            loading={isInitialLoading}
            error={sectionError}
          />
        </div>
      </section>

      <section className="dashboard-section" aria-labelledby="dashboard-section-rankings">
        <header className="dashboard-section-header">
          <h3 id="dashboard-section-rankings" className="dashboard-section-title">
            Classements
          </h3>
        </header>

        <div className="dashboard-rankings-grid">
          <article className="glass-panel chart-card">
            <h4 className="info-card-title">Top artistes</h4>
            <p className="chart-subtitle">Artistes avec le plus de disques dans votre collection.</p>
            <TopArtistsRanking
              config={config!}
              artists={data?.topArtists ?? []}
              loading={isInitialLoading}
              error={sectionError}
            />
          </article>

          <article className="glass-panel chart-card">
            <h4 className="info-card-title">Top genres</h4>
            <p className="chart-subtitle">Genres avec le plus de disques dans votre collection.</p>
            <TopGenresRanking
              config={config!}
              genres={data?.topGenres ?? []}
              loading={isInitialLoading}
              error={sectionError}
            />
          </article>
        </div>
      </section>
    </div>
  )
}
