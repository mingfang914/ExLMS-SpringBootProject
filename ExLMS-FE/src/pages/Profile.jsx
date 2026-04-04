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
  Stack,
  IconButton,
  Tooltip
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { setUser } from '../store/authSlice'
import FileUpload from '../components/Common/FileUpload'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Badge as BadgeIcon,
  EmojiEvents as TrophyIcon,
  Timeline as StatsIcon,
  School as CourseIcon,
  AssignmentTurnedIn as TaskIcon,
  CameraAlt as CameraIcon,
  Save as SaveIcon,
  Email as MailIcon,
  Person as UserIcon,
  Description as BioIcon,
  Verified as VerifiedIcon,
  LocalFireDepartment as StreakIcon
} from '@mui/icons-material'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

const StatCard = ({ icon, label, value, color }) => (
  <Box sx={{
    p: 2.5, borderRadius: '20px',
    bgcolor: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    display: 'flex', alignItems: 'center', gap: 2.5,
    minWidth: '200px', flex: 1,
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      borderColor: alpha(color, 0.4),
      boxShadow: `0 12px 24px ${alpha(color, 0.15)}`
    }
  }}>
    <Box sx={{ 
      width: 48, height: 48, borderRadius: '14px', 
      bgcolor: alpha(color, 0.1), color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--color-text)' }}>
        {value}
      </Typography>
    </Box>
  </Box>
)

const Profile = () => {
  const { t } = useTranslation()
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [profileData, setProfileData] = useState({ fullName: '', bio: '', avatarKey: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/users/me')
        setProfileData({
          fullName: res.data.fullName || '',
          bio: res.data.bio || '',
          avatarKey: res.data.avatarKey || '',
        })
      } catch (err) {
        console.error('Failed to load profile:', err)
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

  const completion = (() => {
    let score = 0
    if (profileData.fullName) score += 34
    if (profileData.bio) score += 33
    if (profileData.avatarKey) score += 33
    return score
  })()

  const avatarSrc = profileData.avatarKey
    ? `/api/files/download/${profileData.avatarKey}`
    : user?.avatarUrl || undefined

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress thickness={4} size={50} sx={{ color: '#6366F1' }} />
      </Box>
    )
  }

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="visible" sx={{ maxWidth: 1000, mx: 'auto', pb: 8 }}>
      
      {/* ── Cinematic Hero Section ─────────────────────────────── */}
      <motion.div variants={item}>
        <Box sx={{ 
          position: 'relative', mb: 10, borderRadius: '40px', overflow: 'hidden',
          bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
        }}>
          {/* Banner Background */}
          <Box sx={{ 
            height: 220, 
            background: 'linear-gradient(135deg, #4338CA 0%, #1E1B4B 100%)',
            position: 'relative'
          }}>
            <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, #FFF 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, var(--color-surface-2), transparent)' }} />
          </Box>

          <Box sx={{ px: { xs: 4, md: 6 }, pb: 6, mt: -8, position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-end' }}>
            {/* Avatar & Upload */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 160, height: 160, borderRadius: '44px',
                  bgcolor: '#6366F1', border: '8px solid var(--color-surface-2)',
                  boxShadow: '0 20px 48px rgba(0,0,0,0.4)',
                  fontSize: '4rem', fontWeight: 900
                }}
              >
                {initials(profileData.fullName || user?.email || 'U')}
              </Avatar>
              <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                <Tooltip title={t('profile.avatar_upload')}>
                  <IconButton sx={{ 
                    bgcolor: '#6366F1', color: '#FFF', 
                    boxShadow: '0 8px 16px rgba(99,102,241,0.4)',
                    border: '3px solid var(--color-surface-2)',
                    '&:hover': { bgcolor: '#4F46E5' }
                  }}>
                    <CameraIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Profile Info Summary */}
            <Box sx={{ flex: 1, pb: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ 
                  fontFamily: 'var(--font-heading)', fontWeight: 900, 
                  fontSize: { xs: '2rem', md: '2.5rem' }, color: 'var(--color-text)',
                  letterSpacing: '-0.04em'
                }}>
                  {profileData.fullName || t('profile.full_name')}
                </Typography>
                <VerifiedIcon sx={{ color: '#34D399', fontSize: 28 }} />
              </Stack>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label={user?.role || 'STUDENT'} 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha('#6366F1', 0.1), color: '#818CF8', 
                    fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6875rem' 
                  }} 
                />
                <Typography sx={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {user?.email}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {/* ── Left Column: Form ──────────────────────────────────────── */}
        <Grid item xs={12} md={7}>
          <motion.div variants={item}>
            <Box sx={{ 
              p: 4, borderRadius: '24px', bgcolor: 'var(--color-surface)', 
              border: '1px solid var(--color-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)', mb: 4 }}>
                {t('profile.personal_info')}
              </Typography>

              <form onSubmit={handleSave}>
                <Stack spacing={3.5}>
                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-sec)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UserIcon fontSize="small" sx={{ color: 'var(--color-text-muted)' }} />
                      {t('profile.full_name')}
                    </Typography>
                    <TextField
                      fullWidth
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleChange}
                      placeholder={t('profile.full_name_placeholder')}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-sec)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MailIcon fontSize="small" sx={{ color: 'var(--color-text-muted)' }} />
                      {t('profile.email')}
                    </Typography>
                    <TextField
                      fullWidth
                      value={user?.email || ''}
                      disabled
                      sx={{ '& .Mui-disabled': { WebkitTextFillColor: alpha('#FFF', 0.4) } }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-sec)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BioIcon fontSize="small" sx={{ color: 'var(--color-text-muted)' }} />
                      {t('profile.bio')}
                    </Typography>
                    <TextField
                      fullWidth
                      name="bio"
                      multiline
                      rows={4}
                      value={profileData.bio}
                      onChange={handleChange}
                      placeholder={t('profile.bio_placeholder')}
                    />
                  </Box>

                  {/* Hidden Upload Component Integration */}
                  <Box sx={{ display: 'none' }}>
                    <FileUpload
                      onUploadSuccess={(fileKey) => setProfileData(prev => ({ ...prev, avatarKey: fileKey }))}
                      accept="image/*"
                      label={t('profile.avatar_upload')}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                    <AnimatePresence>
                      {successMsg && (
                        <Typography sx={{ color: '#34D399', fontSize: '0.875rem', fontWeight: 700, mr: 'auto', alignSelf: 'center' }}>
                          ✓ {successMsg}
                        </Typography>
                      )}
                    </AnimatePresence>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} 
                      disabled={saving}
                      sx={{ 
                        borderRadius: '12px', height: 44, px: 4, fontWeight: 800,
                        background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                        '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)' }
                      }}
                    >
                      {saving ? t('common.saving') : t('common.save_changes')}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Box>
          </motion.div>
        </Grid>

        {/* ── Right Column: Stats & Completion ───────────────────── */}
        <Grid item xs={12} md={5}>
          <Stack spacing={4}>
            {/* Completion Progress */}
            <motion.div variants={item}>
              <Box sx={{ 
                p: 3.5, borderRadius: '24px', bgcolor: 'var(--color-surface-2)', 
                border: '1px solid var(--color-border)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    {t('profile.completion')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 900, color: '#818CF8' }}>
                    {completion}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={completion} 
                  sx={{ 
                    height: 10, borderRadius: '5px', bgcolor: 'rgba(255,255,255,0.05)',
                    '& .MuiLinearProgress-bar': { borderRadius: '5px', background: 'linear-gradient(90deg, #6366F1, #22D3EE)' }
                  }} 
                />
                <Stack spacing={1} sx={{ mt: 3 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: alpha('#FFF', 0.5), fontWeight: 500 }}>
                    {completion < 100 ? "Hoàn thiện hồ sơ để nhận huy hiệu Trusted Member." : "Tuyệt vời! Hồ sơ của bạn đã được tối ưu hóa."}
                  </Typography>
                </Stack>
              </Box>
            </motion.div>

            {/* Achievement Mini Dashboard */}
            <motion.div variants={item}>
              <Box sx={{ 
                p: 3.5, borderRadius: '24px', bgcolor: 'var(--color-surface)', 
                border: '1px solid var(--color-border)'
              }}>
                <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-text)', mb: 3 }}>
                  Hoạt động & Thành tựu
                </Typography>
                <Stack spacing={2}>
                  <StatCard icon={<CourseIcon />} label="Khóa học" value="12" color="#6366F1" />
                  <StatCard icon={<TaskIcon />} label="Nhiệm vụ" value="48" color="#10B981" />
                  <StatCard icon={<StreakIcon />} label="Ngày liên tục" value="7" color="#F59E0B" />
                </Stack>
              </Box>
            </motion.div>

            {/* Reward Badges Preview */}
            <motion.div variants={item}>
              <Box sx={{ 
                p: 3.5, borderRadius: '24px', bgcolor: alpha('#4338CA', 0.05), 
                border: '1px dashed alpha(#6366F1, 0.3)', textAlign: 'center'
              }}>
                <TrophyIcon sx={{ fontSize: 40, color: '#F59E0B', mb: 1 }} />
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  Trung tâm Phần thưởng
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', mt: 0.5 }}>
                  Khám phá các thử thách để nhận huy hiệu mới.
                </Typography>
                <Button variant="text" sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700, color: '#818CF8' }}>
                  Xem tất cả badges
                </Button>
              </Box>
            </motion.div>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

const initials = (name = '') =>
  name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U'

export default Profile
