import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Lock as LockIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ hoặc đã thiếu! Vui lòng kiểm tra lại link trong email!');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={10} 
          sx={{ 
            p: 4, 
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Đặt lại mật khẩu mới
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
             Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </Typography>

          {success ? (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Mật khẩu của bạn đã được cập nhật thành công! Đang chuyển hướng về trang đăng nhập...
              </Alert>
            </Box>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
              
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading || !token}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Cập nhật mật khẩu'}
                  </Button>
                </Box>
              </form>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
