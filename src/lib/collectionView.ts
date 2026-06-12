export type CollectionViewMode = 'list' | 'mosaic'

const STORAGE_KEY = 'visudrome-collection-view'

export function getStoredCollectionViewMode(): CollectionViewMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'mosaic' || value === 'list') return value
  } catch {
    return 'list'
  }
  return 'list'
}

export function saveCollectionViewMode(mode: CollectionViewMode): void {
  localStorage.setItem(STORAGE_KEY, mode)
}
