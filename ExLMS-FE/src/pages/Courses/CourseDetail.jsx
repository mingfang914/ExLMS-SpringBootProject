import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, List, ListItem, ListItemButton,
  Alert, Breadcrumbs, LinearProgress, IconButton, Tooltip, Skeleton, Button, Divider
} from '@mui/material'
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import courseService from '../../services/courseService'

// ── SVG Icons ─────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
  </svg>
)
const DocIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)
const QuizIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const CircleIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
  </svg>
)
const FullscreenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
)
const FullscreenExitIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
)
const PlaySmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
  </svg>
)

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
  let processed = html.replace(/<oembed url="([^"]+)"><\/oembed>/g, (match, url) => {
    const embedUrl = toEmbedUrl(url)
    if (embedUrl) {
      return `<div class="iframe-container"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`
    }
    return match
  })
  return processed
}

const CourseDetail = () => {
  const { t } = useTranslation()
  const { groupId, id: courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [courseData, chapterList, quizList] = await Promise.all([
          courseService.getCourseById(groupId, courseId),
          courseService.getChapters(courseId),
          courseService.getQuizzesByCourseId(courseId),
        ])
        setCourse(courseData)
        setQuizzes(quizList)

        const withLessons = await Promise.all(
          chapterList.map(async (ch) => ({
            ...ch,
            lessons: await courseService.getLessons(ch.id).catch(() => []),
          }))
        )
        setChapters(withLessons)

        const firstLesson = withLessons[0]?.lessons?.[0]
        if (firstLesson) setSelectedItem({ type: 'LESSON', ...firstLesson })
        else if (quizList[0]) setSelectedItem({ type: 'QUIZ', ...quizList[0] })
      } catch {
        setError(t('course_detail.errors.load_failed'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId, courseId])

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: '10px', bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
        {error}
      </Alert>
    )
  }

  const totalLessons = chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0)
  const completedLessons = chapters.reduce((acc, ch) => acc + (ch.lessons?.filter(l => l.completed)?.length || 0), 0)
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{ height: focusMode ? 'calc(100vh - 80px)' : 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}
    >
      {/* ── Breadcrumbs ────────────────────────────────────────── */}
      {!focusMode && (
        <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Box component={RouterLink} to="/groups" sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textDecoration: 'none', '&:hover': { color: 'var(--color-text)' } }}>
            {t('common.groups')}
          </Box>
          <Box sx={{ color: 'var(--color-border-lt)', fontSize: '0.875rem' }}>/</Box>
          <Box component={RouterLink} to={`/groups/${groupId}`} sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textDecoration: 'none', '&:hover': { color: 'var(--color-text)' } }}>
            {loading ? <Skeleton width={80} sx={{ bgcolor: 'rgba(33,38,45,0.8)', display: 'inline-block' }} /> : (course?.groupName || t('common.group'))}
          </Box>
          <Box sx={{ color: 'var(--color-border-lt)', fontSize: '0.875rem' }}>/</Box>
          <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-sec)', fontWeight: 600 }}>
            {loading ? <Skeleton width={120} sx={{ bgcolor: 'rgba(33,38,45,0.8)', display: 'inline-block' }} /> : course?.title}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2.5} sx={{ flex: 1 }}>
        {/* ── Main content viewer ─────────────────────────────── */}
        <Grid item xs={12} md={focusMode ? 12 : 8} sx={{ transition: 'all 0.4s ease' }}>
          <Box
            className="premium-glass"
            sx={{
              borderRadius: focusMode ? 0 : '14px',
              overflow: 'hidden',
              height: '100%',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Content area */}
            <Box
              sx={{
                flex: 1,
                bgcolor: '#060A0F',
                aspectRatio: focusMode ? 'auto' : '16/9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 70%)',
              }}
            >
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'rgba(33,38,45,0.5)' }} />
              ) : selectedItem ? (
                <>
                  {selectedItem.type === 'QUIZ' ? (
                    <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                      <Box sx={{ mb: 2.5, color: '#818CF8', opacity: 0.8 }}><QuizIcon /></Box>
                      <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-text)', mb: 1 }}>
                        {selectedItem.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', mb: 3 }}>
                        {t('course_detail.quiz_ready')}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/groups/${groupId}/courses/${courseId}/quiz/${selectedItem.id}/take`)}
                        sx={{
                          px: 4, height: 42, borderRadius: '10px', fontWeight: 700,
                          background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                          cursor: 'pointer',
                          '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)', boxShadow: '0 6px 18px rgba(99,102,241,0.4)', transform: 'translateY(-1px)' },
                          transition: 'all 0.2s',
                        }}
                      >
                        {t('course_detail.start_quiz')}
                      </Button>
                    </Box>
                  ) : selectedItem.contentType === 'VIDEO' ? (
                    <Box sx={{ position: 'relative', width: '100%', height: '100%', borderRadius: focusMode ? 0 : '14px 14px 0 0', overflow: 'hidden' }}>
                      <iframe
                        src={toEmbedUrl(selectedItem.content)}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        frameBorder="0"
                        allowFullScreen
                      />
                    </Box>
                  ) : selectedItem.contentType === 'DOCUMENT' ? (
                    <Box
                      className="ck-content"
                      sx={{
                        width: '100%', height: '100%', overflowY: 'auto', p: 4, bgcolor: 'var(--color-surface)', color: 'var(--color-text)',
                        '& img': { maxWidth: '100%', borderRadius: '16px' },
                        '& .iframe-container': { position: 'relative', pt: '56.25%', mb: 3, '& iframe': { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '16px' } }
                      }}
                      dangerouslySetInnerHTML={{ __html: processContent(selectedItem.content) }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
                      <Box sx={{ mb: 2 }}><DocIcon /></Box>
                      <Button variant="contained" href={selectedItem.content} download sx={{ borderRadius: '12px' }}>
                        Tải tệp xuống
                      </Button>
                    </Box>
                  )}

                  {/* Focus mode exit button */}
                  {focusMode && (
                    <IconButton
                      onClick={() => setFocusMode(false)}
                      sx={{
                        position: 'absolute', top: 16, right: 16,
                        bgcolor: 'rgba(13,17,23,0.8)', color: 'white',
                        border: '1px solid var(--color-border)', cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(33,38,45,0.9)' },
                      }}
                    >
                      <FullscreenExitIcon />
                    </IconButton>
                  )}
                </>
              ) : (
                <Typography sx={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  {t('course_detail.select_to_begin')}
                </Typography>
              )}
            </Box>

            {/* Lesson info */}
            {!focusMode && selectedItem && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-text)', flex: 1 }}>
                    {selectedItem.title}
                  </Typography>
                  <Tooltip title={t('course_detail.focus_mode')}>
                    <IconButton
                      onClick={() => setFocusMode(true)}
                      sx={{ color: 'var(--color-text-muted)', cursor: 'pointer', '&:hover': { color: 'var(--color-primary-lt)', bgcolor: 'rgba(99,102,241,0.08)' }, borderRadius: '8px' }}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {selectedItem.description || t('course_detail.no_desc')}
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* ── Sidebar: course outline ──────────────────────────── */}
        {!focusMode && (
          <Grid item xs={12} md={4}>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                style={{ height: '100%' }}
              >
                <Box
                  className="premium-glass glow-on-hover"
                  sx={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      px: 2.5, py: 2,
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.06))',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)', mb: 1.5 }}>
                      {t('course_detail.content')}
                    </Typography>

                    {/* Progress */}
                    {!loading && totalLessons > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {t('course_detail.lessons_count', { count: completedLessons, total: totalLessons })}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#818CF8' }}>
                            {progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          className="progress-gradient"
                          sx={{ height: 5, borderRadius: 99, bgcolor: 'rgba(33,38,45,0.8)' }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Lessons list */}
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                    {loading ? (
                      <Box sx={{ p: 2 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <Skeleton key={i} height={36} sx={{ mb: 1, bgcolor: 'rgba(33,38,45,0.8)', borderRadius: '8px' }} />
                        ))}
                      </Box>
                    ) : (
                      <>
                        {chapters.map((ch) => (
                          <Box key={ch.id} sx={{ mb: 0.5 }}>
                            {/* Chapter heading */}
                            <Typography sx={{
                              px: 1.5, py: 1.25,
                              fontSize: '0.75rem', fontWeight: 700,
                              color: 'var(--color-primary-lt)',
                              letterSpacing: '0.06em', textTransform: 'uppercase',
                            }}>
                              {ch.title}
                            </Typography>

                            {/* Lessons */}
                            {(ch.lessons || []).map((lesson) => {
                              const active = selectedItem?.id === lesson.id && selectedItem?.type === 'LESSON'
                              return (
                                <Box
                                  key={lesson.id}
                                  onClick={() => setSelectedItem({ type: 'LESSON', ...lesson })}
                                  sx={{
                                    display: 'flex', alignItems: 'center', gap: 1.5,
                                    px: 1.5, py: 1,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    bgcolor: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                                    mb: 0.25,
                                    transition: 'all 0.15s',
                                    '&:hover': { bgcolor: active ? 'rgba(99,102,241,0.15)' : 'rgba(240,246,252,0.03)' },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      bgcolor: lesson.completed ? 'rgba(34,197,94,0.15)' : 'rgba(33,38,45,0.8)',
                                      border: `1px solid ${lesson.completed ? 'rgba(34,197,94,0.4)' : 'var(--color-border)'}`,
                                      color: lesson.completed ? '#22C55E' : 'var(--color-text-muted)',
                                    }}
                                  >
                                    {lesson.completed ? <CheckIcon /> : <CircleIcon />}
                                  </Box>
                                  <Typography sx={{
                                    fontSize: '0.8125rem',
                                    fontWeight: active ? 600 : 400,
                                    color: active ? 'var(--color-text)' : 'var(--color-text-sec)',
                                    lineHeight: 1.4,
                                    flex: 1,
                                  }} className="clamp-2">
                                    {lesson.title}
                                  </Typography>
                                  <Box sx={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                    <PlaySmall />
                                  </Box>
                                </Box>
                              )
                            })}

                            {/* Chapter quizzes */}
                            {quizzes.filter(q => q.chapterId === ch.id).map(quiz => {
                              const active = selectedItem?.id === quiz.id && selectedItem?.type === 'QUIZ'
                              return (
                                <Box
                                  key={quiz.id}
                                  onClick={() => setSelectedItem({ type: 'QUIZ', ...quiz })}
                                  sx={{
                                    display: 'flex', alignItems: 'center', gap: 1.5,
                                    px: 1.5, py: 1, borderRadius: '8px', cursor: 'pointer',
                                    bgcolor: active ? 'rgba(34,211,238,0.08)' : 'transparent',
                                    border: `1px solid ${active ? 'rgba(34,211,238,0.25)' : 'transparent'}`,
                                    mb: 0.25, transition: 'all 0.15s',
                                    '&:hover': { bgcolor: 'rgba(34,211,238,0.05)' },
                                  }}
                                >
                                  <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#67E8F9' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                    </svg>
                                  </Box>
                                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: active ? '#67E8F9' : 'var(--color-text-sec)', flex: 1 }} className="truncate">
                                    {quiz.title}
                                  </Typography>
                                </Box>
                              )
                            })}

                            <Divider sx={{ borderColor: 'rgba(48,54,61,0.4)', mx: 1, mt: 0.5, mb: 0.5 }} />
                          </Box>
                        ))}

                        {/* Standalone quizzes (no chapterId) */}
                        {quizzes.filter(q => !q.chapterId).map(quiz => {
                          const active = selectedItem?.id === quiz.id && selectedItem?.type === 'QUIZ'
                          return (
                            <Box
                              key={quiz.id}
                              onClick={() => setSelectedItem({ type: 'QUIZ', ...quiz })}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                px: 1.5, py: 1, borderRadius: '8px', cursor: 'pointer',
                                bgcolor: active ? 'rgba(34,211,238,0.08)' : 'transparent',
                                border: `1px solid ${active ? 'rgba(34,211,238,0.25)' : 'transparent'}`,
                                mb: 0.25, transition: 'all 0.15s',
                                '&:hover': { bgcolor: 'rgba(34,211,238,0.05)' },
                              }}
                            >
                              <Box sx={{ color: '#67E8F9', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                              </Box>
                              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: active ? '#67E8F9' : 'var(--color-text-sec)', flex: 1 }} className="truncate">
                                {quiz.title}
                              </Typography>
                            </Box>
                          )
                        })}
                      </>
                    )}
                  </Box>
                </Box>
              </motion.div>
            </AnimatePresence>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default CourseDetail
