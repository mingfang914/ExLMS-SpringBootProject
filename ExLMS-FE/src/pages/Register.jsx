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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import { motion } from 'framer-motion'

// ── Icons ─────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
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
const StudentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
)
const InstructorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
}

const FieldLabel = ({ children }) => (
  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-sec)', mb: 0.75 }}>
    {children}
  </Typography>
)

const Register = () => {
  const [fullName,         setFullName]         = useState('')
  const [email,            setEmail]            = useState('')
  const [password,         setPassword]         = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')
  const [desiredRole,      setDesiredRole]      = useState('STUDENT')
  const [showPwd,          setShowPwd]          = useState(false)
  const [showConfirmPwd,   setShowConfirmPwd]   = useState(false)
  const [error,            setError]            = useState(null)
  const [loading,          setLoading]          = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await authService.register(fullName, email, password, desiredRole)
      navigate('/login', { state: { message: 'Account created! Please sign in.' } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(33,38,45,0.6)',
      borderRadius: '10px',
    },
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
        py: 4,
      }}
    >
      {/* Background */}
      <Box className="auth-bg" />
      <Box
        sx={{
          position: 'fixed', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(48,54,61,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(48,54,61,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          zIndex: 0, pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}
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
            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-text)', letterSpacing: '-0.02em', mb: 0.5 }}>
              Create your account
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', mb: 3 }}>
              Start your learning journey with ExLMS
            </Typography>
          </motion.div>

          {/* Error */}

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Alert
                severity="error"
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
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Role selector */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <FieldLabel>I am a</FieldLabel>
              <ToggleButtonGroup
                value={desiredRole}
                exclusive
                onChange={(_, val) => val && setDesiredRole(val)}
                fullWidth
                sx={{
                  mb: 2.5,
                  gap: 1,
                  bgcolor: 'transparent',
                  '& .MuiToggleButtonGroup-grouped': {
                    border: '1px solid var(--color-border) !important',
                    borderRadius: '10px !important',
                    flex: 1,
                    py: 1.25,
                    color: 'var(--color-text-muted)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    gap: 0.75,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(99,102,241,0.12)',
                      borderColor: 'rgba(99,102,241,0.4) !important',
                      color: '#818CF8',
                      fontWeight: 600,
                      boxShadow: '0 0 0 1px rgba(99,102,241,0.2)',
                    },
                    '&:hover': { bgcolor: 'rgba(99,102,241,0.06)' },
                  },
                }}
              >
                <ToggleButton value="STUDENT" id="role-student">
                  <StudentIcon /> Student
                </ToggleButton>
                <ToggleButton value="INSTRUCTOR" id="role-instructor">
                  <InstructorIcon /> Instructor
                </ToggleButton>
              </ToggleButtonGroup>
            </motion.div>

            {/* Full name */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Box sx={{ mb: 2 }}>
                <FieldLabel>Full name</FieldLabel>
                <TextField
                  fullWidth id="fullName" name="fullName" autoComplete="name" autoFocus
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: 'var(--color-text-muted)' }}><UserIcon /></InputAdornment> }}
                  sx={inputSx}
                />
              </Box>
            </motion.div>

            {/* Email */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <Box sx={{ mb: 2 }}>
                <FieldLabel>Email address</FieldLabel>
                <TextField
                  fullWidth id="email" name="email" type="email" autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: 'var(--color-text-muted)' }}><EmailIcon /></InputAdornment> }}
                  sx={inputSx}
                />
              </Box>
            </motion.div>

            {/* Password */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <Box sx={{ mb: 2 }}>
                <FieldLabel>Password</FieldLabel>
                <TextField
                  fullWidth id="password" name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" sx={{ color: 'var(--color-text-muted)' }}><LockIcon /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" sx={{ color: 'var(--color-text-muted)', cursor: 'pointer', mr: -0.5 }}>
                          {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>
            </motion.div>

            {/* Confirm Password */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
              <Box sx={{ mb: 0 }}>
                <FieldLabel>Confirm password</FieldLabel>
                <TextField
                  fullWidth id="confirmPassword" name="confirmPassword"
                  type={showConfirmPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={confirmPassword.length > 0 && confirmPassword !== password}
                  helperText={confirmPassword.length > 0 && confirmPassword !== password ? "Passwords don't match" : ''}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" sx={{ color: 'var(--color-text-muted)' }}><LockIcon /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPwd(!showConfirmPwd)} edge="end" sx={{ color: 'var(--color-text-muted)', cursor: 'pointer', mr: -0.5 }}>
                          {showConfirmPwd ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>
            </motion.div>

            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={!loading && <ArrowRightIcon />}
                sx={{
                  mt: 3, mb: 2,
                  height: 48,
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                  },
                  '&:active': { transform: 'translateY(0)' },
                  '&.Mui-disabled': { background: 'rgba(99,102,241,0.3)', color: 'rgba(255,255,255,0.4)' },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.7)' }} /> : 'Create Account'}
              </Button>
            </motion.div>
          </Box>

          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
            <Divider sx={{ borderColor: 'var(--color-border)', my: 0.5 }}>
              <Typography sx={{ px: 1.5, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Already have an account?
              </Typography>
            </Divider>

            <Button
              component={RouterLink}
              to="/login"
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
                cursor: 'pointer',
                '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-text)', bgcolor: 'rgba(99,102,241,0.06)' },
                transition: 'all 0.2s',
              }}
            >
              Sign In Instead
            </Button>
          </motion.div>
        </Box>
      </motion.div>

    </Box>
  )
}

export default Register
