import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip,
  Grid, CircularProgress, Alert, Divider, IconButton, Tooltip, Avatar, CardMedia
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Description as DescriptionIcon,
  FilePresent as FileIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import assignmentService from '../../services/assignmentService';
import groupService from '../../services/groupService';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const AssignmentList = ({ courseId, isInstructor: isInstructorProp }) => {
  const { t, i18n } = useTranslation();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInstructor, setIsInstructor] = useState(isInstructorProp || false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Determine role if not provided
      if (isInstructorProp === undefined) {
        const groupData = await groupService.getGroupById(groupId);
        const currentUserRole = groupData?.currentUserRole;
        const instructorRoles = ['OWNER', 'EDITOR'];
        setIsInstructor(instructorRoles.includes(currentUserRole));
      } else {
        setIsInstructor(isInstructorProp);
      }

      let data = [];
      if (courseId) {
        data = await assignmentService.getAssignmentsByCourse(courseId);
      } else {
        data = await assignmentService.getAssignmentsByGroup(groupId);
      }
      setAssignments(data);
    } catch (err) {
      setError(t('assignments.errors.fetch_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [groupId, courseId, isInstructorProp, user?.id]);

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await assignmentService.deleteAssignment(id);
        setAssignments(assignments.filter(a => a.id !== id));
        alert(t('common.success'));
      } catch (err) {
        alert(t('common.error'));
      }
    }
  };

  const getStatusChip = (asgn) => {
    const now = new Date();
    const due = new Date(asgn.dueAt);

    if (asgn.status === 'CLOSED') return <Chip label={t('assignments.status.closed')} color="error" size="small" />;
    if (asgn.status === 'DRAFT') return <Chip label={t('assignments.status.draft')} color="default" size="small" />;
    if (now > due) return <Chip label={t('assignments.status.expired')} color="warning" size="small" />;
    return <Chip label={t('assignments.status.open')} color="success" size="small" />;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: courseId ? 0 : 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" /> {t('group_detail.tabs.assignments')}
        </Typography>
        {isInstructor && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/groups/${groupId}/assignments/create`)}
          >
            {t('common.create')}
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {assignments.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {isInstructor ? t('assignments.no_assignments_instructor') : t('assignments.no_assignments_student')}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {assignments.map((asgn) => (
            <Grid item xs={12} key={asgn.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Grid container>
                    <Grid item xs={12} sm={3} md={2}>
                      <CardMedia
                        component="img"
                        sx={{ 
                            height: { xs: 150, sm: '100%' }, 
                            width: '100%',
                            objectFit: 'cover'
                        }}
                        image={asgn.coverImageUrl || '/api/files/download/Assets/AssignmentDefaultCover.jpg'}
                      />
                    </Grid>
                    <Grid item xs={12} sm={9} md={6} sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                            {asgn.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {getStatusChip(asgn)}
                            <Chip label={asgn.submissionType} size="small" variant="outlined" />
                          </Box>
                        </Box>
                      </Box>

                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          mb: 3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          opacity: 0.8
                        }}
                        dangerouslySetInnerHTML={{ __html: asgn.description }}
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimelineIcon sx={{ fontSize: 14 }} /> {t('assignments.assigned')}
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {asgn.assignedAt ? format(new Date(asgn.assignedAt), 'HH:mm dd/MM', { locale: i18n.language === 'vi' ? vi : enUS }) : '---'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimelineIcon sx={{ fontSize: 14 }} /> {t('assignments.due')}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="error">
                              {format(new Date(asgn.dueAt), 'HH:mm dd/MM', { locale: i18n.language === 'vi' ? vi : enUS })}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" color="textSecondary">
                              Nộp muộn
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color={asgn.allowLate ? 'success.main' : 'error.main'}>
                              {asgn.allowLate ? `Có (-${asgn.latePenaltyPercent}%)` : 'Không'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" color="textSecondary">
                              {t('assignments.max_score')}
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {asgn.maxScore} pts
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={4} sx={{ 
                      bgcolor: 'rgba(255,255,255,0.02)', 
                      borderLeft: { md: '1px solid rgba(255,255,255,0.05)' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      p: 3,
                      gap: 1.5
                    }}>
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={asgn.status === 'CLOSED' && !asgn.allowLate && !isInstructor}
                        onClick={() => navigate(`/groups/${groupId}/assignments/${asgn.id}`)}
                        sx={{ 
                          borderRadius: 3, 
                          py: 1.5, 
                          fontWeight: 800,
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}
                      >
                        {asgn.status === 'CLOSED' ? (asgn.allowLate ? 'Nộp muộn' : t('assignments.status.closed')) : (isInstructor ? t('assignments.actions.grade') : t('common.details'))}
                      </Button>
                      
                      {isInstructor && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/groups/${groupId}/assignments/${asgn.id}/edit`);
                            }}
                            sx={{ borderRadius: 3 }}
                          >
                            {t('common.edit')}
                          </Button>
                          <IconButton 
                            color="error" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(asgn.id);
                            }}
                            sx={{ borderRadius: 3, border: '1px solid rgba(239, 68, 68, 0.2)' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AssignmentList;
