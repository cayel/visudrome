export interface RatingSyncProgress {
  completed: number
  total: number
}

export function getRatingSyncPercent(progress: RatingSyncProgress): number {
  if (progress.total <= 0) return 0
  return Math.min(100, Math.round((progress.completed / progress.total) * 100))
}
