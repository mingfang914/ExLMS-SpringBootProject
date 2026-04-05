import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { setUser } from '../store/authSlice'
import FileUpload from '../components/Common/FileUpload'
import { motion } from 'framer-motion'

// ── SVG Icons ─────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)
const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)
const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const AwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
)

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const StatCard = ({ icon, label, value, colorClass }) => (
  <Box className={`stat-card ${colorClass}`} sx={{ flex: 1, minWidth: 140 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
      <Box className={`icon-badge icon-badge--${colorClass.split('--')[1]}`} sx={{ width: 32, height: 32 }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-sec)' }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', ml: 0.5 }}>
      {value}
    </Typography>
  </Box>
)

const FieldLabel = ({ children, icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
    {icon && <Box sx={{ color: 'var(--color-primary-lt)', display: 'flex', alignItems: 'center' }}>{icon}</Box>}
    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-sec)' }}>
      {children}
    </Typography>
  </Box>
)

const calcCompletion = (data) => {
  let score = 0
  if (data.fullName) score += 34
  if (data.bio) score += 33
  if (data.avatarKey) score += 33
  return score
}

const Profile = () => {
  const { t } = useTranslation()
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [profileData, setProfileData] = useState({ fullName: '', bio: '', avatarKey: '', createdAt: '' })
  const [stats, setStats] = useState({ coursesInProgress: 0, averageCompletion: 0, totalAchievement: 0 })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [userRes, statsRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/dashboard/stats')
        ])

        setProfileData({
          fullName: userRes.data.fullName || '',
          bio: userRes.data.bio || '',
          avatarKey: userRes.data.avatarKey || '',
          createdAt: userRes.data.createdAt || '',
        })
        setStats(statsRes.data)
        dispatch(setUser(userRes.data))
      } catch (err) {
        console.error('Failed to load profile data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) =>
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      await api.put('/users/me/profile', profileData)
      setSuccessMsg(t('profile.update_success'))
      const userRes = await api.get('/users/me')
      dispatch(setUser(userRes.data))
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t('profile.update_failed'))
    } finally {
      setSaving(false)
    }
  }

  const completion = calcCompletion(profileData)
  const avatarSrc = profileData.avatarKey
    ? `/api/files/download/${profileData.avatarKey}`
    : user?.avatarUrl || undefined

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    )
  }

  return (
    <Box
      component={motion.div}
      variants={container} initial="hidden" animate="visible"
      sx={{ maxWidth: 1000, mx: 'auto', pb: 8, px: { xs: 2, sm: 3 } }}
    >

      {/* ── Header Wrapper ─────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box className="glass-panel" sx={{ overflow: 'hidden', mb: 4, position: 'relative' }}>
          <Box className="profile-banner" />

          <Box sx={{ p: { xs: 3, sm: 4 }, pt: 0, mt: -6, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-end' }, gap: 3 }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: { xs: 120, sm: 140 }, height: { xs: 120, sm: 140 },
                  fontSize: '3rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                  color: 'white',
                  border: '6px solid var(--color-surface)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                }}
              >
                {(profileData.fullName || user?.email || 'U')[0].toUpperCase()}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute', bottom: 10, right: 10,
                  width: 36, height: 36, borderRadius: '50%',
                  bgcolor: 'var(--color-primary)',
                  border: '3px solid var(--color-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <CameraIcon />
              </Box>
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, mb: 1 }}>
              <Typography className="gradient-text" sx={{
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                lineHeight: 1.2, mb: 0.5
              }}>
                {profileData.fullName || t('profile.full_name')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1.5, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-sec)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MailIcon /> {user?.email}
                </Typography>
                {user?.role && (
                  <Chip
                    label={user.role === 'ADMIN' ? t('common.administrator') : user.role === 'INSTRUCTOR' ? t('common.instructor') : t('common.student')}
                    size="small"
                    className={user.role === 'ADMIN' ? 'tag--error' : 'tag--primary'}
                    sx={{ height: 22, fontWeight: 700, fontSize: '0.625rem' }}
                  />
                )}
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={!saving && <SaveIcon />}
                sx={{
                  height: 44, borderRadius: '12px', px: 3, fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dk))',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                  '&:hover': { background: 'linear-gradient(135deg, var(--color-primary-lt), var(--color-primary))', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s'
                }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : t('common.save_changes')}
              </Button>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* ── Statistics Row ─────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box className="stats-container">
          <StatCard
            icon={<BookIcon />}
            label={t('dashboard.stats.courses')}
            value={stats.coursesInProgress || 0}
            colorClass="stat-card--indigo"
          />
          <StatCard
            icon={<CheckCircleIcon />}
            label={t('common.course_completion')}
            value={`${Math.round(stats.averageCompletion || 0)}%`}
            colorClass="stat-card--green"
          />
          <StatCard
            icon={<AwardIcon />}
            label={t('common.achievement')}
            value={(stats.totalAchievement || 0).toLocaleString()}
            colorClass="stat-card--amber"
          />
          <StatCard
            icon={<UserIcon />}
            label={t('common.members_since')}
            value={profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '---'}
            colorClass="stat-card--cyan"
          />
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* ── Left Side: Form ──────────────────────────────────── */}
        <Grid item xs={12} md={8}>
          <motion.div variants={item}>
            <Box className="glass-panel" sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-text)', mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 18, bgcolor: 'var(--color-primary)', borderRadius: 2 }} />
                {t('profile.personal_info')}
              </Typography>

              <form onSubmit={handleSave}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel icon={<UserIcon />}>{t('profile.full_name')}</FieldLabel>
                    <TextField
                      fullWidth
                      name="fullName"
                      className="modern-input"
                      value={profileData.fullName}
                      onChange={handleChange}
                      placeholder={t('profile.full_name_placeholder')}
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel icon={<MailIcon />}>{t('profile.email')}</FieldLabel>
                    <TextField
                      fullWidth
                      className="modern-input"
                      value={user?.email || ''}
                      disabled
                      variant="outlined"
                      helperText={t('profile.email_hint')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FieldLabel icon={<FileTextIcon />}>{t('profile.bio')}</FieldLabel>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      name="bio"
                      className="modern-input"
                      value={profileData.bio}
                      onChange={handleChange}
                      placeholder={t('profile.bio_placeholder')}
                    />
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', mt: 1, textAlign: 'right' }}>
                      {t('profile.bio_limit', { count: profileData.bio.length })}
                    </Typography>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </motion.div>
        </Grid>

        {/* ── Right Side: Completion & Media ───────────────────── */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Completion Card */}
            <motion.div variants={item}>
              <Box className="glass-card" sx={{ p: 3, borderLeft: '4px solid var(--color-primary)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {t('profile.completion')}
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary-lt)' }}>
                    {completion}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completion}
                  className="progress-gradient"
                  sx={{ height: 8, borderRadius: 10, bgcolor: 'var(--color-surface-3)', mb: 3 }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: t('profile.completion_full_name'), done: !!profileData.fullName },
                    { label: t('profile.completion_bio'), done: !!profileData.bio },
                    { label: t('profile.completion_avatar'), done: !!profileData.avatarKey },
                  ].map(({ label, done }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 20, height: 20, borderRadius: '6px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: done ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : 'var(--color-border)'}`,
                          color: done ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}
                      >
                        {done ? '✓' : ''}
                      </Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: done ? 'var(--color-text)' : 'var(--color-text-sec)', fontWeight: done ? 600 : 400 }}>
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </motion.div>

            {/* Avatar Upload Card */}
            <motion.div variants={item}>
              <Box className="glass-panel" sx={{ p: 3 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', mb: 2 }}>
                  {t('profile.avatar_upload')}
                </Typography>
                <FileUpload
                  onUploadSuccess={(fileKey) => setProfileData(prev => ({ ...prev, avatarKey: fileKey }))}
                  accept="image/*"
                  label={t('profile.avatar_upload')}
                />
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', mt: 2, fontStyle: 'italic' }}>
                  {t('profile.avatar_hint')}
                </Typography>
              </Box>
            </motion.div>
          </Box>
        </Grid>
      </Grid>

      {/* ── Toast Messages ─────────────────────────────────────── */}
      <Box sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2000, width: '90%', maxWidth: 400 }}>
        {successMsg && (
          <Alert
            severity="success"
            sx={{ borderRadius: '12px', bgcolor: 'rgba(34,197,94,0.9)', backdropFilter: 'blur(10px)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}
            onClose={() => setSuccessMsg('')}
          >
            {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert
            severity="error"
            sx={{ borderRadius: '12px', bgcolor: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(10px)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}
            onClose={() => setErrorMsg('')}
          >
            {errorMsg}
          </Alert>
        )}
      </Box>
    </Box>
  )
}

export default Profile
