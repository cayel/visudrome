import { normalizeServerUrl } from './urlUtils'

export function getConnectionPreflightError(serverUrl: string): string | null {
  const trimmed = serverUrl.trim()
  if (!trimmed || typeof window === 'undefined') return null

  const normalized = normalizeServerUrl(trimmed)
  const pageIsSecure = window.location.protocol === 'https:'
  const serverIsHttp = normalized.startsWith('http://')
  const hasExplicitScheme = /^https?:\/\//i.test(trimmed)

  if (pageIsSecure && serverIsHttp) {
    return (
      'Visudrome est en HTTPS mais votre Navidrome est en HTTP. ' +
      'Le navigateur bloque cette connexion (contenu mixte). ' +
      'Exposez Navidrome en HTTPS (reverse proxy + certificat) ou hébergez Visudrome en local.'
    )
  }

  if (pageIsSecure && !hasExplicitScheme) {
    return (
      'Sans http:// ou https://, l’URL est convertie en HTTPS. ' +
      'Si Navidrome n’est accessible qu’en HTTP, la connexion échouera depuis ce site sécurisé.'
    )
  }

  return null
}

export function buildConnectionFailureMessage(serverUrl: string): string {
  const preflight = getConnectionPreflightError(serverUrl)
  if (preflight) return preflight

  const origin = typeof window !== 'undefined' ? window.location.origin : 'Visudrome'

  return (
    'Impossible de joindre Navidrome depuis ce navigateur. Vérifiez l’URL, ' +
    'l’accessibilité du serveur (réseau local, VPN ou domaine public), ' +
    'que Navidrome est bien en HTTPS si Visudrome est en HTTPS, ' +
    `et les en-têtes CORS côté reverse proxy pour l’origine ${origin}.`
  )
}
