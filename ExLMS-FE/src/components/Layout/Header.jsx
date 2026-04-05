import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Divider,
  Button,
  InputBase,
  Chip,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice'
import { markAsRead, markAllAsRead } from '../../store/notificationSlice'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import notificationService from '../../services/notificationService'
import { motion, AnimatePresence } from 'framer-motion'
import { alpha } from '@mui/material/styles'
import ThemeToggle from '../Common/ThemeToggle'
import LanguageToggle from '../Common/LanguageToggle'
import { useTranslation } from 'react-i18next'

// ── Inline SVG icons ───────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const CheckAllIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const DRAWER_WIDTH = 256

const Header = () => {
  const [anchorElUser, setAnchorElUser]   = useState(null)
  const [anchorElNotif, setAnchorElNotif] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)

  const { t }     = useTranslation()
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector((state) => state.auth)
  const { notifications, unreadCount } = useSelector((state) => state.notifications)

  const handleLogout = () => {
    setAnchorElUser(null)
    authService.logout()
    dispatch(logout())
    navigate('/')
  }

  const handleNotifClick = (id) => {
    dispatch(markAsRead(id))
    notificationService.markAsRead(id).catch(err => console.error(err))
  }

  const handleMarkAll = () => {
    dispatch(markAllAsRead())
    notificationService.markAllAsRead().catch(err => console.error(err))
  }

  const getTimeDiff = (dateStr) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime()
      const mins  = Math.floor(diff / 60000)
      if (mins < 1)  return t('notifications.just_now')
      if (mins < 60) return t('notifications.mins_ago', { count: mins })
      const hrs = Math.floor(mins / 60)
      if (hrs < 24)  return t('notifications.hrs_ago', { count: hrs })
      const days = Math.floor(hrs / 24)
      return t('notifications.days_ago', { count: days })
    } catch { return '' }
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: `${DRAWER_WIDTH}px` },
        boxShadow: 'none',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: '64px !important' }}>

        {/* ── Search bar ──────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            height: 38,
            borderRadius: '9px',
            border: '1px solid',
            borderColor: searchFocused ? 'var(--color-primary)' : 'var(--color-border)',
            backgroundColor: searchFocused
              ? 'rgba(99, 102, 241, 0.15)'
              : 'var(--color-surface-3)',
            boxShadow: searchFocused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
            transition: 'all 0.2s ease',
            width: { xs: 160, sm: 260, md: 340 },
          }}
        >
          <Box sx={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <SearchIcon />
          </Box>
          <InputBase
            placeholder={t('header.search')}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{
              flex: 1,
              fontSize: '0.875rem',
              color: 'var(--color-text)',
              '& input::placeholder': { color: 'var(--color-text-sec)', opacity: 0.9 },
            }}
          />
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: '3px',
              flexShrink: 0,
            }}
          >
            {['⌘', 'K'].map((k) => (
              <Box
                key={k}
                sx={{
                  px: '5px',
                  py: '1px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  bgcolor: 'var(--color-surface-2)',
                  lineHeight: 1.4,
                }}
              >
                {k}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Right actions ────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LanguageToggle />
          <ThemeToggle />

          {/* Notification bell */}
          <Tooltip title={t('header.notifications')}>
            <IconButton
              onClick={(e) => setAnchorElNotif(e.currentTarget)}
              sx={{
                width: 38, height: 38,
                color: 'var(--color-text-sec)',
                bgcolor: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: '9px',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-text)', borderColor: 'var(--color-border-lt)' },
                transition: 'all 0.2s',
              }}
            >
              <Badge
                badgeContent={unreadCount}
                sx={{
                  '& .MuiBadge-badge': {
                    background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    minWidth: 16,
                    height: 16,
                    padding: '0 3px',
                    top: 2,
                    right: 2,
                  },
                }}
              >
                <BellIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Tooltip title={t('header.account')}>
            <motion.div whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={(e) => setAnchorElUser(e.currentTarget)}
                sx={{ p: 0, borderRadius: '10px', cursor: 'pointer' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1,
                    py: '4px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    bgcolor: 'var(--color-surface-2)',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'var(--color-surface-3)', borderColor: 'var(--color-border-lt)' },
                  }}
                >
                  <Avatar
                    src={user?.avatarKey ? `/api/files/download/${user.avatarKey}` : user?.avatarUrl}
                    sx={{
                      width: 28, height: 28, fontSize: '0.75rem', fontWeight: 700,
                      background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                      color: 'white',
                    }}
                  >
                    {(user?.name || user?.fullName || user?.email || 'U')[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>
                      {(user?.name || user?.fullName || user?.email?.split('@')[0] || 'Me').split(' ')[0]}
                    </Typography>
                  </Box>
                </Box>
              </IconButton>
            </motion.div>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* ── Notification Popover ─────────────────────────────────────── */}
      <Popover
        open={Boolean(anchorElNotif)}
        anchorEl={anchorElNotif}
        onClose={() => setAnchorElNotif(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 480,
            mt: 1.5,
            bgcolor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* header */}
        <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
              {t('header.notifications')}
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                  color: 'white',
                  '& .MuiChip-label': { px: '8px' },
                }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<CheckAllIcon />}
              onClick={handleMarkAll}
              sx={{
                fontSize: '0.75rem',
                color: 'var(--color-primary-lt)',
                px: 1,
                py: 0.5,
                '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' },
              }}
            >
              {t('header.mark_all')}
            </Button>
          )}
        </Box>

        {/* list */}
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-lt)' }}>
                <BellIcon />
              </Box>
              <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {t('header.all_caught_up')}
              </Typography>
            </Box>
          ) : (
            notifications.slice(0, 6).map((notif, i) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  onClick={() => handleNotifClick(notif.id)}
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    cursor: 'pointer',
                    bgcolor: notif.read ? 'transparent' : 'rgba(99,102,241,0.05)',
                    transition: 'background-color 0.15s',
                    alignItems: 'flex-start',
                    '&:hover': { bgcolor: 'rgba(240,246,252,0.04)' },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar
                      sx={{
                        width: 34, height: 34,
                        bgcolor: notif.read ? 'rgba(33,38,45,0.8)' : 'rgba(99,102,241,0.15)',
                        color: notif.read ? 'var(--color-text-muted)' : 'var(--color-primary-lt)',
                        borderRadius: '9px',
                        fontSize: '1rem',
                      }}
                    >
                      <BellIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    primary={
                      <Typography component="div" sx={{ fontSize: '0.8125rem', fontWeight: notif.read ? 400 : 700, color: 'var(--color-text)', lineHeight: 1.4, mb: '2px' }}>
                        {notif.title}
                      </Typography>
                    }
                    secondary={
                      <Box component="div">
                        <Typography component="div" sx={{ fontSize: '0.75rem', color: 'var(--color-text-sec)', mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {notif.body}
                        </Typography>
                        <Typography component="div" sx={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                          {getTimeDiff(notif.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notif.read && (
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #22D3EE)', mt: '6px', ml: 1, flexShrink: 0 }} />
                  )}
                </ListItem>
                {i < Math.min(notifications.length, 6) - 1 && (
                  <Divider sx={{ borderColor: 'var(--color-border)', mx: 2.5 }} />
                )}
              </React.Fragment>
            ))
          )}
        </Box>

        {/* footer */}
        <Box sx={{ p: 1.5, borderTop: '1px solid var(--color-border)' }}>
          <Button
            fullWidth
            size="small"
            onClick={() => { setAnchorElNotif(null); navigate('/notifications') }}
            sx={{
              color: 'var(--color-text-sec)',
              fontSize: '0.8125rem',
              py: 1,
              borderRadius: '8px',
              '&:hover': { bgcolor: 'rgba(99,102,241,0.08)', color: 'var(--color-text)' },
            }}
          >
            {t('header.view_all_notifs')}
          </Button>
        </Box>
      </Popover>

      {/* ── User Menu ────────────────────────────────────────────────── */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={() => setAnchorElUser(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 220,
            bgcolor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          },
        }}
      >
        {/* Profile header */}
        <Box sx={{ px: 2, py: 2, borderBottom: '1px solid var(--color-border)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={user?.avatarKey ? `/api/files/download/${user.avatarKey}` : user?.avatarUrl}
              sx={{
                width: 40, height: 40, fontWeight: 700, fontSize: '1rem',
                background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                color: 'white',
              }}
            >
              {(user?.name || user?.fullName || user?.email || 'U')[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                {user?.name || user?.fullName || 'Student'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
          {user?.role && (
            <Box sx={{ mt: 1.5 }}>
              <Chip
                label={user.role === 'ADMIN' ? 'Administrator' : (user.role === 'INSTRUCTOR' ? 'Instructor' : 'Student')}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  bgcolor: user.role === 'ADMIN' ? 'rgba(239,68,68,0.12)' : (user.role === 'INSTRUCTOR' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)'),
                  color: user.role === 'ADMIN' ? '#FCA5A5' : (user.role === 'INSTRUCTOR' ? '#6EE7B7' : '#818CF8'),
                  border: `1px solid ${user.role === 'ADMIN' ? 'rgba(239,68,68,0.25)' : (user.role === 'INSTRUCTOR' ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)')}`,
                  '& .MuiChip-label': { px: '8px' },
                }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ p: '6px' }}>
          <MenuItem onClick={() => { setAnchorElUser(null); navigate('/profile') }}>
            <ListItemIcon sx={{ color: 'var(--color-text-muted)', minWidth: 32 }}><UserIcon /></ListItemIcon>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{t('nav.profile')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => setAnchorElUser(null)}>
            <ListItemIcon sx={{ color: 'var(--color-text-muted)', minWidth: 32 }}><SettingsIcon /></ListItemIcon>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{t('header.settings')}</Typography>
          </MenuItem>
        </Box>

        <Divider sx={{ borderColor: 'var(--color-border)', mx: 1 }} />

        <Box sx={{ p: '6px' }}>
          <MenuItem
            onClick={handleLogout}
            sx={{
              color: '#FCA5A5',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' },
            }}
          >
            <ListItemIcon sx={{ color: '#EF4444', minWidth: 32 }}><LogoutIcon /></ListItemIcon>
            <Typography sx={{ fontSize: '0.875rem', color: '#FCA5A5' }}>{t('nav.logout')}</Typography>
          </MenuItem>
        </Box>
      </Menu>
    </AppBar>
  )
}

export default Header
