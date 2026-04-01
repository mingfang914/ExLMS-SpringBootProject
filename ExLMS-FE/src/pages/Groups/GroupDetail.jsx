import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material'
import {
  People as PeopleIcon,
  Info as InfoIcon,
  Book as CourseIcon,
  Assignment as AssignmentIcon,
  Forum as ForumIcon,
  VideoCall as MeetingIcon,
  Settings as SettingsIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  Inventory2 as InventoryIcon,
} from '@mui/icons-material'
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom'
import groupService from '../../services/groupService'
import courseService from '../../services/courseService'
import assignmentService from '../../services/assignmentService'
import * as quizService from '../../services/quizService'
import meetingService from '../../services/meetingService'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

import GroupMembers from './components/GroupMembers'
import GroupFeed from './components/GroupFeed'
import InventoryDeploymentModal from '../Inventory/InventoryDeploymentModal'

const GroupDetail = () => {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [meetings, setMeetings] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  // Dialog States
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [editGroupData, setEditGroupData] = useState({ name: '', description: '', visibility: 'PUBLIC', category: 'General' })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [newMeetingData, setNewMeetingData] = useState({ title: '', description: '', startAt: '', durationMinutes: 60 })
  const [editMeetingDialogOpen, setEditMeetingDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [editMeetingData, setEditMeetingData] = useState({ title: '', description: '', startAt: '', durationMinutes: 60 })
  
  const [deployModal, setDeployModal] = useState({ open: false, type: 'course' })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGroupData = async () => {
      setLoading(true)
      try {
        const groupData = await groupService.getGroupById(id)
        setGroup(groupData)
        setEditGroupData({
          name: groupData.name || '',
          description: groupData.description || '',
          visibility: groupData.visibility || 'PUBLIC',
          category: groupData.category || 'General'
        })

        if (groupData.isJoined) {
          try {
            const [coursesData, asgnData, meetingsData, quizzesData] = await Promise.all([
              courseService.getCoursesByGroupId(id),
              assignmentService.getAssignmentsByGroup(id),
              meetingService.getMeetingsByGroup(id),
              quizService.getQuizzesByGroup(id)
            ])
            setCourses(coursesData)
            setAssignments(asgnData)
            setMeetings(meetingsData)
            setQuizzes(quizzesData)
          } catch (err) {
            console.error('Error fetching group content:', err)
          }
        }
      } catch (err) {
        setError(t('groups.errors.fetch_failed'))
      } finally {
        setLoading(false)
      }
    }
    fetchGroupData()
  }, [id, t])

  const refreshData = async () => {
    try {
      const [coursesData, asgnData, meetingsData, quizzesData] = await Promise.all([
        courseService.getCoursesByGroupId(id),
        assignmentService.getAssignmentsByGroup(id),
        meetingService.getMeetingsByGroup(id),
        quizService.getQuizzesByGroup(id)
      ])
      setCourses(coursesData)
      setAssignments(asgnData)
      setMeetings(meetingsData)
      setQuizzes(quizzesData)
    } catch (err) {
      console.error('Error refreshing content:', err)
    }
  }

  const handleJoinGroup = async () => {
    try {
      const response = await groupService.createJoinRequest(id, t('groups.messages.join_default'))
      alert(response || t('groups.messages.join_sent'))
    } catch (err) {
      alert(err.response?.data?.message || t('groups.errors.join_failed'))
    }
  }

  const handleUpdateGroup = async (e) => {
    e.preventDefault()
    try {
      await groupService.updateGroup(id, editGroupData)
      setGroup({ ...group, ...editGroupData })
      setManageDialogOpen(false)
      alert(t('group_detail.messages.update_success'))
    } catch (err) {
      alert(err.response?.data?.message || t('group_detail.errors.update_failed'))
    }
  }

  const handleDeleteGroup = async () => {
    if (deleteConfirmText !== group.name) {
      alert(t('group_detail.danger_zone.desc') + group.name)
      return
    }
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await groupService.deleteGroup(id)
        alert(t('common.success'))
        navigate('/groups')
      } catch (err) {
        alert(err.response?.data?.message || t('common.error'))
      }
    }
  }

  const handleScheduleMeeting = async (e) => {
    e.preventDefault()
    try {
      await meetingService.scheduleMeeting(id, newMeetingData)
      const freshMeetings = await meetingService.getMeetingsByGroup(id)
      setMeetings(freshMeetings)
      setScheduleDialogOpen(false)
      setNewMeetingData({ title: '', description: '', startAt: '', durationMinutes: 60 })
      alert(t('group_detail.meetings.schedule_success'))
    } catch (err) {
      alert(t('group_detail.meetings.schedule_failed'))
    }
  }

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm(t('group_detail.meetings.delete_confirm'))) {
      try {
        await meetingService.deleteMeeting(meetingId)
        setMeetings(meetings.filter(m => m.id !== meetingId))
        alert(t('group_detail.meetings.delete_success'))
      } catch (err) {
        alert(err.response?.data?.message || t('group_detail.meetings.delete_failed'))
      }
    }
  }

  const handleOpenEditMeeting = (meeting) => {
    setEditingMeeting(meeting)
    // Format startAt for datetime-local input (YYYY-MM-DDTHH:mm)
    const date = new Date(meeting.startAt)
    const formattedDate = date.toISOString().slice(0, 16)
    setEditMeetingData({
      title: meeting.title,
      description: meeting.description || '',
      startAt: formattedDate,
      durationMinutes: meeting.durationMinutes
    })
    setEditMeetingDialogOpen(true)
  }

  const handleUpdateMeeting = async (e) => {
    e.preventDefault()
    try {
      await meetingService.updateMeeting(editingMeeting.id, editMeetingData)
      const freshMeetings = await meetingService.getMeetingsByGroup(id)
      setMeetings(freshMeetings)
      setEditMeetingDialogOpen(false)
      alert(t('group_detail.meetings.update_success'))
    } catch (err) {
      alert(err.response?.data?.message || t('group_detail.meetings.update_failed'))
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!group) return <Alert severity="warning">Group not found.</Alert>

  return (
    <Box>
      {/* Group Header */}
      <Paper sx={{ p: 0, mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            height: 200,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${group.coverUrl || 'https://via.placeholder.com/1200x300?text=Group+Cover'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            p: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
            <Avatar
              sx={{ width: 100, height: 100, border: '4px solid white', mr: 3, bgcolor: 'primary.main' }}
            >
              {group.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{group.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Chip label={group.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography variant="body2">{t('group_card.members_count', { count: group.memberCount })}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3 }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
            <Tab icon={<InfoIcon />} iconPosition="start" label={t('group_detail.tabs.overview')} />
            {group.isJoined && <Tab icon={<CourseIcon />} iconPosition="start" label={t('group_detail.tabs.courses')} />}
            {group.isJoined && <Tab icon={<AssignmentIcon />} iconPosition="start" label={t('group_detail.tabs.assignments')} />}
            {group.isJoined && <Tab icon={<QuizIcon />} iconPosition="start" label="Kiểm tra" />}
            {group.isJoined && <Tab icon={<MeetingIcon />} iconPosition="start" label={t('group_detail.tabs.meetings')} />}
            {group.isJoined && <Tab icon={<ForumIcon />} iconPosition="start" label={t('group_detail.tabs.feed')} />}
            {group.isJoined && <Tab icon={<PeopleIcon />} iconPosition="start" label={t('group_detail.tabs.members')} />}
          </Tabs>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!group.isJoined ? (
              <Button variant="contained" color="secondary" onClick={handleJoinGroup}>
                {t('group_card.join')}
              </Button>
            ) : (
              <>
                {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                  <>
                    <Tooltip title={t('group_detail.share')}>
                      <IconButton onClick={() => setShareDialogOpen(true)}><ShareIcon /></IconButton>
                    </Tooltip>
                    {group.currentUserRole === 'OWNER' && (
                      <Button variant="contained" startIcon={<SettingsIcon />} onClick={() => setManageDialogOpen(true)}>{t('group_detail.manage')}</Button>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>{t('group_detail.details')}</Typography>
                <Typography variant="body1" paragraph>
                  {group.description || t('group_card.no_desc')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>{t('group_detail.owner')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Avatar sx={{ mr: 2 }}>{group.ownerName.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{group.ownerName}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('group_detail.founder')}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" gutterBottom>{t('group_detail.details')}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary"><strong>{t('group_detail.visibility')}:</strong> {group.visibility}</Typography>
                  <Typography variant="body2" color="text.secondary"><strong>{t('group_detail.created')}:</strong> {t('group_detail.recently')}</Typography>
                  <Typography variant="body2" color="text.secondary"><strong>{t('group_detail.language')}:</strong> {i18n.language === 'vi' ? t('common.language_vi') : t('common.language_en')}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">{t('group_detail.tabs.courses')} in {group.name}</Typography>
              {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<InventoryIcon />}
                    onClick={() => setDeployModal({ open: true, type: 'course' })}
                    sx={{ borderRadius: '12px', fontWeight: 700, background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
                  >
                    Kết nối từ kho đồ
                  </Button>
                </Box>
              )}
            </Box>
            {courses.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('groups.no_groups')}</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {courses.map(course => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.thumbnailUrl || 'https://via.placeholder.com/300x150?text=Course'}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{course.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {course.description}
                        </Typography>
                        <Chip label={course.status} size="small" sx={{ mt: 2 }} />
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          component={RouterLink}
                          to={`/groups/${id}/courses/${course.id}/view`}
                        >
                          {t('group_detail.actions.learn_now')}
                        </Button>
                        {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                          <Button
                            variant="outlined"
                            component={RouterLink}
                            to={`/groups/${id}/courses/${course.id}/edit`}
                          >
                            {t('common.edit')}
                          </Button>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">{t('group_detail.tabs.assignments')}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<InventoryIcon />}
                      onClick={() => setDeployModal({ open: true, type: 'assignment' })}
                      sx={{ borderRadius: '12px', fontWeight: 700, background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', color: '#000' }}
                    >
                      Kết nối từ kho đồ
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to={`/groups/${id}/assignments`}
                >
                  {t('group_detail.actions.view_all')}
                </Button>
              </Box>
            </Box>
            
            {assignments.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('assignments.no_assignments_student')}</Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {assignments.slice(0, 6).map((asgn) => (
                  <Grid item xs={12} key={asgn.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
                        transition: 'all 0.2s',
                        borderRadius: 2
                      }}
                    >
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '16px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                            <AssignmentIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{asgn.title}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {t('assignments.due')}: {format(new Date(asgn.dueAt), 'HH:mm dd/MM/yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                        <Button 
                          variant="text" 
                          component={RouterLink} 
                          to={`/groups/${id}/assignments/${asgn.id}`}
                        >
                          {t('group_detail.actions.details')}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {assignments.length > 6 && (
                  <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                    <Button component={RouterLink} to={`/groups/${id}/assignments`}>
                      {t('group_detail.actions.see_all_assignments', { count: assignments.length })}
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Kiểm tra & Trắc nghiệm</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<InventoryIcon />}
                      onClick={() => setDeployModal({ open: true, type: 'quiz' })}
                      sx={{ borderRadius: '12px', fontWeight: 700, background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF' }}
                    >
                      Kết nối từ kho đồ
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {quizzes.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Typography color="text.secondary">Chưa có bài kiểm tra nào được tổ chức trong nhóm này.</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {quizzes.map(quiz => (
                  <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                    <Card sx={{ 
                      borderRadius: '24px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      '&:hover': { borderColor: '#10B981', background: 'rgba(16, 185, 129, 0.05)' }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                            <QuizIcon />
                          </Avatar>
                          <Typography variant="h6" fontWeight={800}>{quiz.title}</Typography>
                        </Box>
                        <Typography variant="body2" color="var(--color-text-muted)" sx={{ mb: 3 }}>
                          Thời lượng: {quiz.timeLimitSec / 60} phút | Tối đa {quiz.maxAttempts} lần làm.
                        </Typography>
                        <Button 
                          fullWidth 
                          variant="contained" 
                          component={RouterLink}
                          to={`/groups/${id}/courses/placeholder-quiz/${quiz.id}`} // Adjust taking path
                          sx={{ borderRadius: '12px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', '&:hover': { background: '#10B981', color: '#FFF' } }}
                        >
                          Bắt đầu làm bài
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">{t('group_detail.tabs.meetings')}</Typography>
              {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                <Button 
                  variant="contained" 
                  startIcon={<MeetingIcon />}
                  onClick={() => setScheduleDialogOpen(true)}
                >
                  {t('group_detail.meetings.schedule')}
                </Button>
              )}
            </Box>
            <Grid container spacing={3}>
              {meetings.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 5, textAlign: 'center' }}>
                    <Typography color="text.secondary">{t('group_detail.meetings.no_meetings')}</Typography>
                  </Paper>
                </Grid>
              ) : (
                meetings.map((meeting) => (
                  <Grid item xs={12} md={6} key={meeting.id}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderRadius: 2,
                        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{meeting.title}</Typography>
                          {meeting.status === 'LIVE' && <Chip label="LIVE" color="error" size="small" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(meeting.startAt), 'HH:mm dd/MM/yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                          <Box sx={{ display: 'flex', mr: 1 }}>
                            {meeting.status === 'SCHEDULED' && (
                              <Tooltip title={t('common.edit')}>
                                <IconButton size="small" onClick={() => handleOpenEditMeeting(meeting)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {meeting.status !== 'LIVE' && (
                              <Tooltip title={t('common.delete')}>
                                <IconButton size="small" color="error" onClick={() => handleDeleteMeeting(meeting.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                        <Button
                          variant="contained"
                          component={RouterLink}
                          to={`/groups/${id}/meetings/${meeting.id}`}
                        >
                          {meeting.status === 'ENDED' ? t('group_detail.meetings.view_report') : t('group_detail.meetings.join')}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        )}

        {/* Placeholder for other tabs */}
        {activeTab === 5 && (
          <GroupFeed 
            groupId={id} 
            currentUserRole={group.currentUserRole}
            groupCourses={courses}
            groupAssignments={assignments}
            groupMeetings={meetings}
          />
        )}

        {activeTab === 6 && (
          <Paper sx={{ p: 3 }}>
            <GroupMembers groupId={id} groupRole={group.currentUserRole} />
          </Paper>
        )}
      </Box>

      {/* Inventory Deployment Modal */}
      <InventoryDeploymentModal 
        open={deployModal.open}
        onClose={() => setDeployModal({ ...deployModal, open: false })}
        type={deployModal.type}
        groupId={id}
        onDeploySuccess={() => {
          refreshData();
          alert('Học liệu đã được kết nối thành công!');
        }}
      />

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>{t('group_detail.share')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('groups.invite_code_desc')}
          </DialogContentText>
          <Box sx={{ p: 3, mt: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center', border: '1px dashed grey' }}>
            <Typography variant="h4" fontWeight="bold" letterSpacing={6} color="primary">
              {group?.inviteCode || 'N/A'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>{t('common.close')}</Button>
          <Button variant="contained" onClick={() => { navigator.clipboard.writeText(group.inviteCode); alert(t('common.success')); }}>
            {t('common.copy')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Dialog */}
      <Dialog open={manageDialogOpen} onClose={() => setManageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('group_detail.manage')}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdateGroup} sx={{ mt: 2 }}>
            <TextField fullWidth label={t('groups.create.name_label')} margin="normal" value={editGroupData.name} onChange={(e) => setEditGroupData({...editGroupData, name: e.target.value})} required />
            <TextField fullWidth label={t('groups.create.desc_label')} margin="normal" multiline rows={3} value={editGroupData.description} onChange={(e) => setEditGroupData({...editGroupData, description: e.target.value})} />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField fullWidth select label={t('group_detail.visibility')} value={editGroupData.visibility} onChange={(e) => setEditGroupData({...editGroupData, visibility: e.target.value})}>
                  <MenuItem value="PUBLIC">{t('groups.create.public_title')}</MenuItem>
                  <MenuItem value="PRIVATE">{t('groups.create.private_title')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label={t('groups.create.category_label')} placeholder={t('groups.create.category_placeholder')} value={editGroupData.category} onChange={(e) => setEditGroupData({...editGroupData, category: e.target.value})} />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }} fullWidth>{t('common.save')}</Button>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>{t('group_detail.danger_zone.title')}</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('group_detail.danger_zone.desc')} <strong>{group.name}</strong>
          </Typography>
          <TextField fullWidth size="small" placeholder={group.name} value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} sx={{ mb: 2 }} />
          <Button variant="outlined" color="error" fullWidth onClick={handleDeleteGroup} disabled={deleteConfirmText !== group.name}>
            {t('common.confirm_delete')}
          </Button>
        </DialogContent>
      </Dialog>
      {/* Schedule Meeting Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('group_detail.meetings.schedule')}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleScheduleMeeting} sx={{ mt: 2 }}>
            <TextField 
              fullWidth label={t('group_detail.meetings.title')} margin="normal" required
              value={newMeetingData.title} 
              onChange={(e) => setNewMeetingData({...newMeetingData, title: e.target.value})} 
            />
            <TextField 
              fullWidth label={t('group_detail.meetings.description')} margin="normal" multiline rows={2}
              value={newMeetingData.description} 
              onChange={(e) => setNewMeetingData({...newMeetingData, description: e.target.value})} 
            />
            <TextField 
              fullWidth label={t('group_detail.meetings.start_time')} margin="normal" type="datetime-local" required
              InputLabelProps={{ shrink: true }}
              value={newMeetingData.startAt} 
              onChange={(e) => setNewMeetingData({...newMeetingData, startAt: e.target.value})} 
            />
            <TextField 
              fullWidth label={t('group_detail.meetings.duration')} margin="normal" type="number" required
              value={newMeetingData.durationMinutes} 
              onChange={(e) => setNewMeetingData({...newMeetingData, durationMinutes: e.target.value})} 
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              {t('common.create')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={editMeetingDialogOpen} onClose={() => setEditMeetingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('group_detail.meetings.edit')}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdateMeeting} sx={{ mt: 2 }}>
            <TextField 
              fullWidth label={t('group_detail.meetings.title')} margin="normal" required
              value={editMeetingData.title} 
              onChange={(e) => setEditMeetingData({...editMeetingData, title: e.target.value})} 
            />
            <TextField 
              fullWidth label={t('group_detail.meetings.description')} margin="normal" multiline rows={2}
              value={editMeetingData.description} 
              onChange={(e) => setEditMeetingData({...editMeetingData, description: e.target.value})} 
            />
            <TextField 
              fullWidth label={t('group_detail.meetings.start_time')} margin="normal" type="datetime-local" required
              InputLabelProps={{ shrink: true }}
              value={editMeetingData.startAt} 
              onChange={(e) => setEditMeetingData({...editMeetingData, startAt: e.target.value})} 
            />
            <TextField 
              fullWidth label={t('group_detail.meetings.duration')} margin="normal" type="number" required
              value={editMeetingData.durationMinutes} 
              onChange={(e) => setEditMeetingData({...editMeetingData, durationMinutes: e.target.value})} 
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              {t('common.save_changes')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default GroupDetail
