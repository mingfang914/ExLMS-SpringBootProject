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
import { Clock } from 'lucide-react'
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useModal } from '../../context/ModalContext'
import groupService from '../../services/groupService'
import courseService from '../../services/courseService'
import assignmentService from '../../services/assignmentService'
import * as quizService from '../../services/quizService'
import meetingService from '../../services/meetingService'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

import GroupMembers from './components/GroupMembers'
import GroupFeed from './components/GroupFeed'
import InventoryDeploymentModal from '../Inventory/InventoryDeploymentModal'
import DeploymentEditModal from './components/DeploymentEditModal'
import GroupCollab from '../Collab/index'

const DashedPanel = ({ children, sx = {} }) => (
  <Box 
    sx={{ 
      p: 4, 
      borderRadius: '24px', 
      border: '1px dashed #6366F1', 
      background: 'rgba(99, 102, 241, 0.05)', 
      minHeight: '400px',
      position: 'relative',
      ...sx 
    }}
  >
    {children}
  </Box>
)

const GroupDetail = () => {
  const { t, i18n } = useTranslation()
  const { showConfirm, showSuccess, showError } = useModal()
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
    const confirmed = await showConfirm(
      t('common.confirm_delete'),
      t('common.confirm_delete_msg') || 'Bạn có chắc chắn muốn xóa học liệu này?',
      'error'
    );
    if (!confirmed) return
    try {
      if (type === 'course') await courseService.deleteCourse(id, resId)
      else if (type === 'assignment') await assignmentService.deleteDeployment(resId)
      else if (type === 'quiz') await quizService.deleteQuiz(resId)
      
      refreshData()
      await showSuccess(t('common.success'))
    } catch (err) {
      await showError(t('common.error'), err.response?.data?.message || t('common.error'))
    }
  }

  const handleJoinGroup = async () => {
    try {
      const response = await groupService.createJoinRequest(id, t('groups.messages.join_default'))
      await showSuccess(t('common.success'), response || t('groups.messages.join_sent'))
      // Tải lại thông tin nhóm nếu nhóm được duyệt tự động (Auto-Join)
      const groupData = await groupService.getGroupById(id)
      setGroup(groupData)
    } catch (err) {
      await showError(t('common.error'), err.response?.data?.message || t('groups.errors.join_failed'))
    }
  }

  const handleLeaveGroup = async () => {
    const confirmed = await showConfirm(
      t('group_detail.tabs.leave'),
      t('group_detail.messages.leave_confirm'),
      'warning'
    )
    if (!confirmed) return

    try {
      await groupService.leaveGroup(id)
      await showSuccess(t('common.success'), t('group_detail.messages.leave_success'))
      navigate('/groups')
    } catch (err) {
      showError(t('common.error'), err.response?.data?.message || t('group_detail.messages.leave_failed'))
    }
  }

  const handleUpdateGroup = async (e) => {
    e.preventDefault()
    try {
      await groupService.updateGroup(id, editGroupData)
      setGroup({ ...group, ...editGroupData })
      setManageDialogOpen(false)
      await showSuccess(t('common.success'), t('group_detail.messages.update_success'))
    } catch (err) {
      await showError(t('common.error'), err.response?.data?.message || t('group_detail.errors.update_failed'))
    }
  }

  const handleDeleteGroup = async () => {
    if (deleteConfirmText !== group.name) {
      await showError(t('common.error'), t('group_detail.danger_zone.desc') + group.name)
      return
    }
    const confirmed = await showConfirm(
      t('common.confirm_delete'),
      t('group_detail.danger_zone.desc_full'),
      'error'
    );
    if (confirmed) {
      try {
        await groupService.deleteGroup(id)
        await showSuccess(t('common.success'))
        navigate('/groups')
      } catch (err) {
        await showError(t('common.error'), err.response?.data?.message || t('common.error'))
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
      await showSuccess(t('common.success'), t('group_detail.meetings.schedule_success'))
    } catch (err) {
      await showError(t('common.error'), t('group_detail.meetings.schedule_failed'))
    }
  }

  const handleDeleteMeeting = async (meetingId) => {
    const confirmed = await showConfirm(
      t('common.confirm_delete'),
      t('group_detail.meetings.delete_confirm'),
      'warning'
    );
    if (confirmed) {
      try {
        await meetingService.deleteMeeting(meetingId)
        setMeetings(meetings.filter(m => m.id !== meetingId))
        await showSuccess(t('common.success'), t('group_detail.meetings.delete_success'))
      } catch (err) {
        await showError(t('common.error'), err.response?.data?.message || t('group_detail.meetings.delete_failed'))
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
      await showSuccess(t('common.success'), t('group_detail.meetings.update_success'))
    } catch (err) {
      await showError(t('common.error'), err.response?.data?.message || t('group_detail.meetings.update_failed'))
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
        
        <Box 
          sx={{ 
            p: 1, 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', md: 'center' }, 
            px: { xs: 1, md: 3 },
            gap: 2
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-flexContainer': { gap: { xs: 0, md: 1 } }
            }}
          >
            <Tab icon={<InfoIcon />} iconPosition="start" label={t('group_detail.tabs.overview')} sx={{ minHeight: 64 }} />
            {group.isJoined && <Tab icon={<CourseIcon />} iconPosition="start" label={t('group_detail.tabs.courses')} sx={{ minHeight: 64 }} />}
            {group.isJoined && <Tab icon={<AssignmentIcon />} iconPosition="start" label={t('group_detail.tabs.assignments')} sx={{ minHeight: 64 }} />}
            {group.isJoined && <Tab icon={<QuizIcon />} iconPosition="start" label={t('group_detail.tabs.quizzes')} sx={{ minHeight: 64 }} />}
            {group.isJoined && <Tab icon={<MeetingIcon />} iconPosition="start" label={t('group_detail.tabs.meetings')} sx={{ minHeight: 64 }} />}
            {group.isJoined && <Tab icon={<ShareIcon />} iconPosition="start" label={t('group_detail.tabs.collab')} sx={{ minHeight: 64 }} />}
            {group.isJoined && <Tab icon={<ForumIcon />} iconPosition="start" label={t('group_detail.tabs.feed')} sx={{ minHeight: 64 }} />}
            {group.isJoined && <Tab icon={<PeopleIcon />} iconPosition="start" label={t('group_detail.tabs.members')} sx={{ minHeight: 64 }} />}
          </Tabs>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-end', md: 'flex-start' }, px: { xs: 1, md: 0 }, pb: { xs: 1, md: 0 } }}>
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
                    {t('group_detail.tabs.leave')}
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
          <DashedPanel>
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
          </DashedPanel>
        )}

        {activeTab === 1 && (
          <DashedPanel>
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
                    {t('group_detail.actions.connect_inventory')}
                  </Button>
                </Box>
              )}
            </Box>
            {courses.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('groups.no_groups')}</Typography>
              </Box>
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
                            <Typography variant="caption" color="text.secondary">{t('group_detail.resource_card.status')}</Typography>
                            <Chip label={course.status} size="small" color={course.status === 'PUBLISHED' ? 'success' : 'default'} />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">{t('group_detail.resource_card.created_at')}</Typography>
                            <Typography variant="caption" fontWeight={700}>{course.startDate ? format(new Date(course.startDate), 'dd/MM/yyyy') : '---'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">{t('course_editor.end_date_label')}</Typography>
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
          </DashedPanel>
        )}
        
        {activeTab === 2 && (
          <DashedPanel>
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
                      {t('group_detail.actions.connect_inventory')}
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
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('assignments.no_assignments_student')}</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {assignments.map((asgn) => {
                  const isClosed = asgn.status === 'CLOSED';
                  return (
                    <Grid item xs={12} sm={6} md={4} key={asgn.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex', 
                          flexDirection: 'column',
                          borderRadius: '24px',
                          overflow: 'hidden',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid',
                          borderColor: isClosed ? 'rgba(255,255,255,0.05)' : 'rgba(99, 102, 241, 0.2)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': { 
                            boxShadow: '0 12px 24px rgba(0,0,0,0.3)', 
                            borderColor: '#6366F1',
                            transform: 'translateY(-4px)'
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="160"
                          image={asgn.coverImageUrl || '/api/files/download/Assets/AssignmentDefaultCover.jpg'}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ p: 3, flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{asgn.title}</Typography>
                            <Chip 
                               label={isClosed ? t('course_editor.status_ended') : asgn.status} 
                               size="small" 
                               color={isClosed ? 'default' : 'primary'} 
                               variant="outlined"
                            />
                          </Box>

                          <Stack spacing={1.5} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                              <AddIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption">{t('group_detail.resource_card.assigned_at')}: {asgn.assignedAt ? format(new Date(asgn.assignedAt), 'HH:mm dd/MM') : '---'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isClosed ? 'error.main' : 'warning.main' }}>
                              <Clock sx={{ fontSize: 16 }} />
                              <Typography variant="caption" fontWeight="bold">{t('group_detail.resource_card.due_at')}: {asgn.dueAt ? format(new Date(asgn.dueAt), 'HH:mm dd/MM') : '---'}</Typography>
                            </Box>
                          </Stack>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              variant="contained" 
                              fullWidth
                              component={RouterLink}
                              to={`/groups/${id}/assignments/${asgn.id}`}
                              sx={{ 
                                borderRadius: '12px', 
                                fontWeight: 700,
                                textTransform: 'none',
                                background: isClosed ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #6366F1, #4F46E5)',
                                color: isClosed ? 'text.secondary' : 'white'
                              }}
                            >
                              {isClosed ? t('group_detail.resource_card.view_quiz') : t('group_detail.actions.details')}
                            </Button>
                            {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => setEditDeployModal({ open: true, type: 'assignment', resource: asgn })}
                                  sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteResource('assignment', asgn.id)}
                                  sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </DashedPanel>
        )}

        {activeTab === 3 && (
          <DashedPanel>
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
                      {t('group_detail.actions.connect_inventory')}
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {quizzes.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('group_detail.resource_card.no_quizzes')}</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {quizzes.map(quiz => (
                  <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                    <Card sx={{ 
                      borderRadius: '24px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      '&:hover': { borderColor: '#10B981', background: 'rgba(16, 185, 129, 0.05)' },
                      overflow: 'hidden'
                    }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={quiz.coverImageUrl || '/api/files/download/Assets/QuizDefaultCover.png'}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ p: 4, pt: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Typography variant="h6" fontWeight={800}>{quiz.title}</Typography>
                        </Box>
                        
                        <Grid container spacing={1} sx={{ mb: 3 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">{t('group_detail.resource_card.duration')}</Typography>
                            <Typography variant="body2" fontWeight={700}>{quiz.timeLimitSec / 60} {t('group_detail.resource_card.minutes')}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">{t('group_detail.resource_card.questions_count')}</Typography>
                            <Typography variant="body2" fontWeight={700}>{quiz.questionCount || 0} {t('group_detail.resource_card.questions')}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">{t('group_detail.resource_card.max_attempts')}</Typography>
                            <Typography variant="body2" fontWeight={700}>{t('group_detail.resource_card.limit')} {quiz.maxAttempts}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">{t('group_detail.resource_card.passing_score')}</Typography>
                            <Typography variant="body2" fontWeight={700}>{quiz.passingScore}/100</Typography>
                          </Grid>
                          {quiz.openAt && (
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">{t('group_detail.resource_card.open_at')}</Typography>
                              <Typography variant="body2" fontWeight={700}>{format(new Date(quiz.openAt), 'HH:mm dd/MM')}</Typography>
                            </Grid>
                          )}
                          {quiz.closeAt && (
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">{t('group_detail.resource_card.close_at')}</Typography>
                              <Typography variant="body2" fontWeight={700} color="error">{format(new Date(quiz.closeAt), 'HH:mm dd/MM')}</Typography>
                            </Grid>
                          )}
                        </Grid>

                        <Stack direction="row" spacing={1}>
                          <Button 
                            fullWidth 
                            variant="contained" 
                            component={RouterLink}
                            to={quiz.status === 'CLOSED' 
                              ? (group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR' 
                                  ? `/groups/${id}/courses/placeholder-quiz/quiz/${quiz.id}/stats`
                                  : `/groups/${id}/courses/placeholder-quiz/quiz/${quiz.id}/attempts/latest`) // Sẽ tạo route/logic cho học sinh sau
                              : `/groups/${id}/courses/placeholder-quiz/quiz/${quiz.id}/take`
                            } 
                            disabled={quiz.status === 'DRAFT' && group.currentUserRole === 'MEMBER'}
                            sx={{ borderRadius: '12px', fontWeight: 700, background: quiz.status === 'CLOSED' ? 'rgba(0,0,0,0.1)' : 'rgba(16, 185, 129, 0.2)', color: quiz.status === 'CLOSED' ? 'text.secondary' : '#10B981', '&:hover': { background: '#10B981', color: '#FFF' } }}
                          >
                            {quiz.status === 'CLOSED' ? t('group_detail.resource_card.view_quiz') : t('group_detail.resource_card.start_quiz')}
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
          </DashedPanel>
        )}

        {activeTab === 4 && (
          <DashedPanel>
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
                  <Box sx={{ py: 10, textAlign: 'center' }}>
                    <Typography color="text.secondary">{t('group_detail.meetings.no_meetings')}</Typography>
                  </Box>
                </Grid>
              ) : (
                meetings.map((meeting) => {
                  const startTime = new Date(meeting.startAt);
                  const endTime = meeting.endAt ? new Date(meeting.endAt) : new Date(startTime.getTime() + (meeting.durationMinutes || 60) * 60000);
                  const now = new Date();
                  const isLive = meeting.status === 'PUBLISHED' && now >= startTime && now <= endTime;
                  const isClosed = meeting.status === 'CLOSED' || now > endTime;

                  return (
                    <Grid item xs={12} sm={6} md={6} key={meeting.id}>
                      <Card 
                        sx={{ 
                          display: 'flex', 
                          borderRadius: '24px',
                          overflow: 'hidden',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid',
                          borderColor: isLive ? 'error.main' : 'rgba(255,255,255,0.05)',
                          transition: 'all 0.3s',
                          '&:hover': { 
                            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                            borderColor: isLive ? 'error.main' : 'primary.main'
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          sx={{ width: 140, objectFit: 'cover' }}
                          image={meeting.coverImageUrl || '/api/files/download/Assets/MeetingDefaultCover.png'}
                        />
                        <CardContent sx={{ flex: 1, p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>{meeting.title}</Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                {isLive && <Chip label="LIVE" color="error" size="small" sx={{ fontWeight: 900, height: 20 }} />}
                                <Chip label={meeting.status} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                              </Box>
                            </Box>
                            {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                              <Box sx={{ display: 'flex' }}>
                                <IconButton size="small" onClick={() => handleOpenEditMeeting(meeting)}>
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteMeeting(meeting.id)}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            )}
                          </Box>

                          <Stack spacing={0.5} sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Clock size={12} /> Bắt đầu: {format(startTime, 'HH:mm dd/MM')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Clock size={12} /> Kết thúc: {format(endTime, 'HH:mm dd/MM')}
                            </Typography>
                          </Stack>

                          <Button
                            variant="contained"
                            fullWidth
                            component={RouterLink}
                            to={`/groups/${id}/meetings/${meeting.id}`}
                            disabled={meeting.status === 'DRAFT' && group.currentUserRole === 'MEMBER'}
                            sx={{ 
                              borderRadius: '12px', 
                              fontWeight: 700,
                              background: isLive ? 'error.main' : (isClosed ? 'rgba(255,255,255,0.1)' : 'primary.main')
                            }}
                          >
                            {isClosed ? 'Xem báo cáo' : (isLive ? 'Tham gia ngay' : 'Vào phòng')}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </DashedPanel>
        )}

        {activeTab === 5 && (
          <DashedPanel sx={{ p: 0 }}>
            <GroupCollab groupId={id} />
          </DashedPanel>
        )}

        {activeTab === 6 && (
          <DashedPanel>
            <GroupFeed 
              groupId={id} 
              currentUserRole={group.currentUserRole}
              groupCourses={courses}
              groupAssignments={assignments}
              groupMeetings={meetings}
            />
          </DashedPanel>
        )}

        {activeTab === 7 && (
          <DashedPanel>
            <GroupMembers groupId={id} groupRole={group.currentUserRole} />
          </DashedPanel>
        )}
      </Box>

      {/* Inventory Deployment Modal */}
      <InventoryDeploymentModal 
        open={deployModal.open}
        onClose={() => setDeployModal({ ...deployModal, open: false })}
        type={deployModal.type}
        groupId={id}
        onDeploySuccess={async () => {
          refreshData();
          await showSuccess(t('common.success'), 'Học liệu đã được kết nối thành công!');
        }}
      />

      <DeploymentEditModal
        open={editDeployModal.open}
        onClose={() => setEditDeployModal({ ...editDeployModal, open: false })}
        type={editDeployModal.type}
        resource={editDeployModal.resource}
        onUpdateSuccess={async () => {
          refreshData();
          await showSuccess(t('common.success'), 'Cập nhật thiết đặt thành công!');
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
          <Button variant="contained" onClick={async () => { 
            navigator.clipboard.writeText(group.inviteCode); 
            await showSuccess(t('common.success'), t('group_detail.invite_code_copied') || 'Đã sao chép mã mời!'); 
          }}>
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
              <MenuItem value="DRAFT">{t('group_detail.meetings.status_draft')}</MenuItem>
              <MenuItem value="PUBLISHED">{t('group_detail.meetings.status_published')}</MenuItem>
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
              <MenuItem value="DRAFT">{t('group_detail.meetings.status_draft')}</MenuItem>
              <MenuItem value="PUBLISHED">{t('group_detail.meetings.status_published')}</MenuItem>
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
