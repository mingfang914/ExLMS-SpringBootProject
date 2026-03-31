import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Paper, Button, Radio, RadioGroup, FormControlLabel,
  Checkbox, TextField, Divider, LinearProgress, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid
} from '@mui/material'
import {
  Timer as TimerIcon, NavigateNext, NavigateBefore, Send as SendIcon,
  CheckCircle as CheckIcon, Cancel as CancelIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import courseService from '../../services/courseService'

const QuizPlayer = () => {
  const { t } = useTranslation()
  const { groupId, courseId, quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  // answers: { [questionId]: UUID | UUID[] | string }
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef()
  const startedRef = useRef(false)

  useEffect(() => {
    const start = async () => {
      if (startedRef.current) return
      startedRef.current = true
      try {
        const quizData = await courseService.getQuizById(quizId)
        setQuiz(quizData)
        const attemptData = await courseService.startQuizAttempt(quizId)
        setAttempt(attemptData)
        if (quizData.timeLimitSec) {
          setTimeLeft(quizData.timeLimitSec)
        }
      } catch (e) {
        const msg = e.response?.data?.message || ''
        // If max attempts exceeded, try to redirect to last result
        if (msg.includes('hết lượt') || msg.includes('attempts')) {
          try {
            const prevAttempts = await courseService.getMyQuizAttempts(quizId)
            // Find the last SUBMITTED attempt
            const lastSubmitted = prevAttempts
              .filter(a => a.submittedAt)
              .sort((a, b) => (b.attemptNumber || 0) - (a.attemptNumber || 0))[0]
            if (lastSubmitted) {
              navigate(`/groups/${groupId}/courses/${courseId}/quiz/attempts/${lastSubmitted.id}/result`, { replace: true })
              return
            }
          } catch (_) {}
        }
        setError(msg || t('quizzes.player.start_failed'))
      } finally {
        setLoading(false)
      }
    }
    start()
  }, [quizId, groupId, courseId, navigate, t])

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && attempt) handleFinalSubmit()
      return
    }
    timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft, attempt])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleSingleAnswer = (qId, answerId) => {
    setAnswers(prev => ({ ...prev, [qId]: answerId }))
  }

  const handleMultiAnswer = (qId, answerId, checked) => {
    setAnswers(prev => {
      const prev_ids = prev[qId] || []
      const next = checked ? [...prev_ids, answerId] : prev_ids.filter(id => id !== answerId)
      return { ...prev, [qId]: next }
    })
  }

  const handleTextAnswer = (qId, text) => {
    setAnswers(prev => ({ ...prev, [qId]: text }))
  }

  const buildPayload = () => {
    if (!quiz) return { answers: [] }
    return {
      answers: quiz.questions.map(q => {
        const val = answers[q.id]
        const base = { questionId: q.id }
        switch (q.questionType) {
          case 'SINGLE_CHOICE':
          case 'TRUE_FALSE':
            return { ...base, selectedAnswerId: val || null }
          case 'MULTIPLE_CHOICE':
            return { ...base, selectedAnswerIds: val || [] }
          case 'FILL_BLANK':
          case 'SHORT_ANSWER':
          default:
            return { ...base, textResponse: val || '' }
        }
      })
    }
  }

  const handleFinalSubmit = async () => {
    if (submitting) return
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      await courseService.submitQuizAttempt(attempt.id, buildPayload())
      navigate(`/groups/${groupId}/courses/${courseId}/quiz/attempts/${attempt.id}/result`)
    } catch (e) {
      setError(e.response?.data?.message || t('quizzes.messages.submit_failed'))
      setSubmitting(false)
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: 4, mt: 4 }}>
      <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: '10px' }} startIcon={<CancelIcon />}>
        {t('common.back')}
      </Button>
    </Box>
  )
  if (!quiz || !quiz.questions || quiz.questions.length === 0)
    return (
        <Box sx={{ maxWidth: 640, mx: 'auto', p: 4, mt: 4 }}>
            <Alert severity="warning" sx={{ borderRadius: 3 }}>{t('quizzes.player.no_questions')}</Alert>
        </Box>
    )

  const currentQ = quiz.questions[currentQIdx]
  const progress = ((currentQIdx + 1) / quiz.questions.length) * 100
  const answeredCount = Object.keys(answers).filter(k => {
    const v = answers[k]; return v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  }).length

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 4, position: 'sticky', top: 16, zIndex: 10, bgcolor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ fontFamily: 'var(--font-heading)' }}>{quiz.title}</Typography>
          <Typography variant="caption" fontWeight={600} color="var(--color-text-muted)">
            {t('quizzes.player.current_question', { current: currentQIdx + 1, total: quiz.questions.length })} &nbsp;•&nbsp; {t('quizzes.player.answered', { answered: answeredCount, total: quiz.questions.length })}
          </Typography>
        </Box>
        {timeLeft !== null && (
          <Chip
            icon={<TimerIcon sx={{ color: 'inherit !important' }} />}
            label={formatTime(timeLeft)}
            color={timeLeft < 60 ? 'error' : 'primary'}
            variant={timeLeft < 60 ? 'filled' : 'outlined'}
            sx={{ fontWeight: 800, fontSize: '1.2rem', px: 1.5, py: 2.5, borderRadius: 3 }}
          />
        )}
      </Paper>

      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
            mb: 4, borderRadius: 2, height: 10, 
            bgcolor: 'rgba(99,102,241,0.1)',
            '& .MuiLinearProgress-bar': { borderRadius: 2, background: 'linear-gradient(90deg, #6366F1, #818CF8)' }
        }} 
      />

      {/* Question Navigator (mini dots) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4, justifyContent: 'center' }}>
        {quiz.questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '' &&
            (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true)
          return (
            <Button
              key={q.id}
              size="small"
              variant={i === currentQIdx ? 'contained' : 'outlined'}
              color={isAnswered ? 'success' : 'primary'}
              onClick={() => setCurrentQIdx(i)}
              sx={{ 
                  minWidth: 44, width: 44, height: 44, borderRadius: 2.5, fontWeight: 800,
                  boxShadow: i === currentQIdx ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                  borderWidth: '2px !important'
              }}
            >
              {i + 1}
            </Button>
          )
        })}
      </Box>

      {/* Question Area */}
      <Paper elevation={0} sx={{ p: 5, borderRadius: 4, minHeight: 320, border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)', color: 'var(--color-text)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Chip label={t(`quizzes.types.${currentQ.questionType.toLowerCase()}`) || currentQ.questionType.replace('_', ' ')} size="small" sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: 'rgba(99,102,241,0.1)', color: '#6366F1' }} />
          <Typography variant="button" fontWeight={800} color="var(--color-text-muted)">{t('quizzes.player.points', { count: currentQ.points })}</Typography>
        </Box>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4, lineHeight: 1.5 }}>{currentQ.content}</Typography>
        <Divider sx={{ my: 4, borderColor: 'var(--color-border)' }} />

        {/* SINGLE_CHOICE / TRUE_FALSE */}
        {(currentQ.questionType === 'SINGLE_CHOICE' || currentQ.questionType === 'TRUE_FALSE') && (
          <RadioGroup
            value={answers[currentQ.id] || ''}
            onChange={(e) => handleSingleAnswer(currentQ.id, e.target.value)}
          >
            {currentQ.answers.map((a) => (
              <FormControlLabel
                key={a.id}
                value={a.id}
                control={<Radio color="primary" />}
                label={<Typography fontWeight={600} variant="body1">{a.content}</Typography>}
                sx={{
                  mb: 2.5, px: 3, py: 1.5, borderRadius: 3, border: '2px solid',
                  width: '100%', mx: 0,
                  borderColor: answers[currentQ.id] === a.id ? '#6366F1' : 'var(--color-border)',
                  bgcolor: answers[currentQ.id] === a.id ? 'rgba(99,102,241,0.05)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'rgba(99,102,241,0.03)', borderColor: answers[currentQ.id] === a.id ? '#6366F1' : 'rgba(99,102,241,0.4)' }
                }}
              />
            ))}
          </RadioGroup>
        )}

        {/* MULTIPLE_CHOICE */}
        {currentQ.questionType === 'MULTIPLE_CHOICE' && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {currentQ.answers.map((a) => {
              const selected = (answers[currentQ.id] || []).includes(a.id)
              return (
                <FormControlLabel
                  key={a.id}
                  control={
                    <Checkbox
                      checked={selected}
                      onChange={(e) => handleMultiAnswer(currentQ.id, a.id, e.target.checked)}
                      color="primary"
                    />
                  }
                  label={<Typography fontWeight={600} variant="body1">{a.content}</Typography>}
                  sx={{
                    mb: 2.5, px: 3, py: 1.5, borderRadius: 3, border: '2px solid',
                    width: '100%', mx: 0,
                    borderColor: selected ? '#6366F1' : 'var(--color-border)',
                    bgcolor: selected ? 'rgba(99,102,241,0.05)' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'rgba(99,102,241,0.03)', borderColor: selected ? '#6366F1' : 'rgba(99,102,241,0.4)' }
                  }}
                />
              )
            })}
          </Box>
        )}

        {/* FILL_BLANK / SHORT_ANSWER */}
        {(currentQ.questionType === 'FILL_BLANK' || currentQ.questionType === 'SHORT_ANSWER') && (
          <TextField
            fullWidth
            multiline={currentQ.questionType === 'SHORT_ANSWER'}
            rows={currentQ.questionType === 'SHORT_ANSWER' ? 6 : 1}
            variant="outlined"
            placeholder={currentQ.questionType === 'FILL_BLANK' ? t('quizzes.player.fill_blank_placeholder') : t('quizzes.player.short_answer_placeholder')}
            value={answers[currentQ.id] || ''}
            onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
            sx={{ 
                mt: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'var(--color-surface-2)' }
            }}
          />
        )}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          startIcon={<NavigateBefore />}
          disabled={currentQIdx === 0}
          onClick={() => setCurrentQIdx(p => p - 1)}
          sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}
        >
          {t('quizzes.player.prev_btn')}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<SendIcon />}
          onClick={() => setIsConfirmOpen(true)}
          sx={{ borderRadius: '10px', fontWeight: 800, px: 4, borderWidth: '2px !important' }}
        >
          {t('quizzes.player.submit_btn', { answered: answeredCount, total: quiz.questions.length })}
        </Button>
        {currentQIdx < quiz.questions.length - 1 ? (
          <Button
            endIcon={<NavigateNext />}
            variant="contained"
            onClick={() => setCurrentQIdx(p => p + 1)}
            sx={{ borderRadius: '10px', fontWeight: 800, px: 4, background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
          >
            {t('quizzes.player.next_btn')}
          </Button>
        ) : (
          <Button
            endIcon={<CheckIcon />}
            variant="contained"
            color="success"
            onClick={() => setIsConfirmOpen(true)}
            sx={{ borderRadius: '10px', fontWeight: 800, px: 4 }}
          >
            {t('quizzes.player.finish_btn')}
          </Button>
        )}
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.4rem' }}>{t('quizzes.player.confirm_title')}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom variant="body1" sx={{ color: 'var(--color-text-sec)' }} dangerouslySetInnerHTML={{ __html: t('quizzes.player.confirm_desc', { count: answeredCount, total: quiz.questions.length }) }} />
          {answeredCount < quiz.questions.length && (
            <Alert severity="warning" sx={{ mt: 2, borderRadius: 3, fontWeight: 600 }}>
              {t('quizzes.player.warning_unanswered', { count: quiz.questions.length - answeredCount })}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => setIsConfirmOpen(false)} sx={{ fontWeight: 700, borderRadius: 2 }}>{t('quizzes.player.back_to_quiz')}</Button>
          <Button onClick={handleFinalSubmit} variant="contained" color="success" disabled={submitting} sx={{ fontWeight: 800, borderRadius: 2, px: 3, py: 1 }}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : t('quizzes.player.confirm_submit_btn')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuizPlayer
