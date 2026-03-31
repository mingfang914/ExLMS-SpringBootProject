import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Grid, Card, CardContent, Divider,
  List, ListItem, ListItemText, LinearProgress, CircularProgress,
  Alert, Breadcrumbs, Link, Button
} from '@mui/material'
import {
  TrendingUp, People, Timer, AssignmentTurnedIn,
  TrendingDown, HelpOutline, NavigateNext as NextIcon
} from '@mui/icons-material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import courseService from '../../services/courseService'

const QuizStats = () => {
  const { t } = useTranslation()
  const { groupId, courseId, quizId } = useParams()
  const [stats, setStats] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsData, quizData] = await Promise.all([
          courseService.getQuizStats(quizId),
          courseService.getQuizById(quizId)
        ])
        setStats(statsData)
        setQuiz(quizData)
      } catch (err) {
        setError(t('quizzes.stats.load_failed'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [quizId, t])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
  if (error) return (
      <Box sx={{ p: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      </Box>
  )
  if (!stats) return (
      <Box sx={{ p: 4 }}>
          <Alert severity="info" sx={{ borderRadius: 3 }}>{t('quizzes.stats.no_attempts')}</Alert>
      </Box>
  )

  return (
    <Box sx={{ p: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" separator={<NextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/groups" color="inherit" underline="hover">{t('common.groups')}</Link>
        <Link component={RouterLink} to={`/groups/${groupId}`} color="inherit" underline="hover">{t('nav.courses')}</Link>
        <Link component={RouterLink} to={`/groups/${groupId}/courses/${courseId}/edit`} color="inherit" underline="hover">{t('quizzes.stats.breadcrumb_edit')}</Link>
        <Typography color="var(--color-text)" fontWeight={600}>{quiz?.title}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 5, color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
        {t('quizzes.stats.title', { title: quiz?.title })}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('quizzes.stats.total_attempts')} value={stats.totalAttempts} icon={<People color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('quizzes.stats.avg_score')} value={`${stats.averageScore.toFixed(1)}%`} icon={<TrendingUp color="secondary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('quizzes.stats.pass_rate')} value={`${stats.passRate.toFixed(1)}%`} icon={<AssignmentTurnedIn sx={{ color: '#10b981' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('quizzes.stats.avg_time')} value="--" icon={<Timer color="info" />} />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>{t('quizzes.stats.distribution_title')}</Typography>
            <Divider sx={{ mb: 4 }} />
            <Box sx={{ mt: 2 }}>
              {Object.entries(stats.scoreDistribution).map(([range, count]) => (
                <Box key={range} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={700} color="var(--color-text-sec)">{range}%</Typography>
                    <Typography variant="body2" fontWeight={800} color="var(--color-text-muted)">{count} {t('quizzes.stats.attempts_unit')}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(count / stats.totalAttempts) * 100} 
                    sx={{ 
                        height: 10, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': { borderRadius: 5, background: 'linear-gradient(90deg, #6366F1, #818CF8)' }
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: 'error.main', display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingDown sx={{ mr: 1.5 }} /> {t('quizzes.stats.wrong_questions_title')}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {stats.mostWrongQuestions.map((q, idx) => (
                <ListItem key={q.questionId} divider={idx !== stats.mostWrongQuestions.length - 1} sx={{ px: 0, py: 2 }}>
                  <ListItemText
                    primary={q.content}
                    secondary={t('quizzes.stats.wrong_unit', { count: q.wrongCount, percent: q.wrongPercentage.toFixed(1) })}
                    primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700, mb: 0.5 }}
                    secondaryTypographyProps={{ variant: 'caption', fontWeight: 600, color: 'error.main' }}
                  />
                </ListItem>
              ))}
              {stats.mostWrongQuestions.length === 0 && (
                <Typography color="var(--color-text-muted)" sx={{ py: 3, textAlign: 'center', fontStyle: 'italic', fontWeight: 600 }}>{t('quizzes.stats.updating')}</Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

const StatCard = ({ title, value, icon }) => (
  <Card elevation={0} sx={{ height: '100%', borderRadius: 4, border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)', color: 'var(--color-text)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.06)', borderColor: '#6366F1' } }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography color="var(--color-text-muted)" variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Typography>
        <Box sx={{ bgcolor: 'rgba(99,102,241,0.1)', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {React.cloneElement(icon, { sx: { fontSize: 20 } })}
        </Box>
      </Box>
      <Typography variant="h4" fontWeight={900} sx={{ fontFamily: 'var(--font-heading)' }}>{value}</Typography>
    </CardContent>
  </Card>
)

export default QuizStats
