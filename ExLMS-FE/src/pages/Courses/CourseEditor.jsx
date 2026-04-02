import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, TextField, Button, Paper, Select, MenuItem,
  FormControl, InputLabel, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Chip, Divider, Alert, CircularProgress, Snackbar, Stack, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, 
  ListItemText, Checkbox, FormControlLabel
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon, Add as AddIcon, Delete as DeleteIcon,
  DragIndicator as DragIcon, Save as SaveIcon,
  Description as DocIcon, MenuBook as BookIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
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
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' })
  const [expandedChapter, setExpandedChapter] = useState(null)

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        try {
          let data
          if (groupId) {
             data = await courseService.getCourseDeploymentById(courseId)
          } else {
             data = await courseService.getTemplateById(courseId)
          }
          setCourse({
            title: data.title,
            description: data.description || '',
            status: data.status,
            templateId: data.templateId || data.id
          })
          
          const targetId = data.templateId || data.id;
          const [chapterList] = await Promise.all([
            groupId ? courseService.getChapters(targetId) : courseService.getTemplateChapters(targetId)
          ])
          
          const chapterWithLessons = await Promise.all(
            chapterList.map(async (ch) => ({
              ...ch,
              lessons: await (groupId ? courseService.getLessons(ch.id) : courseService.getTemplateLessons(ch.id)).catch(() => [])
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

  const handleSaveCourse = async () => {
    setSaving(true)
    try {
      let savedCourse
      if (isEdit) {
        if (groupId) {
          savedCourse = await courseService.updateCourse(groupId, courseId, course)
        } else {
          savedCourse = await courseService.updateTemplate(courseId, course)
        }
        showSnack(t('course_editor.messages.course_saved'))
      } else {
        if (groupId) {
          savedCourse = await courseService.createCourse(groupId, course)
          navigate(`/groups/${groupId}/courses/${savedCourse.id}/edit`, { replace: true })
        } else {
          savedCourse = await courseService.createTemplate(course)
          navigate(`/inventory/courses`, { replace: true })
        }
        showSnack(t('course_editor.messages.course_saved'))
      }
    } catch (e) {
      showSnack(e.response?.data?.message || t('course_editor.errors.save_course_failed'), 'error')
    } finally {
      setSaving(false)
    }
  }

  // ──────────── Chapters ────────────
  const handleAddChapter = async () => {
    if (!courseId) { showSnack(t('course_editor.messages.save_course_before_chapter'), 'warning'); return }
    const targetId = course.templateId || courseId;
    try {
      const ch = await courseService.createChapter(targetId, { title: t('course_editor.chapter_new_title'), description: '' })
      setChapters(prev => [...prev, { ...ch, lessons: [] }])
      setExpandedChapter(ch.id)
    } catch (e) {
      showSnack(t('course_editor.errors.create_chapter_failed'), 'error')
    }
  }

  const handleDeleteChapter = async (chapterId) => {
    const targetId = course.templateId || courseId;
    try {
      await courseService.deleteChapter(targetId, chapterId)
      setChapters(prev => prev.filter(c => c.id !== chapterId))
      showSnack(t('course_editor.messages.chapter_deleted'))
    } catch (e) {
      showSnack(t('course_editor.errors.delete_chapter_failed'), 'error')
    }
  }

  const handleSaveChapter = async (ch) => {
    const targetId = course.templateId || courseId;
    try {
      await courseService.updateChapter(targetId, ch.id, { title: ch.title, description: ch.description })
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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
      <CircularProgress />
    </Box>
  )

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header section with glassmorphism */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        boxShadow: 'var(--glass-shadow)',
        color: 'var(--color-text)'
      }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            {isEdit ? t('course_editor.title_edit') : t('course_editor.title_new')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-sec)' }}>
            {isEdit ? 'Cập nhật nội dung và thiết kế cho khóa học này' : 'Bắt đầu xây dựng nền tảng tri thức mới'}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />} 
          onClick={handleSaveCourse} 
          disabled={saving}
          sx={{ 
            height: 48, borderRadius: '16px', px: 4, fontWeight: 800,
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)', transform: 'translateY(-2px)' },
            transition: 'all 0.2s'
          }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : t('course_editor.save_course')}
        </Button>
      </Box>

      {/* ── Course Info Section ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DocIcon sx={{ color: '#6366F1' }} />
              Thông tin cơ bản
            </Typography>
            <Stack spacing={3}>
              <TextField
                label={t('course_editor.course_name_label')} 
                fullWidth
                value={course.title || ''}
                onChange={e => setCourse(p => ({ ...p, title: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />
              <TextField
                label={t('course_editor.course_desc_label')} 
                fullWidth multiline rows={4}
                value={course.description || ''}
                onChange={e => setCourse(p => ({ ...p, description: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Structure Section ── */}
      {/* ── Structure Section ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 6 }}>
        <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <BookIcon sx={{ color: '#F59E0B' }} />
          {t('course_editor.content_structure')}
        </Typography>
        {isEdit && (
          <Stack direction="row" spacing={2}>

            <Button 
              startIcon={<AddIcon />} 
              onClick={handleAddChapter}
              sx={{ 
                borderRadius: '16px', px: 3, fontWeight: 800, 
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: 'white',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              Thêm chương mới
            </Button>
          </Stack>
        )}
      </Box>

      {!isEdit ? (
        <Paper sx={{ 
          p: 6, textAlign: 'center', borderRadius: '32px', 
          background: 'var(--glass-bg)', border: '2px dashed var(--glass-border)',
          mb: 4
        }}>
          <BookIcon sx={{ fontSize: 48, color: 'var(--color-text-muted)', mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ color: 'var(--color-text)', fontWeight: 800, mb: 1 }}>
            {t('course_editor.ready_to_build')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 3 }}>
            {t('course_editor.save_to_start_building')}
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleSaveCourse}
            disabled={saving}
            sx={{ borderRadius: '12px', px: 4, background: 'var(--color-primary)', fontWeight: 800 }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : t('course_editor.save_and_start')}
          </Button>
        </Paper>
      ) : (
        <>
          {chapters.map((ch, idx) => (
            <Accordion 
              key={ch.id} 
              expanded={expandedChapter === ch.id}
              onChange={(_, exp) => setExpandedChapter(exp ? ch.id : null)}
              sx={{ 
                mb: 2, 
                borderRadius: '20px !important', 
                border: '1px solid var(--color-border)', 
                bgcolor: 'var(--color-surface)', 
                overflow: 'hidden',
                boxShadow: expandedChapter === ch.id ? 'var(--glass-shadow)' : 'none',
                transition: 'all 0.3s ease',
                '&:before': { display: 'none' } 
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-text-sec)' }} />}
                sx={{ p: 3, '&.Mui-expanded': { background: 'var(--color-surface-2)' } }}
              >
                <DragIcon sx={{ mr: 2, color: 'var(--color-text-muted)' }} />
                <Typography fontWeight={800} sx={{ flexGrow: 1, color: 'var(--color-text)', fontSize: '1.1rem' }}>
                  Chương {idx + 1}: {ch.title}
                </Typography>
                <Chip 
                  label={`${ch.lessons?.length || 0} bài học`} 
                  size="small" 
                  sx={{ 
                    mr: 2, 
                    fontWeight: 800, 
                    bgcolor: 'rgba(99, 102, 241, 0.1)', 
                    color: 'var(--color-primary)' 
                  }} 
                />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 4 }}>
                {/* Chapter Config */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4, p: 2, borderRadius: '16px', background: 'var(--color-surface-2)' }}>
                  <TextField 
                    label="Tên chương học" 
                    size="small" 
                    fullWidth
                    value={ch.title || ''}
                    onChange={e => updateChapterField(ch.id, 'title', e.target.value)}
                    sx={{ bgcolor: 'var(--color-surface)', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={() => handleSaveChapter(ch)}
                    sx={{ borderRadius: '10px', px: 4, fontWeight: 700 }}
                  >
                    Lưu
                  </Button>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteChapter(ch.id)} 
                    sx={{ 
                      borderRadius: '10px', 
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.1)' 
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: 'var(--color-text-sec)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DocIcon fontSize="small" sx={{ color: 'var(--color-primary-lt)' }} />
                  Nội dung bài học
                </Typography>

                <Stack spacing={2.5}>
                  {(ch.lessons || []).map((lesson, lIdx) => (
                    <Paper 
                      key={lesson.id} 
                      elevation={0} 
                      sx={{ 
                        p: 0, 
                        mb: 2, 
                        borderRadius: '20px', 
                        border: '1px solid var(--color-border)', 
                        bgcolor: 'var(--color-surface)',
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.5, p: 2, background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                        <TextField 
                          label={`Bài ${lIdx + 1}: Tên bài học`} 
                          size="small" 
                          fullWidth
                          variant="standard"
                          value={lesson.title || ''}
                          onChange={e => updateLessonField(ch.id, lesson.id, 'title', e.target.value)}
                          sx={{ '& .MuiInput-root': { fontWeight: 700 } }}
                        />
                        <Button 
                          variant="text" 
                          size="small" 
                          startIcon={<SaveIcon />}
                          onClick={() => handleSaveLesson(ch.id, lesson)}
                          sx={{ borderRadius: '8px', fontWeight: 700 }}
                        >
                          Lưu
                        </Button>
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDeleteLesson(ch.id, lesson.id)}
                          sx={{ borderRadius: '8px' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <CKEditorWrapper
                          lessonId={lesson.id}
                          value={lesson.content || ''}
                          onChange={val => updateLessonField(ch.id, lesson.id, 'content', val)}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Stack>

                <Button 
                  fullWidth
                  onClick={() => handleAddLesson(ch.id)}
                  sx={{ 
                    mt: 3, 
                    py: 2,
                    borderRadius: '16px', 
                    border: '2px dashed var(--color-border)',
                    color: 'var(--color-primary)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    '&:hover': { background: 'rgba(99, 102, 241, 0.05)', borderColor: 'var(--color-primary)' }
                  }}
                >
                  <AddIcon fontSize="small" />
                  Thêm bài học mới
                </Button>
              </AccordionDetails>
            </Accordion>
          ))}

          {chapters.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '32px', bgcolor: 'var(--color-surface)', border: '2px dashed var(--color-border)' }}>
              <DocIcon sx={{ fontSize: 60, color: 'var(--color-text-muted)', mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" fontWeight={700} sx={{ color: 'var(--color-text-muted)' }}>Chưa có nội dung cho khóa học này</Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mb: 3 }}>Bắt đầu bằng cách thêm chương học đầu tiên của bạn.</Typography>
              <Button variant="contained" onClick={handleAddChapter} sx={{ borderRadius: '12px', fontWeight: 800 }}>Bắt đầu xây dựng</Button>
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
