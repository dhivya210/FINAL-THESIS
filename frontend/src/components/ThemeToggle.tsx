import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { Button } from './ui/Button'
import { useTheme } from '../context/ThemeContext'

export const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full border border-slate-200/40 bg-white/50 dark:border-slate-700/60 dark:bg-slate-900/70"
    >
      {mode === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
    </Button>
  )
}
