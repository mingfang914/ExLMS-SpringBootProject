import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import groupService from '../../services/groupService'
import FileUpload from '../../components/Common/FileUpload'

// ── Icons ──────────────────────────────────────────────────────────
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const PublicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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

const FieldLabel = ({ children, required }) => (
  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-sec)', mb: 0.75 }}>
    {children}
    {required && <span style={{ color: '#818CF8', marginLeft: 2 }}>*</span>}
  </Typography>
)

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(33,38,45,0.6)',
    borderRadius: '10px',
  },
}

const CreateGroup = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name:        '',
    description: '',
    visibility:  'PUBLIC',
    category:    '',
    coverKey:    '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const navigate = useNavigate()

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) { setError(t('groups.create.error_name_required')); return }
    setLoading(true)
    setError(null)
    try {
      await groupService.createGroup(formData)
      navigate('/groups')
    } catch (err) {
      setError(err.response?.data?.message || t('groups.create.error_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      component={motion.div}
      variants={container} initial="hidden" animate="visible"
      sx={{ maxWidth: 760, mx: 'auto', pb: 6 }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, cursor: 'pointer' }} onClick={() => navigate('/groups')}>
          <Box sx={{ color: 'var(--color-text-muted)' }}><ArrowLeft /></Box>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-text)' } }}>
            {t('groups.create.back')}
          </Typography>
        </Box>
        <Box sx={{ mb: 4, mt: 1.5 }}>
          <Typography sx={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2rem' },
            color: 'var(--color-text)', letterSpacing: '-0.03em', mb: 0.5,
          }}>
            {t('groups.create.title')}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {t('groups.create.subtitle')}
          </Typography>
        </Box>
      </motion.div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            severity="error"
            sx={{ mb: 2.5, borderRadius: '10px', bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', '& .MuiAlert-icon': { color: '#EF4444' } }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {/* ── Form ───────────────────────────────────────────────── */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          bgcolor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          p: { xs: 3, sm: 4 },
        }}
      >
        <Grid container spacing={3}>
          {/* Group name */}
          <Grid item xs={12}>
            <motion.div variants={item}>
              <FieldLabel required>{t('groups.create.name_label')}</FieldLabel>
              <TextField
                fullWidth name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('groups.create.name_placeholder')}
                sx={inputSx}
              />
            </motion.div>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <motion.div variants={item}>
              <FieldLabel>{t('groups.create.desc_label')}</FieldLabel>
              <TextField
                fullWidth name="description"
                value={formData.description}
                onChange={handleChange}
                multiline rows={4}
                placeholder={t('groups.create.desc_placeholder')}
                sx={inputSx}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', mt: 0.75, textAlign: 'right' }}>
                {formData.description.length} / 500
              </Typography>
            </motion.div>
          </Grid>

          {/* Visibility */}
          <Grid item xs={12}>
            <motion.div variants={item}>
              <FieldLabel>{t('groups.create.visibility_label')}</FieldLabel>
              <ToggleButtonGroup
                value={formData.visibility}
                exclusive
                onChange={(_, v) => v && setFormData(p => ({ ...p, visibility: v }))}
                fullWidth
                sx={{
                  gap: 1.5,
                  bgcolor: 'transparent',
                  '& .MuiToggleButtonGroup-grouped': {
                    border: '1px solid var(--color-border) !important',
                    borderRadius: '10px !important',
                    flex: 1, py: 1.5, px: 2,
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    justifyContent: 'flex-start',
                    gap: 1,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(99,102,241,0.1) !important',
                      borderColor: 'rgba(99,102,241,0.4) !important',
                      color: '#818CF8 !important',
                    },
                    '&:hover': { bgcolor: 'rgba(99,102,241,0.05)' },
                    transition: 'all 0.15s',
                  },
                }}
              >
                <ToggleButton value="PUBLIC" id="vis-public">
                  <PublicIcon />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>{t('groups.create.public_title')}</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', opacity: 0.7, lineHeight: 1.3 }}>{t('groups.create.public_desc')}</Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value="PRIVATE" id="vis-private">
                  <LockIcon />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>{t('groups.create.private_title')}</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', opacity: 0.7, lineHeight: 1.3 }}>{t('groups.create.private_desc')}</Typography>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </motion.div>
          </Grid>

          {/* Category */}
          <Grid item xs={12} sm={6}>
            <motion.div variants={item}>
              <FieldLabel>{t('groups.create.category_label')}</FieldLabel>
              <TextField
                select fullWidth name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder={t('groups.create.category_placeholder')}
                sx={inputSx}
              >
                {['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Language', 'Business', 'Arts', 'Other'].map(c => (
                  <MenuItem key={c} value={c} sx={{ fontSize: '0.875rem' }}>{c}</MenuItem>
                ))}
              </TextField>
            </motion.div>
          </Grid>

          {/* Cover image */}
          <Grid item xs={12} sm={6}>
            <motion.div variants={item}>
              <FieldLabel>{t('groups.create.cover_label')}</FieldLabel>
              <FileUpload
                onUploadSuccess={(fk) => setFormData(p => ({ ...p, coverKey: fk }))}
                accept="image/*"
                label={t('groups.create.upload_btn')}
              />
              {formData.coverKey && (
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-success)', mt: 0.75, fontWeight: 600 }}>
                  {t('groups.create.upload_success')}
                </Typography>
              )}
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'var(--color-border)', my: 3.5 }} />

        {/* Actions */}
        <motion.div variants={item}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/groups')}
              sx={{
                height: 42, borderRadius: '10px', px: 3, fontSize: '0.875rem',
                borderColor: 'var(--color-border)', color: 'var(--color-text-sec)',
                cursor: 'pointer',
                '&:hover': { borderColor: 'var(--color-border-lt)', bgcolor: 'rgba(240,246,252,0.04)' },
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={!loading && <PlusIcon />}
              sx={{
                height: 42, borderRadius: '10px', px: 3.5, fontSize: '0.875rem', fontWeight: 600,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                cursor: 'pointer',
                '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)', boxShadow: '0 6px 18px rgba(99,102,241,0.4)', transform: 'translateY(-1px)' },
                '&.Mui-disabled': { background: 'rgba(99,102,241,0.25)', color: 'rgba(255,255,255,0.35)' },
                transition: 'all 0.2s',
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.7)' }} /> : t('groups.create_group')}
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Box>
  )
}

export default CreateGroup
