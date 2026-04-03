import React, { useState, useEffect } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'

// ── Icons ──────────────────────────────────────────────────────────
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const GroupsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const CoursesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)
const AssignIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const container = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
}

const StatCard = ({ label, value, icon, colorClass, href }) => {
  const { t } = useTranslation();
  return (
    <motion.div variants={item} style={{ height: '100%' }}>
      <Box
        component={href ? Link : 'div'}
        to={href}
        className={`stat-card stat-card--${colorClass}`}
        sx={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          textDecoration: 'none !important',
          cursor: href ? 'pointer' : 'default',
          '&:hover': href ? { borderColor: 'var(--color-border-lt)', transform: 'translateY(-2px)' } : {},
        }}
      >
        <Box>
          <Typography sx={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: '2.25rem', lineHeight: 1, color: 'var(--color-text)', mb: 0.5,
          }}>
            {value}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {label}
          </Typography>
        </Box>
        <Box className={`icon-badge icon-badge--${colorClass}`} sx={{ mt: 0.5 }}>
          {icon}
        </Box>
      </Box>
      {href && (
        <Box sx={{
          mt: 2, display: 'flex', alignItems: 'center', gap: 0.5,
          fontSize: '0.75rem', color: 'var(--color-text-muted)',
        }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-primary-lt)' }}>{t('admin.manage')}</Typography>
          <Box sx={{ color: 'var(--color-primary-lt)' }}><ArrowRightIcon /></Box>
        </Box>
      )}
    </motion.div>
  );
}

const AdminDashboard = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    totalUsers: 0, totalGroups: 0, totalCourses: 0, upcomingAssignmentsCount: 0,
  })

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
  }, [])

  const cards = [
    { label: t('admin.stats.total_users'),     value: stats.totalUsers,                icon: <UsersIcon  />, colorClass: 'indigo', href: '/admin/users' },
    { label: t('admin.stats.total_groups'),    value: stats.totalGroups,               icon: <GroupsIcon />, colorClass: 'cyan',   href: null },
    { label: t('admin.stats.total_courses'),   value: stats.totalCourses,              icon: <CoursesIcon/>, colorClass: 'amber',  href: null },
    { label: t('admin.stats.total_assignments'), value: stats.upcomingAssignmentsCount,  icon: <AssignIcon />, colorClass: 'red',    href: null },
  ]

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="visible" sx={{ pb: 6 }}>

      {/* Header */}
      <motion.div variants={item}>
        <Box sx={{ mb: 4 }}>
          <Typography sx={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2rem' },
            color: 'var(--color-text)', letterSpacing: '-0.03em', mb: 0.5,
          }}>
            {t('admin.dashboard_title')}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {t('admin.dashboard_subtitle')}
          </Typography>
        </Box>
      </motion.div>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>

      {/* Quick links */}
      <motion.div variants={item}>
        <Box
          sx={{
            bgcolor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            p: 3,
          }}
        >
          <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', mb: 2.5 }}>
            {t('admin.quick_actions')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {[
              { label: t('admin.actions.manage_users'), href: '/admin/users', color: '#818CF8' },
            ].map(({ label, href, color }) => (
              <Box
                key={label}
                component={Link} to={href}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 2, py: 1, borderRadius: '9px',
                  border: '1px solid var(--color-border)',
                  bgcolor: 'rgba(33,38,45,0.6)',
                  color, fontSize: '0.875rem', fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': {
                    borderColor: color,
                    bgcolor: `${color}12`,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {label}
                <Box sx={{ color, display: 'flex', alignItems: 'center' }}><ArrowRightIcon /></Box>
              </Box>
            ))}
          </Box>
        </Box>
      </motion.div>
    </Box>
  )
}

export default AdminDashboard
