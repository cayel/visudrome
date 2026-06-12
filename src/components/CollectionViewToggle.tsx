import type { CollectionViewMode } from '../lib/collectionView'

interface CollectionViewToggleProps {
  value: CollectionViewMode
  onChange: (mode: CollectionViewMode) => void
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function MosaicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function CollectionViewToggle({ value, onChange }: CollectionViewToggleProps) {
  return (
    <div className="collection-view-toggle" role="group" aria-label="Mode d’affichage">
      <button
        type="button"
        className={`collection-view-btn${value === 'list' ? ' active' : ''}`}
        aria-pressed={value === 'list'}
        aria-label="Vue liste"
        onClick={() => onChange('list')}
      >
        <ListIcon />
      </button>
      <button
        type="button"
        className={`collection-view-btn${value === 'mosaic' ? ' active' : ''}`}
        aria-pressed={value === 'mosaic'}
        aria-label="Vue mosaïque"
        onClick={() => onChange('mosaic')}
      >
        <MosaicIcon />
      </button>
    </div>
  )
}
