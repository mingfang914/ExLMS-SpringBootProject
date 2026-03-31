import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, TextField, Button, Paper, Select, MenuItem,
  FormControl, InputLabel, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Chip, Divider, Alert, CircularProgress, Snackbar
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon, Add as AddIcon, Delete as DeleteIcon,
  DragIndicator as DragIcon, Save as SaveIcon, VideoLibrary as VideoIcon,
  Description as DocIcon, AttachFile as FileIcon, Code as EmbedIcon,
  Quiz as QuizIcon, Edit as EditIcon, BarChart as BarChartIcon
} from '@mui/icons-material'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import courseService from '../../services/courseService'

const CONTENT_TYPES = [
  { value: 'DOCUMENT', label: 'Document', icon: <DocIcon /> },
]

// Custom Upload Adapter for CKEditor
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('upload', file);
      const token = localStorage.getItem('token');
      fetch('/api/cke/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
        .then(res => res.json())
        .then(res => {
          if (res.uploaded) resolve({ default: res.url });
          else reject(res.error?.message || 'Upload failed');
        })
        .catch(err => reject(err));
    }));
  }
  abort() { }
} function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

const CKEditorWrapper = ({ value, onChange, lessonId }) => {
  const { t } = useTranslation()
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let editorInstance = null;
    let isMounted = true;
    const initEditor = async () => {
      if (!containerRef.current || editorRef.current) return;

      if (!window.ClassicEditor) {
        let attempts = 0;
        while (!window.ClassicEditor && attempts < 100) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
      }

      if (!isMounted) return;

      if (window.ClassicEditor && containerRef.current) {
        try {
          editorInstance = await window.ClassicEditor.create(containerRef.current, {
            extraPlugins: [MyCustomUploadAdapterPlugin],
            placeholder: t('course_editor.editor_placeholder'),
          });

          if (!isMounted) {
            editorInstance.destroy();
            return;
          }

          editorRef.current = editorInstance;
          editorInstance.setData(value || '');
          setIsReady(true);

          editorInstance.model.document.on('change:data', () => {
            const data = editorInstance.getData();
            onChange(data);
          });
        } catch (err) {
          console.error(`[CKEditor] Lesson ${lessonId} initialization failed:`, err);
        }
      }
    };

    initEditor();

    return () => {
      isMounted = false;
      if (editorRef.current) {
        editorRef.current.destroy()
          .then(() => {
            editorRef.current = null;
          })
          .catch(err => console.error('Error destroying editor:', err));
      }
    };
  }, [lessonId, t]);

  return (
    <Box sx={{
      mt: 1,
      minHeight: '300px',
      border: isReady ? 'none' : '1px dashed var(--color-border)',
      borderRadius: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {!isReady && (
        <Box sx={{ p: 2, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <CircularProgress size={24} sx={{ mb: 1 }} /><br />
          {t('course_editor.loading_editor')}
        </Box>
      )}
      <Box sx={{ '& .ck-editor__editable': { minHeight: '300px' } }}>
        <div ref={containerRef} />
      </Box>
    </Box>
  );
};

const CourseEditor = () => {
  const { t } = useTranslation()
  const { groupId, courseId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(courseId)

  const [course, setCourse] = useState({ title: '', description: '', status: 'DRAFT', startDate: '', endDate: '' })
  const [chapters, setChapters] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' })
  const [expandedChapter, setExpandedChapter] = useState(null)

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        try {
          const data = await courseService.getCourseById(groupId, courseId)
          setCourse({
            title: data.title,
            description: data.description || '',
            status: data.status,
            startDate: data.startDate ? data.startDate.split('T')[0] : '',
            endDate: data.endDate ? data.endDate.split('T')[0] : ''
          })
          const [chapterList, quizList] = await Promise.all([
            courseService.getChapters(courseId),
            courseService.getQuizzesByCourseId(courseId)
          ])
          
          setQuizzes(quizList)

          const chapterWithLessons = await Promise.all(
            chapterList.map(async (ch) => ({
              ...ch,
              lessons: await courseService.getLessons(ch.id).catch(() => [])
            }))
          )
          setChapters(chapterWithLessons)
        } finally {
          setLoading(false)
        }
      }
      load()
    }
  }, [courseId, groupId, isEdit])

  const showSnack = (msg, severity = 'success') =>
    setSnackbar({ open: true, msg, severity })

  // ──────────── Course ────────────
  const handleSaveCourse = async () => {
    setSaving(true)
    try {
      let savedCourse
      if (isEdit) {
        savedCourse = await courseService.updateCourse(groupId, courseId, course)
      } else {
        savedCourse = await courseService.createCourse(groupId, course)
        navigate(`/groups/${groupId}/courses/${savedCourse.id}/edit`, { replace: true })
      }
      showSnack(t('course_editor.messages.course_saved'))
    } catch (e) {
      showSnack(e.response?.data?.message || t('course_editor.errors.save_course_failed'), 'error')
    } finally {
      setSaving(false)
    }
  }

  // ──────────── Chapters ────────────
  const handleAddChapter = async () => {
    if (!courseId) { showSnack(t('course_editor.messages.save_course_before_chapter'), 'warning'); return }
    try {
      const ch = await courseService.createChapter(courseId, { title: t('course_editor.chapter_new_title'), description: '' })
      setChapters(prev => [...prev, { ...ch, lessons: [] }])
      setExpandedChapter(ch.id)
    } catch (e) {
      showSnack(t('course_editor.errors.create_chapter_failed'), 'error')
    }
  }

  const handleDeleteChapter = async (chapterId) => {
    try {
      await courseService.deleteChapter(courseId, chapterId)
      setChapters(prev => prev.filter(c => c.id !== chapterId))
      showSnack(t('course_editor.messages.chapter_deleted'))
    } catch (e) {
      showSnack(t('course_editor.errors.delete_chapter_failed'), 'error')
    }
  }

  const handleSaveChapter = async (ch) => {
    try {
      await courseService.updateChapter(courseId, ch.id, { title: ch.title, description: ch.description })
      showSnack(t('course_editor.messages.chapter_saved'))
    } catch (e) {
      showSnack(t('course_editor.errors.save_chapter_failed'), 'error')
    }
  }

  const updateChapterField = (chapterId, field, value) =>
    setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, [field]: value } : c))

  // ──────────── Lessons ────────────
  const handleAddLesson = async (chapterId) => {
    try {
      const lesson = await courseService.createLesson(chapterId, {
        title: t('course_editor.lesson_new_title'),
        contentType: 'DOCUMENT',
        content: '',
      })
      setChapters(prev => prev.map(c =>
        c.id === chapterId ? { ...c, lessons: [...(c.lessons || []), lesson] } : c))
    } catch (e) {
      showSnack(t('course_editor.errors.create_lesson_failed'), 'error')
    }
  }

  const handleDeleteLesson = async (chapterId, lessonId) => {
    try {
      await courseService.deleteLesson(chapterId, lessonId)
      setChapters(prev => prev.map(c =>
        c.id === chapterId ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c))
      showSnack(t('course_editor.messages.lesson_deleted'))
    } catch (e) {
      showSnack(t('course_editor.errors.delete_lesson_failed'), 'error')
    }
  }

  const handleSaveLesson = async (chapterId, lesson) => {
    try {
      await courseService.updateLesson(chapterId, lesson.id, {
        title: lesson.title,
        content: lesson.content,
        contentType: 'DOCUMENT',
      })
      showSnack(t('course_editor.messages.lesson_saved'))
    } catch (e) {
      showSnack(t('course_editor.errors.save_lesson_failed'), 'error')
    }
  }

  const updateLessonField = (chapterId, lessonId, field, value) =>
    setChapters(prev => prev.map(c =>
      c.id === chapterId
        ? {
          ...c, lessons: c.lessons.map(l =>
            l.id === lessonId ? { ...l, [field]: value } : l)
        } : c))

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight={800} mb={3} sx={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
        {isEdit ? t('course_editor.title_edit') : t('course_editor.title_new')}
      </Typography>

      {/* ── Course Info ── */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
        <Typography variant="h6" gutterBottom fontWeight={700}>{t('course_editor.course_info')}</Typography>
        <TextField
          label={t('course_editor.course_name_label')} fullWidth sx={{ mb: 2 }}
          value={course.title}
          onChange={e => setCourse(p => ({ ...p, title: e.target.value }))}
        />
        <TextField
          label={t('course_editor.course_desc_label')} fullWidth multiline rows={3} sx={{ mb: 2 }}
          value={course.description}
          onChange={e => setCourse(p => ({ ...p, description: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label={t('course_editor.start_date_label')} type="date" sx={{ flex: 1 }}
            InputLabelProps={{ shrink: true }}
            value={course.startDate}
            onChange={e => setCourse(p => ({ ...p, startDate: e.target.value }))}
          />
          <TextField
            label={t('course_editor.end_date_label')} type="date" sx={{ flex: 1 }}
            InputLabelProps={{ shrink: true }}
            value={course.endDate}
            onChange={e => setCourse(p => ({ ...p, endDate: e.target.value }))}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{t('course_editor.status_label')}</InputLabel>
            <Select value={course.status} label={t('course_editor.status_label')}
              onChange={e => setCourse(p => ({ ...p, status: e.target.value }))}>
              <MenuItem value="DRAFT">📝 {t('course_editor.status.draft')}</MenuItem>
              <MenuItem value="PUBLISHED">🌐 {t('course_editor.status.published')}</MenuItem>
              <MenuItem value="ARCHIVED">📦 {t('course_editor.status.archived')}</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSaveCourse} 
            disabled={saving}
            sx={{ 
                height: 44, borderRadius: '10px', px: 3, fontWeight: 700,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)' }
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : t('course_editor.save_course')}
          </Button>
        </Box>
      </Paper>

      {/* ── Chapters ── */}
      {isEdit && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" fontWeight={700}>{t('course_editor.chapter_list', { count: chapters.length })}</Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to={`/groups/${groupId}/courses/${courseId}/quiz/create`}
                sx={{ borderRadius: '10px', fontWeight: 600, borderColor: 'var(--color-border)', color: 'var(--color-text-sec)' }}
              >
                {t('course_editor.add_quiz')}
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleAddChapter}
                sx={{ 
                    borderRadius: '10px', fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                    '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)' }
                }}
              >
                {t('course_editor.add_chapter')}
              </Button>
            </Box>
          </Box>

          {chapters.map((ch, idx) => (
            <Accordion key={ch.id} expanded={expandedChapter === ch.id}
              onChange={(_, exp) => setExpandedChapter(exp ? ch.id : null)}
              sx={{ mb: 1.5, borderRadius: '12px !important', border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)', color: 'var(--color-text)', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-text-muted)' }} />}>
                <DragIcon sx={{ mr: 1, color: 'var(--color-text-muted)' }} />
                <Typography fontWeight={700} sx={{ flexGrow: 1 }}>
                  Chapter {idx + 1}: {ch.title}
                </Typography>
                <Chip label={`${ch.lessons?.length || 0} items`} size="small" sx={{ ml: 2, bgcolor: 'rgba(99,102,241,0.1)', color: '#818CF8', fontWeight: 600 }} />
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: '1px solid var(--color-border)', pt: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField label={t('course_editor.chapter_name_label')} size="small" sx={{ flex: 1 }}
                    value={ch.title}
                    onChange={e => updateChapterField(ch.id, 'title', e.target.value)} />
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => handleSaveChapter(ch)}
                    sx={{ borderRadius: '8px', px: 3 }}
                  >
                    {t('common.save')}
                  </Button>
                  <IconButton color="error" onClick={() => handleDeleteChapter(ch.id)} sx={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ my: 2.5, borderColor: 'var(--color-border)' }} />
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'var(--color-text-sec)' }}>{t('course_editor.lessons_in_chapter')}</Typography>

                {(ch.lessons || []).map((lesson, lIdx) => (
                  <Paper key={lesson.id} elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface-2)' }}>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                      <TextField label={t('course_editor.lesson_name_label')} size="small" sx={{ flex: 1 }}
                        value={lesson.title}
                        onChange={e => updateLessonField(ch.id, lesson.id, 'title', e.target.value)} />
                      <Button variant="outlined" size="small" onClick={() => handleSaveLesson(ch.id, lesson)} sx={{ borderRadius: '8px' }}>{t('common.save')}</Button>
                      <IconButton color="error" size="small" onClick={() => handleDeleteLesson(ch.id, lesson.id)} sx={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <CKEditorWrapper
                      lessonId={lesson.id}
                      value={lesson.content}
                      onChange={val => updateLessonField(ch.id, lesson.id, 'content', val)}
                    />
                  </Paper>
                ))}

                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleAddLesson(ch.id)}
                  sx={{ mt: 1, borderRadius: '8px', color: 'var(--color-primary-lt)', borderColor: 'rgba(99,102,241,0.3)' }}
                >
                  {t('course_editor.add_lesson')}
                </Button>
              </AccordionDetails>
            </Accordion>
          ))}

          {quizzes.filter(q => !q.chapterId).map((q, qIdx) => (
            <Paper key={q.id} elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#67E8F9' }}>
                <QuizIcon />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700} sx={{ color: 'var(--color-text)' }}>{t('course_editor.quiz_label')}: {q.title}</Typography>
                <Typography variant="caption" color="var(--color-text-muted)">
                  {t('course_editor.quiz_desc', { 
                    time: q.timeLimitSec ? `${q.timeLimitSec} ${t('course_editor.seconds')}` : t('course_editor.no_limit'),
                    count: q.maxAttempts 
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Statistics">
                  <IconButton component={RouterLink} to={`/groups/${groupId}/courses/${courseId}/quiz/${q.id}/stats`} sx={{ color: 'var(--color-primary-lt)' }}>
                    <BarChartIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton component={RouterLink} to={`/groups/${groupId}/courses/${courseId}/quiz/${q.id}/edit`} sx={{ color: 'var(--color-text-muted)' }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}

          {chapters.length === 0 && quizzes.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center', color: 'var(--color-text-muted)', borderRadius: 4, bgcolor: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}>
              <Typography>{t('course_editor.no_content')}</Typography>
            </Paper>
          )}
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '10px' }}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  )
}

export default CourseEditor
