import { getRatingSyncPercent, type RatingSyncProgress } from '../lib/sync/types'

interface RatingSyncProgressBarProps {
  progress: RatingSyncProgress
}

export function RatingSyncProgressBar({ progress }: RatingSyncProgressBarProps) {
  const percent = getRatingSyncPercent(progress)

  return (
    <div className="sync-progress" role="status" aria-live="polite">
      <div className="sync-progress-track" aria-hidden="true">
        <div className="sync-progress-bar" style={{ width: `${percent}%` }} />
      </div>
      <p className="sync-progress-label">
        Analyse des notes : {progress.completed.toLocaleString('fr-FR')} /{' '}
        {progress.total.toLocaleString('fr-FR')} albums ({percent}&nbsp;%)
      </p>
    </div>
  )
}
