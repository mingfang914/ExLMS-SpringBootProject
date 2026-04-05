import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, IconButton, Switch, FormControlLabel, Chip, Divider, Accordion,
  AccordionSummary, AccordionDetails, Alert, Snackbar, CircularProgress, Tooltip
} from '@mui/material'
import {
  Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon,
  ExpandMore as ExpandMoreIcon, RadioButtonChecked, CheckBox as CheckBoxIcon,
  ShortText as ShortTextIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import courseService from '../../services/courseService'
import * as quizService from '../../services/quizService'

const QuizEditor = () => {
  const { t } = useTranslation()
  const { groupId, courseId, quizId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(quizId)

  const QUESTION_TYPES = [
    { value: 'SINGLE_CHOICE', label: t('quizzes.types.single'), icon: <RadioButtonChecked /> },
    { value: 'MULTIPLE_CHOICE', label: t('quizzes.types.multiple'), icon: <CheckBoxIcon /> },
    { value: 'TRUE_FALSE', label: t('quizzes.types.true_false'), icon: '✓/✗' },
    { value: 'FILL_BLANK', label: t('quizzes.types.fill_blank'), icon: '___' },
  ]

  const emptyAnswer = () => ({ content: '', isCorrect: false, orderIndex: 0 })
  const emptyQuestion = () => ({
    content: '', questionType: 'SINGLE_CHOICE', points: 1, explanation: '',
    answers: [emptyAnswer(), emptyAnswer()]
  })

  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    timeLimitSec: 3600,
    maxAttempts: 1,
    passingScore: 50,
    chapterId: '',
    shuffleQuestions: false
  })
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' })

  useEffect(() => {
    if (isEdit) {
      const loadQuiz = async () => {
        try {
          let data;
          if (groupId || courseId) {
            data = await courseService.getQuizById(quizId)
          } else {
            // Inventory mode
            data = await quizService.getTemplateById(quizId)
          }
          
          setQuiz({
            title: data.title,
            description: data.description || '',
            timeLimitSec: data.timeLimitSec,
            maxAttempts: data.maxAttempts || 1,
            passingScore: data.passingScore || 50,
            chapterId: data.chapterId,
            shuffleQuestions: data.shuffleQuestions || false
          })
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions.map(q => ({
              ...q,
              questionType: q.questionType || 'SINGLE_CHOICE',
              points: q.points || 1,
              answers: (q.answers || []).map(a => ({ ...a, isCorrect: a.correct || false }))
            })))
          }
        } catch (e) {
          showSnack(t('quizzes.messages.load_failed'), 'error')
        } finally {
          setLoading(false)
        }
      }
      loadQuiz()
    }
  }, [quizId, isEdit, t])

  const showSnack = (msg, severity = 'success') => setSnackbar({ open: true, msg, severity })

  // ── Quiz config ──
  const updateQuiz = (field, value) => setQuiz(p => ({ ...p, [field]: value }))

  // ── Questions ──
  const addQuestion = () => setQuestions(p => [...p, emptyQuestion()])

  const updateQuestion = (qIdx, field, value) =>
    setQuestions(p => p.map((q, i) => i === qIdx ? { ...q, [field]: value } : q))

  const deleteQuestion = (qIdx) =>
    setQuestions(p => p.filter((_, i) => i !== qIdx))

  // ── Answers ──
  const addAnswer = (qIdx) =>
    setQuestions(p => p.map((q, i) => i === qIdx ? { ...q, answers: [...q.answers, emptyAnswer()] } : q))

  const updateAnswer = (qIdx, aIdx, field, value) =>
    setQuestions(p => p.map((q, i) => i === qIdx
      ? { ...q, answers: q.answers.map((a, j) => j === aIdx ? { ...a, [field]: value } : a) }
      : q))

  const deleteAnswer = (qIdx, aIdx) =>
    setQuestions(p => p.map((q, i) => i === qIdx
      ? { ...q, answers: q.answers.filter((_, j) => j !== aIdx) }
      : q))

  const setCorrectAnswer = (qIdx, aIdx, single) =>
    setQuestions(p => p.map((q, i) => i === qIdx ? {
      ...q,
      answers: q.answers.map((a, j) => ({
        ...a,
        isCorrect: single ? j === aIdx : (j === aIdx ? !a.isCorrect : a.isCorrect)
      }))
    } : q))

  // ── Submit ──
  const handleSave = async () => {
    if (!quiz.title.trim()) { showSnack(t('quizzes.messages.enter_title'), 'error'); return }
    setSaving(true)
    try {
      const payload = {
        ...quiz,
        timeLimitSec: quiz.timeLimitSec ? parseInt(quiz.timeLimitSec) : null,
        questions: questions.map((q, i) => ({
          content: q.content,
          questionType: q.questionType,
          points: q.points || 1,
          explanation: q.explanation,
          orderIndex: i,
          answers: q.answers.map((a, j) => ({ content: a.content, correct: a.isCorrect, orderIndex: j }))
        }))
      }
      if (isEdit) {
        if (groupId || courseId) {
          await courseService.updateQuiz(quizId, payload)
        } else {
          await quizService.updateTemplate(quizId, payload)
        }
        showSnack(t('quizzes.messages.update_success'))
      } else {
        if (courseId) {
          await courseService.createQuiz(courseId, payload)
        } else {
          await quizService.createTemplate(payload)
        }
        showSnack(t('quizzes.messages.create_success'))
      }
      setTimeout(() => navigate(-1), 1000)
    } catch (e) {
      showSnack(t('quizzes.errors.save_failed', { action: isEdit ? t('quizzes.errors.update_action') : t('quizzes.errors.create_action') }), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight={800} mb={3} sx={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
        {isEdit ? t('quizzes.edit_title') : t('quizzes.create_title')}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* ── Quiz Config ── */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)', color: 'var(--color-text)' }}>
        <Typography variant="h6" gutterBottom fontWeight={700}>{t('quizzes.config')}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
          <TextField label={t('quizzes.title_label')} fullWidth value={quiz.title}
            onChange={e => updateQuiz('title', e.target.value)} />
          <TextField label={t('quizzes.desc_label')} fullWidth multiline rows={2} value={quiz.description}
            onChange={e => updateQuiz('description', e.target.value)} />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField label={t('quizzes.time_limit_label')}
              type="number" sx={{ flex: 1, minWidth: 280 }}
              inputProps={{ min: 0 }}
              value={quiz.timeLimitSec || ''}
              onChange={e => updateQuiz('timeLimitSec', e.target.value || null)} />
            <TextField label={t('quizzes.max_attempts_label')} type="number" sx={{ width: 180 }}
              inputProps={{ min: 1 }}
              value={quiz.maxAttempts}
              onChange={e => updateQuiz('maxAttempts', Math.max(1, parseInt(e.target.value) || 1))} />
            <TextField label={t('quizzes.passing_score_label')} type="number" sx={{ width: 160 }}
              inputProps={{ min: 0, max: 100 }}
              value={quiz.passingScore}
              onChange={e => updateQuiz('passingScore', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))} />
          </Box>

          <FormControlLabel
            control={
              <Switch 
                checked={quiz.shuffleQuestions} 
                onChange={e => updateQuiz('shuffleQuestions', e.target.checked)} 
                color="primary"
              />
            }
            label={
                <Box>
                    <Typography variant="body1" fontWeight={600}>{t('quizzes.shuffle_questions_label')}</Typography>
                    <Typography variant="caption" color="var(--color-text-muted)">{t('quizzes.shuffle_questions_hint')}</Typography>
                </Box>
            }
          />


        </Box>
      </Paper>

      {/* ── Questions ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography variant="h6" fontWeight={700}>{t('quizzes.question')} ({questions.length})</Typography>
        <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={addQuestion}
            sx={{ 
                borderRadius: '10px', fontWeight: 700,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)' }
            }}
        >
          {t('quizzes.add_question')}
        </Button>
      </Box>

      {questions.map((q, qIdx) => (
        <Accordion key={qIdx} defaultExpanded sx={{ mb: 2, borderRadius: '12px !important', border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)', color: 'var(--color-text)', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-text-muted)' }} />}>
            <Chip label={t('quizzes.question_no', { count: qIdx + 1 })} size="small" sx={{ mr: 2, fontWeight: 700, bgcolor: 'rgba(99,102,241,0.1)', color: '#818CF8' }} />
            <Typography noWrap sx={{ flex: 1, fontWeight: 600 }}>{q.content || t('quizzes.enter_question_placeholder')}</Typography>
            <Chip label={QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}
              size="small" color="primary" variant="outlined" sx={{ mr: 2, borderRadius: 1.5 }} />
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); deleteQuestion(qIdx) }} sx={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails sx={{ borderTop: '1px solid var(--color-border)', pt: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField label={t('quizzes.question_content_label')} fullWidth value={q.content}
                onChange={e => updateQuestion(qIdx, 'content', e.target.value)} />
              <FormControl sx={{ minWidth: 240 }}>
                <InputLabel>{t('quizzes.question_type_label')}</InputLabel>
                <Select value={q.questionType} label={t('quizzes.question_type_label')}
                  onChange={e => updateQuestion(qIdx, 'questionType', e.target.value)}>
                  {QUESTION_TYPES.map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField 
                label={t('quizzes.points_label')} 
                type="number" 
                sx={{ width: 120 }} 
                value={q.points}
                inputProps={{ min: 1 }}
                onChange={e => updateQuestion(qIdx, 'points', Math.max(1, parseInt(e.target.value) || 1))} />
            </Box>

            {/* Answers — only for choice questions */}
            {['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(q.questionType) && (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <Typography variant="subtitle2" color="var(--color-text-sec)" mb={2} fontWeight={700}>
                  {t('quizzes.answers_label')}
                </Typography>
                {(q.questionType === 'TRUE_FALSE'
                  ? [{ content: t('quizzes.types.true'), isCorrect: q.answers[0]?.isCorrect }, { content: t('quizzes.types.false'), isCorrect: q.answers[1]?.isCorrect }]
                  : q.answers
                ).map((a, aIdx) => (
                  <Box key={aIdx} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
                    <Tooltip title="Correct Answer">
                        <Button
                        variant={a.isCorrect ? 'contained' : 'outlined'}
                        color={a.isCorrect ? 'success' : 'inherit'}
                        size="small" sx={{ minWidth: 44, height: 40, borderRadius: '8px' }}
                        onClick={() => setCorrectAnswer(qIdx, aIdx, q.questionType === 'SINGLE_CHOICE')}
                        >✓</Button>
                    </Tooltip>
                    <TextField
                      size="small" fullWidth
                      placeholder={t('quizzes.placeholder_answer', { count: aIdx + 1 })}
                      value={a.content}
                      disabled={q.questionType === 'TRUE_FALSE'}
                      onChange={e => updateAnswer(qIdx, aIdx, 'content', e.target.value)}
                    />
                    {q.questionType !== 'TRUE_FALSE' && (
                      <IconButton size="small" color="error" onClick={() => deleteAnswer(qIdx, aIdx)} sx={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {q.questionType !== 'TRUE_FALSE' && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => addAnswer(qIdx)} sx={{ mt: 1, fontWeight: 700 }}>
                    {t('quizzes.add_answer')}
                  </Button>
                )}
              </Box>
            )}

            {q.questionType === 'FILL_BLANK' && (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <TextField label={t('quizzes.types.correct_answer')} fullWidth size="small"
                    value={q.answers[0]?.content || ''}
                    onChange={e => updateAnswer(qIdx, 0, 'content', e.target.value)}
                    placeholder={t('quizzes.types.enter_correct')} />
              </Box>
            )}

            {q.questionType === 'SHORT_ANSWER' && (
              <Alert severity="info" sx={{ borderRadius: '10px' }}>
                {t('quizzes.short_answer_hint')}
              </Alert>
            )}

            {/* Explanation */}
            {q.questionType !== 'SHORT_ANSWER' && (
              <TextField label={t('quizzes.explanation_label')} fullWidth multiline rows={2}
                sx={{ mt: 3 }} size="small" value={q.explanation}
                onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)} />
            )}
          </AccordionDetails>
        </Accordion>
      ))}

        <Button variant="contained" startIcon={<SaveIcon />} size="large" sx={{ mt: 4, py: 2, borderRadius: '12px', fontWeight: 800, background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
          onClick={handleSave} disabled={saving} fullWidth>
          {saving ? <CircularProgress size={22} color="inherit" /> : (isEdit ? t('quizzes.update_btn') : t('quizzes.create_btn'))}
        </Button>
      </>)}

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '10px' }}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  )
}

export default QuizEditor
