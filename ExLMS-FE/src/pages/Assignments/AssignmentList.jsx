import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip,
  Grid, CircularProgress, Alert, Divider, IconButton, Tooltip
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
        <Grid container spacing={2}>
          {assignments.map((asgn) => (
            <Grid item xs={12} key={asgn.id}>
              <Card
                sx={{
                  '&:hover': { boxShadow: 4 },
                  transition: 'box-shadow 0.2s'
                }}
              >
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {asgn.title}
                      </Typography>
                      {getStatusChip(asgn)}
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                      dangerouslySetInnerHTML={{ __html: asgn.description }}
                    />
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimelineIcon fontSize="inherit" />
                        {t('assignments.due')}: {format(new Date(asgn.dueAt), 'HH:mm dd/MM/yyyy', { locale: i18n.language === 'vi' ? vi : enUS })}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {asgn.submissionType === 'FILE' ? <FileIcon fontSize="inherit" /> : <DescriptionIcon fontSize="inherit" />}
                        {t('assignments.type')}: {asgn.submissionType === 'FILE' ? t('assignments.type_file') : t('assignments.type_text')}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {t('assignments.max_score')}: {asgn.maxScore}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/groups/${groupId}/assignments/${asgn.id}`)}
                    >
                      {isInstructor ? t('assignments.actions.grade') : t('common.details')}
                    </Button>
                    {isInstructor && (
                      <>
                        <Tooltip title={t('common.edit')}>
                          <IconButton size="small" color="primary" onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/groups/${groupId}/assignments/${asgn.id}/edit`);
                          }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton size="small" color="error" onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(asgn.id);
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
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
