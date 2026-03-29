import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useScrollTrigger,
} from '@mui/material';
import {
  AutoStories,
  VideoCall,
  Groups,
  Quiz,
  CalendarMonth,
  Forum
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Common/Logo';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <Grid item xs={12} sm={6} md={4}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      viewport={{ once: true }}
    >
      <Card
        sx={{
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: 4,
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: 6
          }
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ color: 'primary.main', mb: 2 }}>
            <Icon sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  </Grid>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const features = [
    {
      icon: AutoStories,
      title: 'Học tập & Bài giảng',
      description: 'Hệ thống quản lý khóa học, chương và bài học chi tiết, theo dõi tiến độ học tập thông minh.',
      delay: 0.1
    },
    {
      icon: VideoCall,
      title: 'Họp Trực tuyến',
      description: 'Phòng họp video HD tích hợp sẵn, hỗ trợ học tập và thảo luận nhóm thời gian thực.',
      delay: 0.2
    },
    {
      icon: Groups,
      title: 'Nhóm học tập',
      description: 'Không gian cộng tác riêng tư cho từng nhóm, chia sẻ tài liệu và feed tin tức nội bộ.',
      delay: 0.3
    },
    {
      icon: Quiz,
      title: 'Kiểm tra & Quiz',
      description: 'Tạo và làm các bài kiểm tra trắc nghiệm, nhận kết quả và đánh giá trình độ tức thì.',
      delay: 0.4
    },
    {
      icon: Forum,
      title: 'Diễn đàn Thảo luận',
      description: 'Cộng đồng học thuật năng động, nơi đặt câu hỏi và giải đáp thắc mắc cùng giảng viên.',
      delay: 0.5
    },
    {
      icon: CalendarMonth,
      title: 'Lịch & Nhắc nhở',
      description: 'Quản lý thời gian biểu khoa học, nhận thông báo đẩy cho các sự kiện học tập quan trọng.',
      delay: 0.6
    }
  ];

  return (
    <Box sx={{ overflowX: 'hidden', bgcolor: '#f8fafc' }}>
      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: trigger ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
          backdropFilter: 'blur(10px)',
          boxShadow: trigger ? 1 : 0,
          transition: 'all 0.3s ease'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Logo 
              variant={trigger ? 'colored' : 'white'} 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />

            <Button
              variant={trigger ? "contained" : "outlined"}
              color={trigger ? "primary" : "inherit"}
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 'bold',
                color: trigger ? 'white' : 'white',
                borderColor: trigger ? 'transparent' : 'white'
              }}
            >
              Đăng nhập
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          height: '100vh',
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
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

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 0
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Nâng tầm trải nghiệm học tập & Gặp gỡ trực tuyến
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Giải pháp học thuật chuyên nghiệp dành cho sinh viên và học viên hiện đại.
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                borderRadius: 4,
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}
            >
              Khám phá ngay
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container id="features" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
            Tính Năng Nổi Bật
          </Typography>
          <Typography variant="h6" color="text.secondary" maxWidth="md" sx={{ mx: 'auto' }}>
            ExLMS được xây dựng với đầy đủ bộ công cụ hỗ trợ việc học tập và cộng tác từ xa hiệu quả nhất.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Về Dự Án ExLMS
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, lineHeight: 1.6, mb: 3 }}>
                  ExLMS (Extended Learning Management System) là nền tảng quản lý học tập thế hệ mới.
                  Với sứ mệnh xóa nhòa khoảng cách giữa sinh viên và kiến thức thông qua các công cụ cộng tác nhóm hiện đại.
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Tất cả trong một: Từ Video Meeting, Quản lý tài liệu đến Hệ thống thi cử trực tuyến đều được tích hợp trong một giao diện duy nhất, tinh gọn và dễ sử dụng.
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <Box
                  component="img"
                  src="/api/files/download/landingpagePicture.png" // Dùng video cho preview nếu không có ảnh khác, nhưng thường là Img
                  sx={{
                    width: '100%',
                    borderRadius: 4,
                    boxShadow: 10,
                    bgcolor: 'white',
                    p: 1
                  }}
                />
                {/* Note: In real app, we would use a meaningful static image for About block */}
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="body1" color="text.secondary">
          © {new Date().getFullYear()} ExLMS - Nâng tầm tri thức. Phát triển bởi Astatine.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
