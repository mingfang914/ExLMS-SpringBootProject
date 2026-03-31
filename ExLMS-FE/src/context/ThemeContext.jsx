import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

const ThemeCtx = createContext({
  mode: 'dark',
  toggleMode: () => {},
  isDark: true,
})

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('exlms-theme') || 'dark' }
    catch { return 'dark' }
  })

  // Apply data-theme attribute to <html> whenever mode changes
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', mode)
    localStorage.setItem('exlms-theme', mode)
    // Also set a class for legacy-style CSS hooks
    if (mode === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [mode])

  const toggleMode = () => setMode(m => (m === 'dark' ? 'light' : 'dark'))

  const isDark  = mode === 'dark'
  const isLight = mode === 'light'

  const value = useMemo(() => ({ mode, toggleMode, isDark, isLight }), [mode])

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

// Hook for consuming the context
// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => useContext(ThemeCtx)

export default ThemeCtx
