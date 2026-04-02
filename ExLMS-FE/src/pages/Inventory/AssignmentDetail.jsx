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
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ color: 'var(--color-text-muted)' }}>
          Quay lại kho
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/inventory/assignments/edit/${id}`)}
          sx={{
            borderRadius: '12px', fontWeight: 700,
            background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
            color: '#000',
            '&:hover': { background: '#F59E0B' }
          }}
        >
          Chỉnh sửa thiết kế
        </Button>
      </Box>

      {/* Main Info Card */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 5, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, background: 'rgba(252, 211, 77, 0.1)', color: '#FCD34D', borderRadius: 4 }}>
            <AssignmentIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" fontWeight={900} sx={{ color: '#FFF', mb: 1, lineHeight: 1.2 }}>
              {assignment.title}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={assignment.submissionType} size="small" sx={{ background: 'rgba(252, 211, 77, 0.2)', color: '#FCD34D', fontWeight: 800 }} />
              <Chip label={`${assignment.maxScore} PTS`} size="small" icon={<ScoreIcon />} sx={{ fontWeight: 800 }} />
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mb: 4, borderColor: 'rgba(255,255,255,0.05)' }} />

        <Typography variant="h6" sx={{ color: '#FFF', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DocIcon sx={{ color: '#6366F1' }} />
          Nội dung chi tiết
        </Typography>
        <Box
          sx={{
            color: 'var(--color-text-muted)',
            lineHeight: 1.8,
            fontSize: '1.05rem',
            '& p': { mb: 2 },
            '& img': { maxWidth: '100%', borderRadius: 2 }
          }}
          dangerouslySetInnerHTML={{ __html: assignment.description || "Chưa có nội dung mô tả." }}
        />
      </Paper>

      {/* Constraints Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="subtitle1" sx={{ color: '#FFF', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FileIcon sx={{ color: '#60A5FA' }} />
              Quy định nộp bài
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="var(--color-text-muted)">Loại tệp cho phép</Typography>
                <Typography variant="body1" fontWeight={700} color="#FFF">
                  {assignment.allowedFileTypes || 'Tất cả'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="var(--color-text-muted)">Dung lượng tối đa</Typography>
                <Typography variant="body1" fontWeight={700} color="#FFF">{assignment.maxFileSizeMb} MB</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default AssignmentDetail;
