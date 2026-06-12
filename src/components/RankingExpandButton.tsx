interface RankingExpandButtonProps {
  total: number
  expanded: boolean
  hasMore: boolean
  onToggle: () => void
}

export function RankingExpandButton({ total, expanded, hasMore, onToggle }: RankingExpandButtonProps) {
  if (!hasMore) return null

  return (
    <div className="ranking-expand">
      <button type="button" className="ranking-expand-btn" onClick={onToggle}>
        {expanded ? 'Réduire' : `Voir tout (${total})`}
      </button>
    </div>
  )
}
