import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Chip, Button, Divider, 
  List, ListItem, ListItemText, ListItemIcon, CircularProgress, 
  IconButton, Tooltip, Stack
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Edit as EditIcon, 
  Timer as TimerIcon, 
  HelpOutline as QuestionIcon,
  EmojiEvents as TrophyIcon, 
  Shuffle as ShuffleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as quizService from '../../services/quizService';

const QuizDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await quizService.getTemplateById(id);
        setQuiz(data);
      } catch (error) {
        console.error('Failed to fetch quiz template:', error);
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

  if (!quiz) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5">Không tìm thấy bài trắc nghiệm!</Typography>
      <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Quay lại</Button>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-text)' } }}
        >
          {t('common.back')}
        </Button>
        <Tooltip title={quiz.hasAttempts ? "Không thể chỉnh sửa khi đã có học sinh làm bài" : ""}>
          <span>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />} 
              disabled={quiz.hasAttempts}
              onClick={() => navigate(`/inventory/quizzes/edit/${id}`)}
              sx={{ 
                borderRadius: '12px', px: 3, py: 1.2, fontWeight: 700,
                background: quiz.hasAttempts ? 'rgba(156, 163, 175, 0.5)' : 'var(--color-primary)',
                '&:hover': { background: quiz.hasAttempts ? 'none' : 'var(--color-primary-lt)', transform: quiz.hasAttempts ? 'none' : 'translateY(-1px)', boxShadow: quiz.hasAttempts ? 'none' : '0 6px 20px rgba(99,102,241,0.3)' },
                transition: 'all 0.2s'
              }}
            >
              {t('common.edit')}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Header Card */}
      <Paper sx={{ 
        p: { xs: 3, sm: 5 }, mb: 4, borderRadius: 5, 
        bgcolor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontFamily: 'var(--font-heading)', fontWeight: 900, mb: 1, 
            color: 'var(--color-text)', letterSpacing: '-0.02em',
            fontSize: { xs: '2rem', md: '2.75rem' }
          }}
        >
          {quiz.title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--color-text-sec)', mb: 4, maxWidth: '800px', lineHeight: 1.6 }}>
          {quiz.description || t('common.no_data')}
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderRadius: 3, bgcolor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TimerIcon sx={{ color: 'var(--color-primary)' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', mb: -0.5 }}>{t('quizzes.table.time_limit')}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
                  {quiz.timeLimitSec ? `${Math.floor(quiz.timeLimitSec / 60)} ${t('course_editor.seconds').replace('giây', 'phút')}` : t('quizzes.no_limit')}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderRadius: 3, bgcolor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(252,211,77,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QuestionIcon sx={{ color: '#F59E0B' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', mb: -0.5 }}>{t('quizzes.player.answered').split(':')[0]}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--color-text)' }}>{quiz.questions?.length || 0} {t('quizzes.question').toLowerCase()}</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderRadius: 3, bgcolor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrophyIcon sx={{ color: '#10B981' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', mb: -0.5 }}>{t('quizzes.passing_score_label').replace(' *', '')}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--color-text)' }}>{quiz.passingScore}%</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderRadius: 3, bgcolor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShuffleIcon sx={{ color: '#EC4899' }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', mb: -0.5 }}>{t('quizzes.shuffle_questions_label')}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--color-text)' }}>{quiz.shuffleQuestions ? t('quizzes.types.true') : t('quizzes.types.false')}</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Questions Preview */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-text)' }}>
          {t('quizzes.result.details_title')}
        </Typography>
        <Chip 
          label={`${quiz.questions?.length || 0}`} 
          size="small" 
          sx={{ bgcolor: 'var(--color-primary)', color: '#FFF', fontWeight: 900, borderRadius: '6px' }} 
        />
      </Box>

      <Stack spacing={3}>
        {quiz.questions?.map((q, idx) => (
          <Paper 
            key={q.id} 
            sx={{ 
              p: 3.5, borderRadius: 4, 
              bgcolor: 'var(--color-surface)', 
              border: '1px solid var(--color-border)',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'var(--color-primary)', boxShadow: '0 4px 12px rgba(99,102,241,0.05)' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Chip 
                label={`${t('quizzes.question')} ${idx + 1}`} 
                size="small" 
                sx={{ fontWeight: 700, borderRadius: '6px', bgcolor: 'var(--color-surface-hover)', color: 'var(--color-text-sec)', border: '1px solid var(--color-border)' }} 
              />
              <Typography sx={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                {q.points} {t('quizzes.player.points').replace('{{count}} ', '').toLowerCase()}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'var(--color-text)', lineHeight: 1.5 }}>
              {q.content}
            </Typography>
            
            <Grid container spacing={2}>
              {q.answers?.map((ans, aIdx) => (
                <Grid item xs={12} sm={6} key={ans.id}>
                  <Box sx={{ 
                    p: 2.5, 
                    borderRadius: '12px', 
                    border: '1px solid',
                    borderColor: ans.correct ? 'rgba(16, 184, 129, 0.4)' : 'var(--color-border)',
                    bgcolor: ans.correct ? 'rgba(16, 184, 129, 0.06)' : 'var(--color-surface-hover)',
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{ 
                      minWidth: 24, height: 24, borderRadius: '50%', 
                      bgcolor: ans.correct ? '#10B981' : 'var(--color-text-muted)', 
                      color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800
                    }}>
                      {String.fromCharCode(65 + aIdx)}
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: ans.correct ? '#059669' : 'var(--color-text-sec)', 
                        fontWeight: ans.correct ? 700 : 500,
                        fontSize: '0.9375rem'
                      }}
                    >
                      {ans.content}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {q.explanation && (
              <Box sx={{ mt: 3, p: 2.5, bgcolor: 'rgba(99,102,241,0.06)', borderRadius: '12px', borderLeft: '4px solid var(--color-primary)' }}>
                <Typography variant="caption" sx={{ color: 'var(--color-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                   {t('quizzes.result.explanation_title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-sec)', lineHeight: 1.6 }}>{q.explanation}</Typography>
              </Box>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default QuizDetail;
