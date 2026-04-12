import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Button, Container, Grid,
  Divider, Chip, Avatar, CircularProgress, Alert
} from '@mui/material'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  VideoCall as MeetIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import meetingService from '../../services/meetingService'
import { useModal } from '../../context/ModalContext'

const MeetingDetail = () => {
  const { groupId, id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { showSuccess, showError, showConfirm } = useModal()
  const [meeting, setMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState([])
  const [polls, setPolls] = useState([])

  const fetchMeeting = async () => {
    try {
      const data = await meetingService.getMeeting(id)
      setMeeting(data)
      if (data.status === 'CLOSED') {
        const [qData, pData] = await Promise.all([
          meetingService.getQuestions(id),
          meetingService.getPolls(id)
        ])
        setQuestions(qData || [])
        setPolls(pData || [])
      }
    } catch (err) {
      setError('Không thể tải thông tin buổi họp')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeeting()

    // Setup WebSocket
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
      client.subscribe(`/topic/meeting/${id}`, (message) => {
        try {
          const event = JSON.parse(message.body)
          console.log('Meeting Detail Event:', event)
          if (event.type === 'MEETING_STARTED' || event.type === 'MEETING_ENDED') {
            fetchMeeting()
          }
        } catch (err) {
          console.error('Error parsing STOMP message', err)
        }
      })
    }

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [id])

  const handleJoin = async () => {
    try {
      if (meeting.status === 'DRAFT' && isInstructor) {
        // Validation: Allow starting 15 mins before
        const now = new Date()
        const startAt = new Date(meeting.startAt)
        const diffMinutes = (startAt - now) / (1000 * 60)

        if (diffMinutes > 15) {
          await showError(t('common.error'), `Chưa đến giờ bắt đầu. Vui lòng quay lại sau (Ít nhất là 15 phút trước giờ bắt đầu)`)
          return
        }

        await meetingService.startMeeting(id)
      }
      navigate(`/groups/${groupId}/meetings/${id}/room`, {
        state: {
          roomName: meeting.joinUrl.split('/').pop(),
          title: meeting.title
        }
      })
    } catch (err) {
      await showError(t('common.error'), err.response?.data?.message || 'Không thể bắt đầu buổi họp')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!meeting) return null

  const isInstructor = user.role === 'ADMIN' || user.role === 'INSTRUCTOR' ||
    meeting.currentUserRole === 'OWNER' || meeting.currentUserRole === 'EDITOR'
  const isLive = meeting.status === 'PUBLISHED'
  const isPast = meeting.status === 'CLOSED'
  const isScheduled = meeting.status === 'DRAFT'

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button startIcon={<BackIcon />} onClick={() => navigate(`/groups/${groupId}?tab=meetings`)} sx={{ mb: 2 }}>
        Quay lại nhóm
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <Chip
                label={meeting.status === 'PUBLISHED' ? 'Đang diễn ra' : meeting.status === 'CLOSED' ? 'Đã kết thúc' : 'Đã lên lịch'}
                color={meeting.status === 'PUBLISHED' ? 'error' : 'default'}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
              <Typography variant="caption" color="text.secondary">
                ID: {meeting.id}
              </Typography>
            </Box>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {meeting.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              {meeting.description || 'Không có mô tả cho buổi họp này.'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon color="action" />
                <Typography variant="body1">
                  {format(new Date(meeting.startAt), 'EEEE, dd MMMM yyyy', { locale: vi })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TimeIcon color="action" />
                <Typography variant="body1">
                  {format(new Date(meeting.startAt), 'HH:mm')} ({meeting.durationMinutes} phút)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon color="action" />
                <Typography variant="body1">
                  Hình thức: {meeting.meetingType === 'VIDEO_CONFERENCE' ? 'Video Meeting' : meeting.meetingType}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.50', borderRadius: 2, p: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light', mb: 2 }}>
              <MeetIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<MeetIcon />}
              onClick={handleJoin}
              disabled={isPast || (!isLive && !isInstructor)}
              sx={{
                py: 1.5,
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: isLive ? 'error.main' : 'primary.main',
                '&:hover': { bgcolor: isLive ? 'error.dark' : 'primary.dark', boxShadow: 6 }
              }}
            >
              {isInstructor ? (isLive ? 'Tham gia (Host)' : 'Bắt đầu ngay (Host)') : (isLive ? 'Tham gia ngay' : 'Chưa đến giờ')}
            </Button>

            {!isLive && !isPast && !isInstructor && (
              <Typography variant="caption" sx={{ mt: 2, textAlign: 'center' }}>
                Vui lòng đợi cho đến khi Chủ nhóm hoặc Biên tập viên bắt đầu buổi họp.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* --- REPORT SECTION FOR CLOSED MEETINGS --- */}
      {isPast && (
        <Box sx={{ mt: 4, mb: 8 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Báo cáo buổi họp</Typography>
          
          {meeting.recordingUrl && (
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Bản ghi hình</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
                <video controls style={{ width: '100%', maxHeight: '500px' }} src={meeting.recordingUrl}>
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              </Box>
            </Paper>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Lịch sử Hỏi đáp / Trò chuyện
                </Typography>
                {questions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Không có câu hỏi/trò chuyện nào trong buổi họp này.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '400px', overflowY: 'auto', p: 1 }}>
                    {questions.map(q => (
                      <Box key={q.id} sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{q.userName}</Typography>
                        <Typography variant="body2">{q.content}</Typography>
                        {q.answered && (
                          <Box sx={{ mt: 1, pl: 2, borderLeft: '2px solid', borderColor: 'primary.main' }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{q.answeredByName} đã trả lời:</Typography>
                            <Typography variant="body2">{q.answer}</Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Kết quả Bình chọn
                </Typography>
                {polls.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Không có bình chọn nào trong buổi họp này.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: '400px', overflowY: 'auto', p: 1 }}>
                    {polls.map(p => {
                      const totalVotes = p.options.reduce((sum, opt) => sum + opt.voteCount, 0);
                      return (
                        <Box key={p.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{p.question}</Typography>
                          {p.options.map(o => {
                             const percent = totalVotes > 0 ? Math.round((o.voteCount / totalVotes) * 100) : 0;
                             return (
                              <Box key={o.id} sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">{o.label}</Typography>
                                  <Typography variant="caption">{o.voteCount} ({percent}%)</Typography>
                                </Box>
                                <Box sx={{ width: '100%', height: 6, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                                  <Box sx={{ width: `${percent}%`, height: '100%', bgcolor: 'primary.main' }} />
                                </Box>
                              </Box>
                             );
                          })}
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  )
}

export default MeetingDetail
