import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { NavidromeConfig } from '../types/navidrome'
import { clearLocalDatabase } from '../lib/db'
import { loadConfig, saveConfig as persistConfig, clearConfig as removeConfig } from '../lib/storage'

interface NavidromeContextValue {
  config: NavidromeConfig | null
  isConfigured: boolean
  saveConfig: (config: NavidromeConfig) => void
  disconnect: () => void
}

const NavidromeContext = createContext<NavidromeContextValue | null>(null)

export function NavidromeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<NavidromeConfig | null>(() => loadConfig())

  const saveConfig = useCallback((next: NavidromeConfig) => {
    persistConfig(next)
    setConfig(next)
  }, [])

  const disconnect = useCallback(() => {
    removeConfig()
    void clearLocalDatabase()
    setConfig(null)
  }, [])

  const value = useMemo(
    () => ({
      config,
      isConfigured: config !== null,
      saveConfig,
      disconnect,
    }),
    [config, saveConfig, disconnect],
  )

  return <NavidromeContext.Provider value={value}>{children}</NavidromeContext.Provider>
}

export function useNavidrome() {
  const context = useContext(NavidromeContext)
  if (!context) {
    throw new Error('useNavidrome doit être utilisé dans NavidromeProvider')
  }
  return context
}
