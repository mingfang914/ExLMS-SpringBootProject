import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import store from './store'
import { buildTheme } from './theme'
import { ThemeModeProvider, useThemeMode } from './context/ThemeContext'
import './index.css'
import './i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
})

// VITE_GOOGLE_CLIENT_ID phải được cấu hình trong file .env
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Inner wrapper so it can consume the ThemeContext
function ThemedApp() {
  const { mode } = useThemeMode()
  const muiTheme = useMemo(() => buildTheme(mode), [mode])

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeModeProvider>
            <ThemedApp />
          </ThemeModeProvider>
        </QueryClientProvider>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
