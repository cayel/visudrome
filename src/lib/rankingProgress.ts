export function getRankingProgress(count: number, maxCount: number): number {
  if (maxCount <= 0) return 0
  return (count / maxCount) * 100
}
