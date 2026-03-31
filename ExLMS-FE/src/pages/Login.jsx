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
import { loginStart, loginSuccess, loginFailure, setUser, setLoading } from '../store/authSlice'
import authService from '../services/authService'
import { useGoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import ThemeToggle from '../components/Common/ThemeToggle'
import LanguageToggle from '../components/Common/LanguageToggle'
import { useTranslation } from 'react-i18next'

// ── Google Login Button Component ──────────────────────────────────
const GoogleLoginButton = ({ disabled, onError, onSuccess }) => {
  const { t } = useTranslation()
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  // If no client ID, return null or a disabled button to avoid hook crash
  if (!googleClientId) {
    return (
      <Button
        fullWidth
        variant="outlined"
        disabled
        title="Google Client ID is missing in .env"
        sx={{
          height: 44, borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
          borderColor: 'rgba(255,255,255,0.05)', color: '#4B5563', bgcolor: 'rgba(255,255,255,0.02)',
        }}
      >
        Google Login (Missing Config)
      </Button>
    )
  }

  // Inside this component, hook usage is safe because we only render it 
  // if GoogleOAuthProvider is present (checked by key existence)
  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess,
    onError,
  })

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={() => login()}
      disabled={disabled}
      startIcon={
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      }
      sx={{
        mt: 0, mb: 1.5, height: 44, borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
        borderColor: 'rgba(255,255,255,0.12)', color: '#8B949E', bgcolor: 'rgba(255,255,255,0.03)',
        '&:hover': { borderColor: 'rgba(66,133,244,0.5)', bgcolor: 'rgba(66,133,244,0.06)', color: '#F0F6FC' }
      }}
    >
      Đăng nhập với Google
    </Button>
  )
}

// ── SVG Icons ──────────────────────────────────────────────────────
const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] } 
  }),
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { t } = useTranslation()
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
      } catch (_) { }
      navigate('/')
    } catch (err) {
      const message = err.response?.data?.message || t('auth.login_failed') || 'Đăng nhập thất bại'
      setError(message)
      dispatch(loginFailure(message))
    } finally {
      setLoading(false)
    }
  }

  const onGoogleSuccess = async (codeResponse) => {
    setError(null)
    dispatch(setLoading(true))
    try {
      const redirectUri = window.location.origin
      const data = await authService.loginWithGoogle(codeResponse.code, redirectUri)
      dispatch(loginSuccess({ token: data.token, refreshToken: data.refreshToken, user: data }))
      try {
        const profile = await authService.getCurrentUser()
        dispatch(setUser(profile))
      } catch (_) { }
      navigate('/')
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.'
      setError(message)
      dispatch(loginFailure(message))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const onGoogleError = (error) => {
    setError('Đã xảy ra lỗi khi kết nối với Google. Vui lòng thử lại.')
    console.error('Google OAuth2 error:', error)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#02040A',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
      }}
    >
      <Box sx={{ position: 'fixed', top: 24, right: 24, zIndex: 100, display: 'flex', gap: 1 }}>
        <LanguageToggle />
        <ThemeToggle />
      </Box>

      <Box className="auth-bg" />

      <Box
        sx={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(48,54,61,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(48,54,61,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

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
            border: '1px solid #30363D',
            borderRadius: '20px',
            p: { xs: 3, sm: 4 },
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
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
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1, color: '#F0F6FC' }}>
                  ExLMS
                </Typography>
                <Typography sx={{ fontSize: '0.625rem', color: '#6E7681', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Learning Platform
                </Typography>
              </Box>
            </Box>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.625rem', color: '#F0F6FC', letterSpacing: '-0.02em', mb: 0.5 }}>
              {t('auth.signin_title')}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#8B949E', mb: 3 }}>
              {t('auth.signin_subtitle')}
            </Typography>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Alert severity="error" icon={<AlertCircleIcon />} sx={{ mb: 2.5, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', borderRadius: '10px', '& .MuiAlert-icon': { color: '#EF4444' } }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <Box sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#8B949E', mb: 0.75 }}>{t('auth.email')}</Typography>
                <TextField fullWidth id="email" name="email" type="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: '#6E7681' }}><EmailIcon /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(33,38,45,0.6)', borderRadius: '10px', color: '#F0F6FC' } }} />
              </Box>
            </motion.div>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Box sx={{ mt: 2, mb: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#8B949E' }}>{t('auth.password')}</Typography>
                  <Typography component="a" sx={{ fontSize: '0.75rem', color: '#818CF8', cursor: 'pointer', '&:hover': { color: '#22D3EE' }, transition: 'color 0.2s' }}>{t('auth.forgot_password')}</Typography>
                </Box>
                <TextField fullWidth id="password" name="password" type={showPwd ? 'text' : 'password'} placeholder={t('auth.placeholder_password')} value={password} onChange={(e) => setPassword(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: '#6E7681' }}><LockIcon /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPwd(!showPwd)} edge="end" sx={{ color: '#6E7681', '&:hover': { color: '#F0F6FC' }, mr: -0.5 }}>{showPwd ? <EyeOffIcon /> : <EyeIcon />}</IconButton></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(33,38,45,0.6)', borderRadius: '10px', color: '#F0F6FC' } }} />
              </Box>
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <Button type="submit" fullWidth variant="contained" disabled={loading} endIcon={!loading && <ArrowRightIcon />} sx={{ mt: 3, mb: 2, height: 48, borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 700, background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', '&:hover': { background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' } }}>
                {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('auth.signin')}
              </Button>
            </motion.div>
          </Box>

          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <Divider sx={{ borderColor: '#30363D', my: 1.5 }}>
              <Typography sx={{ px: 1.5, fontSize: '0.75rem', color: '#6E7681' }}>Social login</Typography>
            </Divider>

            <GoogleLoginButton 
              disabled={loading}
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
            />

            <Button component={RouterLink} to="/register" fullWidth variant="outlined" sx={{ height: 44, borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, borderColor: '#30363D', color: '#8B949E', '&:hover': { borderColor: '#6366F1', color: '#F0F6FC', bgcolor: 'rgba(99,102,241,0.06)' } }}>
              {t('auth.create_account')}
            </Button>
          </motion.div>
        </Box>

        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
          <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.75rem', color: '#6E7681' }}>
            {t('auth.agreement')}{' '}
            <Typography component="span" sx={{ color: '#818CF8', cursor: 'pointer', fontSize: 'inherit' }}>{t('auth.terms')}</Typography>
            {' '}{t('auth.and')}{' '}
            <Typography component="span" sx={{ color: '#818CF8', cursor: 'pointer', fontSize: 'inherit' }}>{t('auth.privacy')}</Typography>
          </Typography>
        </motion.div>
      </motion.div>
    </Box>
  )
}

export default Login
