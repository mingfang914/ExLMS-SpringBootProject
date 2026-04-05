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
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ color: 'var(--color-text-muted)' }}>
          Quay lại kho
        </Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />} 
          onClick={() => navigate(`/inventory/quizzes/edit/${id}`)}
          sx={{ 
            borderRadius: '12px', fontWeight: 700,
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)' }
          }}
        >
          Chỉnh sửa thiết kế
        </Button>
      </Box>

      {/* Header Card */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Typography variant="h3" fontWeight={900} gutterBottom sx={{ color: '#FFF' }}>
          {quiz.title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--color-text-muted)', mb: 3 }}>
          {quiz.description || "Không có mô tả chi tiết."}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TimerIcon color="primary" />
              <Box>
                <Typography variant="caption" color="var(--color-text-muted)">Thời gian</Typography>
                <Typography variant="body1" fontWeight={700} color="#FFF">
                  {quiz.timeLimitSec ? `${Math.floor(quiz.timeLimitSec / 60)} phút` : 'Không giới hạn'}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
              <QuestionIcon sx={{ color: '#FCD34D' }} />
              <Box>
                <Typography variant="caption" color="var(--color-text-muted)">Số câu hỏi</Typography>
                <Typography variant="body1" fontWeight={700} color="#FFF">{quiz.questions?.length || 0} câu</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TrophyIcon sx={{ color: '#10B981' }} />
              <Box>
                <Typography variant="caption" color="var(--color-text-muted)">Điểm đạt</Typography>
                <Typography variant="body1" fontWeight={700} color="#FFF">{quiz.passingScore}%</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
              <ShuffleIcon sx={{ color: quiz.shuffleQuestions ? '#818CF8' : 'var(--color-text-muted)' }} />
              <Box>
                <Typography variant="caption" color="var(--color-text-muted)">Trộn câu hỏi</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={quiz.shuffleQuestions ? 'Đang bật' : 'Tắt'} 
                    size="small" 
                    variant={quiz.shuffleQuestions ? 'filled' : 'outlined'}
                    sx={{ 
                        height: 20, fontSize: '0.65rem', fontWeight: 800,
                        bgcolor: quiz.shuffleQuestions ? 'rgba(129, 140, 248, 0.2)' : 'transparent',
                        color: quiz.shuffleQuestions ? '#818CF8' : 'var(--color-text-muted)',
                        borderColor: quiz.shuffleQuestions ? 'transparent' : 'rgba(255,255,255,0.1)'
                    }} 
                  />
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Questions Preview */}
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        Xem trước câu hỏi
        <Chip label={`${quiz.questions?.length || 0}`} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.2)', color: '#818CF8', fontWeight: 800 }} />
      </Typography>

      <Stack spacing={3}>
        {quiz.questions?.map((q, idx) => (
          <Paper key={q.id} sx={{ p: 3, borderRadius: 3, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip label={`Câu ${idx + 1}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
              <Chip label={`${q.points} điểm`} size="small" color="info" />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#FFF' }}>
              {q.content}
            </Typography>
            
            <Grid container spacing={2}>
              {q.answers?.map((ans, aIdx) => (
                <Grid item xs={12} sm={6} key={ans.id}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    border: '1px solid',
                    borderColor: ans.correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)',
                    bgcolor: ans.correct ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                  }}>
                    <Typography variant="body2" sx={{ color: ans.correct ? '#10B981' : 'var(--color-text-muted)', fontWeight: ans.correct ? 700 : 400 }}>
                      {String.fromCharCode(65 + aIdx)}. {ans.content}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {q.explanation && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(99,102,241,0.05)', borderRadius: 2, borderLeft: '4px solid #6366F1' }}>
                <Typography variant="caption" color="primary" fontWeight={800} display="block">Giải thích:</Typography>
                <Typography variant="body2" color="var(--color-text-muted)">{q.explanation}</Typography>
              </Box>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default QuizDetail;
