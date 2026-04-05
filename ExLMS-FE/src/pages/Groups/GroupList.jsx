import React, { useState, useEffect } from 'react'
import {
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Chip,
  Skeleton,
} from '@mui/material'
<<<<<<< HEAD
import { alpha, useTheme } from '@mui/material/styles'
=======
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import groupService from '../../services/groupService'
import GroupCard from '../../components/Groups/GroupCard'

// ── SVG Icons ─────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const HashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)
const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
)
const UsersIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const container = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const GroupList = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [groups,  setGroups]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab,  setActiveTab]  = useState(0)
  const [snackbar,   setSnackbar]   = useState({ open: false, message: '', severity: 'success' })

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteCode,   setInviteCode]   = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  const fetchGroups = async (tab = activeTab) => {
    setLoading(true)
    setError(null)
    try {
      const data = tab === 1
        ? await groupService.getMyGroups()
        : await groupService.getAllPublicGroups()
      setGroups(data)
    } catch {
      setError(t('groups.errors.fetch_failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups(activeTab) }, [activeTab])

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await groupService.createJoinRequest(groupId, t('groups.messages.join_default'))
      setSnackbar({ open: true, message: response || t('groups.messages.join_sent'), severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t('groups.errors.join_failed'), severity: 'error' })
    }
  }

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) return
    setInviteLoading(true)
    try {
      const response = await groupService.joinGroupByInviteCode(inviteCode)
      setSnackbar({ open: true, message: response || t('groups.messages.join_success'), severity: 'success' })
      setInviteDialogOpen(false)
      setInviteCode('')
      fetchGroups()
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t('groups.errors.invalid_code'), severity: 'error' })
    } finally {
      setInviteLoading(false)
    }
  }

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.category && g.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="visible" sx={{ pb: 6 }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              sx={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                color: 'var(--color-text)',
                letterSpacing: '-0.03em',
                mb: 0.5,
              }}
            >
              {t('groups.title')}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {t('groups.subtitle')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchGroups(activeTab)}
              disabled={loading}
              sx={{
                height: 38, borderRadius: '9px', fontSize: '0.875rem',
                borderColor: 'var(--color-border)', color: 'var(--color-text-sec)',
                cursor: 'pointer',
                '&:hover': { borderColor: 'var(--color-border-lt)', color: 'var(--color-text)', bgcolor: 'rgba(240,246,252,0.04)' },
              }}
            >
              {t('groups.refresh')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<KeyIcon />}
              onClick={() => setInviteDialogOpen(true)}
              sx={{
                height: 38, borderRadius: '9px', fontSize: '0.875rem',
                borderColor: 'var(--color-border)', color: 'var(--color-text-sec)',
                cursor: 'pointer',
                '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary-lt)', bgcolor: 'rgba(99,102,241,0.06)' },
              }}
            >
              {t('groups.join_by_code')}
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusIcon />}
              component={Link}
              to="/groups/create"
              sx={{
                height: 38, borderRadius: '9px', fontSize: '0.875rem', fontWeight: 600,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                cursor: 'pointer',
                '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' },
              }}
            >
              {t('groups.create_group')}
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
<<<<<<< HEAD
            gap: 3,
            mb: 4,
            p: '10px 10px 10px 20px',
            bgcolor: 'var(--color-surface-2)',
            backdropFilter: 'blur(16px)',
=======
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: 'var(--color-surface)',
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            flexWrap: 'wrap',
<<<<<<< HEAD
            boxShadow: `0 8px 32px rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.3 : 0.08})`,
=======
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
          }}
        >
          {/* Search */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, height: 38, flex: '1 1 240px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              bgcolor: 'var(--color-surface-3)',
              '&:focus-within': { borderColor: 'var(--color-primary)', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' },
              transition: 'all 0.2s',
            }}
          >
            <Box sx={{ color: 'var(--color-text-sec)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <SearchIcon />
            </Box>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('groups.search_placeholder')}
              className="search-input"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--color-text)', fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1,
                  padding: 0, display: 'flex', alignItems: 'center',
                }}
              >
                ×
              </button>
            )}
          </Box>

          {/* Tab filter */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              minHeight: 38,
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #6366F1, #22D3EE)',
                height: 2, borderRadius: 1,
              },
              '& .MuiTab-root': {
                minHeight: 38, py: 0, px: 2,
                fontSize: '0.875rem', fontWeight: 500,
                color: 'var(--color-text-muted)',
                textTransform: 'none',
                cursor: 'pointer',
                '&.Mui-selected': { color: 'var(--color-text)', fontWeight: 600 },
              },
            }}
          >
            <Tab label={t('groups.tabs.all')} id="tab-all" />
            <Tab label={t('groups.tabs.mine')}  id="tab-mine" />
          </Tabs>

<<<<<<< HEAD
          <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: 'var(--color-border)', opacity: 0.5 }} />

          {/* Search */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 2, height: 40, flex: 1,
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              bgcolor: alpha(theme.palette.background.paper, 0.4),
              '&:focus-within': { 
                borderColor: 'var(--color-primary)', 
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
              },
              transition: 'all 0.2s',
            }}
          >
            <Box sx={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', opacity: 0.7 }}>
              <SearchIcon />
            </Box>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('groups.search_placeholder')}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 500,
                fontFamily: 'var(--font-body)',
              }}
            />
            {searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm('')} sx={{ p: 0.5, color: 'var(--color-text-muted)' }}>
                ×
              </IconButton>
            )}
          </Box>

=======
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
          {/* Result count */}
          {!loading && (
            <Chip
              label={t('groups.count', { count: filteredGroups.length })}
              size="small"
              sx={{
                height: 24, fontSize: '0.75rem', fontWeight: 600,
                bgcolor: 'rgba(99,102,241,0.1)', color: '#818CF8',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            />
          )}
        </Box>
      </motion.div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rounded"
                height={280}
                sx={{ bgcolor: 'var(--color-surface-3)', borderRadius: '14px' }}
              />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert
          severity="error"
          sx={{
            borderRadius: '10px',
            bgcolor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#FCA5A5',
            '& .MuiAlert-icon': { color: '#EF4444' },
          }}
        >
          {error}
        </Alert>
      ) : filteredGroups.length === 0 ? (
        <motion.div variants={item}>
          <Box
            sx={{
              textAlign: 'center', py: 10, px: 4,
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
              <UsersIcon />
            </Box>
            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-text)', mb: 0.75 }}>
              {searchTerm ? t('groups.no_matching') : t('groups.no_groups')}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', mb: 3 }}>
              {searchTerm
                ? t('groups.search_no_results', { searchTerm })
                : t('groups.be_first')}
            </Typography>
            {searchTerm ? (
              <Button
                onClick={() => setSearchTerm('')}
                variant="outlined"
                sx={{ borderRadius: '9px', borderColor: 'var(--color-border)', color: 'var(--color-text-sec)', cursor: 'pointer' }}
              >
                {t('groups.clear_search')}
              </Button>
            ) : (
              <Button
                component={Link} to="/groups/create"
                variant="contained"
                startIcon={<PlusIcon />}
                sx={{ borderRadius: '9px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', cursor: 'pointer' }}
              >
                {t('groups.create_group')}
              </Button>
            )}
          </Box>
        </motion.div>
      ) : (
        <Grid container spacing={2.5}>
          {filteredGroups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <motion.div variants={item} style={{ height: '100%' }}>
                <GroupCard group={group} onJoin={handleJoinGroup} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Join by Code Dialog ──────────────────────────────────── */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: '14px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            minWidth: 360,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)', pb: 1 }}>
          {t('groups.invite.dialog_title')}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', mb: 2.5 }}>
            {t('groups.invite.dialog_desc')}
          </Typography>
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, height: 44,
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              bgcolor: alpha(theme.palette.background.paper, 0.4),
              '&:focus-within': { 
                borderColor: 'var(--color-primary)', 
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.6)
              },
              transition: 'all 0.2s',
            }}
          >
            <Box sx={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              <KeyIcon />
            </Box>
            <input
              autoFocus
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
              placeholder={t('groups.invite.input_placeholder')}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--color-text)', fontSize: '0.9375rem',
                fontFamily: 'var(--font-body)', letterSpacing: '0.08em',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => { setInviteDialogOpen(false); setInviteCode('') }}
            sx={{ borderRadius: '8px', color: 'var(--color-text-sec)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(240,246,252,0.04)' } }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleJoinByCode}
            variant="contained"
            disabled={inviteLoading || !inviteCode.trim()}
            sx={{
              borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)' },
              '&.Mui-disabled': { background: 'rgba(99,102,241,0.25)', color: 'rgba(255,255,255,0.3)' },
            }}
          >
            {inviteLoading ? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.7)' }} /> : t('groups.invite.join_btn')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{
            borderRadius: '10px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default GroupList
