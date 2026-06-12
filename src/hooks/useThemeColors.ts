import { useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'

export interface ThemeColors {
  bar: string
  grid: string
  tick: string
  cursor: string
}

function readThemeColors(): ThemeColors {
  const styles = getComputedStyle(document.documentElement)

  return {
    bar: styles.getPropertyValue('--chart-bar').trim() || '#4f6cb0',
    grid: styles.getPropertyValue('--chart-grid').trim() || '#d8dfef',
    tick: styles.getPropertyValue('--chart-tick').trim() || '#6b7898',
    cursor: styles.getPropertyValue('--chart-cursor').trim() || '#d8dfef',
  }
}

export function useThemeColors(): ThemeColors {
  const { theme } = useTheme()

  return useMemo(() => {
    void theme
    return readThemeColors()
  }, [theme])
}
