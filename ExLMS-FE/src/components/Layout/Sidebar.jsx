import React, { useState } from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Tooltip,
  Divider,
  Avatar,
  Chip
} from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

// ── Lucide-style SVG Icons (inline, consistent 20×20) ─────────────────────────
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  groups: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  inventory: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20L4 20L4 4L20 4L20 20Z"/><path d="M4 9L20 9"/><path d="M9 4L9 20"/><path d="M15 4L15 20"/>
    </svg>
  ),
  courses: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  assignments: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  quizzes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  forum: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  notifications: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  admin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  chevronRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
}

const drawerWidth = 256


const menuItems = [
  { key: 'dashboard',    icon: icons.dashboard,     path: '/',              section: 'main' },
  { key: 'groups',       icon: icons.groups,        path: '/groups',        section: 'main' },
  
  // Inventory Section
  { key: 'courses_repo',    icon: icons.courses,       path: '/inventory/courses',     section: 'inventory' },
  { key: 'assignments_repo',icon: icons.assignments,   path: '/inventory/assignments', section: 'inventory' },
  { key: 'quizzes_repo',    icon: icons.quizzes,       path: '/inventory/quizzes',     section: 'inventory' },

  { key: 'forum',        icon: icons.forum,          path: '/forum',         section: 'community' },
  { key: 'calendar',     icon: icons.calendar,       path: '/calendar',      section: 'community' },
  { key: 'notifications',icon: icons.notifications,  path: '/notifications', section: 'community' },
]

const Sidebar = () => {
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const unreadCount = useSelector((s) => s.notifications?.unreadCount ?? 0)

  const { t } = useTranslation()
  const allItems = [...menuItems]
  if (user?.role === 'ADMIN') {
    allItems.push({ key: 'admin', icon: icons.admin, path: '/admin/users', section: 'admin' })
  }

  const sections = {
    main: { label: t('nav.sections.main'), items: allItems.filter(i => i.section === 'main') },
    inventory: { label: t('nav.sections.inventory') || 'THƯ VIỆN CÁ NHÂN', items: allItems.filter(i => i.section === 'inventory') },
    community: { label: t('nav.sections.community'), items: allItems.filter(i => i.section === 'community') },
    ...(user?.role === 'ADMIN' ? { admin: { label: t('nav.sections.admin'), items: allItems.filter(i => i.section === 'admin') } } : {}),
  }

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path)

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          overflow: 'hidden',
        },
      }}
      PaperProps={{ className: 'glass-sidebar' }}
    >
      {/* ── Logo ───────────────────────────── */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          px: 3,
          borderBottom: '1px solid rgba(48, 54, 61, 0.8)',
          flexShrink: 0,
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          {/* Brand icon */}
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </Box>
          <Box>
            <Typography
              className="brand-text"
              sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.1 }}
            >
              ExLMS
            </Typography>
            <Typography sx={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>
              Learning Platform
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* ── User mini card ─────────────────── */}
      <Box
        sx={{
          mx: 2,
          mt: 2,
          mb: 1,
          p: '10px 12px',
          borderRadius: '10px',
          background: 'rgba(99,102,241,0.07)',
          border: '1px solid rgba(99,102,241,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          transition: 'all 0.2s',
          textDecoration: 'none',
          '&:hover': { background: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.3)' },
        }}
        component={Link}
        to="/profile"
      >
        <Avatar
          src={user?.avatarKey ? `/api/files/download/${user.avatarKey}` : user?.avatarUrl}
          sx={{
            width: 32, height: 32, fontSize: '0.875rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
            color: 'white',
          }}
        >
          {(user?.name || user?.fullName || user?.email || 'U')[0].toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }} className="truncate">
            {user?.name || user?.fullName || user?.email?.split('@')[0] || 'Student'}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }} className="truncate">
            {user?.role === 'ADMIN' ? t('common.administrator') : t('common.student')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
        </Box>
      </Box>

      {/* ── Navigation sections ────────────── */}
      <Box sx={{ overflow: 'auto', flex: 1, px: 1.5, pt: 1, pb: 2 }}>
        {Object.values(sections).map((section, si) => (
          <Box key={si} sx={{ mb: 1.5 }}>
            <Typography
              sx={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                px: 1.5,
                py: 1,
                display: 'block',
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const active = isActive(item.path)
                const badge = item.path === '/notifications' ? unreadCount : item.badge
                return (
                  <ListItem key={item.key} disablePadding>
                    <motion.div style={{ width: '100%' }} whileTap={{ scale: 0.98 }}>
                      <ListItemButton
                        component={Link}
                        to={item.path}
                        selected={active}
                        className={active ? 'nav-item-active' : ''}
                        sx={{
                          borderRadius: '8px',
                          py: '9px',
                          px: '12px',
                          gap: 1.5,
                          color: active ? 'var(--color-primary-lt)' : 'var(--color-text-sec)',
                          backgroundColor: active ? 'rgba(99,102,241,0.12) !important' : 'transparent',
                          '&:hover': {
                            backgroundColor: active
                              ? 'rgba(99,102,241,0.15) !important'
                              : 'rgba(240,246,252,0.04) !important',
                            color: active ? 'var(--color-primary-lt)' : 'var(--color-text)',
                          },
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 'unset',
                            color: active ? 'var(--color-primary-lt)' : 'var(--color-text-muted)',
                            transition: 'color 0.15s',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={t(`nav.${item.key}`)}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: active ? 600 : 400,
                            lineHeight: 1,
                          }}
                        />
                        {badge > 0 && (
                          <Chip
                            label={badge > 99 ? '99+' : badge}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              backgroundColor: active ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)',
                              color: active ? '#A5B4FC' : 'var(--color-text-muted)',
                              '& .MuiChip-label': { px: '6px' },
                            }}
                          />
                        )}
                        {active && (
                          <Box sx={{ color: 'rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center' }}>
                            {icons.chevronRight}
                          </Box>
                        )}
                      </ListItemButton>
                    </motion.div>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* ── Footer ─────────────────────────── */}
      <Box
        sx={{
          px: 2,
          py: 2,
          borderTop: '1px solid rgba(48,54,61,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
          ExLMS v1.0
        </Typography>
        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'var(--color-border-lt)' }} />
        <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
          © 2026
        </Typography>
      </Box>
    </Drawer>
  )
}

export default Sidebar
