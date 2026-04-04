import React, { useState, useEffect } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'

// ── Icons ──────────────────────────────────────────────────────────
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

const container = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
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
          display: 'flex', flexDirection: 'column', height: '100%',
          p: 3, border: '1px solid var(--color-border)', borderRadius: '16px',
          bgcolor: 'var(--color-surface-2)',
          textDecoration: 'none !important',
          cursor: href ? 'pointer' : 'default',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': href ? {
            borderColor: `var(--color-${colorClass}-lt)`,
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px -10px rgba(var(--color-${colorClass}-rgb), 0.3)`,
          } : {},
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box className={`icon-badge icon-badge--${colorClass}`} sx={{ width: 42, height: 42 }}>
            {icon}
          </Box>
          {href && (
            <Box sx={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {t('admin.manage')} <ArrowRightIcon />
            </Box>
          )}
        </Box>
        <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', mb: 0.5, letterSpacing: '-0.02em' }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
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
    <Box component={motion.div} variants={container} initial="hidden" animate="visible" sx={{ pb: 8, position: 'relative' }}>
      
      {/* Dynamic Background Glows */}
      <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div variants={item}>
        <Box sx={{ mb: 5 }}>
          <Typography className="gradient-text" sx={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            letterSpacing: '-0.04em', mb: 1,
          }}>
            {t('admin.dashboard_title')}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'var(--color-text-muted)', maxWidth: 600 }}>
            {t('admin.dashboard_subtitle')}
          </Typography>
        </Box>
      </motion.div>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12} md={7}>
          <motion.div variants={item}>
            <Box
              className="glass-panel"
              sx={{ p: { xs: 3, sm: 4 }, height: '100%' }}
            >
              <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-text)', mb: 3.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-lt)', display: 'flex' }}>
                   <ActivityIcon />
                </Box>
                {t('admin.quick_actions')}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {[
                  { label: t('admin.actions.manage_users'), href: '/admin/users', icon: <UsersIcon />, color: '#818CF8', desc: 'Manage user access, roles, and account status.' },
                ].map(({ label, href, icon, color, desc }) => (
                  <Box
                    key={label}
                    component={Link} to={href}
                    sx={{
                      display: 'flex', flexDirection: 'column', gap: 1.5,
                      p: 2.5, borderRadius: '14px',
                      border: '1px solid var(--color-border)',
                      bgcolor: 'rgba(255,255,255,0.02)',
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: color,
                        bgcolor: `${color}08`,
                        transform: 'translateY(-2px)',
                        '& .btn-arrow': { transform: 'translateX(4px)' }
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color }}>
                      {icon}
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{label}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                      {desc}
                    </Typography>
                    <Box className="btn-arrow" sx={{ mt: 'auto', color, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 700, transition: 'transform 0.2s' }}>
                      {t('admin.manage')} <ArrowRightIcon />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </motion.div>
        </Grid>

        {/* System Snapshot (Mock Visual) */}
        <Grid item xs={12} md={5}>
          <motion.div variants={item}>
            <Box className="glass-card" sx={{ p: { xs: 3, sm: 4 }, height: '100%', borderLeft: '4px solid var(--color-primary)' }}>
              <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', mb: 3 }}>
                 System Health Snapshot
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { label: 'API Uptime', value: '99.98%', color: 'var(--color-success)' },
                  { label: 'Database Load', value: '14%', color: 'var(--color-primary-lt)' },
                  { label: 'Storage Usage', value: '42%', color: 'var(--color-warning)' },
                ].map((s) => (
                  <Box key={s.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-sec)' }}>{s.label}</Typography>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: s.color }}>{s.value}</Typography>
                    </Box>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <Box sx={{ width: s.value, height: '100%', bgcolor: s.color, borderRadius: 3 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ mt: 5, p: 2, borderRadius: '12px', bgcolor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                 <Box className="pulse-dot" />
                 <Typography sx={{ fontSize: '0.8125rem', color: '#86EFAC', fontWeight: 600 }}>
                    All systems operational
                 </Typography>
              </Box>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard
