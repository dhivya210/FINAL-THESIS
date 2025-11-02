import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { LoginDialog } from '../components/auth/LoginDialog'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Questionnaire', to: '/questionnaire' },
  { label: 'Results', to: '/results' },
  { label: 'Comparison', to: '/comparison' },
  { label: 'Report', to: '/report' }
]

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, logout, loading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="sticky top-0 z-40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <NavLink to="/" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            QA Decision Support
          </NavLink>
          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-600 dark:text-primary-200'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
                  {user?.name}
                </span>
                <Button variant="ghost" size="sm" onClick={logout} disabled={loading}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setLoginOpen(true)}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:py-16">{children}</main>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
