import type { NavidromeConfig } from '../types/navidrome'

export const SYNC_TTL_MS = 6 * 60 * 60 * 1000

export function buildConfigKey(config: NavidromeConfig): string {
  const serverUrl = config.serverUrl.trim().replace(/\/+$/, '')
  return `${serverUrl}|${config.username}`
}

export function isCacheFresh(cachedAt: number, now = Date.now()): boolean {
  return now - cachedAt < SYNC_TTL_MS
}

export function formatCacheAge(cachedAt: number, now = Date.now()): string {
  const diffMs = Math.max(0, now - cachedAt)
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`

  const days = Math.floor(hours / 24)
  return `il y a ${days} j`
}
