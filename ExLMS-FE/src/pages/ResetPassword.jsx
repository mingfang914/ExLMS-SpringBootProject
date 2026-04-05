import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import authService from '../services/authService'
import { motion } from 'framer-motion'
import ThemeToggle from '../components/Common/ThemeToggle'
import LanguageToggle from '../components/Common/LanguageToggle'

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] } 
  }),
}

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setError('Mã khôi phục không hợp lệ. Vui lòng kiểm tra lại email của bạn.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    
    setError(null)
    setIsSubmitting(true)

    try {
      const message = await authService.resetPassword(token, newPassword)
      setSuccess(message || 'Đặt lại mật khẩu thành công! Chuyển hướng về trang đăng nhập...')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#02040A', position: 'relative', overflow: 'hidden', px: 2,
      }}
    >
      <Box sx={{ position: 'fixed', top: 24, right: 24, zIndex: 100, display: 'flex', gap: 1 }}>
        <LanguageToggle />
        <ThemeToggle />
      </Box>

      <Box className="auth-bg" />

      <motion.div
        variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden" animate="visible"
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}
      >
        <Box
          sx={{
            background: 'rgba(13,17,23,0.9)', backdropFilter: 'blur(24px)', border: '1px solid #30363D',
            borderRadius: '20px', p: { xs: 3, sm: 4 }, boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '11px', background: 'linear-gradient(135deg, #6366F1, #22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(99,102,241,0.4)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#F0F6FC' }}>ExLMS</Typography>
            </Box>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#F0F6FC', mb: 0.5 }}>Đặt lại mật khẩu</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#8B949E', mb: 3 }}>Tạo mật khẩu mới cho tài khoản của bạn.</Typography>
          </motion.div>

          {error && <Alert severity="error" sx={{ mb: 2.5, bgcolor: 'rgba(239,68,68,0.1)', color: '#FCA5A5', borderRadius: '10px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2.5, bgcolor: 'rgba(16,185,129,0.1)', color: '#6EE7B7', borderRadius: '10px' }}>{success}</Alert>}

          {(!success && !!token) && (
            <Box component="form" onSubmit={handleSubmit}>
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#8B949E', mb: 0.75 }}>Mật khẩu mới</Typography>
                  <TextField 
                    fullWidth required type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start" sx={{ color: '#6E7681' }}><LockIcon /></InputAdornment>,
                      endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPwd(!showPwd)} edge="end" sx={{ color: '#6E7681' }}>{showPwd ? <EyeOffIcon /> : <EyeIcon />}</IconButton></InputAdornment>
                    }} 
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(33,38,45,0.6)', borderRadius: '10px', color: '#F0F6FC' } }} 
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#8B949E', mb: 0.75 }}>Xác nhận mật khẩu</Typography>
                  <TextField 
                    fullWidth required type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                    InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color: '#6E7681' }}><LockIcon /></InputAdornment> }} 
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(33,38,45,0.6)', borderRadius: '10px', color: '#F0F6FC' } }} 
                  />
                </Box>
                <Button 
                  type="submit" fullWidth variant="contained" disabled={isSubmitting} 
                  sx={{ height: 48, borderRadius: '10px', fontWeight: 700, background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
                >
                  {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Đặt lại mật khẩu'}
                </Button>
              </motion.div>
            </Box>
          )}
        </Box>
      </motion.div>
    </Box>
  )
}

export default ResetPassword
