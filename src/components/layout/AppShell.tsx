import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import {
  initializeStorageWithReport,
  type StorageInitializationReport,
} from '../../services/storage'
import { Button } from '../ui/Button'
import { ErrorPanel } from '../ui/ErrorPanel'

const navigationItems = [
  { label: 'Home', to: '/', icon: '⌂' },
  { label: 'Practice', to: '/practice/setup', icon: '✎' },
  { label: 'Statistics', to: '/statistics', icon: '★' },
  { label: 'Settings', to: '/settings', icon: '⚙' },
]

interface AppShellProps {
  storageInitializationReport?: StorageInitializationReport
}

export function AppShell({ storageInitializationReport }: AppShellProps) {
  const location = useLocation()
  const previousPath = useRef(location.pathname)
  const [storageReport] = useState(
    () => storageInitializationReport ?? initializeStorageWithReport(),
  )
  const [showStorageNotice, setShowStorageNotice] = useState(
    () =>
      !storageReport.succeeded || storageReport.recoveredCategories.length > 0,
  )
  const routeName = location.pathname.startsWith('/practice/')
    ? 'Practice'
    : location.pathname === '/privacy'
      ? 'Privacy'
      : (navigationItems.find((item) => item.to === location.pathname)?.label ??
        'Math Practice')

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      document.getElementById('main-content')?.focus()
      previousPath.current = location.pathname
    }
  }, [location.pathname])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="site-header__inner">
          <NavLink className="brand" to="/" aria-label="Math Practice home">
            <span className="brand__mark" aria-hidden="true">
              2+2
            </span>
            <span className="brand__name">Math Practice</span>
          </NavLink>

          <nav className="main-nav" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `main-nav__link${isActive ? ' main-nav__link--active' : ''}`
                }
                end={item.to === '/'}
                key={item.to}
                to={item.to}
              >
                <span className="main-nav__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <p className="sr-only" aria-atomic="true" aria-live="polite">
          {routeName} page loaded.
        </p>
        {showStorageNotice && (
          <div className="app-notice">
            <ErrorPanel
              compact
              title={
                storageReport.succeeded
                  ? 'We repaired some saved data'
                  : 'Saved progress is unavailable'
              }
              message={
                storageReport.succeeded
                  ? 'Some saved data was damaged, so we safely reset only that part. Everything else is still here.'
                  : 'We could not safely read or update saved progress. You can keep practicing, but progress may not survive a refresh.'
              }
              actions={
                <Button
                  type="button"
                  variant="quiet"
                  onClick={() => setShowStorageNotice(false)}
                >
                  Dismiss
                </Button>
              }
            />
          </div>
        )}
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Keep trying, keep growing, and have fun with math!</p>
        <NavLink to="/privacy">Privacy</NavLink>
      </footer>
    </div>
  )
}
