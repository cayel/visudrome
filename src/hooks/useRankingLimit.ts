import { useCallback, useState } from 'react'

export const RANKING_INITIAL_LIMIT = 10

export function useRankingLimit<T>(items: T[], limit = RANKING_INITIAL_LIMIT) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = items.length > limit
  const visibleItems = expanded ? items : items.slice(0, limit)

  const toggle = useCallback(() => {
    setExpanded((value) => !value)
  }, [])

  return {
    visibleItems,
    expanded,
    hasMore,
    total: items.length,
    toggle,
  }
}
