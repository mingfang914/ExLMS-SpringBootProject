import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Button, Divider, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemIcon, Chip, Grid, alpha, useTheme
} from '@mui/material'
import {
  CheckCircle as CheckIcon, Cancel as ErrorIcon,
  HelpOutline, ArrowBack, ExitToApp,
  EmojiEvents as TrophyIcon, Replay as RetryIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import * as quizService from '../../services/quizService'

const QuizResult = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { groupId, courseId, attemptId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await quizService.getAttemptResult(attemptId)
        setResult(data)
      } catch (e) {
        alert('Không thể tải kết quả bài làm.')
      } finally {
        setLoading(false)
      }
    }
    loadResult()
  }, [attemptId])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>
  if (!result) return <Box sx={{ p: 4 }}><Alert severity="error">Không tìm thấy kết quả.</Alert></Box>

  if (result.resultVisibility === 'HIDDEN') {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 }, textAlign: 'center', mt: 8 }}>
        <Paper className="premium-glass" sx={{ p: 6, borderRadius: '40px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(79, 70, 229, 0.05))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4 }}>
            <HelpOutline sx={{ fontSize: 50, color: '#6366F1' }} />
          </Box>
          <Typography variant="h3" fontWeight={900} gutterBottom sx={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            Kết quả chưa được công bố
          </Typography>
          <Typography variant="h6" color="var(--color-text-sec)" sx={{ mb: 6, fontWeight: 500 }}>
            Vui lòng quay lại sau khi giảng viên thiết lập công bố kết quả của bài kiểm tra này.
          </Typography>
          <Button 
            variant="contained" size="large"
            onClick={() => navigate(courseId === 'placeholder-quiz' ? `/groups/${groupId}` : `/groups/${groupId}/courses/${courseId}/view`)} 
            sx={{ borderRadius: '16px', px: 6, py: 2, fontWeight: 800, background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
          >
            Quay lại
          </Button>
        </Paper>
      </Box>
    )
  }

  const isPassed = result.score >= (result.passingScore || 50)

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Score Hero Section */}
        <Paper className="premium-glass animate-float" sx={{ 
          p: { xs: 4, md: 8 }, textAlign: 'center', borderRadius: '40px', mb: 6, 
          background: isPassed 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))' 
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: isPassed ? alpha('#10B981', 0.2) : alpha('#EF4444', 0.2),
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Animated Background Icons */}
          <TrophyIcon sx={{ position: 'absolute', top: -20, right: -20, fontSize: 200, opacity: 0.05, transform: 'rotate(15deg)' }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ 
              width: 120, height: 120, borderRadius: '35%', 
              bgcolor: isPassed ? '#10B981' : '#EF4444', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 4, boxShadow: `0 20px 40px ${alpha(isPassed ? '#10B981' : '#EF4444', 0.3)}`
            }}>
              {isPassed ? <CheckIcon sx={{ fontSize: 70 }} /> : <ErrorIcon sx={{ fontSize: 70 }} />}
            </Box>

            <Typography variant="h3" fontWeight={900} sx={{ mb: 1, fontFamily: 'var(--font-heading)' }}>
              {isPassed ? 'Chúc mừng! Bạn đã đạt' : 'Rất tiếc! Bạn chưa đạt'}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1, my: 4 }}>
              <Typography variant="h1" fontWeight={950} sx={{ 
                fontSize: { xs: '5rem', md: '8rem' }, color: isPassed ? '#10B981' : '#EF4444',
                lineHeight: 1, letterSpacing: -4
              }}>
                {Math.round(result.score || 0)}
              </Typography>
              <Typography variant="h3" fontWeight={900} color="var(--color-text-muted)">%</Typography>
            </Box>

            <Chip 
              label={isPassed ? 'ĐÃ VƯỢT QUA' : 'CHƯA ĐẠT'} 
              sx={{ 
                fontWeight: 900, px: 3, py: 3, borderRadius: '16px', fontSize: '1.1rem',
                bgcolor: isPassed ? alpha('#10B981', 0.2) : alpha('#EF4444', 0.2),
                color: isPassed ? '#10B981' : '#EF4444', mb: 6
              }} 
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" size="large" onClick={() => navigate(courseId === 'placeholder-quiz' ? `/groups/${groupId}` : `/groups/${groupId}/courses/${courseId}/view`)}
                sx={{ borderRadius: '16px', px: 4, py: 2, fontWeight: 800, background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
              >
                {courseId === 'placeholder-quiz' ? 'Quay lại nhóm' : 'Quay lại khóa học'}
              </Button>
              {!isPassed && (
                <Button 
                  variant="outlined" size="large" startIcon={<RetryIcon />}
                  onClick={() => navigate(courseId === 'placeholder-quiz' ? `/groups/${groupId}` : `/groups/${groupId}/courses/${courseId}/view`)}
                  sx={{ borderRadius: '16px', px: 4, py: 2, fontWeight: 800, borderWidth: '2px !important' }}
                >
                  Làm lại bài
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        <Typography variant="h4" fontWeight={900} sx={{ mb: 4, fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
          Phân tích chi tiết
        </Typography>

        <Grid container spacing={3}>
          {(result.responses || []).map((resp, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper className="premium-glass glow-on-hover" sx={{ 
                p: { xs: 3, md: 5 }, borderRadius: '32px',
                border: '1px solid', borderColor: resp.correct ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
                position: 'relative', overflow: 'hidden'
              }}>
                <Box sx={{ pos: 'absolute', top: 0, left: 0, width: '6px', height: '100%', bgcolor: resp.correct ? '#10B981' : '#EF4444' }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 40, height: 40, borderRadius: '12px', 
                      bgcolor: alpha(resp.correct ? '#10B981' : '#EF4444', 0.1),
                      color: resp.correct ? '#10B981' : '#EF4444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900
                    }}>
                      {idx + 1}
                    </Box>
                    <Typography variant="h6" fontWeight={800}>{resp.correct ? 'Chính xác' : 'Chưa đúng'}</Typography>
                  </Box>
                  <Chip label={`${resp.points} điểm`} sx={{ fontWeight: 800, borderRadius: '8px' }} />
                </Box>

                <Typography variant="h5" fontWeight={700} sx={{ mb: 4, color: 'var(--color-text)' }}>
                  {resp.questionContent}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 3, borderRadius: '20px', bgcolor: alpha('#FFF', 0.05), border: '1px solid var(--color-border)' }}>
                      <Typography variant="overline" color="var(--color-text-muted)" fontWeight={800}>CÂU TRẢ LỜI CỦA BẠN</Typography>
                      <Typography variant="body1" fontWeight={700} sx={{ mt: 1, color: resp.correct ? '#10B981' : '#EF4444' }}>
                        {resp.content || '(Trống)'}
                      </Typography>
                    </Box>
                  </Grid>
                  {resp.explanation && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2, p: 3, borderRadius: '20px', bgcolor: alpha('#6366F1', 0.05), color: 'var(--color-text)' }}>
                        <Typography variant="overline" color="#6366F1" fontWeight={900}>GIẢI THÍCH</Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, lineHeight: 1.6 }}>
                          {resp.explanation}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  )
}

export default QuizResult
