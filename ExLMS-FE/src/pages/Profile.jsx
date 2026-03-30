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
import api from '../services/api'
import { setUser } from '../store/authSlice'
import FileUpload from '../components/Common/FileUpload'
import { motion } from 'framer-motion'

// ── SVG Icons ─────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
)
const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

const container = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const FieldLabel = ({ children, icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
    {icon && <Box sx={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>{icon}</Box>}
    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-sec)' }}>
      {children}
    </Typography>
  </Box>
)

// Profile completion calculator
const calcCompletion = (data) => {
  let score = 0
  if (data.fullName) score += 34
  if (data.bio) score += 33
  if (data.avatarKey) score += 33
  return score
}

const Profile = () => {
  const { user }   = useSelector((state) => state.auth)
  const dispatch   = useDispatch()

  const [profileData, setProfileData] = useState({ fullName: '', bio: '', avatarKey: '' })
  const [loading,     setLoading]     = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [successMsg,  setSuccessMsg]  = useState('')
  const [errorMsg,    setErrorMsg]    = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/users/me')
        setProfileData({
          fullName:  res.data.fullName  || '',
          bio:       res.data.bio       || '',
          avatarKey: res.data.avatarKey || '',
        })
      } catch {}
      finally { setLoading(false) }
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
      setSuccessMsg('Profile updated successfully!')
      const userRes = await api.get('/users/me')
      dispatch(setUser(userRes.data))
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not save profile.')
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
      sx={{ maxWidth: 900, mx: 'auto', pb: 6 }}
    >

      {/* ── Page header ─────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box sx={{ mb: 4 }}>
          <Typography sx={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2rem' },
            color: 'var(--color-text)', letterSpacing: '-0.03em', mb: 0.5,
          }}>
            My Profile
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Manage your personal information and account settings
          </Typography>
        </Box>
      </motion.div>

      {/* ── Alerts ──────────────────────────────────────────────── */}
      {successMsg && (
        <motion.div variants={item}>
          <Alert
            severity="success"
            sx={{ mb: 2.5, borderRadius: '10px', bgcolor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#86EFAC', '& .MuiAlert-icon': { color: '#22C55E' } }}
            onClose={() => setSuccessMsg('')}
          >
            {successMsg}
          </Alert>
        </motion.div>
      )}
      {errorMsg && (
        <motion.div variants={item}>
          <Alert
            severity="error"
            sx={{ mb: 2.5, borderRadius: '10px', bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', '& .MuiAlert-icon': { color: '#EF4444' } }}
            onClose={() => setErrorMsg('')}
          >
            {errorMsg}
          </Alert>
        </motion.div>
      )}

      <Grid container spacing={3}>
        {/* ── Left: Avatar + Completion ────────────────────────── */}
        <Grid item xs={12} md={4}>
          <motion.div variants={item}>
            <Box
              sx={{
                bgcolor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '14px',
                p: 3,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                mb: 2.5,
              }}
            >
              {/* Avatar */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Avatar
                  src={avatarSrc}
                  sx={{
                    width: 100, height: 100,
                    fontSize: '2rem', fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                    color: 'white',
                    border: '3px solid var(--color-surface-2)',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                  }}
                >
                  {(profileData.fullName || user?.email || 'U')[0].toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 28, height: 28, borderRadius: '50%',
                    bgcolor: 'var(--color-primary)',
                    border: '2px solid var(--color-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                  }}
                >
                  <CameraIcon />
                </Box>
              </Box>

              <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', mb: 0.25, textAlign: 'center' }}>
                {profileData.fullName || 'Your Name'}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', mb: 0.5 }}>
                {user?.email}
              </Typography>
              {user?.role && (
                <Chip
                  label={user.role === 'ADMIN' ? 'Administrator' : user.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}
                  size="small"
                  sx={{
                    mt: 0.5, height: 20, fontSize: '0.625rem', fontWeight: 700,
                    bgcolor: user.role === 'ADMIN' ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
                    color: user.role === 'ADMIN' ? '#FCA5A5' : '#818CF8',
                    border: `1px solid ${user.role === 'ADMIN' ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)'}`,
                    '& .MuiChip-label': { px: '8px' },
                  }}
                />
              )}

              {/* Upload */}
              <Box sx={{ width: '100%', mt: 3 }}>
                <FileUpload
                  onUploadSuccess={(fileKey) => setProfileData(prev => ({ ...prev, avatarKey: fileKey }))}
                  accept="image/*"
                  label="Upload New Avatar"
                />
              </Box>
              <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', mt: 1, textAlign: 'center' }}>
                JPG, PNG or GIF · Max 1MB
              </Typography>
            </Box>
          </motion.div>

          {/* Profile completion */}
          <motion.div variants={item}>
            <Box
              sx={{
                bgcolor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '14px',
                p: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  Profile Completion
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#818CF8' }}>
                  {completion}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completion}
                className="progress-gradient"
                sx={{ height: 6, borderRadius: 99, bgcolor: 'rgba(33,38,45,0.8)', mb: 2 }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'Full name added', done: !!profileData.fullName },
                  { label: 'Bio written',     done: !!profileData.bio },
                  { label: 'Avatar uploaded', done: !!profileData.avatarKey },
                ].map(({ label, done }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        bgcolor: done ? 'rgba(34,197,94,0.15)' : 'rgba(33,38,45,0.8)',
                        border: `1px solid ${done ? 'rgba(34,197,94,0.4)' : 'var(--color-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: done ? '#22C55E' : 'var(--color-text-muted)',
                        fontSize: '0.625rem', fontWeight: 800,
                      }}
                    >
                      {done ? '✓' : ''}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: done ? 'var(--color-text-sec)' : 'var(--color-text-muted)' }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </motion.div>
        </Grid>

        {/* ── Right: Form ─────────────────────────────────────────── */}
        <Grid item xs={12} md={8}>
          <motion.div variants={item}>
            <Box
              component="form"
              onSubmit={handleSave}
              sx={{
                bgcolor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '14px',
                p: 3,
              }}
            >
              <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', mb: 3 }}>
                Personal Information
              </Typography>

              {/* Full Name */}
              <Box sx={{ mb: 2.5 }}>
                <FieldLabel icon={<UserIcon />}>Full Name</FieldLabel>
                <TextField
                  fullWidth
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(33,38,45,0.6)', borderRadius: '10px' } }}
                />
              </Box>

              {/* Email (read-only) */}
              <Box sx={{ mb: 2.5 }}>
                <FieldLabel icon={<MailIcon />}>Email Address</FieldLabel>
                <TextField
                  fullWidth
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed"
                  FormHelperTextProps={{ sx: { color: 'var(--color-text-muted)', fontSize: '0.75rem', mt: 0.5 } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(22,27,34,0.5)', borderRadius: '10px',
                      '&.Mui-disabled': { opacity: 0.6 },
                    },
                  }}
                />
              </Box>

              {/* Bio */}
              <Box sx={{ mb: 3.5 }}>
                <FieldLabel icon={<FileTextIcon />}>Bio / Introduction</FieldLabel>
                <TextField
                  fullWidth
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Tell others a bit about yourself, your interests, and what you're learning…"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(33,38,45,0.6)', borderRadius: '10px' } }}
                />
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', mt: 0.75, textAlign: 'right' }}>
                  {profileData.bio.length} / 300 characters
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'var(--color-border)', mb: 3 }} />

              {/* Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button
                  type="button"
                  variant="outlined"
                  sx={{
                    height: 40, borderRadius: '9px', px: 3, fontSize: '0.875rem',
                    borderColor: 'var(--color-border)', color: 'var(--color-text-sec)', cursor: 'pointer',
                    '&:hover': { borderColor: 'var(--color-border-lt)', bgcolor: 'rgba(240,246,252,0.04)' },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? null : <SaveIcon />}
                  sx={{
                    height: 40, borderRadius: '9px', px: 3, fontSize: '0.875rem', fontWeight: 600,
                    background: 'linear-gradient(135deg, #6366F1, #4F46E5)', cursor: 'pointer',
                    '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)', transform: 'translateY(-1px)' },
                    '&.Mui-disabled': { background: 'rgba(99,102,241,0.25)', color: 'rgba(255,255,255,0.3)' },
                    transition: 'all 0.2s',
                  }}
                >
                  {saving ? <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.6)' }} /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Profile
