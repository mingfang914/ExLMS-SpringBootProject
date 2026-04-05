import React, { useState } from 'react';
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
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response || 'Link đặt lại mật khẩu đã được gửi!');
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
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton onClick={() => navigate('/login')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">
              Quên mật khẩu?
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary">
            Đừng lo lắng! Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
          </Typography>

          {message && <Alert severity="success" sx={{ borderRadius: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Địa chỉ Email"
                variant="outlined"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi liên kết đặt lại'}
              </Button>
            </Box>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Nhớ mật khẩu? <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 'bold' }}>Quay lại đăng nhập</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
