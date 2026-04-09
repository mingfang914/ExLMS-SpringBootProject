import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import forumService from '../../services/forumService'
import CKEditorWrapper from '../../components/Common/CKEditorWrapper'

// ── Icons ──────────────────────────────────────────────────────────
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
)
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
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

const FieldLabel = ({ children, hint }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-sec)' }}>
      {children}
    </Typography>
    {hint && (
      <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        {hint}
      </Typography>
    )}
  </Box>
)

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'var(--color-surface-hover)',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    '&.Mui-focused': {
       bgcolor: 'var(--color-surface)',
    }
  },
}

const CreateForumPost = () => {
  const { t } = useTranslation()
  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags,     setTags]     = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = !!id

  useEffect(() => {
    if (!isEdit) return
    forumService.getPostById(id)
      .then(post => {
        setTitle(post.title)
        setContent(post.content)
        setTags(post.tags.map(t => t.name))
      })
      .catch(() => setError(t('forum.errors.load_post_failed')))
  }, [id, isEdit, t])

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim().replace(/,$/, '')
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags(prev => [...prev, val])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tag) => setTags(prev => prev.filter(t => t !== tag))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError(t('forum.errors.title_content_required'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = { title, content, tagNames: tags.join(', ') }
      if (isEdit) {
        await forumService.updatePost(id, data)
        navigate(`/forum/posts/${id}`)
      } else {
        await forumService.createPost(data)
        navigate('/forum')
      }
    } catch (err) {
      setError(err.response?.data?.message || t('forum.errors.save_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      component={motion.div}
      variants={container} initial="hidden" animate="visible"
      sx={{ maxWidth: 820, mx: 'auto', pb: 6 }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, cursor: 'pointer' }} onClick={() => navigate('/forum')}>
          <Box sx={{ color: 'var(--color-text-muted)' }}><ArrowLeft /></Box>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-text)' } }}>
            {t('forum.back_to_forum')}
          </Typography>
        </Box>
        <Box sx={{ mb: 4, mt: 1.5 }}>
          <Typography sx={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2rem' },
            color: 'var(--color-text)', letterSpacing: '-0.03em', mb: 0.5,
          }}>
            {isEdit ? t('forum.edit_post') : t('forum.new_discussion')}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {isEdit ? t('forum.edit_subtitle') : t('forum.create_subtitle')}
          </Typography>
        </Box>
      </motion.div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            severity="error"
            sx={{ 
              mb: 2.5, 
              borderRadius: '10px', 
              bgcolor: 'rgba(239,68,68,0.1)', 
              border: '1px solid rgba(239,68,68,0.25)', 
              color: 'var(--color-error)', 
              '& .MuiAlert-icon': { color: 'var(--color-error)' } 
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {/* ── Form ───────────────────────────────────────────────── */}
      <Box
        className="auth-card"
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 3, sm: 4 },
        }}
      >
        {/* Title */}
        <motion.div variants={item}>
          <Box sx={{ mb: 3 }}>
            <FieldLabel hint={`${title.length}/150`}>{t('forum.post_title_label')}</FieldLabel>
            <TextField
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('forum.post_title_placeholder')}
              inputProps={{ maxLength: 150 }}
              sx={inputSx}
              className="modern-input"
            />
          </Box>
        </motion.div>

        {/* Tags */}
        <motion.div variants={item}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Box sx={{ color: 'var(--color-text-muted)' }}><TagIcon /></Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-sec)' }}>
                {t('forum.tags_label')}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {t('forum.tags_hint')}
              </Typography>
            </Box>

            {/* Tag chips */}
            {tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    sx={{
                      height: 28, fontSize: '0.75rem', fontWeight: 600,
                      bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      '& .MuiChip-deleteIcon': { color: 'var(--color-primary)', '&:hover': { color: 'var(--color-error)' } },
                    }}
                  />
                ))}
              </Box>
            )}

            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 2, height: 48,
                borderRadius: '10px', border: '1px solid var(--color-border)',
                bgcolor: 'var(--color-surface-hover)',
                transition: 'all 0.2s',
                '&:focus-within': { 
                  borderColor: 'var(--color-primary)', 
                  bgcolor: 'var(--color-surface)',
                  boxShadow: '0 0 0 4px rgba(99,102,241,0.1)' 
                },
              }}
            >
              <Box sx={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><TagIcon /></Box>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length < 5 ? t('forum.tags_placeholder') : t('forum.tags_max_reached')}
                disabled={tags.length >= 5}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--color-text)', fontSize: '0.875rem', fontFamily: 'var(--font-body)',
                }}
              />
            </Box>
          </Box>
        </motion.div>

        {/* Content CKEditor */}
        <motion.div variants={item}>
          <Box sx={{ mb: 3.5 }}>
            <FieldLabel>{t('forum.post_content_label')}</FieldLabel>
            <Box
              sx={{
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                bgcolor: 'var(--color-surface)',
                '&:focus-within': { borderColor: 'var(--color-primary)' },
                transition: 'border-color 0.2s',
                // CKEditor overrides local
                '& .ck.ck-editor__main > .ck-editor__editable': {
                  minHeight: '320px',
                },
              }}
            >
              <CKEditorWrapper
                value={content}
                onChange={(data) => setContent(data)}
                placeholder={t('forum.post_content_placeholder')}
                minHeight="320px"
              />
            </Box>
          </Box>
        </motion.div>

        <Divider sx={{ borderColor: 'var(--color-border)', mb: 3 }} />

        {/* Actions */}
        <motion.div variants={item}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/forum')}
              disabled={loading}
              sx={{
                height: 44, borderRadius: '10px', px: 3, fontSize: '0.875rem', fontWeight: 600,
                borderColor: 'var(--color-border)', color: 'var(--color-text-sec)',
                cursor: 'pointer',
                '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', bgcolor: 'rgba(99,102,241,0.04)' },
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={!loading && (isEdit ? <SaveIcon /> : <SendIcon />)}
              sx={{
                height: 44, borderRadius: '10px', px: 3.5, fontSize: '0.875rem', fontWeight: 700,
                background: 'var(--color-primary)',
                cursor: 'pointer',
                '&:hover': { background: 'var(--color-primary-lt)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)', transform: 'translateY(-1px)' },
                '&.Mui-disabled': { background: 'rgba(99,102,241,0.25)', color: 'rgba(255,255,255,0.35)' },
                transition: 'all 0.2s',
              }}
            >
              {loading
                ? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.7)' }} />
                : isEdit ? t('common.save_changes') : t('forum.publish_post')}
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Box>
  )
}

export default CreateForumPost
