import React from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

// ── SVG Icons ─────────────────────────────────────────────────────
const PeopleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const PublicIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

// Deterministic gradient from string
const getGradient = (str = '') => {
  const gradients = [
    'linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)',
    'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
    'linear-gradient(135deg, #7C2D12 0%, #431407 100%)',
    'linear-gradient(135deg, #1E3A5F 0%, #0C1C30 100%)',
    'linear-gradient(135deg, #4C1D95 0%, #2E1065 100%)',
    'linear-gradient(135deg, #0C4A6E 0%, #082F49 100%)',
    'linear-gradient(135deg, #3D1A40 0%, #1A0A1B 100%)',
  ]
  const idx = str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length
  return gradients[idx]
}

const initials = (name = '') =>
  name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'G'

const GroupCard = ({ group, onJoin }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { id, name, description, ownerName, visibility, memberCount, category, coverUrl, isJoined, currentUserRole } = group
  const isPublic = visibility === 'PUBLIC'
  const gradient = getGradient(name)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:hover': {
            borderColor: 'var(--color-border-lt)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)',
          },
        }}
      >
        {/* ── Cover / Header ─── */}
        <Box
          sx={{
            height: 100,
            position: 'relative',
            flexShrink: 0,
            background: coverUrl ? undefined : gradient,
            backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />

          {/* Visibility badge */}
          <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: '4px',
                px: '8px', py: '3px',
                borderRadius: '99px',
                bgcolor: isPublic ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                border: `1px solid ${isPublic ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.4)'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box sx={{ color: isPublic ? '#86EFAC' : '#FDE68A' }}>
                {isPublic ? <PublicIcon /> : <LockIcon />}
              </Box>
              <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: isPublic ? '#86EFAC' : '#FDE68A', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {isPublic ? t('group_card.public') : t('group_card.private')}
              </Typography>
            </Box>
          </Box>

          {/* Group avatar */}
          <Box sx={{ position: 'absolute', bottom: -20, left: 16 }}>
            <Avatar
              sx={{
                width: 44, height: 44,
                fontSize: '1rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                border: '2px solid var(--color-surface-2)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              {initials(name)}
            </Avatar>
          </Box>
        </Box>

        {/* ── Body ─── */}
        <Box sx={{ flex: 1, p: 2.5, pt: 3.5 }}>
          {/* Category chip */}
          {category && (
            <Chip
              label={category}
              size="small"
              sx={{
                mb: 1,
                height: 18,
                fontSize: '0.5625rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                bgcolor: 'rgba(99,102,241,0.12)',
                color: '#818CF8',
                border: '1px solid rgba(99,102,241,0.25)',
                '& .MuiChip-label': { px: '8px' },
              }}
            />
          )}

          <Typography
            sx={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--color-text)',
              lineHeight: 1.3,
              mb: 0.75,
            }}
            className="clamp-2"
          >
            {name}
          </Typography>

          <Typography
            sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5, mb: 2 }}
            className="clamp-2"
          >
            {description || t('group_card.no_desc')}
          </Typography>

          {/* Stats row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-text-muted)' }}>
              <PeopleIcon />
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-sec)' }}>
                {t('group_card.members_count', { count: memberCount ?? 0 })}
              </Typography>
            </Box>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'var(--color-border-lt)' }} />
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {t('group_card.by_owner', { owner: ownerName })}
            </Typography>
          </Box>
        </Box>

        {/* ── Actions ─── */}
        <Box
          sx={{
            px: 2.5, pb: 2.5,
            display: 'flex', gap: 1.5,
            borderTop: '1px solid rgba(48,54,61,0.5)',
            pt: 2,
          }}
        >
          <Button
            component={Link}
            to={`/groups/${id}`}
            variant="outlined"
            size="small"
            endIcon={<ArrowRightIcon />}
            sx={{
              flex: 1,
              height: 36,
              borderRadius: '8px',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-sec)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-text)', bgcolor: 'rgba(99,102,241,0.06)' },
              transition: 'all 0.15s',
            }}
          >
            {t('group_card.view')}
          </Button>
          {!isJoined && (
            <Button
              size="small"
              variant="contained"
              startIcon={<PlusIcon />}
              onClick={() => onJoin(id)}
              sx={{
                flex: 1,
                height: 36,
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                cursor: 'pointer',
                '&:hover': {
                  background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.15s',
              }}
            >
              {t('group_card.join')}
            </Button>
          )}
        </Box>
      </Box>
    </motion.div>
  )
}

export default GroupCard
