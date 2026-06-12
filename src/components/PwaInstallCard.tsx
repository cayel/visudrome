import { useEffect, useState } from 'react'
import { canUseNativeInstallPrompt, isIosDevice, isStandalonePwa } from '../lib/pwaInstall'

export function PwaInstallCard() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalonePwa)
  const [installing, setInstalling] = useState(false)
  const isSecure = window.isSecureContext
  const isIos = isIosDevice()
  const lanOrigin = window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.endsWith('.local')

  useEffect(() => {
    function onInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    return () => {
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) return

    setInstalling(true)
    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setInstalled(true)
      }
      setInstallPrompt(null)
    } finally {
      setInstalling(false)
    }
  }

  if (installed) {
    return (
      <section className="glass-panel pwa-install-card" aria-labelledby="pwa-install-title">
        <h3 id="pwa-install-title" className="pwa-install-title">
          Application installée
        </h3>
        <p className="pwa-install-text">
          Visudrome est lancé en mode application. Vos données restent dans ce navigateur.
        </p>
      </section>
    )
  }

  return (
    <section className="glass-panel pwa-install-card" aria-labelledby="pwa-install-title">
      <h3 id="pwa-install-title" className="pwa-install-title">
        Installer sur l&apos;écran d&apos;accueil
      </h3>
      <p className="pwa-install-text">
        Ajoutez Visudrome comme une application sur votre téléphone ou tablette, sans passer par le
        navigateur à chaque fois.
      </p>

      {installPrompt && canUseNativeInstallPrompt() && (
        <button type="button" className="btn-primary pwa-install-action" onClick={handleInstall} disabled={installing}>
          {installing ? 'Installation…' : 'Installer Visudrome'}
        </button>
      )}

      {isIos && (
        <ol className="pwa-install-steps">
          <li>Ouvrez Visudrome dans <strong>Safari</strong>.</li>
          <li>Appuyez sur <strong>Partager</strong> (icône carré + flèche).</li>
          <li>Choisissez <strong>Sur l&apos;écran d&apos;accueil</strong>, puis <strong>Ajouter</strong>.</li>
        </ol>
      )}

      {!isSecure && lanOrigin && (
        <p className="alert alert-info pwa-install-note">
          Sur le réseau local en HTTP, l&apos;installation avancée (hors ligne) nécessite Visudrome en{' '}
          <strong>HTTPS</strong> sur votre NAS ou routeur. En attendant, l&apos;ajout à l&apos;écran
          d&apos;accueil iOS fonctionne ; sur Android, utilisez le menu du navigateur →{' '}
          <strong>Installer l&apos;application</strong> ou <strong>Ajouter à l&apos;écran d&apos;accueil</strong>.
        </p>
      )}

      {!isSecure && !lanOrigin && (
        <p className="alert alert-info pwa-install-note">
          L&apos;installation complète nécessite une connexion sécurisée (HTTPS ou localhost).
        </p>
      )}

      <details className="pwa-install-details">
        <summary>Servir Visudrome sur votre réseau</summary>
        <div className="pwa-install-details-body">
          <p>Après un build, lancez sur votre machine ou NAS :</p>
          <pre className="pwa-install-code">npm run start:lan</pre>
          <p>
            Ouvrez ensuite <code>{window.location.protocol}//&lt;ip-de-votre-serveur&gt;:5174</code> depuis
            votre téléphone (même Wi‑Fi). Pour une PWA complète avec cache, exposez le site en HTTPS (Caddy,
            nginx + certificat).
          </p>
        </div>
      </details>
    </section>
  )
}
