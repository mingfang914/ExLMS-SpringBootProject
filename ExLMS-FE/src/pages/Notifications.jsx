import React from 'react'
import {
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { markAsRead, markAllAsRead } from '../store/notificationSlice'
import { motion, AnimatePresence } from 'framer-motion'

// ── SVG Icons ─────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const BellBigIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const CheckAllIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/><polyline points="16 6 5 17"/>
  </svg>
)

const container = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.25 } },
}

const timeSince = (dateStr) => {
  try {
    const diff  = Date.now() - new Date(dateStr).getTime()
    const mins  = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7)  return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return '' }
}

const Notifications = () => {
  const { notifications, unreadCount } = useSelector((state) => state.notifications)
  const dispatch = useDispatch()

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', pb: 6 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography sx={{
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                color: 'var(--color-text)', letterSpacing: '-0.03em',
              }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  sx={{
                    height: 22, fontSize: '0.75rem', fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                    color: 'white',
                    '& .MuiChip-label': { px: '8px' },
                  }}
                />
              )}
            </Box>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </Typography>
          </Box>

          {unreadCount > 0 && (
            <Button
              onClick={() => dispatch(markAllAsRead())}
              variant="outlined"
              startIcon={<CheckAllIcon />}
              sx={{
                height: 38, borderRadius: '9px', fontSize: '0.875rem',
                borderColor: 'var(--color-border)', color: 'var(--color-text-sec)',
                cursor: 'pointer',
                '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary-lt)', bgcolor: 'rgba(99,102,241,0.06)' },
              }}
            >
              Mark All as Read
            </Button>
          )}
        </Box>
      </motion.div>

      {/* ── List ────────────────────────────────────────────────── */}
      {notifications.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Box
            sx={{
              textAlign: 'center', py: 12,
              bgcolor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '14px',
            }}
          >
            <Box
              sx={{
                width: 72, height: 72, borderRadius: '18px',
                bgcolor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-primary-lt)', mx: 'auto', mb: 2.5,
              }}
            >
              <BellBigIcon />
            </Box>
            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-text)', mb: 0.75 }}>
              No notifications
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              You're all caught up! Check back later.
            </Typography>
          </Box>
        </motion.div>
      ) : (
        <Box
          component={motion.div}
          variants={container} initial="hidden" animate="visible"
          sx={{
            bgcolor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence>
            {notifications.map((notif, index) => (
              <motion.div key={notif.id} variants={item} layout>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    px: 3, py: 2.5,
                    bgcolor: notif.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                    borderLeft: notif.read ? '3px solid transparent' : '3px solid rgba(99,102,241,0.5)',
                    transition: 'all 0.2s',
                    cursor: notif.read ? 'default' : 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(240,246,252,0.02)',
                    },
                  }}
                  onClick={() => !notif.read && dispatch(markAsRead(notif.id))}
                >
                  {/* Icon */}
                  <Avatar
                    sx={{
                      width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                      bgcolor: notif.read ? 'rgba(33,38,45,0.8)' : 'rgba(99,102,241,0.15)',
                      color: notif.read ? 'var(--color-text-muted)' : 'var(--color-primary-lt)',
                    }}
                  >
                    <BellIcon />
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: notif.read ? 400 : 600,
                          color: 'var(--color-text)',
                          lineHeight: 1.45,
                        }}
                      >
                        {notif.message}
                      </Typography>
                      {!notif.read && (
                        <Tooltip title="Mark as read">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); dispatch(markAsRead(notif.id)) }}
                            sx={{
                              width: 28, height: 28, flexShrink: 0,
                              color: 'var(--color-text-muted)', cursor: 'pointer',
                              '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-lt)' },
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {timeSince(notif.createdAt)}
                      </Typography>
                      {!notif.read && (
                        <Box
                          sx={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {index < notifications.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(48,54,61,0.5)' }} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  )
}

export default Notifications
