import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginStart, loginSuccess, loginFailure, setUser } from '../store/authSlice'
import authService from '../services/authService'
import { motion } from 'framer-motion'

// ── SVG Icons ──────────────────────────────────────────────────────
const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
}

const Login = () => {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    dispatch(loginStart())

    try {
      const data = await authService.login(email, password)
      dispatch(loginSuccess({ token: data.token, refreshToken: data.refreshToken, user: data }))
      try {
        const profile = await authService.getCurrentUser()
        dispatch(setUser(profile))
      } catch (_) {}
      navigate('/')
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.'
      setError(message)
      dispatch(loginFailure(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--color-bg)',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
      }}
    >
      {/* Animated background blobs */}
      <Box className="auth-bg" />

      {/* Subtle grid overlay */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(48,54,61,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(48,54,61,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}
      >
        <Box
          sx={{
            background: 'rgba(13,17,23,0.9)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            p: { xs: 3, sm: 4 },
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
          }}
        >
          {/* Logo */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: '11px',
                  background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 18px rgba(99,102,241,0.4)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </Box>
              <Box>
                <Typography className="brand-text" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1 }}>
                  ExLMS
                </Typography>
                <Typography sx={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Learning Platform
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Heading */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Typography
              sx={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.625rem',
                color: 'var(--color-text)',
                letterSpacing: '-0.02em',
                mb: 0.5,
              }}
            >
              Welcome back
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', mb: 3 }}>
              Sign in to continue your learning journey
            </Typography>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Alert
                severity="error"
                icon={<AlertCircleIcon />}
                sx={{
                  mb: 2.5,
                  bgcolor: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#FCA5A5',
                  borderRadius: '10px',
                  '& .MuiAlert-icon': { color: '#EF4444' },
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <Box sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-sec)', mb: 0.75 }}>
                  Email address
                </Typography>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: 'var(--color-text-muted)' }}>
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(33,38,45,0.6)',
                      borderRadius: '10px',
                    },
                  }}
                />
              </Box>
            </motion.div>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Box sx={{ mt: 2, mb: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-sec)' }}>
                    Password
                  </Typography>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      fontSize: '0.75rem',
                      color: 'var(--color-primary-lt)',
                      cursor: 'pointer',
                      '&:hover': { color: 'var(--color-accent)' },
                      transition: 'color 0.2s',
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: 'var(--color-text-muted)' }}>
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPwd(!showPwd)}
                          edge="end"
                          sx={{ color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-text)' }, mr: -0.5, cursor: 'pointer' }}
                        >
                          {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(33,38,45,0.6)',
                      borderRadius: '10px',
                    },
                  }}
                />
              </Box>
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={!loading && <ArrowRightIcon />}
                sx={{
                  mt: 3,
                  mb: 2,
                  height: 48,
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                  },
                  '&:active': { transform: 'translateY(0)' },
                  '&.Mui-disabled': {
                    background: 'rgba(99,102,241,0.3)',
                    color: 'rgba(255,255,255,0.4)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading
                  ? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  : 'Sign In'}
              </Button>
            </motion.div>
          </Box>

          {/* Divider */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <Divider sx={{ borderColor: 'var(--color-border)', my: 0.5 }}>
              <Typography sx={{ px: 1.5, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                New to ExLMS?
              </Typography>
            </Divider>

            <Button
              component={RouterLink}
              to="/register"
              fullWidth
              variant="outlined"
              sx={{
                mt: 2,
                height: 44,
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-sec)',
                '&:hover': {
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-text)',
                  bgcolor: 'rgba(99,102,241,0.06)',
                },
                transition: 'all 0.2s',
              }}
            >
              Create a free account
            </Button>
          </motion.div>
        </Box>

        {/* Footer note */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
          <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            By continuing, you agree to our{' '}
            <Typography component="span" sx={{ color: 'var(--color-primary-lt)', cursor: 'pointer', fontSize: 'inherit' }}>Terms of Service</Typography>
            {' '}and{' '}
            <Typography component="span" sx={{ color: 'var(--color-primary-lt)', cursor: 'pointer', fontSize: 'inherit' }}>Privacy Policy</Typography>
          </Typography>
        </motion.div>
      </motion.div>
    </Box>
  )
}

export default Login
