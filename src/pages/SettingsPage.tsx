import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PwaInstallCard } from '../components/PwaInstallCard'
import { useNavidrome } from '../context/NavidromeContext'
import { getConnectionPreflightError } from '../lib/connectionDiagnostics'
import { testConnection } from '../lib/navidrome'
import { hasStoredProfile, loadStoredProfile } from '../lib/storage'
import type { NavidromeConfig } from '../types/navidrome'

export function SettingsPage() {
  const navigate = useNavigate()
  const { config, saveConfig, disconnect } = useNavidrome()
  const savedProfile = loadStoredProfile()

  const [serverUrl, setServerUrl] = useState(config?.serverUrl ?? savedProfile?.serverUrl ?? '')
  const [username, setUsername] = useState(config?.username ?? savedProfile?.username ?? '')
  const [password, setPassword] = useState(config?.password ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const sessionExpired = !config && hasStoredProfile()
  const urlWarning = useMemo(() => getConnectionPreflightError(serverUrl), [serverUrl])
  const pageIsSecure = window.location.protocol === 'https:'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const nextConfig: NavidromeConfig = {
      serverUrl: serverUrl.trim().replace(/\/+$/, ''),
      username: username.trim(),
      password,
    }

    try {
      await testConnection(nextConfig)
      saveConfig(nextConfig)
      setSuccess('Connexion établie avec succès.')
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible')
    } finally {
      setLoading(false)
    }
  }

  function handleDisconnect() {
    disconnect()
    setServerUrl('')
    setUsername('')
    setPassword('')
    setSuccess(null)
    setError(null)
  }

  return (
    <div className="settings-layout page-enter">
      <header className="settings-intro page-header">
        <h2 className="page-title metallic-text">Paramètres</h2>
        <p className="page-subtitle">
          Connectez Visudrome à votre instance Navidrome pour explorer votre collection musicale.
          Le mot de passe reste dans la session du navigateur et n&apos;apparaît plus dans les URLs
          d&apos;appels API.
        </p>
      </header>

      {sessionExpired && (
        <p className="alert alert-info settings-session-alert">
          Session expirée — saisissez votre mot de passe pour vous reconnecter.
        </p>
      )}

      <p className="alert alert-info settings-cors-alert">
        Visudrome ({window.location.origin}) appelle <strong>directement</strong> votre Navidrome depuis votre
        navigateur — jamais via nos serveurs.
        {pageIsSecure && (
          <>
            {' '}
            En production HTTPS, Navidrome doit aussi être accessible en <strong>https://</strong> (contenu mixte
            sinon).
          </>
        )}
      </p>

      {urlWarning && <p className="alert alert-error settings-url-alert">{urlWarning}</p>}

      <form onSubmit={handleSubmit} className="glass-panel form-panel">
        <div className="form-stack">
          <label>
            <span className="field-label">URL du serveur</span>
            <input
              type="url"
              required
              placeholder="https://navidrome.example.com"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="field-input"
            />
          </label>

          <label>
            <span className="field-label">Nom d&apos;utilisateur</span>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field-input"
            />
          </label>

          <label>
            <span className="field-label">Mot de passe</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
            />
          </label>
        </div>

        {error && <p className="alert alert-error">{error}</p>}
        {success && <p className="alert alert-success">{success}</p>}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Connexion…' : 'Enregistrer et connecter'}
          </button>

          {config && (
            <button type="button" onClick={handleDisconnect} className="btn-ghost">
              Déconnecter
            </button>
          )}

          {sessionExpired && (
            <button type="button" onClick={handleDisconnect} className="btn-ghost">
              Oublier ce serveur
            </button>
          )}
        </div>
      </form>

      <PwaInstallCard />
    </div>
  )
}
