import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, List, ListItemButton, ListItemIcon, ListItemText,
  Chip, LinearProgress, Button, Divider, CircularProgress, Alert,
  Accordion, AccordionSummary, AccordionDetails, Snackbar, Tooltip,
  useTheme, alpha, IconButton
} from '@mui/material'
import {
  PlayCircle as VideoIcon, Description as DocIcon, AttachFile as FileIcon,
  Code as EmbedIcon, CheckCircle as CheckIcon, Lock as LockIcon,
  ExpandMore as ExpandMoreIcon, Quiz as QuizIcon, ChevronLeft as BackIcon,
  EmojiEvents as TrophyIcon, Timer as TimerIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import courseService from '../../services/courseService'
import * as quizService from '../../services/quizService'

const CONTENT_ICONS = {
  VIDEO: <VideoIcon sx={{ color: '#6366F1' }} />,
  DOCUMENT: <DocIcon sx={{ color: '#10B981' }} />,
  FILE: <FileIcon sx={{ color: '#F59E0B' }} />,
  EMBED: <EmbedIcon sx={{ color: '#EC4899' }} />,
}

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

const GroupCourseDetail = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { groupId, courseId } = useParams()
  const navigate = useNavigate()
  
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [activeItem, setActiveItem] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'error' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const courseData = await courseService.getCourseById(groupId, courseId)
        setCourse(courseData)

        const [chapterList, enroll] = await Promise.all([
          courseService.getChapters(courseData.templateId),
          courseService.getMyEnrollment(courseId)
        ])
        
        setEnrollment(enroll)

        const withLessons = await Promise.all(
          chapterList.map(async (ch) => ({
            ...ch,
            lessons: await courseService.getLessons(ch.id).catch(() => [])
          }))
        )
        setChapters(withLessons)

        const firstLesson = withLessons[0]?.lessons?.[0]
        if (firstLesson) setActiveItem({ type: 'LESSON', ...firstLesson })
      } catch (err) {
        console.error('Load error:', err)
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
      setSnackbar({ open: true, msg: e.response?.data?.message || t('group_course_detail.enroll_failed'), severity: 'error' })
    }
  }

  const handleMarkComplete = async () => {
    if (!activeItem || activeItem.type !== 'LESSON' || !enrollment) return
    setCompleting(true)
    try {
      await courseService.markLessonComplete(activeItem.chapterId, activeItem.id)
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

  const renderContent = () => {
    if (!activeItem) return null
    
    if (activeItem.type === 'LESSON') {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={activeItem.contentType} 
                icon={CONTENT_ICONS[activeItem.contentType]}
                sx={{ borderRadius: '8px', fontWeight: 700, bgcolor: alpha('#6366F1', 0.1), color: '#6366F1' }} 
              />
              {enrollment && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={handleMarkComplete}
                  disabled={completing}
                  sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}
                >
                  {completing ? <CircularProgress size={20} color="inherit" /> : t('group_course_detail.mark_complete_btn')}
                </Button>
              )}
            </Box>
            <Typography variant="h3" fontWeight={900} sx={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', mb: 1 }}>
              {activeItem.title}
            </Typography>
            <Divider sx={{ mb: 4, borderColor: 'var(--color-border)' }} />
          </Box>

          <Box sx={{ color: 'var(--color-text)', lineHeight: 1.8 }}>
            {activeItem.contentType === 'VIDEO' ? (
              <Box sx={{ position: 'relative', pt: '56.25%', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--glass-shadow)' }}>
                <iframe
                  src={toEmbedUrl(activeItem.content)}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  frameBorder="0"
                  allowFullScreen
                />
              </Box>
            ) : activeItem.contentType === 'DOCUMENT' ? (
              <Box 
                className="ck-content"
                sx={{ 
                  '& img': { maxWidth: '100%', borderRadius: '16px' },
                  '& .iframe-container': { position: 'relative', pt: '56.25%', mb: 3, '& iframe': { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '16px' } }
                }}
                dangerouslySetInnerHTML={{ __html: processContent(activeItem.content) }}
              />
            ) : (
              <Box sx={{ p: 10, textAlign: 'center', bgcolor: 'var(--glass-bg)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                <FileIcon sx={{ fontSize: 64, color: '#F59E0B', mb: 2 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom>{activeItem.title}</Typography>
                <Button variant="contained" color="warning" href={activeItem.content} download sx={{ borderRadius: '12px', px: 4, mt: 2 }}>
                  {t('group_course_detail.download_file')}
                </Button>
              </Box>
            )}
          </Box>
        </motion.div>
      )
    }

    if (activeItem.type === 'QUIZ') {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Paper sx={{ 
            p: 6, borderRadius: '32px', 
            background: 'var(--glass-bg)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            textAlign: 'center'
          }}>
            <Box sx={{ 
              width: 100, height: 100, borderRadius: '30%', 
              bgcolor: alpha('#6366F1', 0.1), color: '#6366F1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 4
            }}>
              <QuizIcon sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h3" fontWeight={900} sx={{ mb: 2, fontFamily: 'var(--font-heading)' }}>{activeItem.title}</Typography>
            <Typography variant="body1" sx={{ color: 'var(--color-text-sec)', mb: 6, maxWidth: 600, mx: 'auto' }}>
              {activeItem.description || 'Bài đánh giá năng lực giúp bạn củng cố kiến thức đã học.'}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 6 }}>
              {[
                { icon: <TimerIcon />, label: 'Thời gian', value: `${activeItem.timeLimitSec / 60} phút` },
                { icon: <CheckIcon />, label: 'Điểm sàn', value: `${activeItem.passingScore}%` },
                { icon: <TrophyIcon />, label: 'Lượt làm', value: `${activeItem.maxAttempts} lần` }
              ].map((stat, i) => (
                <Grid item xs={4} key={i}>
                  <Box sx={{ p: 2, borderRadius: '16px', bgcolor: alpha('#FFF', 0.03) }}>
                    <Box sx={{ color: '#6366F1', mb: 1 }}>{stat.icon}</Box>
                    <Typography variant="h6" fontWeight={800}>{stat.value}</Typography>
                    <Typography variant="caption" color="var(--color-text-muted)">{stat.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {enrollment ? (
              <Button 
                variant="contained" size="large" 
                onClick={() => handleStartQuiz(activeItem.id)}
                sx={{ 
                  py: 2, px: 8, borderRadius: '16px', fontSize: '1.2rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  boxShadow: '0 10px 30px rgba(99,102,241,0.4)',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                Bắt đầu làm bài
              </Button>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: '16px' }}>
                Vui lòng tham gia khóa học để thực hiện bài kiểm tra này.
              </Alert>
            )}
          </Paper>
        </motion.div>
      )
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>
  if (!course) return (
    <Box sx={{ p: 4, maxWidth: 640, mx: 'auto', textAlign: 'center' }}>
      <Alert severity="error" sx={{ borderRadius: '16px', mb: 4 }}>
        Không thể tải thông tin khóa học hoặc khóa học hiện không khả dụng.
      </Alert>
      <Button variant="contained" onClick={() => navigate(-1)} startIcon={<BackIcon />} sx={{ borderRadius: '12px' }}>
        Quay lại
      </Button>
    </Box>
  )

  if (course.status !== 'PUBLISHED' && !enrollment?.isInstructor) {
     // This part is mostly handled by the backend error but good for safety
  }
 
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 84px)', overflow: 'hidden' }}>
      {/* Dynamic Sidebar */}
      <Box className="premium-glass" sx={{ 
        width: isSidebarOpen ? 360 : 0, 
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        borderRight: '1px solid var(--glass-border)',
      }}>
        <Box sx={{ p: 3, borderBottom: '1px solid var(--color-border)' }}>
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => navigate(`/groups/${groupId}`)}
            sx={{ mb: 2, color: 'var(--color-text-sec)', fontSize: '0.75rem', fontWeight: 700 }}
          >
            Quay lại nhóm
          </Button>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 2, fontFamily: 'var(--font-heading)' }}>{course.title}</Typography>
          {enrollment ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" fontWeight={700} color="var(--color-text-muted)">Tiến độ học tập</Typography>
                <Typography variant="caption" fontWeight={900} color="#6366F1">{enrollment.progressPercent}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" value={enrollment.progressPercent} 
                sx={{ borderRadius: 10, height: 8, bgcolor: alpha('#6366F1', 0.1), '& .MuiLinearProgress-bar': { borderRadius: 10, bgcolor: '#6366F1' } }} 
              />
            </Box>
          ) : (
            <Button variant="contained" fullWidth onClick={handleEnroll} sx={{ borderRadius: '12px', fontWeight: 700 }}>
              Tham gia học ngay
            </Button>
          )}
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
          {chapters.map((ch, i) => (
            <Accordion key={ch.id} defaultExpanded={i === 0} sx={{ bgcolor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight={800}>Phần {i + 1}: {ch.title}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense disablePadding>
                  {ch.lessons.map(lesson => (
                    <ListItemButton 
                      key={lesson.id} 
                      selected={activeItem?.id === lesson.id}
                      onClick={() => setActiveItem({ type: 'LESSON', ...lesson, chapterId: ch.id })}
                      sx={{ mx: 1, borderRadius: '12px', my: 0.5, '&.Mui-selected': { bgcolor: alpha('#6366F1', 0.1), '&:hover': { bgcolor: alpha('#6366F1', 0.15) } } }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>{CONTENT_ICONS[lesson.contentType]}</ListItemIcon>
                      <ListItemText primary={lesson.title} primaryTypographyProps={{ fontWeight: 600, noWrap: true }} />
                      {lesson.completed && <CheckIcon color="success" sx={{ fontSize: 16 }} />}
                    </ListItemButton>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, bgcolor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)' }}>
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} sx={{ mr: 2 }}>
            <BackIcon sx={{ transform: isSidebarOpen ? 'none' : 'rotate(180deg)', transition: '0.3s' }} />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700}>{activeItem?.title}</Typography>
        </Box>
        <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
          <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', fontWeight: 600 }}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  )
}

export default GroupCourseDetail
