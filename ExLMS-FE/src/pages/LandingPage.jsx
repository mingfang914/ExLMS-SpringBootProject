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
import ThemeToggle from '../components/Common/ThemeToggle';
import LanguageToggle from '../components/Common/LanguageToggle';
import { useTranslation } from 'react-i18next';

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
          backgroundColor: 'var(--color-surface-2)',
          backdropFilter: 'blur(8px)',
          borderRadius: 4,
          transition: 'all 0.3s ease',
          border: '1px solid var(--color-border)',
          '&:hover': {
            transform: 'translateY(-10px)',
            borderColor: 'var(--color-primary)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const features = [
    { icon: AutoStories, title: t('landing.features.courses.title'), description: t('landing.features.courses.description'), delay: 0.1 },
    { icon: VideoCall, title: t('landing.features.meetings.title'), description: t('landing.features.meetings.description'), delay: 0.2 },
    { icon: Groups, title: t('landing.features.groups.title'), description: t('landing.features.groups.description'), delay: 0.3 },
    { icon: Quiz, title: t('landing.features.quizzes.title'), description: t('landing.features.quizzes.description'), delay: 0.4 },
    { icon: Forum, title: t('landing.features.forum.title'), description: t('landing.features.forum.description'), delay: 0.5 },
    { icon: CalendarMonth, title: t('landing.features.calendar.title'), description: t('landing.features.calendar.description'), delay: 0.6 }
  ];

  return (
    <Box sx={{ overflowX: 'hidden', bgcolor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: trigger ? 'var(--color-surface)' : 'transparent',
          backdropFilter: 'blur(10px)',
          boxShadow: trigger ? 1 : 0,
          transition: 'all 0.3s ease',
          borderBottom: trigger ? '1px solid var(--color-border)' : 'none'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Logo
              variant={trigger ? 'colored' : 'white'}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LanguageToggle />
              <ThemeToggle />
              <Button
                variant={trigger ? "contained" : "outlined"}
                color={trigger ? "primary" : "inherit"}
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 'bold',
                  borderColor: trigger ? 'transparent' : 'white'
                }}
              >
                {t('auth.signin')}
              </Button>
            </Box>
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
              {t('landing.hero_title')}
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {t('landing.hero_subtitle')}
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
              {t('landing.get_started')}
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container id="features" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
            {t('landing.explore')}
          </Typography>
          <Typography variant="h6" color="text.secondary" maxWidth="md" sx={{ mx: 'auto' }}>
            {t('landing.hero_subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: 'var(--color-primary)', color: 'white', py: 10 }}>
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
                  {t('landing.about_title')}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, lineHeight: 1.6, mb: 3 }}>
                  {t('landing.about_subtitle')}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  {t('landing.about_description')}
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
                  src="/api/files/download/landingpagePicture.png"
                  sx={{
                    width: '100%',
                    borderRadius: 4,
                    boxShadow: 10,
                    bgcolor: 'white',
                    p: 1
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
        <Typography variant="body1" color="text.secondary">
          {t('landing.copyright', { year: new Date().getFullYear() })}
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
