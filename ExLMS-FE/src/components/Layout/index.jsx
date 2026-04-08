import React, { useState, useEffect } from 'react'
import { Box, CssBaseline, IconButton } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon } from '@mui/icons-material'
import Header from './Header'
import Sidebar from './Sidebar'
import PageTransition from '../Common/PageTransition'

const Layout = ({ children }) => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  // Auto-collapse if user enters a meeting room
  useEffect(() => {
    if (location.pathname.includes('/meetings/') && location.pathname.includes('/room')) {
      setCollapsed(true)
    } else {
      setCollapsed(false)
    }
  }, [location.pathname])

  const DRAWER_WIDTH = collapsed ? 72 : 256

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        bgcolor: 'var(--color-bg)',
      }}
    >
      <CssBaseline />
      <Header />
      <Sidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} width={DRAWER_WIDTH} />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px', // header height
          transition: 'width 0.3s ease',
          bgcolor: 'var(--color-bg)',
          // Subtle mesh grid background
          backgroundImage: `
            radial-gradient(ellipse at 80% 0%, rgba(99,102,241,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 100%, rgba(34,211,238,0.04) 0%, transparent 50%)
          `,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '1280px' }}>
            <PageTransition>
              {children}
            </PageTransition>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
