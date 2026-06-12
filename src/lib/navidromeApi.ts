import type { NavidromeConfig } from '../types/navidrome'
import { buildConnectionFailureMessage, getConnectionPreflightError } from './connectionDiagnostics'
import { normalizeServerUrl } from './urlUtils'

async function loginNavidrome(config: NavidromeConfig): Promise<string> {
  const preflightError = getConnectionPreflightError(config.serverUrl)
  if (preflightError) {
    throw new Error(preflightError)
  }

  const base = normalizeServerUrl(config.serverUrl)
  let response: Response

  try {
    response = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: config.username,
        password: config.password,
      }),
    })
  } catch {
    throw new Error(buildConnectionFailureMessage(config.serverUrl))
  }

  if (!response.ok) {
    throw new Error('Authentification Navidrome refusée')
  }

  const payload = (await response.json()) as { token?: string }
  if (!payload.token) {
    throw new Error('Jeton Navidrome manquant')
  }

  return payload.token
}

export async function fetchGenreIdByName(config: NavidromeConfig): Promise<Map<string, string>> {
  const base = normalizeServerUrl(config.serverUrl)
  const token = await loginNavidrome(config)

  let response: Response
  try {
    response = await fetch(`${base}/api/genre?sort=name&order=ASC&range=[0,4999]`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
  } catch {
    throw new Error('Impossible de charger les genres Navidrome')
  }

  if (!response.ok) {
    throw new Error('Impossible de charger les genres Navidrome')
  }

  const genres = (await response.json()) as Array<{ id?: string; name?: string }>
  const map = new Map<string, string>()

  for (const genre of genres) {
    if (genre.id && genre.name) {
      map.set(genre.name, genre.id)
    }
  }

  return map
}
