import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { GoogleOAuthProvider } from '@react-oauth/google'

import App from './App'
import store from './store'
import { ThemeModeProvider, useThemeMode } from './context/ThemeContext'
import { ModalProvider } from './context/ModalContext'
import { buildTheme } from './theme'
import './index.css'
import './i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

/**
 * Standard Error Boundary to catch UI-breaking crashes
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', background: '#02040A', color: '#F0F6FC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Oops! Something went wrong.</h2>
          <p>Please try refreshing the page or clearing your cache.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#6366F1', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>Refresh Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ThemedApp() {
  const { mode } = useThemeMode()
  const muiTheme = useMemo(() => buildTheme(mode), [mode])

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider>
          <ModalProvider>
            {googleClientId ? (
              <GoogleOAuthProvider clientId={googleClientId}>
                <ThemedApp />
              </GoogleOAuthProvider>
            ) : (
              <ThemedApp />
            )}
          </ModalProvider>
        </ThemeModeProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)
