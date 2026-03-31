import React, { useState, useEffect, useCallback, useRef } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { useTranslation } from 'react-i18next'
import { 
  Box, Typography, Paper, Button, Container, Grid, 
  Tabs, Tab, List, ListItem, ListItemText, ListItemAvatar,
  Avatar, TextField, IconButton, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress
} from '@mui/material'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import JitsiMeeting from '../../components/Meetings/JitsiMeeting'
import { 
  ArrowBack as BackIcon, 
  Send as SendIcon,
  Poll as PollIcon,
  QuestionAnswer as QAIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  FiberManualRecord as LiveIcon
} from '@mui/icons-material'
import meetingService from '../../services/meetingService'

const MeetingRoom = () => {
  const { t } = useTranslation()
  const { groupId, id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  
  const [meeting, setMeeting] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [questions, setQuestions] = useState([])
  const [polls, setPolls] = useState([])
  const [attendance, setAttendance] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [answeringId, setAnsweringId] = useState(null)
  const [openPollDialog, setOpenPollDialog] = useState(false)
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''] })
  const stompClientRef = useRef(null)
  
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const roomName = location.state?.roomName || meeting?.joinUrl?.split('/').pop() || `exlms-meeting-${id}`
  const meetingTitle = meeting?.title || location.state?.title || t('common.loading')
  
  const isInstructor = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR' || 
                       meeting?.currentUserRole === 'OWNER' || meeting?.currentUserRole === 'EDITOR'

  const fetchData = useCallback(async () => {
    try {
      // Always fetch meeting details to get current role and title
      const meetingData = await meetingService.getMeeting(id)
      setMeeting(meetingData)

      const qs = await meetingService.getQuestions(id)
      setQuestions(Array.isArray(qs) ? qs : [])
      
      const ps = await meetingService.getPolls(id)
      setPolls(Array.isArray(ps) ? ps : [])
      
      // We check role from meetingData here for precision
      const currentIsInstructor = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR' || 
                                  meetingData?.currentUserRole === 'OWNER' || meetingData?.currentUserRole === 'EDITOR'
      
      if (currentIsInstructor) {
        const att = await meetingService.getAttendanceReport(id)
        setAttendance(Array.isArray(att) ? att : [])
      }
    } catch (err) {
      console.error('Error fetching room data', err)
    }
  }, [id, user?.role])

  const handleWebSocketEvent = useCallback((event) => {
    const { type, data } = event
    switch (type) {
      case 'QUESTION_ADDED':
        setQuestions(prev => {
          if (prev.find(q => q.id === data.id)) return prev
          // Basic private filtering
          if (data.isPrivate && data.userId !== user?.id && !isInstructor) return prev
          return [...prev, data]
        })
        break
      case 'QUESTION_ANSWERED':
        setQuestions(prev => prev.map(q => q.id === data.id ? data : q))
        break
      case 'POLL_CREATED':
        setPolls(prev => {
          if (prev.find(p => p.id === data.id)) return prev
          return [...prev, data]
        })
        break
      case 'POLL_UPDATED':
        setPolls(prev => prev.map(p => {
          if (p.id === data.id) {
            // Keep user's vote status if we had it
            return { ...data, userVoted: p.userVoted }
          }
          return p
        }))
        break
      case 'MEMBER_JOINED':
      case 'MEMBER_LEFT':
        // If instructor is viewing attendance, refresh it
        if (isInstructor) {
          fetchData()
        }
        break
      case 'MEETING_STARTED':
        fetchData()
        break
      case 'MEETING_ENDED':
        if (!isInstructor) {
          alert(t('meetings.ended_by_instructor'))
        }
        handleMeetingEnd()
        break
      default:
        break
    }
  }, [user?.id, isInstructor, fetchData, t])

  useEffect(() => {
    meetingService.recordAttendance(id, true)
    fetchData()
    
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
          console.log('WebSocket Event Received:', event)
          handleWebSocketEvent(event)
        } catch (err) {
          console.error('Error parsing STOMP message', err)
        }
      })
    }

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message'])
      console.error('STOMP Error Details:', frame.body)
    }

    client.onWebSocketError = (event) => {
      console.error('WebSocket Error:', event)
    }

    client.activate()
    stompClientRef.current = client

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
      }
      meetingService.recordAttendance(id, false)
    }
  }, [id, fetchData, handleWebSocketEvent])

  const handleMeetingEnd = useCallback(() => {
    navigate(`/groups/${groupId}/meetings/${id}`)
  }, [navigate, groupId, id])

  const handleSendQuestion = useCallback(async () => {
    if (!newQuestion.trim()) return
    try {
      await meetingService.addQuestion(id, { content: newQuestion, isPrivate: false })
      setNewQuestion('')
      // fetchData() is now handled by WebSocket
    } catch (err) {
      console.error('Error sending question', err)
    }
  }, [id, newQuestion])

  const handleAnswer = useCallback(async () => {
    if (!answerText.trim()) return
    try {
      await meetingService.answerQuestion(answeringId, answerText)
      setAnsweringId(null)
      setAnswerText('')
      // fetchData() is now handled by WebSocket
    } catch (err) {
      console.error('Error answering question', err)
    }
  }, [answeringId, answerText])

  const handleVote = useCallback(async (pollId, optionId) => {
    try {
      await meetingService.voteInPoll(pollId, optionId)
      // Update local voted status immediately for better UX
      setPolls(prev => prev.map(p => p.id === pollId ? { ...p, userVoted: true } : p))
      // fetchData() is now handled by WebSocket
    } catch (err) {
      alert(t('meetings.already_voted'))
    }
  }, [t])

  const handleCreatePoll = async () => {
    if (!pollForm.question.trim() || pollForm.options.some(o => !o.trim())) {
      alert(t('meetings.poll_form_error'))
      return
    }
    try {
      await meetingService.createPoll(id, pollForm)
      setOpenPollDialog(false)
      setPollForm({ question: '', options: ['', ''] })
      // fetchData() is now handled by WebSocket
    } catch (err) {
      console.error('Error creating poll', err)
    }
  }

  const handleAddPollOption = () => {
    setPollForm(prev => ({ ...prev, options: [...prev.options, ''] }))
  }

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollForm.options]
    newOptions[index] = value
    setPollForm(prev => ({ ...prev, options: newOptions }))
  }

  return (
    <Container maxWidth={false} sx={{ mt: 2, height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button startIcon={<BackIcon />} onClick={handleMeetingEnd} sx={{ mr: 2 }}>
            {t('meetings.leave_room')}
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {meetingTitle}
          </Typography>
          <Chip icon={<LiveIcon sx={{ color: 'error.main !important', fontSize: 'small' }} />} label={t('meetings.live')} size="small" variant="outlined" sx={{ ml: 2, fontWeight: 'bold', color: 'error.main' }} />
        </Box>
        {isInstructor && (
            <Button variant="contained" color="error" onClick={async () => {
                await meetingService.endMeeting(id)
                handleMeetingEnd()
            }}>{t('meetings.end_meeting')}</Button>
        )}
      </Box>

      <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
        <Grid item xs={12} md={8.5} lg={9} sx={{ height: '100%' }}>
          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', height: '100%', bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {meeting ? (
              <JitsiMeeting
                roomName={roomName}
                displayName={user?.fullName || user?.email}
                email={user?.email}
                isInstructor={isInstructor}
                onMeetingEnd={handleMeetingEnd}
              />
            ) : (
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <CircularProgress color="inherit" sx={{ mb: 2 }} />
                <Typography>{t('meetings.connecting')}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={3.5} lg={3} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth">
              <Tab icon={<PeopleIcon />} label={t('meetings.tabs.members')} />
              <Tab icon={<QAIcon />} label={t('meetings.tabs.qa')} />
              <Tab icon={<PollIcon />} label={t('meetings.tabs.polls')} />
            </Tabs>
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
              {tabValue === 0 && (
                <List>
                  {isInstructor ? (
                    attendance.map(a => (
                      <ListItem key={a.id} sx={{ mb: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: a.leftAt ? 'grey.400' : 'success.main' }}>{a.userName[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{a.userName}</Typography>}
                          secondary={
                            <Box component="span">
                              <Typography variant="caption" display="block">
                                {t('meetings.joined_at')} {new Date(a.joinedAt).toLocaleTimeString()}
                              </Typography>
                              <Typography variant="caption" color={a.leftAt ? "text.secondary" : "success.main"} sx={{ fontWeight: 600 }}>
                                {a.leftAt ? t('meetings.left', { count: Math.round(a.durationSec/60) }) : t('meetings.joining')}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                      {t('meetings.instructor_only_attendance')}
                    </Typography>
                  )}
                </List>
              )}

              {tabValue === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1, mb: 8 }}>
                    {questions.map(q => (
                      <Box key={q.id} sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: q.userId === user.id ? 'flex-end' : 'flex-start' }}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 1.5, 
                            maxWidth: '90%', 
                            borderRadius: 2, 
                            bgcolor: q.userId === user.id ? 'primary.light' : 'grey.100',
                            color: q.userId === user.id ? 'primary.contrastText' : 'text.primary',
                            position: 'relative'
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, opacity: 0.8 }}>
                            {q.userId === user.id ? t('meetings.you') : q.userName}
                          </Typography>
                          <Typography variant="body2">{q.content}</Typography>
                          
                          {q.answered && (
                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'rgba(0,0,0,0.1)' }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                                {t('meetings.answered_by', { name: q.answeredByName })}
                              </Typography>
                              <Typography variant="body2">{q.answer}</Typography>
                            </Box>
                          )}
                        </Paper>
                        {!q.answered && isInstructor && (
                          <Button size="small" onClick={() => setAnsweringId(q.id)} sx={{ mt: 0.5, alignSelf: 'flex-start' }}>
                            {t('meetings.answer')}
                          </Button>
                        )}
                      </Box>
                    ))}
                    {questions.length === 0 && (
                      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                        {t('meetings.no_questions')}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: 1, bgcolor: 'background.paper', p: 1, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <TextField 
                      fullWidth size="small" placeholder={t('meetings.ask_question')}
                      value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
                    />
                    <IconButton color="primary" onClick={handleSendQuestion}><SendIcon /></IconButton>
                  </Box>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  {polls.map(p => (
                    <Paper key={p.id} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>{p.question}</Typography>
                      {p.options.map(o => (
                        <Button 
                          key={o.id} 
                          fullWidth 
                          variant={p.userVotedOptionId === o.id ? "contained" : "outlined"}
                          onClick={() => handleVote(p.id, o.id)}
                          sx={{ mb: 1, justifyContent: 'space-between' }}
                        >
                          {o.label}
                          <Typography variant="caption">{o.voteCount} votes</Typography>
                        </Button>
                      ))}
                    </Paper>
                  ))}
                  {isInstructor && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Button variant="contained" onClick={() => setOpenPollDialog(true)}>{t('meetings.create_poll')}</Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={!!answeringId} onClose={() => setAnsweringId(null)}>
        <DialogTitle>{t('meetings.answer_question_dialog')}</DialogTitle>
        <DialogContent>
          <TextField 
            autoFocus fullWidth multiline rows={3} label={t('meetings.answer_label')} sx={{ mt: 1 }}
            value={answerText} onChange={e => setAnswerText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnsweringId(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleAnswer}>{t('meetings.send_answer')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPollDialog} onClose={() => setOpenPollDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('meetings.create_poll_dialog')}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField 
            fullWidth label={t('meetings.poll_question_label')} sx={{ mb: 3 }}
            value={pollForm.question} onChange={e => setPollForm({...pollForm, question: e.target.value})}
          />
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>{t('meetings.options_label')}</Typography>
          {pollForm.options.map((opt, idx) => (
            <TextField 
              key={idx} fullWidth size="small" label={t('meetings.option_placeholder', { count: idx + 1 })} sx={{ mb: 1.5 }}
              value={opt} onChange={e => handlePollOptionChange(idx, e.target.value)}
            />
          ))}
          <Button size="small" onClick={handleAddPollOption} variant="outlined">{t('meetings.add_option')}</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPollDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreatePoll}>{t('meetings.create_poll_btn')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default MeetingRoom
