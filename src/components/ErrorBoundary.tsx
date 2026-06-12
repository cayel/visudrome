import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Visudrome:', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary page-enter">
          <div className="glass-panel error-boundary-panel">
            <h2 className="page-title metallic-text">Une erreur est survenue</h2>
            <p className="page-subtitle">
              Visudrome a rencontré un problème inattendu. Rechargez la page ou revenez aux paramètres.
            </p>
            <div className="form-actions error-boundary-actions">
              <button type="button" className="btn-primary" onClick={this.handleReload}>
                Recharger
              </button>
              <a href="/parametres" className="btn-ghost">
                Paramètres
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
