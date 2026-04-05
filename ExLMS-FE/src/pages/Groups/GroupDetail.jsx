import React, { useState, useEffect } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
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
  MenuItem,
  Stack
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
  Insights as TipsIcon,
  Logout as LeaveIcon
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
import DeploymentEditModal from './components/DeploymentEditModal'

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
  const [newMeetingData, setNewMeetingData] = useState({ title: '', description: '', startAt: '', endAt: '', status: 'PUBLISHED' })
  const [editMeetingDialogOpen, setEditMeetingDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [editMeetingData, setEditMeetingData] = useState({ title: '', description: '', startAt: '', endAt: '', status: 'PUBLISHED' })
  
  const [deployModal, setDeployModal] = useState({ open: false, type: 'course' })
  const [editDeployModal, setEditDeployModal] = useState({ open: false, type: 'course', resource: null })
  const navigate = useNavigate()
  const stompClientRef = React.useRef(null)

  const refreshData = React.useCallback(async () => {
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
  }, [id])

  useEffect(() => {
    // WebSocket setup
    const socket = new SockJS('/api/ws')
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = (frame) => {
      console.log('STOMP Connected: ' + frame)
      client.subscribe('/topic/resource-status', (message) => {
        try {
          const event = JSON.parse(message.body)
          console.log('Resource Status Event:', event)
          if (event.type === 'STATUS_CHANGED') {
            refreshData()
          }
        } catch (err) {
          console.error('Error parsing STOMP message', err)
        }
      })
    }

    client.activate()
    stompClientRef.current = client

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
      }
    }
  }, [refreshData])

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



  const handleDeleteResource = async (type, resId) => {
    if (!window.confirm(t('common.confirm_delete'))) return
    try {
      if (type === 'course') await courseService.deleteCourse(id, resId)
      else if (type === 'assignment') await assignmentService.deleteDeployment(resId)
      else if (type === 'quiz') await quizService.deleteQuiz(resId)
      
      refreshData()
      alert(t('common.success'))
    } catch (err) {
      alert(err.response?.data?.message || t('common.error'))
    }
  }

  const handleJoinGroup = async () => {
    try {
      const response = await groupService.createJoinRequest(id, t('groups.messages.join_default'))
      alert(response || t('groups.messages.join_sent'))
      // Tải lại thông tin nhóm nếu nhóm được duyệt tự động (Auto-Join)
      const groupData = await groupService.getGroupById(id)
      setGroup(groupData)
    } catch (err) {
      alert(err.response?.data?.message || t('groups.errors.join_failed'))
    }
  }

  const handleLeaveGroup = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn rời khỏi nhóm học tập này?')) return
    try {
      await groupService.leaveGroup(id)
      alert('Đã rời khỏi nhóm thành công!')
      navigate('/groups')
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể rời nhóm lúc này!')
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
      setNewMeetingData({ title: '', description: '', startAt: '', endAt: '', status: 'PUBLISHED' })
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
      startAt: meeting.startAt ? new Date(meeting.startAt).toISOString().slice(0, 16) : '',
      endAt: meeting.endAt ? new Date(meeting.endAt).toISOString().slice(0, 16) : '',
      status: meeting.status || 'PUBLISHED'
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
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {group.name} 
                <Typography variant="caption" sx={{ opacity: 0.5, ml: 1, color: 'inherit' }}>v1.0.2</Typography>
              </Typography>
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
                {group.currentUserRole !== 'OWNER' && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LeaveIcon />}
                    onClick={handleLeaveGroup}
                    sx={{ borderRadius: '12px', fontWeight: 700 }}
                  >
                    Rời nhóm
                  </Button>
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
                  {courses.map(course => {
                    // Ẩn luôn card đối với member nếu đã CLOSED
                    if (course.status === 'CLOSED' && group.currentUserRole === 'MEMBER') return null;
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.thumbnailUrl || 'https://via.placeholder.com/300x150?text=Course'}
                        sx={{ borderRadius: '16px 16px 0 0' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={800}>{course.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.description}
                        </Typography>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                            <Chip label={course.status} size="small" color={course.status === 'PUBLISHED' ? 'success' : 'default'} />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Ngày tạo</Typography>
                            <Typography variant="caption" fontWeight={700}>{course.startDate ? format(new Date(course.startDate), 'dd/MM/yyyy') : '---'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Ngày kết thúc</Typography>
                            <Typography variant="caption" fontWeight={700}>{course.endDate ? format(new Date(course.endDate), 'dd/MM/yyyy') : '---'}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                        {!(course.status === 'CLOSED' && group.currentUserRole === 'MEMBER') && (
                          <Button
                            fullWidth
                            variant="contained"
                            component={RouterLink}
                            to={`/groups/${id}/courses/${course.id}/view`}
                            sx={{ borderRadius: '12px', fontWeight: 700 }}
                          >
                             {t('group_detail.actions.learn_now')}
                          </Button>
                        )}
                        {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && course.status !== 'CLOSED' && (
                          <IconButton
                            color="primary"
                            onClick={() => setEditDeployModal({ open: true, type: 'course', resource: course })}
                            sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' } }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && course.status !== 'CLOSED' && (
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteResource('course', course.id)}
                            sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
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
                {Array.isArray(assignments) && assignments.slice(0, 6).map((asgn) => (
                  <Grid item xs={12} key={asgn.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
                        transition: 'all 0.2s',
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '20px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Avatar sx={{ bgcolor: 'rgba(252, 211, 77, 0.1)', color: '#FCD34D', width: 48, height: 48, borderRadius: 2 }}>
                            <AssignmentIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="subtitle1" fontWeight="bold">{asgn.title}</Typography>
                              <Chip label={asgn.status} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                            </Box>
                            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                              <Grid item>
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                  Giao: {asgn.assignedAt ? format(new Date(asgn.assignedAt), 'HH:mm dd/MM') : '---'}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                                  Hạn: {asgn.dueAt ? format(new Date(asgn.dueAt), 'HH:mm dd/MM') : '---'}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="caption" color="textSecondary">
                                  Nộp muộn: <span style={{ color: asgn.allowLate ? '#10B981' : '#EF4444', fontWeight: 700 }}>{asgn.allowLate ? `Có (-${asgn.latePenaltyPercent}%)` : 'Không'}</span>
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="caption" color="textSecondary">
                                  {asgn.submissionType} • {asgn.maxScore} pts
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                          <Button 
                            variant="contained" 
                            component={RouterLink} 
                            to={`/groups/${id}/assignments/${asgn.id}`}
                            disabled={String(asgn.status).toUpperCase() === 'CLOSED' && !asgn.allowLate && group.currentUserRole === 'MEMBER'}
                            sx={{ borderRadius: '12px', bgcolor: 'rgba(252, 211, 77, 0.1)', color: '#FCD34D', '&:hover': { bgcolor: 'rgba(252, 211, 77, 0.2)' } }}
                          >
                            {String(asgn.status).toUpperCase() === 'CLOSED' ? (asgn.allowLate ? 'Nộp muộn' : t('common.closed')) : t('group_detail.actions.details')}
                          </Button>
                          {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && String(asgn.status).toUpperCase() !== 'CLOSED' && (
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => setEditDeployModal({ open: true, type: 'assignment', resource: asgn })}
                              sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && asgn.status !== 'CLOSED' && (
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteResource('assignment', asgn.id)}
                              sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
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
                        
                        <Grid container spacing={1} sx={{ mb: 3 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Thời lượng</Typography>
                            <Typography variant="body2" fontWeight={700}>{quiz.timeLimitSec / 60} phút</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Số câu hỏi</Typography>
                            <Typography variant="body2" fontWeight={700}>{quiz.questionCount || 0} câu</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Lượt làm bài</Typography>
                            <Typography variant="body2" fontWeight={700}>Tối đa {quiz.maxAttempts}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">Điểm đạt</Typography>
                            <Typography variant="body2" fontWeight={700}>{quiz.passingScore}/100</Typography>
                          </Grid>
                          {quiz.openAt && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" display="block">Thời gian mở</Typography>
                              <Typography variant="body2" fontWeight={700}>{format(new Date(quiz.openAt), 'HH:mm dd/MM/yyyy')}</Typography>
                            </Grid>
                          )}
                        </Grid>

                        <Stack direction="row" spacing={1}>
                          <Button 
                            fullWidth 
                            variant="contained" 
                            component={RouterLink}
                            to={`/groups/${id}/courses/placeholder-quiz/quiz/${quiz.id}/take`} 
                            disabled={quiz.status === 'CLOSED' && (group.currentUserRole === 'MEMBER' || !group.currentUserRole)}
                            sx={{ borderRadius: '12px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', '&:hover': { background: '#10B981', color: '#FFF' } }}
                          >
                            {quiz.status === 'CLOSED' ? 'Đã đóng' : 'Bắt đầu làm bài'}
                          </Button>
                          {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                            <>
                              {quiz.status !== 'CLOSED' && (
                                <Tooltip title="Thiết lập">
                                  <IconButton 
                                    color="primary"
                                    onClick={() => setEditDeployModal({ open: true, type: 'quiz', resource: quiz })}
                                    sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' } }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Xem thống kê & lịch sử">
                                <IconButton 
                                  color="info"
                                  component={RouterLink}
                                  to={`/groups/${id}/courses/placeholder-quiz/quiz/${quiz.id}/stats`}
                                  sx={{ bgcolor: 'rgba(30, 64, 175, 0.1)', '&:hover': { bgcolor: 'rgba(30, 64, 175, 0.2)' } }}
                                >
                                  <TipsIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {quiz.status !== 'CLOSED' && (
                                <IconButton 
                                  color="error"
                                  onClick={() => handleDeleteResource('quiz', quiz.id)}
                                  sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </>
                          )}
                        </Stack>
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
                meetings.map((meeting) => {
                  const startTime = new Date(meeting.startAt);
                  const endTime = meeting.endAt ? new Date(meeting.endAt) : new Date(startTime.getTime() + (meeting.durationMinutes || 60) * 60000);
                  const now = new Date();
                  const isLive = meeting.status === 'PUBLISHED' && now >= startTime && now <= endTime;

                  return (
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
                          borderColor: isLive ? 'error.main' : 'divider'
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{meeting.title}</Typography>
                            {isLive && <Chip label="LIVE" color="error" size="small" />}
                            {meeting.status === 'DRAFT' && <Chip label="DRAFT" variant="outlined" size="small" />}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(meeting.startAt), 'HH:mm dd/MM/yyyy')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                            <Box sx={{ display: 'flex', mr: 1 }}>
                              {meeting.status !== 'CLOSED' && (
                                <Tooltip title={t('common.edit')}>
                                  <IconButton size="small" onClick={() => handleOpenEditMeeting(meeting)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title={t('common.delete')}>
                                <IconButton size="small" color="error" onClick={() => handleDeleteMeeting(meeting.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                          <Button
                            variant="contained"
                            component={RouterLink}
                            to={`/groups/${id}/meetings/${meeting.id}`}
                            disabled={meeting.status === 'DRAFT' && group.currentUserRole === 'MEMBER'}
                            color={isLive ? 'error' : 'primary'}
                          >
                            {meeting.status === 'CLOSED' ? t('group_detail.meetings.view_report') : t('group_detail.meetings.join')}
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })
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

      <DeploymentEditModal
        open={editDeployModal.open}
        onClose={() => setEditDeployModal({ ...editDeployModal, open: false })}
        type={editDeployModal.type}
        resource={editDeployModal.resource}
        onUpdateSuccess={() => {
          refreshData();
          alert('Cập nhật thiết đặt thành công!');
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
              inputProps={{ min: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) }}
              value={newMeetingData.startAt} 
              onChange={(e) => setNewMeetingData({...newMeetingData, startAt: e.target.value})} 
            />
            <TextField 
              fullWidth label={t('group_detail.meetings.end_time') || 'Thời gian kết thúc'} margin="normal" type="datetime-local" required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: newMeetingData.startAt || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) }}
              value={newMeetingData.endAt} 
              onChange={(e) => setNewMeetingData({...newMeetingData, endAt: e.target.value})} 
            />
            <TextField
              fullWidth select label={t('group_detail.meeting_status') || 'Trạng thái'} margin="normal"
              value={newMeetingData.status}
              onChange={(e) => setNewMeetingData({...newMeetingData, status: e.target.value})}
            >
              <MenuItem value="DRAFT">Dành cho chủ nhóm (DRAFT)</MenuItem>
              <MenuItem value="PUBLISHED">Công khai (PUBLISHED)</MenuItem>
              <MenuItem value="CLOSED">Kết thúc (CLOSED)</MenuItem>
            </TextField>
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
              inputProps={{ min: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) }}
              value={editMeetingData.startAt} 
              onChange={(e) => setEditMeetingData({...editMeetingData, startAt: e.target.value})} 
            />
            <TextField 
              fullWidth label={t('group_detail.meetings.end_time') || 'Thời gian kết thúc'} margin="normal" type="datetime-local" required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: editMeetingData.startAt || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) }}
              value={editMeetingData.endAt} 
              onChange={(e) => setEditMeetingData({...editMeetingData, endAt: e.target.value})} 
            />
            <TextField
              fullWidth select label={t('group_detail.meeting_status') || 'Trạng thái'} margin="normal"
              value={editMeetingData.status}
              onChange={(e) => setEditMeetingData({...editMeetingData, status: e.target.value})}
            >
              <MenuItem value="DRAFT">Dành cho chủ nhóm (DRAFT)</MenuItem>
              <MenuItem value="PUBLISHED">Công khai (PUBLISHED)</MenuItem>
              <MenuItem value="CLOSED">Kết thúc (CLOSED)</MenuItem>
            </TextField>
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
