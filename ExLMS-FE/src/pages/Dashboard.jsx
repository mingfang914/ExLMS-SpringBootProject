import React, { useState, useEffect } from 'react'
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Skeleton,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
} from '@mui/material'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// ───────────────────────────────────────────────────────────────────
// Data
// ───────────────────────────────────────────────────────────────────
const chartData = [
  { name: 'Mon', hours: 2.0 },
  { name: 'Tue', hours: 3.5 },
  { name: 'Wed', hours: 1.0 },
  { name: 'Thu', hours: 4.2 },
  { name: 'Fri', hours: 2.8 },
  { name: 'Sat', hours: 5.0 },
  { name: 'Sun', hours: 3.3 },
]

// ───────────────────────────────────────────────────────────────────
// SVG Icons (20 × 20)
// ───────────────────────────────────────────────────────────────────
const Icons = {
  groups: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  courses: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  assignments: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  meetings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  arrowRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  trendUp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  play: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  notification: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
}

// ───────────────────────────────────────────────────────────────────
// Animation Variants
// ───────────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

// ───────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, colorClass, loading, trend }) => (
  <div className={`stat-card stat-card--${colorClass}`}>
    {loading ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '10px', bgcolor: 'rgba(33,38,45,0.8)' }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="70%" height={32} sx={{ bgcolor: 'rgba(33,38,45,0.8)' }} />
          <Skeleton width="55%" height={20} sx={{ bgcolor: 'rgba(33,38,45,0.8)' }} />
        </Box>
      </Box>
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            sx={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '2rem',
              lineHeight: 1,
              color: 'var(--color-text)',
              mb: 0.5,
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {label}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Box sx={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center' }}>
                {Icons.trendUp}
              </Box>
              <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-success)', fontWeight: 600 }}>
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Box className={`icon-badge icon-badge--${colorClass}`}>
          {icon}
        </Box>
      </Box>
    )}
  </div>
)

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'var(--color-surface-3)',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          px: 2, py: 1.5,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', mb: 0.5 }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#818CF8' }}>
          {payload[0].value}h
        </Typography>
      </Box>
    )
  }
  return null
}

// ───────────────────────────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const theme = useTheme()
  const { t, i18n } = useTranslation()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { default: dashboardService } = await import('../services/dashboardService')
        const data = await dashboardService.getStats()
        setStatsData(data)
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const stats = [
    { label: t('dashboard.stats.groups'), value: statsData?.joinedGroups ?? 0, icon: Icons.groups, colorClass: 'indigo', trend: `+2 ${t('dashboard.this_week')}` },
    { label: t('dashboard.stats.courses'), value: statsData?.coursesInProgress ?? 0, icon: Icons.courses, colorClass: 'cyan', trend: null },
    { label: t('dashboard.stats.assignments'), value: statsData?.pendingAssignments ?? 0, icon: Icons.assignments, colorClass: 'amber', trend: null },
    { label: t('dashboard.stats.meetings'), value: statsData?.upcomingMeetings ?? 0, icon: Icons.meetings, colorClass: 'red', trend: null },
  ]

  const upcomingMeetings = [
    { id: 1, title: 'Java Programming Workshop', time: `${t('common.today')} · 2:00 PM`, group: 'CS 2024', status: 'today' },
    { id: 2, title: 'Weekly Team Sync', time: `${t('common.tomorrow')} · 10:00 AM`, group: 'Study Group A', status: 'soon' },
    { id: 3, title: 'Database Design Review', time: `Thu · 3:00 PM`, group: 'DB Class', status: 'upcoming' },
  ]

  const recentActivities = [
    { id: 1, type: 'assignment', text: t('dashboard.activities.new_assignment'), time: t('common.hrs_ago', { count: 2 }), icon: Icons.assignments },
    { id: 2, type: 'course', text: t('dashboard.activities.course_updated'), time: t('common.hrs_ago', { count: 5 }), icon: Icons.courses },
    { id: 3, type: 'notif', text: t('dashboard.activities.new_replies'), time: t('common.days_ago', { count: 1 }), icon: Icons.notification },
  ]

  const username = user?.name || user?.fullName || user?.email?.split('@')[0] || t('common.student')
  const greetingKey = getGreeting()

  return (
    <Box
      component={motion.div}
      variants={container}
      initial="hidden"
      animate="visible"
      sx={{ pb: 6 }}
    >
      {/* ── Hero Greeting ──────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              sx={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                color: 'var(--color-text)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                mb: 0.75,
              }}
            >
              {t(`dashboard.greetings.${greetingKey}`)},{' '}
              <Box component="span" className="gradient-text">{username.split(' ')[0]}</Box>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <span className="pulse-dot" />
              <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {t('dashboard.hero_desc')}
              </Typography>
            </Box>
          </Box>

          <Button
            component={Link}
            to="/calendar"
            variant="outlined"
            sx={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-sec)',
              borderRadius: '10px',
              px: 2.5,
              height: 40,
              fontSize: '0.875rem',
              '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-text)', bgcolor: 'rgba(99,102,241,0.06)' },
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t('nav.calendar')}
          </Button>
        </Box>
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <motion.div variants={item}>
              <StatCard {...stat} loading={loading} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* ── Charts Row ─────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Learning Hours chart */}
        <Grid item xs={12} md={8}>
          <motion.div variants={item} style={{ height: '100%' }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                        {t('dashboard.learning_hours')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', mt: 0.25 }}>
                        {t('dashboard.this_week')}
                      </Typography>
                    </Box>
                    <Chip
                      label={t('dashboard.total_learning_time', { count: 21.5 })}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(99,102,241,0.12)',
                        color: '#818CF8',
                        border: '1px solid rgba(99,102,241,0.25)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 26,
                      }}
                    />
                  </Box>
                }
                sx={{ pb: 0, px: 3, pt: 2.5 }}
              />
              <CardContent sx={{ pt: 2, px: 2, pb: '16px !important', minHeight: 280 }}>
                {loading ? (
                  <Skeleton variant="rounded" width="100%" height={240} sx={{ bgcolor: 'rgba(33,38,45,0.6)' }} />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="100%" stopColor="#22D3EE" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(48,54,61,0.6)" />
                      <XAxis
                        dataKey="name"
                        axisLine={false} tickLine={false}
                        tick={{ fill: '#6E7681', fontSize: 12, fontFamily: 'Inter' }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false} tickLine={false}
                        tick={{ fill: '#6E7681', fontSize: 12, fontFamily: 'Inter' }}
                        tickFormatter={(v) => `${v}h`}
                      />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
                      <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="url(#gradStroke)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#gradHours)"
                        dot={{ fill: '#6366F1', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, fill: '#818CF8', stroke: 'var(--color-surface-3)', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Current Course progress */}
        <Grid item xs={12} md={4}>
          <motion.div variants={item} style={{ height: '100%' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={
                  <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                    {t('dashboard.continue_learning')}
                  </Typography>
                }
                sx={{ pb: 0, px: 3, pt: 2.5 }}
              />
              <CardContent sx={{ flex: 1, px: 3, pb: '24px !important', pt: 2 }}>
                {loading ? (
                  <Box>
                    <Skeleton variant="rounded" height={130} sx={{ mb: 2, bgcolor: 'rgba(33,38,45,0.6)' }} />
                    <Skeleton width="80%" height={22} sx={{ mb: 0.5, bgcolor: 'rgba(33,38,45,0.6)' }} />
                    <Skeleton width="50%" height={18} sx={{ mb: 2, bgcolor: 'rgba(33,38,45,0.6)' }} />
                    <Skeleton variant="rounded" height={6} sx={{ bgcolor: 'rgba(33,38,45,0.6)' }} />
                  </Box>
                ) : (
                  <Box>
                    {/* Course thumbnail */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: 130,
                        borderRadius: '10px',
                        mb: 2.5,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 60%, #0D1117 100%)',
                      }}
                    >
                      {/* Decorative circles */}
                      <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(99,102,241,0.25)' }} />
                      <Box sx={{ position: 'absolute', bottom: -10, left: -10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(34,211,238,0.15)' }} />

                      {/* Content overlay */}
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                        <Box
                          sx={{
                            width: 44, height: 44,
                            borderRadius: '12px',
                            bgcolor: 'rgba(99,102,241,0.3)',
                            border: '1px solid rgba(99,102,241,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mb: 1, color: '#C7D2FE',
                          }}
                        >
                          {Icons.courses}
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(199,210,254,0.8)', fontWeight: 500 }}>
                          React JS Advanced
                        </Typography>
                      </Box>

                      {/* Play button */}
                      <Box
                        sx={{
                          position: 'absolute', top: 10, right: 10,
                          width: 28, height: 28, borderRadius: '50%',
                          bgcolor: 'rgba(99,102,241,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', cursor: 'pointer',
                          transition: 'bgcolor 0.2s',
                          '&:hover': { bgcolor: 'rgba(99,102,241,0.7)' },
                        }}
                      >
                        {Icons.play}
                      </Box>
                    </Box>

                    <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)', mb: 0.5, lineHeight: 1.3 }}>
                      React JS Advanced Practices
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
                      <Box sx={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                        {Icons.clock}
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {t('dashboard.completion_status', { completed: 12, total: 24 })}
                      </Typography>
                    </Box>

                    {/* Progress */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('common.progress')}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#818CF8' }}>50%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={50}
                        className="progress-gradient"
                        sx={{
                          height: 6,
                          borderRadius: 99,
                          bgcolor: 'rgba(33,38,45,0.8)',
                          mb: 3,
                        }}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={Icons.play}
                      sx={{
                        height: 40,
                        borderRadius: '9px',
                        fontSize: '0.875rem',
                        background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                          boxShadow: '0 6px 18px rgba(99,102,241,0.4)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      {t('dashboard.continue_learning_btn')}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* ── Activity Row ──────────────────────────────────────────── */}
      <Grid container spacing={2.5}>
        {/* Recent Activities */}
        <Grid item xs={12} md={7}>
          <motion.div variants={item}>
            <Card>
              <CardHeader
                title={
                  <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                    {t('dashboard.recent_activity')}
                  </Typography>
                }
                action={
                  <Button
                    size="small"
                    endIcon={Icons.arrowRight}
                    sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', cursor: 'pointer', '&:hover': { color: 'var(--color-primary-lt)' } }}
                  >
                    {t('dashboard.view_all')}
                  </Button>
                }
                sx={{ pb: 0, px: 3, pt: 2.5 }}
              />
              <CardContent sx={{ px: 2, pb: '16px !important', pt: 1.5 }}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, p: 1.5, mb: 0.5 }}>
                      <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '9px', bgcolor: 'rgba(33,38,45,0.8)' }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="70%" height={18} sx={{ mb: 0.5, bgcolor: 'rgba(33,38,45,0.8)' }} />
                        <Skeleton width="35%" height={14} sx={{ bgcolor: 'rgba(33,38,45,0.8)' }} />
                      </Box>
                    </Box>
                  ))
                ) : (
                  recentActivities.map((act, i) => (
                    <React.Fragment key={act.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          px: 1,
                          py: 1.5,
                          borderRadius: '9px',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(240,246,252,0.03)' },
                          transition: 'background-color 0.15s',
                        }}
                      >
                        <Box
                          sx={{
                            width: 36, height: 36,
                            borderRadius: '9px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            bgcolor: act.type === 'assignment'
                              ? 'rgba(245,158,11,0.12)'
                              : act.type === 'course'
                                ? 'rgba(99,102,241,0.12)'
                                : 'rgba(34,211,238,0.1)',
                            color: act.type === 'assignment' ? '#FDE68A' : act.type === 'course' ? '#818CF8' : '#67E8F9',
                          }}
                        >
                          {act.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.4, mb: 0.25 }} className="clamp-2">
                            {act.text}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {act.time}
                          </Typography>
                        </Box>
                        <Box sx={{ color: 'var(--color-text-muted)', flexShrink: 0, mt: 0.5 }}>
                          {Icons.arrowRight}
                        </Box>
                      </Box>
                      {i < recentActivities.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(48,54,61,0.5)', mx: 1 }} />
                      )}
                    </React.Fragment>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Upcoming Meetings */}
        <Grid item xs={12} md={5}>
          <motion.div variants={item}>
            <Card>
              <CardHeader
                title={
                  <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                    {t('dashboard.upcoming_meetings')}
                  </Typography>
                }
                action={
                  <Button
                    component={Link}
                    to="/calendar"
                    size="small"
                    endIcon={Icons.arrowRight}
                    sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', cursor: 'pointer', '&:hover': { color: 'var(--color-primary-lt)' } }}
                  >
                    {t('nav.calendar')}
                  </Button>
                }
                sx={{ pb: 0, px: 3, pt: 2.5 }}
              />
              <CardContent sx={{ px: 2, pb: '16px !important', pt: 1.5 }}>
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <Box key={i} sx={{ p: 1.5, mb: 1.5 }}>
                      <Skeleton variant="rounded" height={68} sx={{ borderRadius: '10px', bgcolor: 'rgba(33,38,45,0.8)' }} />
                    </Box>
                  ))
                ) : (
                  upcomingMeetings.map((meeting) => (
                    <Box
                      key={meeting.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: '10px',
                        border: '1px solid var(--color-border)',
                        mb: 1.5,
                        cursor: 'pointer',
                        bgcolor: 'var(--color-surface-2)',
                        '&:hover': { 
                          borderColor: 'var(--color-primary-lt)', 
                          bgcolor: 'var(--color-surface-3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 44, height: 44,
                          borderRadius: '10px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          bgcolor: meeting.status === 'today'
                            ? alpha(theme.palette.error.main, 0.1)
                            : alpha(theme.palette.primary.main, 0.1),
                          border: `1px solid ${meeting.status === 'today' 
                            ? alpha(theme.palette.error.main, 0.2) 
                            : alpha(theme.palette.primary.main, 0.2)}`,
                          color: meeting.status === 'today' 
                            ? theme.palette.error.main 
                            : theme.palette.primary.main,
                          flexShrink: 0,
                        }}
                      >
                        {Icons.meetings}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3, mb: 0.25 }} className="truncate">
                          {meeting.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                            {meeting.time}
                          </Typography>
                          <Chip
                            label={meeting.group}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.625rem',
                              fontWeight: 600,
                              bgcolor: 'var(--color-surface-3)',
                              color: 'var(--color-text-sec)',
                              border: '1px solid var(--color-border)',
                              '& .MuiChip-label': { px: '8px' },
                            }}
                          />
                        </Box>
                      </Box>
                      {meeting.status === 'today' && (
                        <Box sx={{ flexShrink: 0 }}>
                          <Box
                            sx={{
                              px: '10px', py: '4px',
                              borderRadius: '99px',
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                            }}
                          >
                            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: theme.palette.error.main, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                              {t('common.today')}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}

// Helper
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default Dashboard
