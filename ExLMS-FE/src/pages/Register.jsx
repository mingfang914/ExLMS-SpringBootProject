import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import authService from '../services/authService'

const Register = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [desiredRole, setDesiredRole] = useState('STUDENT')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      await authService.register(fullName, email, password, desiredRole)
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Video (Auto loops) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="/api/files/download/login_gif.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay to make the form pop out */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 0,
        }}
      />

      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Đăng ký
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="Họ và tên"
              name="fullName"
              autoComplete="name"
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Địa chỉ Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              name="desiredRole"
              label="Tôi muốn đăng ký với vai trò"
              id="desiredRole"
              value={desiredRole}
              onChange={(e) => setDesiredRole(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="STUDENT">Học viên</option>
              <option value="INSTRUCTOR">Giảng viên</option>
            </TextField>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {"Đã có tài khoản? Đăng nhập"}
              </Link>
            </Box>
          </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Register
