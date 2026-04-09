import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button, Divider,
  CircularProgress, Stack, Avatar
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Description as DocIcon,
  Assignment as AssignmentIcon,
  Score as ScoreIcon,
  AttachFile as FileIcon,
  EventNote as CalendarIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import assignmentService from '../../services/assignmentService';

const AssignmentDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await assignmentService.getTemplateById(id);
        setAssignment(data);
      } catch (error) {
        console.error('Failed to fetch assignment template:', error);
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

  if (!assignment) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5">Không tìm thấy bài tập mẫu!</Typography>
      <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Quay lại</Button>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-text)' } }}
        >
          {t('common.back')}
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/inventory/assignments/edit/${id}`)}
          sx={{
            borderRadius: '12px', px: 3, py: 1.2, fontWeight: 700,
            background: 'var(--color-warning)',
            color: '#000',
            '&:hover': { background: 'var(--color-warning-lt)', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(245,158,11,0.3)' },
            transition: 'all 0.2s'
          }}
        >
          {t('common.edit')}
        </Button>
      </Box>

      {/* Main Info Card */}
      <Paper sx={{ 
        p: { xs: 3, sm: 5 }, mb: 4, borderRadius: 5, 
        bgcolor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <Avatar sx={{ width: 80, height: 80, background: 'rgba(252, 211, 77, 0.1)', color: 'var(--color-warning)', borderRadius: 4 }}>
            <AssignmentIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h3" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)', mb: 1, lineHeight: 1.2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
              {assignment.title}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              <Chip 
                label={t('assignment_detail.' + (assignment.submissionType?.toLowerCase() || 'both'))} 
                size="small" 
                sx={{ bgcolor: 'rgba(252, 211, 77, 0.15)', color: 'var(--color-warning)', fontWeight: 800, borderRadius: '6px' }} 
              />
              <Chip 
                label={`${assignment.maxScore} PTS`} 
                size="small" 
                icon={<ScoreIcon sx={{ fontSize: '14px !important' }} />} 
                sx={{ fontWeight: 800, borderRadius: '6px', bgcolor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }} 
              />
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mb: 4, borderColor: 'var(--color-border)' }} />

        <Typography variant="h6" sx={{ color: 'var(--color-text)', mb: 2.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DocIcon sx={{ color: 'var(--color-primary)', fontSize: 18 }} />
          </Box>
          {t('assignment_detail.instructions')}
        </Typography>
        <Box
          sx={{
            color: 'var(--color-text-sec)',
            lineHeight: 1.8,
            fontSize: '1.05rem',
            '& p': { mb: 2 },
            '& img': { maxWidth: '100%', borderRadius: 3, boxShadow: 'var(--shadow-md)', my: 2 }
          }}
          dangerouslySetInnerHTML={{ __html: assignment.description || t('common.no_data') }}
        />
      </Paper>

      {/* Constraints Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ 
            p: 3.5, borderRadius: 4, height: '100%', 
            bgcolor: 'var(--color-surface)', 
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Typography variant="subtitle1" sx={{ color: 'var(--color-text)', fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileIcon sx={{ color: '#60A5FA', fontSize: 16 }} />
              </Box>
              {t('assignment_detail.submission_content')}
            </Typography>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  {t('assignment_form.file_types_label')}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
                  {assignment.allowedFileTypes || t('quizzes.no_limit')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  {t('assignment_form.max_file_size_label')}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
                  {assignment.maxFileSizeMb} MB
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssignmentDetail;
