import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import authService from '../services/authService'
import { motion } from 'framer-motion'
import ThemeToggle from '../components/Common/ThemeToggle'
import LanguageToggle from '../components/Common/LanguageToggle'
import { useTranslation } from 'react-i18next'

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const message = await authService.forgotPassword(email)
      setSuccess(message || 'Vui lòng kiểm tra email của bạn để nhận hướng dẫn khôi phục mật khẩu.')
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
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
          backgroundImage: (theme) => `
            linear-gradient(var(--color-border) 0.5px, transparent 0.5px),
            linear-gradient(90deg, var(--color-border) 0.5px, transparent 0.5px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.1,
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
          className="auth-card"
          sx={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
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
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 18px rgba(99,102,241,0.3)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)' }}>ExLMS</Typography>
            </Box>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: 'var(--color-text)', mb: 0.5 }}>
              Khôi phục mật khẩu
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-sec)', mb: 3 }}>
              Nhập email của bạn để nhận liên kết khôi phục mật khẩu.
            </Typography>
          </motion.div>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, bgcolor: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2.5, bgcolor: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', borderRadius: '10px' }}>
              {success}
            </Alert>
          )}

          {!success && (
            <Box component="form" onSubmit={handleSubmit}>
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-sec)', mb: 0.75 }}>Email</Typography>
                <TextField
                  fullWidth
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" sx={{ color: 'var(--color-text-muted)' }}><EmailIcon /></InputAdornment>,
                  }}
                  className="auth-input"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2, height: 48, borderRadius: '10px', fontWeight: 700, background: 'var(--color-primary)', '&:hover': { background: 'var(--color-primary-lt)' } }}
                >
                  {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Gửi liên kết'}
                </Button>
              </motion.div>
            </Box>
          )}

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <Button
              component={RouterLink}
              to="/login"
              fullWidth
              variant="text"
              startIcon={<ArrowLeftIcon />}
              sx={{ color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-text)' } }}
            >
              Quay lại đăng nhập
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  )
}

export default ForgotPassword
