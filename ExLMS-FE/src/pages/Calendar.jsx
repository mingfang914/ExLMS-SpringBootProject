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
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  SYSTEM: '#a855f7'
};

const LEGEND_LABELS = {
  MEETING: 'Cuộc họp',
  ASSIGNMENT_DUE: 'Hạn bài tập',
  QUIZ: 'Bài kiểm tra',
  COURSE_START: 'Bắt đầu khóa học',
  COURSE_END: 'Kết thúc khóa học',
  COURSE_SESSION: 'Buổi học',
  PERSONAL: 'Cá nhân',
  SYSTEM: 'Hệ thống'
};

const EVENT_ICONS = {
  MEETING: MeetingIcon,
  ASSIGNMENT_DUE: AssignmentIcon,
  QUIZ: QuizIcon,
  COURSE_START: StartIcon,
  COURSE_END: EndIcon,
  COURSE_SESSION: CourseIcon,
  PERSONAL: PersonalIcon,
  SYSTEM: SystemIcon,
  DEFAULT: AssignmentIcon
};

const Calendar = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const [calendarTitle, setCalendarTitle] = useState('')

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
        setError('Failed to load calendar events.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

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
    const { type, groupId, assignmentId, meetingId, courseId } = selectedEvent.extendedProps
    handleDialogClose()

    switch (type) {
      case 'ASSIGNMENT_DUE':
        navigate(`/groups/${groupId}/assignments/${assignmentId}`)
        break
      case 'MEETING':
        navigate(`/groups/${groupId}/meetings/${meetingId}`)
        break
      case 'COURSE_START':
        navigate(`/groups/${groupId}/courses/${courseId}`)
        break
      default:
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
          Lịch Biểu
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Quản lý lịch học, bài tập và các cuộc họp.
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
          <Typography color="text.secondary" variant="body2">Synchronizing your schedule...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" variant="outlined" sx={{ m: 3, borderRadius: 2 }}>{error}</Alert>
      ) : (
        <CalendarContainer elevation={0}>
          <CustomToolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, minWidth: isMobile ? 'auto' : '250px' }}>
                {calendarTitle}
              </Typography>
              <ButtonGroup size="small" variant="text" sx={{ bgcolor: alpha(theme.palette.action.hover, 0.05), borderRadius: 2, p: 0.5 }}>
                <Tooltip title="Previous">
                  <IconButton onClick={handlePrev} size="small" aria-label="previous month">
                    <PrevIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Today">
                  <Button onClick={handleToday} sx={{ fontWeight: 600, px: 2 }}>Today</Button>
                </Tooltip>
                <Tooltip title="Next">
                  <IconButton onClick={handleNext} size="small" aria-label="next month">
                    <NextIcon />
                  </IconButton>
                </Tooltip>
              </ButtonGroup>
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
                Month
              </Button>
              <Button
                className={currentView === 'timeGridWeek' ? 'active' : ''}
                onClick={() => handleViewChange('timeGridWeek')}
                startIcon={<WeekIcon />}
              >
                Week
              </Button>
              <Button
                className={currentView === 'timeGridDay' ? 'active' : ''}
                onClick={() => handleViewChange('timeGridDay')}
                startIcon={<DayIcon />}
              >
                Day
              </Button>
              <Button
                className={currentView === 'listWeek' ? 'active' : ''}
                onClick={() => handleViewChange('listWeek')}
                startIcon={<ListIcon />}
              >
                List
              </Button>
            </ButtonGroup>
          </CustomToolbar>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false} // Hidden as we use custom toolbar
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
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Time Details</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {selectedEvent.start && `Starts: ${new Date(selectedEvent.start).toLocaleString([], {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}`}
                    {selectedEvent.end && (
                      <>
                        <br />
                        {`Ends: ${new Date(selectedEvent.end).toLocaleString([], {
                          hour: '2-digit', minute: '2-digit'
                        })}`}
                      </>
                    )}
                  </Typography>
                </Box>

                {selectedEvent.extendedProps?.description && (
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>Description</Typography>
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
                Close
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
                Go to Event
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default Calendar
