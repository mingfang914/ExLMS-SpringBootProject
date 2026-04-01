import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import courseService from '../../services/courseService'
import FileUpload from '../../components/Common/FileUpload'

const CreateCourse = () => {
  const { t } = useTranslation()
  const { groupId } = useParams()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'DRAFT',
    thumbnailKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()

  const handleUploadSuccess = (fileKey) => {
    setFormData(prev => ({ ...prev, thumbnailKey: fileKey }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (groupId) {
        await courseService.createCourse(groupId, formData)
        navigate(`/groups/${groupId}`)
      } else {
        await courseService.createTemplate(formData)
        navigate('/inventory/courses')
      }
    } catch (err) {
      setError(err.response?.data?.message || t('course_editor.errors.save_course_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (groupId) {
      navigate(`/groups/${groupId}`)
    } else {
      navigate('/inventory/courses')
    }
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4, borderRadius: 3, bgcolor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          {t('course_editor.title_new')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'var(--color-text-muted)' }}>
          {t('course_editor.create_subtitle')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label={t('course_editor.course_name_label')}
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('course_editor.course_name_placeholder')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={t('course_editor.course_desc_label')}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('course_editor.course_desc_placeholder')}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>{t('course_editor.thumbnail_label')}</Typography>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                accept="image/*"
                label={t('course_editor.select_thumbnail')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label={t('course_editor.status_label')}
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="DRAFT">📝 {t('course_editor.status_draft_hint')}</MenuItem>
                <MenuItem value="PUBLISHED">🌐 {t('course_editor.status_published_hint')}</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate(`/groups/${groupId}`)} sx={{ borderRadius: '10px', px: 3 }}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
              sx={{ 
                borderRadius: '10px', px: 4, fontWeight: 700,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)' }
              }}
            >
              {loading ? t('course_editor.creating') : t('common.create')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default CreateCourse
