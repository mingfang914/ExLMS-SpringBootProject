import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Paper, Button, Radio, RadioGroup, FormControlLabel,
  Checkbox, TextField, Divider, LinearProgress, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid,
  useTheme, alpha, IconButton, Stack
} from '@mui/material'
import {
  Timer as TimerIcon, NavigateNext, NavigateBefore, Send as SendIcon,
  CheckCircle as CheckIcon, Cancel as CancelIcon, ChevronLeft as BackIcon,
  EmojiObjects as TipsIcon, QuestionAnswer as QIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import * as quizService from '../../services/quizService'

const QuizPlayer = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { groupId, courseId, quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [currentQIdx, setCurrentQIdx] = useState(0)
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
        const quizData = await quizService.getQuiz(quizId)
        setQuiz(quizData)
        const attemptData = await quizService.startAttempt(quizId)
        setAttempt(attemptData)
        if (quizData.timeLimitSec) setTimeLeft(quizData.timeLimitSec)
      } catch (e) {
        const msg = e.response?.data?.message || ''
        if (msg.includes('hết lượt')) {
          try {
            const prevAttempts = await quizService.getMyAttempts(quizId)
            const lastSub = prevAttempts.filter(a => a.submittedAt).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
            if (lastSub) navigate(`/groups/${groupId}/courses/${courseId}/quiz/attempts/${lastSub.id}/result`, { replace: true })
          } catch (_) {}
        }
        setError(msg || 'Không thể bắt đầu bài kiểm tra.')
      } finally {
        setLoading(false)
      }
    }
    start()
  }, [quizId, groupId, courseId])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) handleFinalSubmit()
      return
    }
    timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft])

  const formatTime = (s) => {
    const m = Math.floor(s / 60); const sec = s % 60
    return `${m}:${sec < 10 ? '0' : ''}${sec}`
  }

  const handleAnswer = (qId, val, isMulti = false, checked = false) => {
    setAnswers(prev => {
      if (!isMulti) return { ...prev, [qId]: val }
      const prevIds = prev[qId] || []
      const newIds = checked ? [...prevIds, val] : prevIds.filter(id => id !== val)
      return { ...prev, [qId]: newIds }
    })
  }

  const handleFinalSubmit = async () => {
    if (submitting) return
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      const payload = {
        answers: quiz.questions.map(q => ({
          questionId: q.id,
          selectedAnswerId: (q.questionType === 'SINGLE_CHOICE' || q.questionType === 'TRUE_FALSE') ? answers[q.id] : null,
          selectedAnswerIds: q.questionType === 'MULTIPLE_CHOICE' ? (answers[q.id] || []) : [],
          textResponse: q.questionType === 'FILL_BLANK' ? (answers[q.id] || '') : ''
        }))
      }
      await quizService.submitAttempt(attempt.id, payload)
      navigate(`/groups/${groupId}/courses/${courseId}/quiz/attempts/${attempt.id}/result`)
    } catch (e) {
      setError('Nộp bài thất bại. Vui lòng thử lại.')
      setSubmitting(false)
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}><Alert severity="error">{error}</Alert><Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>Quay lại</Button></Box>

  const currentQ = quiz.questions[currentQIdx]
  const progress = ((currentQIdx + 1) / quiz.questions.length) * 100
  const answeredCount = Object.keys(answers).filter(k => {
    const v = answers[k]; return v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  }).length

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--color-bg)', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 3 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(`/groups/${groupId}/courses/${courseId}/view`)}
          sx={{ fontWeight: 700, color: 'var(--color-text-sec)', borderRadius: '12px' }}
        >
          Quay lại khóa học
        </Button>
      </Box>
      <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'grid', gridTemplateColumns: { md: '1fr 340px' }, gap: 4 }}>
        
        {/* Main Quiz Area */}
        <Box>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Paper className="premium-glass" sx={{ 
              p: { xs: 3, md: 6 }, borderRadius: '32px', position: 'relative', overflow: 'hidden' 
            }}>
              {/* Question Header */}
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label={`CÂU HỎI ${currentQIdx + 1}`} 
                  sx={{ borderRadius: '8px', fontWeight: 900, bgcolor: alpha('#6366F1', 0.1), color: '#6366F1', px: 1 }} 
                />
                <Typography variant="button" sx={{ fontWeight: 800, color: 'var(--color-text-muted)' }}>
                  {currentQ.points} ĐIỂM
                </Typography>
              </Box>

              <Typography variant="h4" fontWeight={800} sx={{ mb: 6, lineHeight: 1.4, color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                {currentQ.content}
              </Typography>

              <Divider sx={{ mb: 6, borderColor: 'var(--color-border)' }} />

              <Box sx={{ mb: 8 }}>
                <AnimatePresence mode="wait">
                  <motion.div key={currentQ.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {/* Render inputs based on type */}
                    {(currentQ.questionType === 'SINGLE_CHOICE' || currentQ.questionType === 'TRUE_FALSE') && (
                      <RadioGroup value={answers[currentQ.id] || ''} onChange={(e) => handleAnswer(currentQ.id, e.target.value)}>
                        {currentQ.answers.map(a => (
                          <Box key={a.id} className={`answer-tile ${answers[currentQ.id] === a.id ? 'selected' : ''}`} sx={{ mb: 2, borderRadius: '16px' }}>
                            <FormControlLabel value={a.id} control={<Radio sx={{ display: 'none' }} />} 
                              label={<Typography sx={{ fontWeight: 700, p: 2, textAlign: 'center', width: '100%', color: answers[currentQ.id] === a.id ? 'var(--color-primary)' : 'var(--color-text)' }}>{a.content}</Typography>}
                              sx={{ m: 0, width: '100%', '& .MuiFormControlLabel-label': { width: '100%' } }} 
                            />
                          </Box>
                        ))}
                      </RadioGroup>
                    )}

                    {currentQ.questionType === 'MULTIPLE_CHOICE' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {currentQ.answers.map(a => {
                          const isSel = (answers[currentQ.id] || []).includes(a.id)
                          return (
                            <Box key={a.id} className={`answer-tile ${isSel ? 'selected' : ''}`} sx={{ mb: 2, borderRadius: '16px' }}>
                              <FormControlLabel control={<Checkbox checked={isSel} onChange={(e) => handleAnswer(currentQ.id, a.id, true, e.target.checked)} />} 
                                label={<Typography sx={{ fontWeight: 700, p: 2, color: isSel ? 'var(--color-primary)' : 'var(--color-text)' }}>{a.content}</Typography>}
                                sx={{ m: 0, width: '100%', '& .MuiFormControlLabel-label': { width: '100%' } }}
                              />
                            </Box>
                          )
                        })}
                      </Box>
                    )}

                    {currentQ.questionType === 'FILL_BLANK' && (
                      <TextField fullWidth variant="filled" placeholder="Nhập câu trả lời của bạn..."
                        value={answers[currentQ.id] || ''} onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                        sx={{ '& .MuiFilledInput-root': { borderRadius: '16px', background: alpha('#FFF', 0.03) } }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" startIcon={<NavigateBefore />} disabled={currentQIdx === 0} onClick={() => setCurrentQIdx(p => p - 1)} sx={{ borderRadius: '12px', fontWeight: 800 }}>
                  Câu trước
                </Button>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="error" onClick={() => setIsConfirmOpen(true)} sx={{ borderRadius: '12px', fontWeight: 900, px: 4 }}>
                    Nộp bài
                  </Button>
                  {currentQIdx < quiz.questions.length - 1 && (
                    <Button variant="contained" endIcon={<NavigateNext />} onClick={() => setCurrentQIdx(p => p + 1)} sx={{ borderRadius: '12px', fontWeight: 900, px: 4, background: 'linear-gradient(135deg, #6366F1, #4B5563)' }}>
                      Câu kế tiếp
                    </Button>
                  )}
                </Stack>
              </Box>
            </Paper>
          </motion.div>
        </Box>

        {/* Sidebar Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Timer Card */}
          <Paper className="premium-glass" sx={{ p: 4, borderRadius: '24px', textAlign: 'center' }}>
            <Typography variant="overline" color="var(--color-text-muted)" fontWeight={800}>THỜI GIAN CÒN LẠI</Typography>
            <Typography variant="h2" fontWeight={900} sx={{ color: timeLeft < 60 ? '#EF4444' : '#6366F1', fontFamily: 'monospace', mb: 2 }}>
              {formatTime(timeLeft)}
            </Typography>
            <LinearProgress variant="determinate" value={(timeLeft / quiz.timeLimitSec) * 100} sx={{ borderRadius: 10, height: 10, bgcolor: alpha('#6366F1', 0.1), '& .MuiLinearProgress-bar': { bgcolor: timeLeft < 60 ? '#EF4444' : '#6366F1' } }} />
          </Paper>

          {/* Question Grid */}
          <Paper className="premium-glass" sx={{ p: 4, borderRadius: '24px' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>DANH SÁCH CÂU HỎI</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5 }}>
              {quiz.questions.map((q, i) => {
                const ans = answers[q.id]; const isAns = ans !== undefined && ans !== '' && (Array.isArray(ans) ? ans.length > 0 : true)
                return (
                  <Button key={q.id} variant={i === currentQIdx ? 'contained' : 'outlined'} color={isAns ? 'success' : 'primary'} onClick={() => setCurrentQIdx(i)}
                    sx={{ minWidth: 44, height: 44, borderRadius: '12px', fontWeight: 900, boxShadow: i === currentQIdx ? '0 0 15px rgba(99,102,241,0.4)' : 'none' }}>
                    {i + 1}
                  </Button>
                )
              })}
            </Box>
            <Box sx={{ mt: 4, p: 2, borderRadius: '12px', bgcolor: alpha('#6366F1', 0.05) }}>
              <Typography variant="caption" color="var(--color-text-muted)" fontWeight={700}>
                Bạn đã trả lời {answeredCount}/{quiz.questions.length} câu hỏi.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '24px', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem' }}>Xác nhận nộp bài?</DialogTitle>
        <DialogContent>
          <Typography color="var(--color-text-sec)">
            Bạn đã hoàn thành <strong>{answeredCount}</strong> trên tổng số <strong>{quiz.questions.length}</strong> câu hỏi. 
            Bạn có chắc chắn muốn kết thúc bài thi ngay bây giờ?
          </Typography>
          {answeredCount < quiz.questions.length && (
            <Alert severity="warning" sx={{ mt: 3, borderRadius: '12px' }}>Vẫn còn các câu hỏi chưa được trả lời!</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setIsConfirmOpen(false)} sx={{ fontWeight: 700 }}>Tiếp tục làm bài</Button>
          <Button variant="contained" color="success" onClick={handleFinalSubmit} disabled={submitting} sx={{ borderRadius: '10px', px: 4, fontWeight: 900 }}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận nộp'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuizPlayer
