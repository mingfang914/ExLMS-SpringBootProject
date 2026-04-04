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
import { useTranslation } from 'react-i18next'

// ── SVG Icons ─────────────────────────────────────────────────────
const PeopleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const PublicIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
  const { t } = useTranslation()
  const { id, name, description, ownerName, visibility, memberCount, category, coverUrl, isJoined, currentUserRole } = group
  const isPublic   = visibility === 'PUBLIC'
  const gradient   = getGradient(name)

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(99, 102, 241, 0.4)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)',
            '& .card-banner-img': { transform: 'scale(1.1)' }
          },
        }}
      >
        {/* ── Banner ─── */}
        <Box sx={{ height: 120, position: 'relative', overflow: 'hidden' }}>
          <Box
            className="card-banner-img"
            sx={{
              position: 'absolute',
              inset: 0,
              background: coverUrl ? undefined : gradient,
              backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-surface-2), transparent)' }} />
          
          {/* Status Badge */}
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: '6px',
                px: 1.5, py: 0.5,
                borderRadius: '8px',
                bgcolor: isPublic ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                border: `1px solid ${isPublic ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box sx={{ color: isPublic ? '#34D399' : '#FBBF24', display: 'flex' }}>
                {isPublic ? <PublicIcon /> : <LockIcon />}
              </Box>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: isPublic ? '#34D399' : '#FBBF24', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                {isPublic ? t('group_card.public') : t('group_card.private')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Content ─── */}
        <Box sx={{ flex: 1, px: 3, pb: 3, pt: 1, position: 'relative' }}>
          {/* Avatar floating */}
          <Avatar
            sx={{
              width: 52, height: 52,
              position: 'absolute',
              top: -26, left: 24,
              fontSize: '1.25rem', fontWeight: 900,
              background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
              border: '4px solid var(--color-surface-2)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            }}
          >
            {initials(name)}
          </Avatar>

          <Box sx={{ mt: 3.5 }}>
            {category && (
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-primary-lt)', mb: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {category}
              </Typography>
            )}
            <Typography
              sx={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.125rem',
                color: 'var(--color-text)',
                lineHeight: 1.25,
                mb: 1.25,
              }}
              className="clamp-1"
            >
              {name}
            </Typography>

            <Typography
              sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.6, mb: 2.5, height: '2.6em' }}
              className="clamp-2"
            >
              {description || t('group_card.no_desc')}
            </Typography>

            {/* Meta data */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 18, height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.1)' }}>
                  {ownerName.charAt(0)}
                </Avatar>
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {ownerName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'var(--color-text-muted)' }}>
                <PeopleIcon />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-sec)' }}>
                  {memberCount ?? 0}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Actions ─── */}
        <Box
          sx={{
            px: 3, pb: 3,
            display: 'flex', gap: 1.5,
          }}
        >
          <Button
            component={Link}
            to={`/groups/${id}`}
            variant="outlined"
            fullWidth
            sx={{
              height: 40,
              borderRadius: '12px',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-sec)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { borderColor: '#6366F1', color: 'var(--color-text)', bgcolor: 'rgba(99,102,241,0.06)' },
            }}
          >
            {t('group_card.view')}
          </Button>
          {!isJoined && (
            <Button
              variant="contained"
              fullWidth
              onClick={(e) => { e.preventDefault(); onJoin(id); }}
              sx={{
                height: 40,
                borderRadius: '12px',
                fontSize: '0.8125rem',
                fontWeight: 800,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                  boxShadow: '0 6px 18px rgba(79, 70, 229, 0.45)',
                },
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
