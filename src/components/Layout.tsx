import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useNavidrome } from '../context/NavidromeContext'

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <circle className="brand-mark-ring" cx="24" cy="24" r="18" strokeWidth="1.5" />
        <circle className="brand-mark-core" cx="24" cy="24" r="6" />
        <circle className="brand-mark-center" cx="24" cy="24" r="2" />
      </svg>
    </div>
  )
}

function NavIcon({ name }: { name: 'dashboard' | 'collection' | 'settings' }) {
  if (name === 'dashboard') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    )
  }

  if (name === 'collection') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.25" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 1.5v1.25M8 13.25V14.5M1.5 8h1.25M13.25 8H14.5M3.4 3.4l.88.88M11.72 11.72l.88.88M3.4 12.6l.88-.88M11.72 4.28l.88-.88"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Layout() {
  const { isConfigured } = useNavidrome()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <BrandMark />
            <div>
              <h1 className="brand-name metallic-text">Visudrome</h1>
              <p className="brand-tagline">Collection Navidrome</p>
            </div>
          </div>

          <div className="header-actions">
            <ThemeToggle />
            {isConfigured && (
              <nav className="app-nav" aria-label="Navigation principale">
                <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <NavIcon name="dashboard" />
                  Dashboard
                </NavLink>
                <NavLink to="/collection" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <NavIcon name="collection" />
                  Collection
                </NavLink>
                <NavLink to="/parametres" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <NavIcon name="settings" />
                  Paramètres
                </NavLink>
              </nav>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
