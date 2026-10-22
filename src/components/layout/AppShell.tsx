import { NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { label: 'Home', to: '/', icon: '⌂' },
  { label: 'Practice', to: '/practice/setup', icon: '✎' },
  { label: 'Statistics', to: '/statistics', icon: '★' },
  { label: 'Settings', to: '/settings', icon: '⚙' },
]

export function AppShell() {
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
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Keep trying, keep growing, and have fun with math!</p>
      </footer>
    </div>
  )
}
