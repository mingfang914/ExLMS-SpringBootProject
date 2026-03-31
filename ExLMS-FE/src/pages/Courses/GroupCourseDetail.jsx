import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, List, ListItemButton, ListItemIcon, ListItemText,
  Chip, LinearProgress, Button, Divider, CircularProgress, Alert,
  Accordion, AccordionSummary, AccordionDetails, Snackbar, Tooltip
} from '@mui/material'
import {
  PlayCircle as VideoIcon, Description as DocIcon, AttachFile as FileIcon,
  Code as EmbedIcon, CheckCircle as CheckIcon, Lock as LockIcon,
  ExpandMore as ExpandMoreIcon, Quiz as QuizIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import courseService from '../../services/courseService'

const CONTENT_ICONS = {
  VIDEO: <VideoIcon color="primary" />,
  DOCUMENT: <DocIcon color="success" />,
  FILE: <FileIcon color="warning" />,
  EMBED: <EmbedIcon color="secondary" />,
}

/**
 * Convert a YouTube/Vimeo URL to an embeddable iframe src
 */
const toEmbedUrl = (url) => {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url 
}

const processContent = (html) => {
  if (!html) return ''
  // Replace <oembed url="..."> with iframe for YouTube/Vimeo
  let processed = html.replace(/<oembed url="([^"]+)"><\/oembed>/g, (match, url) => {
    const embedUrl = toEmbedUrl(url)
    if (embedUrl) {
      return `<div class="iframe-container"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`
    }
    return match
  })
  return processed
}

const GroupCourseDetail = () => {
  const { t } = useTranslation()
  const { groupId, courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [activeItem, setActiveItem] = useState(null) // Can be lesson or quiz
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'error' })
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [courseData, chapterList, quizList] = await Promise.all([
          courseService.getCourseById(groupId, courseId),
          courseService.getChapters(courseId),
          courseService.getQuizzesByCourseId(courseId)
        ])
        setCourse(courseData)
        setQuizzes(quizList)

        const withLessons = await Promise.all(
          chapterList.map(async (ch) => ({
            ...ch,
            lessons: await courseService.getLessons(ch.id).catch(() => [])
          }))
        )
        setChapters(withLessons)

        // First item selected by default
        const firstLesson = withLessons[0]?.lessons?.[0]
        if (firstLesson) setActiveItem({ type: 'LESSON', ...firstLesson })
        else if (quizList[0]) setActiveItem({ type: 'QUIZ', ...quizList[0] })

        // Try to get enrollment (returns null if not enrolled)
        const enroll = await courseService.getMyEnrollment(courseId)
        setEnrollment(enroll)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, groupId])

  const handleEnroll = async () => {
    try {
      const enroll = await courseService.enrollCourse(courseId)
      setEnrollment(enroll)
      setSnackbar({ open: true, msg: t('group_course_detail.enroll_success'), severity: 'success' })
    } catch (e) {
      const msg = e.response?.data?.message || t('group_course_detail.enroll_failed')
      setSnackbar({ open: true, msg, severity: 'error' })
    }
  }

  const handleMarkComplete = async () => {
    if (!activeItem || activeItem.type !== 'LESSON' || !enrollment) return
    setCompleting(true)
    try {
      await courseService.markLessonComplete(activeItem.chapter?.id || activeItem.chapterId, activeItem.id)
      // Refresh enrollment progress
      const updated = await courseService.getMyEnrollment(courseId)
      setEnrollment(updated)
    } catch (e) {
      setSnackbar({ open: true, msg: e.response?.data?.message || t('group_course_detail.mark_complete_failed'), severity: 'error' })
    } finally {
      setCompleting(false)
    }
  }

  const handleStartQuiz = (quizId) => {
    navigate(`/groups/${groupId}/courses/${courseId}/quiz/${quizId}/take`)
  }

  const renderLessonContent = (lesson) => {
    if (!lesson) return null
    switch (lesson.contentType) {
      case 'VIDEO': {
        const embedSrc = toEmbedUrl(lesson.content)
        if (embedSrc) {
          return (
            <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <iframe
                src={embedSrc}
                title={lesson.title}
                frameBorder="0"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </Box>
          )
        }
        return (
          <video controls style={{ width: '100%', borderRadius: 12 }}>
            <source src={lesson.content} />
            Your browser does not support video.
          </video>
        )
      }
      case 'DOCUMENT':
        return (
          <Box className="ck-content" sx={{ 
            p: 2,
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 3 },
            '& .iframe-container': {
              position: 'relative',
              paddingTop: '56.25%',
              mb: 3,
              '& iframe': {
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                borderRadius: 3
              }
            }
          }}
            dangerouslySetInnerHTML={{ __html: processContent(lesson.content) }}
          />
        )
      case 'FILE':
        return (
          <Box sx={{ p: 6, textAlign: 'center', bgcolor: 'var(--color-surface-2)', borderRadius: 4, border: '1px dashed var(--color-border)' }}>
            <FileIcon sx={{ fontSize: 80, color: 'warning.main', mb: 3 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>{lesson.title}</Typography>
            <Button variant="contained" color="warning" sx={{ mt: 2, borderRadius: '10px', px: 4, fontWeight: 700 }} href={lesson.content} download>
              {t('group_course_detail.download_file')}
            </Button>
          </Box>
        )
      default:
        return <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>{t('group_course_detail.no_content')}</Typography>
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (!course) return <Alert severity="error" sx={{ mx: 2, mt: 2 }}>{t('group_course_detail.not_found')}</Alert>

  return (
    <>
      <Box sx={{ display: 'flex', gap: 3, p: 3, height: 'calc(100vh - 84px)' }}>
      {/* ── Sidebar: Chapters + Lessons ── */}
      <Paper elevation={0} sx={{ width: 340, flexShrink: 0, overflowY: 'auto', borderRadius: 4, p: 1, border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)', color: 'var(--color-text)' }}>
        <Box sx={{ p: 2.5, mb: 1, borderBottom: '1px solid var(--color-border)' }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1, fontFamily: 'var(--font-heading)' }}>{course.title}</Typography>
          {enrollment ? (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" fontWeight={600} color="var(--color-text-muted)">
                    {t('group_course_detail.progress', { percent: enrollment.progressPercent || 0 })}
                </Typography>
                <Typography variant="caption" fontWeight={700} color="var(--color-primary-lt)">
                    {enrollment.progressPercent || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={enrollment.progressPercent || 0}
                sx={{ borderRadius: 2, height: 8, bgcolor: 'rgba(99,102,241,0.1)', '& .MuiLinearProgress-bar': { borderRadius: 2, background: 'linear-gradient(90deg, #6366F1, #818CF8)' } }}
              />
            </Box>
          ) : (
            <Button variant="contained" fullWidth sx={{ mt: 1.5, borderRadius: '10px', fontWeight: 700, background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }} onClick={handleEnroll}>
              {t('group_course_detail.enroll_btn')}
            </Button>
          )}
        </Box>

        {chapters.map((ch, idx) => (
          <Accordion key={ch.id} defaultExpanded={idx === 0}
            sx={{ boxShadow: 'none', bgcolor: 'transparent', color: 'inherit', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-text-muted)' }} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { my: 1.5 } }}>
              <Typography variant="subtitle2" fontWeight={800}>
                {t('group_course_detail.chapter_title', { idx: idx + 1, title: ch.title })}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pb: 1 }}>
              <List dense disablePadding>
                {(ch.lessons || []).map((lesson) => (
                  <ListItemButton
                    key={lesson.id}
                    selected={activeItem?.type === 'LESSON' && activeItem?.id === lesson.id}
                    onClick={() => setActiveItem({ type: 'LESSON', ...lesson, chapterId: ch.id })}
                    sx={{ 
                        mx: 1, my: 0.5, borderRadius: 2, 
                        '&.Mui-selected': { bgcolor: 'rgba(99,102,241,0.08)', borderLeft: '4px solid #6366F1' },
                        '&:hover': { bgcolor: 'rgba(99,102,241,0.04)' }
                    }}>
                    <ListItemIcon sx={{ minWidth: 36, color: 'var(--color-text-sec)' }}>
                      {CONTENT_ICONS[lesson.contentType] || <DocIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={lesson.title}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600, noWrap: true }}
                    />
                    {lesson.completed && <CheckIcon fontSize="small" color="success" />}
                  </ListItemButton>
                ))}
                {/* Quizzes in this chapter */}
                {quizzes.filter(q => q.chapterId === ch.id).map(quiz => (
                  <ListItemButton
                    key={quiz.id}
                    selected={activeItem?.type === 'QUIZ' && activeItem?.id === quiz.id}
                    onClick={() => setActiveItem({ type: 'QUIZ', ...quiz })}
                    sx={{ 
                        mx: 1, my: 0.5, borderRadius: 2,
                        '&.Mui-selected': { bgcolor: 'rgba(99,102,241,0.08)', borderLeft: '4px solid #6366F1' }
                    }}>
                    <ListItemIcon sx={{ minWidth: 36 }}><QuizIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText
                      primary={`[Quiz] ${quiz.title}`}
                      primaryTypographyProps={{ variant: 'body2', noWrap: true, color: 'var(--color-primary-lt)', fontWeight: 600 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Top-level Quizzes */}
        <List dense sx={{ px: 1, mt: 1, borderTop: '1px solid var(--color-border)' }}>
          {quizzes.filter(q => !q.chapterId).map(quiz => (
            <ListItemButton
              key={quiz.id}
              selected={activeItem?.type === 'QUIZ' && activeItem?.id === quiz.id}
              onClick={() => setActiveItem({ type: 'QUIZ', ...quiz })}
              sx={{ my: 0.5, borderRadius: 2, '&.Mui-selected': { bgcolor: 'rgba(99,102,241,0.08)', borderLeft: '4px solid #6366F1' } }}>
              <ListItemIcon sx={{ minWidth: 36 }}><QuizIcon fontSize="small" color="primary" /></ListItemIcon>
              <ListItemText
                primary={`${t('quizzes.quiz_label') || '[Quiz]'}: ${quiz.title}`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 700, color: 'var(--color-primary-lt)' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* ── Main Content Area ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
        {activeItem?.type === 'LESSON' ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)', color: 'var(--color-text)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Chip
                  icon={CONTENT_ICONS[activeItem.contentType]}
                  label={activeItem.contentType}
                  size="small"
                  sx={{ mb: 1.5, fontWeight: 700, borderRadius: 1.5, textTransform: 'capitalize' }}
                />
                <Typography variant="h4" fontWeight={800} sx={{ fontFamily: 'var(--font-heading)' }}>{activeItem.title}</Typography>
              </Box>
              {enrollment && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={handleMarkComplete}
                  disabled={completing}
                  sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
                >
                  {completing ? <CircularProgress size={18} color="inherit" /> : t('group_course_detail.mark_complete_btn')}
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 4, borderColor: 'var(--color-border)' }} />

            {renderLessonContent(activeItem)}
          </Paper>
        ) : activeItem?.type === 'QUIZ' ? (
          <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)', color: 'var(--color-text)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: 'rgba(99,102,241,0.1)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QuizIcon sx={{ fontSize: 40 }} />
              </Box>
              <Box>
                <Typography variant="overline" fontWeight={800} color="var(--color-text-muted)" sx={{ letterSpacing: 1.5 }}>
                    {t('quizzes.quiz_label') || 'QUIZ'}
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ fontFamily: 'var(--font-heading)' }}>{activeItem.title}</Typography>
              </Box>
            </Box>

            {activeItem.description && (
              <Typography variant="body1" sx={{ mb: 4, color: 'var(--color-text-sec)', lineHeight: 1.7 }}>
                {activeItem.description}
              </Typography>
            )}

            {/* Quiz Stats */}
            <Box sx={{ display: 'flex', gap: 3, mb: 5 }}>
              {[
                { label: t('quizzes.form.time_limit'), value: activeItem.timeLimitSec ? `${Math.floor(activeItem.timeLimitSec / 60)} min` : t('common.no_limit') },
                { label: t('course_editor.quiz_desc', { count: activeItem.maxAttempts }).split('•')[1]?.trim() || 'Attempts', value: activeItem.maxAttempts ?? '∞' },
                { label: t('quizzes.form.passing_score'), value: `${activeItem.passingScore ?? 50}%` },
              ].map(stat => (
                <Paper key={stat.label} elevation={0} sx={{ p: 3, flex: 1, textAlign: 'center', borderRadius: 3, bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <Typography variant="h5" fontWeight={800} color="var(--color-primary-lt)" sx={{ mb: 0.5 }}>{stat.value}</Typography>
                  <Typography variant="caption" fontWeight={700} color="var(--color-text-muted)" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</Typography>
                </Paper>
              ))}
            </Box>

            {!enrollment ? (
              <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'rgba(239,68,68,0.05)', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)' }}>
                <Typography sx={{ mb: 3, color: 'var(--color-text)', display: 'block' }} dangerouslySetInnerHTML={{ __html: t('group_course_detail.quiz_requirement') }} />
                <Button variant="contained" fullWidth size="large" onClick={handleEnroll} sx={{ py: 2, borderRadius: '12px', fontWeight: 800, background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                  {t('group_course_detail.enroll_to_take')}
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => handleStartQuiz(activeItem.id)}
                sx={{ py: 2.5, fontSize: '1.2rem', fontWeight: 800, borderRadius: 3, background: 'linear-gradient(135deg, #6366F1, #4F46E5)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' } }}
              >
                {t('group_course_detail.take_quiz')}
              </Button>
            )}
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 4, border: '1px dashed var(--color-border)', bgcolor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
            <Box sx={{ mb: 3, opacity: 0.5 }}>
                <DocIcon sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {t('group_course_detail.lessons_list_placeholder')}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
    <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
      <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ borderRadius: '10px', fontWeight: 600 }}>{snackbar.msg}</Alert>
    </Snackbar>
  </>
  )
}

export default GroupCourseDetail
