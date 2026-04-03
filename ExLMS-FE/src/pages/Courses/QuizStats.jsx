import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Grid, Card, CardContent, Divider,
  List, ListItem, ListItemText, LinearProgress, CircularProgress,
  Alert, Breadcrumbs, Link, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip
} from '@mui/material'
import {
  TrendingUp, People, Timer, AssignmentTurnedIn,
  TrendingDown, HelpOutline, NavigateNext as NextIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import * as quizService from '../../services/quizService'
import { format } from 'date-fns'

const QuizStats = () => {
  const { t } = useTranslation()
  const { groupId, courseId, quizId } = useParams()
  const [stats, setStats] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsData, quizData, attemptsData] = await Promise.all([
          quizService.getQuizStats(quizId),
          quizService.getQuiz(quizId),
          quizService.getAttemptsByDeployment(quizId)
        ])
        setStats(statsData)
        setQuiz(quizData)
        setAttempts(attemptsData)
      } catch (err) {
        setError(t('quizzes.stats.load_failed') || 'Không thể tải dữ liệu thống kê')
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

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Breadcrumbs aria-label="breadcrumb" separator={<NextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/groups" color="inherit" underline="hover">{t('common.groups')}</Link>
        <Link component={RouterLink} to={`/groups/${groupId}`} color="inherit" underline="hover">{quiz?.title}</Link>
        <Typography color="var(--color-text)" fontWeight={600}>Thống kê & Lịch sử</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 5, color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
        Thống kê: {quiz?.title}
      </Typography>

      {stats && stats.totalAttempts > 0 ? (
        <>
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Tổng lượt làm" value={stats.totalAttempts} icon={<People color="primary" />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Điểm trung bình" value={`${stats.averageScore?.toFixed(1)}%`} icon={<TrendingUp color="secondary" />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Tỷ lệ đạt" value={`${stats.passRate?.toFixed(1)}%`} icon={<AssignmentTurnedIn sx={{ color: '#10b981' }} />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Số câu hỏi" value={quiz?.questionCount || 0} icon={<HelpOutline color="info" />} />
            </Grid>
          </Grid>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>Phân phối điểm số</Typography>
                <Divider sx={{ mb: 4 }} />
                <Box sx={{ mt: 2 }}>
                  {stats.scoreDistribution && Object.entries(stats.scoreDistribution).map(([range, count]) => (
                    <Box key={range} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={700} color="var(--color-text-sec)">{range}%</Typography>
                        <Typography variant="body2" fontWeight={800} color="var(--color-text-muted)">{count} lượt</Typography>
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
                  <TrendingDown sx={{ mr: 1.5 }} /> Câu hỏi hay sai nhất
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stats.mostWrongQuestions?.map((q, idx) => (
                    <ListItem key={q.questionId} divider={idx !== stats.mostWrongQuestions.length - 1} sx={{ px: 0, py: 2 }}>
                      <ListItemText
                        primary={q.content}
                        secondary={`Bị làm sai ${q.wrongCount} lần (${q.wrongPercentage?.toFixed(1)}%)`}
                        primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700, mb: 0.5 }}
                        secondaryTypographyProps={{ variant: 'caption', fontWeight: 600, color: 'error.main' }}
                      />
                    </ListItem>
                  ))}
                  {(!stats.mostWrongQuestions || stats.mostWrongQuestions.length === 0) && (
                    <Typography color="var(--color-text-muted)" sx={{ py: 3, textAlign: 'center', fontStyle: 'italic', fontWeight: 600 }}>Chưa có dữ liệu thống kê câu hỏi.</Typography>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Alert severity="info" sx={{ mb: 5, borderRadius: 3 }}>Chưa có thành viên nào thực hiện bài kiểm tra này.</Alert>
      )}

      {/* Attempts History Table */}
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={800}>Lịch sử làm bài của các thành viên</Typography>
          <Chip label={`${attempts.length} lượt làm`} color="primary" sx={{ fontWeight: 700 }} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha('#6366F1', 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Thành viên</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Lần làm</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Thời gian nộp</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Điểm số</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attempts.map((att) => (
                <TableRow key={att.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'secondary.main' }}>
                        {att.userName?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant="body2" fontWeight={700}>{att.userName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>Lần {att.attemptNumber}</TableCell>
                  <TableCell>{att.submittedAt ? format(new Date(att.submittedAt), 'HH:mm dd/MM/yyyy') : 'Chưa nộp'}</TableCell>
                  <TableCell>
                    <Typography fontWeight={800} color={att.passed ? 'success.main' : 'error.main'}>
                      {Math.round(att.score)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={att.passed ? 'Đạt' : 'Chưa đạt'} 
                      size="small" 
                      color={att.passed ? 'success' : 'error'} 
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      startIcon={<ViewIcon />}
                      component={RouterLink}
                      to={`/groups/${groupId}/courses/${courseId}/quiz/attempts/${att.id}/result`}
                      sx={{ borderRadius: '8px', fontWeight: 700 }}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {attempts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}>
                    Chưa có lịch sử làm bài.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
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
