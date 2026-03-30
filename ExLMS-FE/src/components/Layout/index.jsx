import React from 'react'
import { Box, CssBaseline } from '@mui/material'
import Header from './Header'
import Sidebar from './Sidebar'
import PageTransition from '../Common/PageTransition'

const DRAWER_WIDTH = 256

const Layout = ({ children }) => {
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
      <Sidebar />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px', // header height
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
