import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Button, Divider, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemIcon, Chip
} from '@mui/material'
import {
  CheckCircle as CheckIcon, Cancel as ErrorIcon,
  HelpOutline as QuestionIcon, ArrowBack, ExitToApp
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import courseService from '../../services/courseService'

const QuizResult = () => {
  const { t } = useTranslation()
  const { groupId, courseId, attemptId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await courseService.getQuizAttemptResult(attemptId)
        setResult(data)
      } catch (e) {
        alert(e.response?.data?.message || t('quizzes.result.load_failed'))
      } finally {
        setLoading(false)
      }
    }
    loadResult()
  }, [attemptId, t])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (!result) return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>{t('quizzes.result.not_found')}</Alert>
      </Box>
  )

  const isPassed = result.score >= (result.passingScore || 50)

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4, mb: 4, bgcolor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <Box sx={{ mb: 3 }}>
          {isPassed ? (
            <CheckIcon sx={{ fontSize: 100, color: '#10B981' }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 100, color: '#EF4444' }} />
          )}
        </Box>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontFamily: 'var(--font-heading)' }}>
          {isPassed ? t('quizzes.result.title_passed') : t('quizzes.result.title_failed')}
        </Typography>
        <Typography variant="h1" color={isPassed ? '#10B981' : '#EF4444'} fontWeight={900} sx={{ my: 3, letterSpacing: -2 }}>
          {(result.score || 0).toFixed(1)}%
        </Typography>
        <Typography variant="subtitle1" fontWeight={600} color="var(--color-text-muted)">
          {t('quizzes.result.score_needed', { score: result.passingScore })}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, mt: 5 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(`/groups/${groupId}/courses/${courseId}/view`)}
            sx={{ borderRadius: '12px', fontWeight: 700, px: 3, py: 1.5, borderWidth: '2px !important' }}
          >
            {t('quizzes.result.back_to_course')}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ExitToApp />}
            onClick={() => navigate(-2)}
            sx={{ borderRadius: '12px', fontWeight: 800, px: 4, py: 1.5, background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
          >
            {t('quizzes.result.exit')}
          </Button>
        </Box>
      </Paper>

      {/* Detailed Feedback (if visible) */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
        {t('quizzes.result.details_title')}
      </Typography>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(result.responses || []).map((resp, idx) => (
          <Paper key={resp.questionId || idx} elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
              <Box sx={{ mt: 0.5 }}>
                {resp.correct ? (
                  <CheckIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    {t('quizzes.result.question_no', { count: idx + 1, content: resp.questionContent })}
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'var(--color-surface-2)', borderRadius: 2, border: '1px solid var(--color-border)' }}>
                  <Typography variant="caption" fontWeight={700} color="var(--color-text-muted)" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                    {t('quizzes.result.your_answer')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>{resp.content || t('quizzes.result.empty_answer')}</Typography>
                </Box>
                
                {!resp.correct && resp.explanation && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(59, 130, 246, 0.05)', borderLeft: '4px solid #3B82F6', borderRadius: '0 12px 12px 0' }}>
                    <Typography variant="caption" fontWeight={800} color="#3B82F6" sx={{ textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                        {t('quizzes.result.explanation_title')}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>{resp.explanation}</Typography>
                  </Box>
                )}
              </Box>
              <Chip 
                label={resp.correct ? `+${resp.points} pts` : '0 pts'} 
                color={resp.correct ? 'success' : 'default'} 
                sx={{ fontWeight: 800, borderRadius: 1.5, height: 28 }} 
              />
            </Box>
          </Paper>
        ))}
      </List>
    </Box>
  )
}

export default QuizResult
