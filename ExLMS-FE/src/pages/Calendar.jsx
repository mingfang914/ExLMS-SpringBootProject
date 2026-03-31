import React, { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  ButtonGroup,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Fade
} from '@mui/material'
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Today as TodayIcon,
  CalendarMonthOutlined as MonthIcon,
  ViewWeekOutlined as WeekIcon,
  ViewDayOutlined as DayIcon,
  ListAltOutlined as ListIcon,
  AssignmentOutlined as AssignmentIcon,
  GroupsOutlined as MeetingIcon,
  SchoolOutlined as CourseIcon,
  ArrowForward as GoIcon,
  QuizOutlined as QuizIcon,
  FlagOutlined as StartIcon,
  SportsScoreOutlined as EndIcon,
  PersonOutline as PersonalIcon,
  SettingsOutlined as SystemIcon,
  Sync as SyncIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import calendarService from '../services/calendarService'
import { 
  CalendarContainer, 
  CustomToolbar, 
  EventBadge, 
  LegendContainer, 
  LegendItem 
} from './CalendarStyles'

const EVENT_COLORS = {
  MEETING: '#6c63ff',
  ASSIGNMENT_DUE: '#ef4444',
  QUIZ: '#f59e0b',
  COURSE_START: '#22c55e',
  COURSE_END: '#94a3b8',
  COURSE_SESSION: '#10b981',
  PERSONAL: '#00d4ff',
  SYSTEM: '#a855f7',
  GROUP_EVENT: '#f43f5e'
};

const getLegendLabels = (t) => ({
  MEETING: t('calendar.event_types.meeting'),
  ASSIGNMENT_DUE: t('calendar.event_types.assignment'),
  QUIZ: t('calendar.event_types.quiz'),
  COURSE_START: t('calendar.event_types.course_start'),
  COURSE_END: t('calendar.event_types.course_end'),
  COURSE_SESSION: t('calendar.event_types.course_session'),
  PERSONAL: t('calendar.event_types.personal'),
  SYSTEM: t('calendar.event_types.system'),
  GROUP_EVENT: t('calendar.event_types.group_event')
});

const EVENT_ICONS = {
  MEETING: MeetingIcon,
  ASSIGNMENT_DUE: AssignmentIcon,
  QUIZ: QuizIcon,
  COURSE_START: StartIcon,
  COURSE_END: EndIcon,
  COURSE_SESSION: CourseIcon,
  PERSONAL: PersonalIcon,
  SYSTEM: SystemIcon,
  GROUP_EVENT: MeetingIcon,
  DEFAULT: AssignmentIcon
};

const Calendar = () => {
  const { t, i18n } = useTranslation()
  const LEGEND_LABELS = getLegendLabels(t)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const [calendarTitle, setCalendarTitle] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState(null)

  const calendarRef = useRef(null)
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const data = await calendarService.getEvents()
        const formattedEvents = data.map(event => ({
          ...event,
          extendedProps: {
            ...event.extendedProps,
            type: event.extendedProps?.type || 'DEFAULT'
          }
        }))
        setEvents(formattedEvents)
      } catch (err) {
        setError(t('calendar.errors.load_failed'))
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [t])

  const handleSync = async () => {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const responseMessage = await calendarService.syncCalendar()
      setSyncMessage({ type: 'success', text: responseMessage || t('common.success') })
      // Re-fetch events
      const data = await calendarService.getEvents()
      setEvents(data)
    } catch (err) {
      setSyncMessage({ type: 'error', text: t('common.error') })
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMessage(null), 5000)
    }
  }

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setTimeout(() => setSelectedEvent(null), 200)
  }

  const handleNavigate = () => {
    if (!selectedEvent) return
    const eventId = selectedEvent.id;
    const { 
      type, 
      groupId: propGroupId, 
      assignmentId, 
      meetingId, 
      courseId: propCourseId, 
      quizId,
      sourceEntityId
    } = selectedEvent.extendedProps
    
    // Fallback logic for IDs
    const groupId = propGroupId
    const aid = assignmentId || sourceEntityId || eventId
    const mid = meetingId || sourceEntityId || eventId
    const cid = propCourseId || sourceEntityId || eventId
    const qid = quizId || sourceEntityId || eventId

    handleDialogClose()

    if (!groupId && type !== 'PERSONAL' && type !== 'SYSTEM') {
      console.warn('Missing groupId for event navigation')
    }

    switch (type) {
      case 'ASSIGNMENT_DUE':
        navigate(`/groups/${groupId}/assignments/${aid}`)
        break
      case 'MEETING':
        navigate(`/groups/${groupId}/meetings/${mid}`)
        break
      case 'COURSE_START':
      case 'COURSE_SESSION':
        navigate(`/groups/${groupId}/courses/${cid}/view`)
        break
      case 'QUIZ':
        navigate(`/groups/${groupId}/courses/${cid}/quiz/${qid}/take`)
        break
      case 'GROUP_EVENT':
        if (groupId) {
           navigate(`/groups/${groupId}`)
        } else {
           navigate(`/groups`)
        }
        break
      default:
        console.warn(`No navigation defined for event type: ${type}`)
        break
    }
  }

  const handlePrev = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.prev()
    setCalendarTitle(calendarApi.view.title)
  }

  const handleNext = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.next()
    setCalendarTitle(calendarApi.view.title)
  }

  const handleToday = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.today()
    setCalendarTitle(calendarApi.view.title)
  }

  const handleViewChange = (view) => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.changeView(view)
    setCurrentView(view)
    setCalendarTitle(calendarApi.view.title)
  }

  const renderEventContent = (eventInfo) => {
    const type = eventInfo.event.extendedProps?.type || 'DEFAULT'
    const Icon = EVENT_ICONS[type] || EVENT_ICONS.DEFAULT

    return (
      <Tooltip title={eventInfo.event.title} arrow placement="top">
        <EventBadge type={type}>
          <Icon sx={{ fontSize: '1rem' }} />
          <Typography variant="inherit" sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {eventInfo.event.title}
          </Typography>
        </EventBadge>
      </Tooltip>
    )
  }

  // Set initial title
  useEffect(() => {
    if (calendarRef.current && !loading) {
      setCalendarTitle(calendarRef.current.getApi().view.title)
    }
  }, [loading])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      <Box sx={{ px: 3, pt: 2, mb: 1 }}>
        <Typography variant="h4" sx={{
          fontWeight: 800,
          color: 'text.primary',
          letterSpacing: '-0.02em',
          mb: 1
        }}>
          {t('calendar.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t('calendar.subtitle')}
        </Typography>
      </Box>

      {/* Legend section */}
      {!loading && !error && (
        <LegendContainer component={motion.div} variants={containerVariants}>
          {Object.entries(EVENT_COLORS).map(([type, color]) => (
            <LegendItem key={type}>
              <Box className="dot" sx={{ backgroundColor: color }} />
              <Typography className="label">{LEGEND_LABELS[type]}</Typography>
            </LegendItem>
          ))}
        </LegendContainer>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 2 }}>
          <CircularProgress size={48} thickness={4} />
          <Typography color="text.secondary" variant="body2">{t('common.loading')}</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" variant="outlined" sx={{ m: 3, borderRadius: 2 }}>{error}</Alert>
      ) : (
        <CalendarContainer elevation={0}>
          {syncMessage && (
            <Fade in={!!syncMessage}>
              <Alert 
                severity={syncMessage.type} 
                sx={{ m: 2, borderRadius: 2 }}
                onClose={() => setSyncMessage(null)}
              >
                {syncMessage.text}
              </Alert>
            </Fade>
          )}
          <CustomToolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, minWidth: isMobile ? 'auto' : '250px' }}>
                {calendarTitle}
              </Typography>
              <ButtonGroup size="small" variant="text" sx={{ bgcolor: alpha(theme.palette.action.hover, 0.05), borderRadius: 2, p: 0.5 }}>
                <Tooltip title={t('common.back')}>
                  <IconButton onClick={handlePrev} size="small" aria-label="previous month">
                    <PrevIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('common.today')}>
                  <Button onClick={handleToday} sx={{ fontWeight: 600, px: 2 }}>{t('common.today')}</Button>
                </Tooltip>
                <Tooltip title={t('common.next')}>
                  <IconButton onClick={handleNext} size="small" aria-label="next month">
                    <NextIcon />
                  </IconButton>
                </Tooltip>
              </ButtonGroup>
              
              <Tooltip title={t('calendar.sync_desc')}>
                <Button 
                  onClick={handleSync} 
                  disabled={syncing}
                  variant="outlined" 
                  size="small"
                  startIcon={syncing ? <CircularProgress size={16} /> : <SyncIcon />}
                  sx={{ borderRadius: 2, ml: 2, fontWeight: 600 }}
                >
                  {syncing ? t('calendar.syncing_text') : t('calendar.sync_text')}
                </Button>
              </Tooltip>
            </Box>

            <ButtonGroup
              variant="contained"
              color="inherit"
              sx={{
                boxShadow: 'none',
                bgcolor: alpha(theme.palette.action.hover, 0.05),
                p: 0.5,
                borderRadius: 2,
                '& .MuiButton-root': {
                  border: 'none',
                  borderRadius: 1.5,
                  m: 0.2,
                  px: 2,
                  py: 1,
                  color: 'text.secondary',
                  bgcolor: 'transparent',
                  '&.active': {
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                  }
                }
              }}
            >
              <Button
                className={currentView === 'dayGridMonth' ? 'active' : ''}
                onClick={() => handleViewChange('dayGridMonth')}
                startIcon={<MonthIcon />}
              >
                {t('calendar.views.month')}
              </Button>
              <Button
                className={currentView === 'timeGridWeek' ? 'active' : ''}
                onClick={() => handleViewChange('timeGridWeek')}
                startIcon={<WeekIcon />}
              >
                {t('calendar.views.week')}
              </Button>
              <Button
                className={currentView === 'timeGridDay' ? 'active' : ''}
                onClick={() => handleViewChange('timeGridDay')}
                startIcon={<DayIcon />}
              >
                {t('calendar.views.day')}
              </Button>
              <Button
                className={currentView === 'listWeek' ? 'active' : ''}
                onClick={() => handleViewChange('listWeek')}
                startIcon={<ListIcon />}
              >
                {t('calendar.views.list')}
              </Button>
            </ButtonGroup>
          </CustomToolbar>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            events={events}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
            editable
            selectable
            dayMaxEvents={3}
            navLinks={true}
            businessHours={true}
            nowIndicator={true}
            locale={i18n && i18n.language === 'vi' ? 'vi' : 'en'}
          />
        </CalendarContainer>
      )}

      <AnimatePresence>
        {selectedEvent && (
          <Dialog
            open={dialogOpen}
            onClose={handleDialogClose}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 400 }}
            PaperProps={{
              sx: {
                borderRadius: 4,
                padding: 1,
                maxWidth: 450,
                width: '100%',
                backgroundImage: 'none'
              },
              className: 'glass-panel'
            }}
          >
            <DialogTitle sx={{
              fontWeight: 800,
              fontSize: '1.5rem',
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              {(() => {
                const type = selectedEvent.extendedProps?.type || 'DEFAULT'
                const Icon = EVENT_ICONS[type] || EVENT_ICONS.DEFAULT
                const color = EVENT_COLORS[type] || theme.palette.primary.main
                return <Icon sx={{ color: color, fontSize: '2rem' }} />
              })()}
              {selectedEvent.title}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>{t('calendar.event_dialog.time_details')}</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {selectedEvent.start && `${t('calendar.event_dialog.starts')}: ${new Date(selectedEvent.start).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}`}
                    {selectedEvent.end && (
                      <>
                        <br />
                        {`${t('calendar.event_dialog.ends')}: ${new Date(selectedEvent.end).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                          hour: '2-digit', minute: '2-digit'
                        })}`}
                      </>
                    )}
                  </Typography>
                </Box>

                {selectedEvent.extendedProps?.description && (
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>{t('group_detail.meetings.description')}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedEvent.extendedProps.description}</Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button onClick={handleDialogClose} sx={{
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': { bgcolor: alpha(theme.palette.text.secondary, 0.05) }
              }}>
                {t('common.close')}
              </Button>
              <Button
                onClick={handleNavigate}
                variant="contained"
                endIcon={<GoIcon />}
                aria-label={`navigate to ${selectedEvent.title}`}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                  }
                }}
              >
                {t('calendar.event_dialog.goto_event')}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default Calendar
