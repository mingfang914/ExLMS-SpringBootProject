import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Chip, Button, Divider, 
  CircularProgress, Stack, Avatar, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Tooltip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  ArrowBack as BackIcon, 
  Edit as EditIcon, 
  School as SchoolIcon,
  EmojiEvents as TrophyIcon, 
  ExpandMore as ExpandMoreIcon,
  MenuBook as BookIcon,
  Description as DocIcon,
  Quiz as QuizIcon,
  PlayCircleOutline as PlayIcon,
  AccessTime as TimeIcon,
  Layers as LayersIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import courseService from '../../services/courseService';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const CourseDetail = () => {
  const theme = useTheme();
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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress size={60} thickness={4} sx={{ color: '#6366F1' }} />
    </Box>
  );

  if (!course) return (
    <Box sx={{ p: 8, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Không tìm thấy khóa học mẫu!</Typography>
      <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ borderRadius: '12px' }}>
        Quay lại kho
      </Button>
    </Box>
  );

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ pb: 8 }}>
      
      {/* ── Navigation ─────────────────────────────────────────── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ 
            color: 'var(--color-text-sec)', fontWeight: 700, textTransform: 'none',
            '&:hover': { color: 'var(--color-text)', bgcolor: 'rgba(255,255,255,0.05)' }
          }}
        >
          Quay lại kho tài liệu
        </Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />} 
          onClick={() => navigate(`/inventory/courses/edit/${id}`)}
          sx={{ 
            borderRadius: '14px', fontWeight: 800, px: 3, py: 1,
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

      {/* ── Immersive Hero Header ─────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Box sx={{ 
          position: 'relative', mb: 6, borderRadius: '40px', overflow: 'hidden',
          bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          boxShadow: `0 24px 80px rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.4 : 0.1})`
        }}>
          {/* Background Blur */}
          <Box sx={{
            position: 'absolute', inset: 0,
            backgroundImage: course.thumbnailUrl ? `url(${course.thumbnailUrl})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: `blur(60px) brightness(${theme.palette.mode === 'dark' ? 0.4 : 0.9})`, 
            opacity: theme.palette.mode === 'dark' ? 0.6 : 0.3,
            transform: 'scale(1.2)', zIndex: 0
          }} />

          <Grid container sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={4} sx={{ p: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar 
                  variant="rounded" 
                  src={course.thumbnailUrl} 
                  sx={{ 
                    width: { xs: 240, md: 280 }, height: { xs: 240, md: 280 }, 
                    borderRadius: '32px', 
                    border: `8px solid ${alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.05 : 0.5)}`,
                    boxShadow: `0 32px 64px rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.5 : 0.15})`,
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 100, color: '#818CF8' }} />
                </Avatar>
                <Chip 
                  label="Premium Template" 
                  sx={{ 
                    position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
                    height: 28, px: 2, fontWeight: 900, fontSize: '0.625rem', textTransform: 'uppercase',
                    bgcolor: '#6366F1', color: '#FFF', border: '2px solid var(--color-surface-2)',
                    boxShadow: '0 8px 16px rgba(99,102,241,0.4)'
                  }} 
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={8} sx={{ p: { xs: 4, md: 6 }, pl: { md: 2 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography sx={{ 
                    fontFamily: 'var(--font-heading)', fontWeight: 900, 
                    fontSize: { xs: '2.5rem', md: '3.5rem' }, color: 'var(--color-text)', 
                    lineHeight: 1.1, letterSpacing: '-0.04em', mb: 2
                  }}>
                    {course.title}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '1.125rem', color: 'var(--color-text-sec)', 
                    lineHeight: 1.6, maxWidth: '800px', fontWeight: 500 
                  }}>
                    {course.description || "Khóa học mẫu cấp độ chuyên gia giúp bạn xây dựng lộ trình học tập bài bản và chuyên nghiệp dành cho sinh viên."}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap', gap: 3 }}>
                  <Box>
                    <Typography sx={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>Tổng số chương</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>{chapters.length}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--color-border)', opacity: 0.5 }} />
                  <Box>
                    <Typography sx={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>Tổng số bài học</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'var(--color-text)' }}>
                      {chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0)}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--color-border)', opacity: 0.5 }} />
                  <Box>
                    <Typography sx={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>Trạng thái</Typography>
                    <Chip label="Đang hoạt động" size="small" variant="outlined" sx={{ fontWeight: 800, borderColor: alpha(theme.palette.success.main, 0.4), color: theme.palette.success.main }} />
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      {/* ── Content Syllabus ─────────────────────────────── */}
      <Box sx={{ px: { xs: 1, sm: 3 } }}>
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1'
            }}>
              <LayersIcon />
            </Box>
            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--color-text)' }}>
              Đề cương chương trình học
            </Typography>
          </Box>
        </motion.div>

        <Stack spacing={2.5}>
          {chapters.map((ch, idx) => (
            <motion.div key={ch.id} variants={itemVariants}>
              <Accordion 
                defaultExpanded={idx === 0} 
                sx={{ 
                  borderRadius: '24px !important', 
                  bgcolor: 'var(--color-surface-2)', 
                  border: '1px solid var(--color-border)', 
                  boxShadow: 'none',
                  overflow: 'hidden',
                  '&:before': { display: 'none' },
                  '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3) },
                  transition: 'border-color 0.2s'
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-text-muted)' }} />}
                  sx={{ px: 3, py: 1 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Typography sx={{ 
                      fontSize: '1.5rem', fontWeight: 900, color: alpha(theme.palette.text.primary, 0.05),
                      fontFamily: 'var(--font-heading)', lineHeight: 1
                    }}>
                      {String(idx + 1).padStart(2, '0')}
                    </Typography>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-text)' }}>
                        {ch.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                        {ch.lessons?.length || 0} bài học nội dung
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'var(--color-surface-3)', p: 3, borderTop: '1px solid var(--color-border)' }}>
                  <Stack spacing={1.5}>
                    {(ch.lessons || []).map((lesson, lIdx) => (
                      <Box key={lesson.id} sx={{ 
                        p: 2, px: 2.5, borderRadius: '16px', 
                        bgcolor: 'var(--color-surface)', 
                        border: '1px solid var(--color-border)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'default',
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.05), 
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          transform: 'translateX(8px)' 
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                          <Box sx={{ color: '#6366F1', display: 'flex' }}>
                            <PlayIcon fontSize="small" />
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                            {lesson.title}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Tooltip title="Xem trước nội dung">
                            <IconButton size="small" sx={{ color: 'var(--color-text-muted)' }}>
                              <DocIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                    {(!ch.lessons || ch.lessons.length === 0) && (
                      <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 40, mb: 1.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Chương này hiện chưa có bài học</Typography>
                      </Box>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default CourseDetail;
