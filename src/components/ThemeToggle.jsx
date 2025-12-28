import { useTheme } from '../hooks/useTheme.js'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      className="theme-toggle"
      id="theme-toggle"
      aria-label="Toggle theme"
      onClick={toggle}
    >
      {theme === 'dark' ? '\u2600' : '\u263D'}
    </button>
  )
}
