import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button, Divider,
  CircularProgress, Stack, Avatar, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as BookIcon,
  Description as DocIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import courseService from '../../services/courseService';

const CourseDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await courseService.getTemplateById(id);
        setCourse(data);

        const [chapterList] = await Promise.all([
          courseService.getTemplateChapters(id)
        ]);

        const chapterWithLessons = await Promise.all(
          chapterList.map(async (ch) => ({
            ...ch,
            lessons: await courseService.getTemplateLessons(ch.id).catch(() => [])
          }))
        );

        setChapters(chapterWithLessons);
      } catch (error) {
        console.error('Failed to fetch course template details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (!course) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5">Không tìm thấy khóa học mẫu!</Typography>
      <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Quay lại</Button>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'none' }}
        >
          Quay lại kho
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/inventory/courses/edit/${id}`)}
          sx={{
            borderRadius: '16px', fontWeight: 800, px: 3, py: 1,
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
            textTransform: 'none',
            '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)', transform: 'translateY(-2px)' },
            transition: 'all 0.2s'
          }}
        >
          Chỉnh sửa cấu trúc
        </Button>
      </Box>

      {/* Main Info Card - Glassmorphism */}
      <Paper sx={{
        p: { xs: 3, md: 5 }, mb: 5, borderRadius: '32px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        position: 'relative', overflow: 'hidden'
      }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md="auto">
            <Avatar
              variant="rounded"
              src={course.thumbnailUrl}
              sx={{
                width: 180, height: 180, borderRadius: '24px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              <SchoolIcon sx={{ fontSize: 80, color: '#6366F1' }} />
            </Avatar>
          </Grid>
          <Grid item xs={12} md>
            <Stack spacing={2}>
              <Box>
                <Chip label="Core Template" size="small" sx={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', fontWeight: 800, mb: 2, borderRadius: '8px' }} />
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'var(--color-text)', mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                  {course.title}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '1.05rem', maxWidth: '800px' }}>
                {course.description || "Chưa có nội dung mô tả chi tiết cho khóa học mẫu này."}
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', display: 'block', mb: 0.5 }}>Chương học</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-text)' }}>{chapters.length}</Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          {/* Course Structure Preview */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BookIcon sx={{ color: '#6366F1' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
              Cấu trúc chương trình
            </Typography>
          </Box>

          <Stack spacing={2}>
            {chapters.map((ch, idx) => (
              <Accordion
                key={ch.id}
                defaultExpanded={idx === 0}
                sx={{
                  borderRadius: '20px !important',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  overflow: 'hidden'
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-text-secondary)' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', fontWeight: 800
                    }}>
                      {idx + 1}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
                      {ch.title}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ borderTop: '1px solid var(--color-border)', bgcolor: 'var(--color-surface-2)', p: 3 }}>
                  <Stack spacing={1.5}>
                    {(ch.lessons || []).map((lesson, lIdx) => (
                      <Box key={lesson.id} sx={{
                        p: 2, borderRadius: '14px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', gap: 2,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateX(4px)', borderColor: '#6366F1' }
                      }}>
                        <DocIcon fontSize="small" sx={{ color: 'var(--color-text-muted)' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
                          {lIdx + 1}. {lesson.title}
                        </Typography>
                      </Box>
                    ))}
                    {(!ch.lessons || ch.lessons.length === 0) && (
                      <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                        Chưa có bài học trong chương này.
                      </Typography>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseDetail;
