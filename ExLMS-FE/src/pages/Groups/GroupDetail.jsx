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
import { alpha } from '@mui/material/styles'
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
      else if (type === 'assignment') await assignmentService.deleteAssignment(resId)
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
    <Box sx={{ pb: 8 }}>
      {/* ── Immersive Group Header ────────────────────────────────── */}
      <Box 
        sx={{ 
          position: 'relative', 
          mb: 6, 
          borderRadius: { xs: 0, sm: '24px' }, 
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Cover Image with Depth */}
        <Box
          sx={{
            height: { xs: 220, md: 280 },
            position: 'relative',
            backgroundImage: `url(${group.coverUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to top, rgba(13,17,23,1) 0%, rgba(13,17,23,0.4) 50%, transparent 100%)' 
            }} 
          />
          
          {/* Metadata floating top right */}
          <Box sx={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 1.5 }}>
            <Chip 
              label={group.visibility} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(10px)', 
                color: 'white', 
                fontWeight: 800, 
                fontSize: '0.625rem',
                border: '1px solid rgba(255,255,255,0.1)',
                textTransform: 'uppercase',
              }} 
            />
            <Chip 
              label={group.category} 
              size="small" 
              sx={{ 
                bgcolor: alpha('#6366F1', 0.2), 
                backdropFilter: 'blur(10px)', 
                color: '#818CF8', 
                fontWeight: 800, 
                fontSize: '0.625rem',
                border: '1px solid rgba(99,102,241,0.2)',
                textTransform: 'uppercase',
              }} 
            />
          </Box>
        </Box>
        
        {/* Profile Info Overlay */}
        <Box sx={{ px: { xs: 3, md: 5 }, mt: { xs: -6, md: -8 }, position: 'relative', zIndex: 2, pb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 2, md: 4 }, flexWrap: 'wrap' }}>
            <Avatar
              sx={{ 
                width: { xs: 100, md: 140 }, 
                height: { xs: 100, md: 140 }, 
                border: '6px solid var(--color-surface-2)', 
                fontSize: '3rem', 
                fontWeight: 900,
                background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              }}
            >
              {group.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 300, pb: 1 }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontWeight: 900, 
                  fontSize: { xs: '2rem', md: '2.75rem' }, 
                  color: 'var(--color-text)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  mb: 1.5,
                  textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                {group.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-text-muted)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ fontSize: 18, color: 'var(--color-primary-lt)' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--color-text-sec)' }}>
                    {t('group_card.members_count', { count: group.memberCount })}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto', borderColor: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {t('group_detail.owner')}: <strong style={{ color: 'var(--color-text)' }}>{group.ownerName}</strong>
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5, pb: 1 }}>
              {!group.isJoined ? (
                <Button 
                  variant="contained" 
                  onClick={handleJoinGroup}
                  sx={{ 
                    height: 48, px: 4, borderRadius: '14px', 
                    fontWeight: 800, background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                    boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
                  }}
                >
                  {t('group_card.join')}
                </Button>
              ) : (
                <>
                  {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                    <>
                      <Tooltip title={t('group_detail.share')}>
                        <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} onClick={() => setShareDialogOpen(true)}>
                          <ShareIcon sx={{ color: 'var(--color-text-sec)' }} />
                        </IconButton>
                      </Tooltip>
                      {group.currentUserRole === 'OWNER' && (
                        <Button 
                          variant="outlined" 
                          startIcon={<SettingsIcon />} 
                          onClick={() => setManageDialogOpen(true)}
                          sx={{ height: 48, px: 3, borderRadius: '14px', borderColor: 'var(--color-border)', fontWeight: 700 }}
                        >
                          {t('group_detail.manage')}
                        </Button>
                      )}
                    </>
                  )}
                  {group.currentUserRole !== 'OWNER' && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<LeaveIcon />}
                      onClick={handleLeaveGroup}
                      sx={{ height: 48, px: 3, borderRadius: '14px', fontWeight: 700 }}
                    >
                      {t('group_detail.leave')}
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
        
        {/* Premium Navigation Tabs */}
        <Box sx={{ bgcolor: 'rgba(13,17,23,0.3)', px: { xs: 2, md: 4 } }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 64,
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
                background: 'linear-gradient(90deg, #6366F1, #22D3EE)',
                boxShadow: '0 -4px 12px rgba(99,102,241,0.5)',
              },
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                px: { xs: 2, md: 3 },
                transition: 'all 0.2s',
                '&.Mui-selected': { color: 'var(--color-text)' },
                '&:hover': { color: 'var(--color-text)', bgcolor: 'rgba(255,255,255,0.02)' },
              },
            }}
          >
            <Tab icon={<InfoIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('group_detail.tabs.overview')} />
            {group.isJoined && <Tab icon={<CourseIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('group_detail.tabs.courses')} />}
            {group.isJoined && <Tab icon={<AssignmentIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('group_detail.tabs.assignments')} />}
            {group.isJoined && <Tab icon={<QuizIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Kiểm tra" />}
            {group.isJoined && <Tab icon={<MeetingIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('group_detail.tabs.meetings')} />}
            {group.isJoined && <Tab icon={<ForumIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('group_detail.tabs.feed')} />}
            {group.isJoined && <Tab icon={<PeopleIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={t('group_detail.tabs.members')} />}
          </Tabs>

        </Box>
      </Box>

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
              <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed var(--color-border)' }}>
                <Typography color="text.secondary">{t('groups.no_groups')}</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3.5}>
                {courses.map(course => {
                  if (course.status === 'CLOSED' && group.currentUserRole === 'MEMBER') return null;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                      <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '20px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                          <Box sx={{ position: 'relative', height: 160 }}>
                            <CardMedia
                              component="img"
                              sx={{ height: '100%', objectFit: 'cover' }}
                              image={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'}
                            />
                            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-surface-2), transparent)' }} />
                            <Chip 
                              label={course.status} 
                              size="small" 
                              sx={{ 
                                position: 'absolute', top: 12, right: 12,
                                bgcolor: course.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                                color: course.status === 'PUBLISHED' ? '#34D399' : '#FFF',
                                fontWeight: 800, fontSize: '0.625rem',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                              }} 
                            />
                          </Box>
                          <CardContent sx={{ flexGrow: 1, px: 3, pt: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.3 }}>{course.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3em' }}>
                              {course.description}
                            </Typography>
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{t('common.created')}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>{course.startDate ? format(new Date(course.startDate), 'dd MMM, yyyy') : '---'}</Typography>
                              </Box>
                              <Box sx={{ height: 1, bgcolor: 'rgba(255,255,255,0.03)' }} />
                            </Stack>
                          </CardContent>
                          <Box sx={{ p: 2.5, pt: 0, display: 'flex', gap: 1 }}>
                            <Button
                              fullWidth
                              variant="contained"
                              component={RouterLink}
                              to={`/groups/${id}/courses/${course.id}/view`}
                              disabled={course.status === 'CLOSED' && group.currentUserRole === 'MEMBER'}
                              sx={{ 
                                borderRadius: '12px', fontWeight: 800, height: 40,
                                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                              }}
                            >
                              {course.status === 'CLOSED' ? t('common.ended') : t('group_detail.actions.learn_now')}
                            </Button>
                            {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                              <IconButton
                                size="small"
                                onClick={() => setEditDeployModal({ open: true, type: 'course', resource: course })}
                                sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--color-text-sec)' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                            {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteResource('course', course.id)}
                                sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }, borderRadius: '10px' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>{t('group_detail.tabs.assignments')}</Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                  <Button
                    variant="contained"
                    startIcon={<InventoryIcon />}
                    onClick={() => setDeployModal({ open: true, type: 'assignment' })}
                    sx={{ 
                      borderRadius: '12px', fontWeight: 800, 
                      background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', color: '#000',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                    }}
                  >
                    Kết nối từ kho đồ
                  </Button>
                )}
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to={`/groups/${id}/assignments`}
                  sx={{ borderRadius: '12px', fontWeight: 700, borderColor: 'var(--color-border)' }}
                >
                  {t('group_detail.actions.view_all')}
                </Button>
              </Box>
            </Box>
            
            {assignments.length === 0 ? (
              <Box sx={{ p: 8, textAlign: 'center', borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed var(--color-border)' }}>
                <Typography color="text.secondary">{t('assignments.no_assignments_student')}</Typography>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {Array.isArray(assignments) && assignments.slice(0, 6).map((asgn) => (
                  <Grid item xs={12} key={asgn.id}>
                    <motion.div whileHover={{ x: 6 }} transition={{ duration: 0.2 }}>
                      <Card 
                        sx={{ 
                          borderRadius: '16px',
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border)',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: '#FBBF24', boxShadow: '0 8px 24px rgba(245,158,11,0.1)' }
                        }}
                      >
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '24px !important' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                            <Avatar sx={{ bgcolor: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', width: 56, height: 56, borderRadius: '12px' }}>
                              <AssignmentIcon sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                                <Typography sx={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text)' }}>{asgn.title}</Typography>
                                <Chip label={asgn.status} size="small" sx={{ height: 20, fontSize: '0.625rem', fontWeight: 800, bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }} />
                              </Box>
                              <Stack direction="row" spacing={3}>
                                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <span style={{ fontWeight: 600 }}>{t('common.due')}:</span> 
                                  <span style={{ color: '#FCA5A5', fontWeight: 700 }}>{asgn.dueAt ? format(new Date(asgn.dueAt), 'HH:mm dd MMM') : '---'}</span>
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <span style={{ fontWeight: 600 }}>Score:</span> 
                                  <span style={{ color: 'var(--color-text-sec)', fontWeight: 700 }}>{asgn.maxScore} pts</span>
                                </Typography>
                              </Stack>
                            </Box>
                          </Box>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Button 
                            variant="contained" 
                            component={RouterLink} 
                            to={`/groups/${id}/assignments/${asgn.id}`}
                            disabled={asgn.status === 'CLOSED' && !asgn.allowLate && group.currentUserRole === 'MEMBER'}
                            sx={{ 
                              borderRadius: '10px', height: 40, px: 3, fontWeight: 800,
                              background: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24',
                              '&:hover': { background: '#FBBF24', color: '#000' }
                            }}
                          >
                            {asgn.status === 'CLOSED' ? (asgn.allowLate ? 'Nộp muộn' : t('common.closed')) : t('group_detail.actions.details')}
                          </Button>
                          {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                            <>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => setEditDeployModal({ open: true, type: 'assignment', resource: asgn })}
                                sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' }, borderRadius: '10px' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteResource('assignment', asgn.id)}
                                sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }, borderRadius: '10px' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Kiểm tra & Trắc nghiệm</Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                  <Button
                    variant="contained"
                    startIcon={<InventoryIcon />}
                    onClick={() => setDeployModal({ open: true, type: 'quiz' })}
                    sx={{ 
                      borderRadius: '12px', fontWeight: 800, 
                      background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    Kết nối từ kho đồ
                  </Button>
                )}
              </Box>
            </Box>

            {quizzes.length === 0 ? (
              <Box sx={{ p: 8, textAlign: 'center', borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed var(--color-border)' }}>
                <Typography color="text.secondary">Chưa có bài kiểm tra nào được tổ chức trong nhóm này.</Typography>
              </Box>
            ) : (
              <Grid container spacing={3.5}>
                {quizzes.map(quiz => (
                  <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
                      <Card sx={{ 
                        borderRadius: '20px', 
                        background: 'var(--color-surface-2)', 
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden',
                        '&:hover': { borderColor: '#10B981', boxShadow: '0 12px 32px rgba(16, 185, 129, 0.1)' }
                      }}>
                        <CardContent sx={{ p: 3.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                            <Avatar sx={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '10px' }}>
                              <QuizIcon />
                            </Avatar>
                            <Typography sx={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text)' }}>{quiz.title}</Typography>
                          </Box>
                          
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}>
                              <Typography sx={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Thời lượng</Typography>
                              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800 }}>{quiz.timeLimitSec / 60} phút</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography sx={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Câu hỏi</Typography>
                              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800 }}>{quiz.questionCount || 0}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Box sx={{ height: 1, bgcolor: 'rgba(255,255,255,0.03)', my: 1 }} />
                              <Typography sx={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Lượt làm bài</Typography>
                              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800 }}>Tối đa {quiz.maxAttempts} lượt</Typography>
                            </Grid>
                          </Grid>
                          
                          <Stack direction="row" spacing={1}>
                            <Button 
                              fullWidth 
                              variant="contained" 
                              component={RouterLink}
                              to={`/groups/${id}/courses/placeholder-quiz/quiz/${quiz.id}/take`} 
                              disabled={quiz.status === 'CLOSED' && (group.currentUserRole === 'MEMBER' || !group.currentUserRole)}
                              sx={{ 
                                borderRadius: '12px', fontWeight: 800, height: 40,
                                background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', 
                                '&:hover': { background: '#10B981', color: '#FFF' } 
                              }}
                            >
                              {quiz.status === 'CLOSED' ? 'Đã đóng' : 'Bắt đầu làm bài'}
                            </Button>
                            {(group.currentUserRole === 'OWNER' || group.currentUserRole === 'EDITOR') && (
                              <>
                                <IconButton 
                                  size="small" 
                                  onClick={() => setEditDeployModal({ open: true, type: 'quiz', resource: quiz })}
                                  sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  color="info"
                                  component={RouterLink}
                                  to={`/groups/${id}/courses/placeholder-quiz/quiz/${quiz.id}/stats`}
                                  sx={{ bgcolor: 'rgba(30, 64, 175, 0.1)', '&:hover': { bgcolor: 'rgba(30, 64, 175, 0.2)' }, borderRadius: '10px' }}
                                >
                                  <TipsIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteResource('quiz', quiz.id)}
                                  sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
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
