import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Checkbox, TextField,
  Grid, CircularProgress, Alert, FormControl, InputLabel,
  Select, MenuItem, FormControlLabel, Switch
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  Inventory2 as InventoryIcon,
  DateRange as DateIcon,
} from '@mui/icons-material'
import courseService from '../../services/courseService'
import assignmentService from '../../services/assignmentService'
import * as quizService from '../../services/quizService'

// Chuyển Date sang 'YYYY-MM-DDTHH:mm' theo múi giờ cục bộ, dùng cho input[type=datetime-local]
const toLocalISO = (date) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const makeDefaultConfig = () => {
  const now = new Date()
  return {
    assignedAt: toLocalISO(now),
    dueAt: toLocalISO(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
    openAt: toLocalISO(now),
    closeAt: toLocalISO(new Date(now.getTime() + 2 * 60 * 60 * 1000)),
    startDate: toLocalISO(now),
    endDate: toLocalISO(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
    shuffleQuestions: false,
    resultVisibility: 'CLOSE',
    allowLate: false,
    latePenaltyPercent: 0,
    status: 'PUBLISHED',
  }
}

const InventoryDeploymentModal = ({ open, onClose, type, groupId, onDeploySuccess }) => {
  const [items, setItems] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState(makeDefaultConfig())
  const { t } = useTranslation()

  // Giá trị min hiện tại (tính lại mỗi khi modal mở)
  const [minNow, setMinNow] = useState(toLocalISO(new Date()))

  useEffect(() => {
    if (open) {
      const freshConfig = makeDefaultConfig()
      setConfig(freshConfig)
      setMinNow(toLocalISO(new Date())) // cập nhật "now" khi mở
      setSelectedIds([])
      setError(null)
      fetchInventory()
    }
  }, [open, type])

  const fetchInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      let data = []
      if (type === 'course') data = await courseService.getInventory()
      else if (type === 'assignment') data = await assignmentService.getInventory()
      else if (type === 'quiz') data = await quizService.getInventory()
      setItems(data)
    } catch (err) {
      setError(t('inventory.error_fetch'))
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDeploy = async () => {
    if (selectedIds.length === 0) return
    setDeploying(true)
    setError(null)
    try {
      if (type === 'course') await courseService.deployToGroup(groupId, selectedIds, config)
      else if (type === 'assignment') await assignmentService.deployToGroup(groupId, selectedIds, config)
      else if (type === 'quiz') await quizService.deployToGroup(groupId, selectedIds, config)
      onDeploySuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || t('inventory.error_deploy'))
    } finally {
      setDeploying(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 800 }}>
        <InventoryIcon color="primary" />
        {t('inventory.title_connect', { type: type === 'course' ? t('group_detail.tabs.courses') : type === 'assignment' ? t('group_detail.tabs.assignments') : t('group_detail.tabs.quizzes') })}
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={4}>
          {/* ── Danh sách học liệu ── */}
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t('inventory.select_items', { count: selectedIds.length })}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto', bgcolor: 'var(--color-surface-3)', borderRadius: '12px', border: '1px solid var(--color-border)', opacity: 0.8 }}>
                {items.length === 0 ? (
                  <ListItem><ListItemText secondary={t('inventory.empty_inventory')} /></ListItem>
                ) : (
                  items.map((item) => (
                    <ListItem key={item.templateId} disablePadding divider>
                      <ListItemButton onClick={() => handleToggle(item.templateId)}>
                        <ListItemIcon>
                          <Checkbox checked={selectedIds.includes(item.templateId)} />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography fontWeight={600}>{item.title}</Typography>}
                          secondary={item.description?.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...'}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Grid>

          {/* ── Thiết đặt triển khai ── */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>{t('inventory.deploy_settings')}</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {/* Trạng thái chung */}
              <FormControl fullWidth>
                <InputLabel>{t('inventory.status_initial')}</InputLabel>
                <Select
                  value={config.status}
                  label={t('inventory.status_initial')}
                  onChange={(e) => setConfig({ ...config, status: e.target.value })}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="PUBLISHED">{t('inventory.status_published')}</MenuItem>
                  <MenuItem value="DRAFT">{t('inventory.status_draft')}</MenuItem>
                </Select>
              </FormControl>

              {/* ─── Bài tập ─── */}
              {type === 'assignment' && (
                <>
                  <TextField
                    label={t('inventory.assigned_at')} type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: minNow }}
                    value={config.assignedAt}
                    onChange={(e) => setConfig({ ...config, assignedAt: e.target.value })}
                    helperText={t('course_editor.start_date_label')}
                  />
                  <TextField
                    label={t('inventory.due_at')} type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: config.assignedAt || minNow }}
                    value={config.dueAt}
                    onChange={(e) => setConfig({ ...config, dueAt: e.target.value })}
                    helperText={t('course_editor.end_date_label')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.allowLate}
                        onChange={(e) => setConfig({ ...config, allowLate: e.target.checked })}
                      />
                    }
                    label={<Typography variant="body2">{t('inventory.allow_late')}</Typography>}
                  />
                  {config.allowLate && (
                    <TextField
                      label={t('inventory.late_penalty')} type="number" fullWidth
                      value={config.latePenaltyPercent}
                      inputProps={{ min: 0, max: 100 }}
                      onChange={(e) => setConfig({ ...config, latePenaltyPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                      InputProps={{ endAdornment: '%' }}
                    />
                  )}
                </>
              )}

              {/* ─── Bài kiểm tra ─── */}
              {type === 'quiz' && (
                <>
                   <TextField
                    label={t('inventory.open_at')} type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: minNow }}
                    value={config.openAt}
                    onChange={(e) => setConfig({ ...config, openAt: e.target.value })}
                    helperText={t('course_editor.start_date_label')}
                  />
                  <TextField
                    label={t('inventory.close_at')} type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: config.openAt || minNow }}
                    value={config.closeAt}
                    onChange={(e) => setConfig({ ...config, closeAt: e.target.value })}
                    helperText={t('course_editor.end_date_label')}
                  />
                   <FormControl fullWidth>
                    <InputLabel>{t('inventory.result_visibility')}</InputLabel>
                    <Select
                      value={config.resultVisibility}
                      label={t('inventory.result_visibility')}
                      onChange={(e) => setConfig({ ...config, resultVisibility: e.target.value })}
                    >
                      <MenuItem value="OPEN">{t('inventory.result_open')}</MenuItem>
                      <MenuItem value="CLOSE">{t('inventory.result_close')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.shuffleQuestions}
                        onChange={(e) => setConfig({ ...config, shuffleQuestions: e.target.checked })}
                      />
                    }
                     label={<Typography variant="body2">{t('inventory.shuffle_questions')}</Typography>}
                  />
                </>
              )}

              {/* ─── Khóa học ─── */}
              {type === 'course' && (
                <>
                   <TextField
                    label={t('inventory.start_at')} type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: minNow }}
                    value={config.startDate}
                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                    helperText={t('course_editor.start_date_label')}
                  />
                  <TextField
                    label={t('inventory.end_at')} type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: config.startDate || minNow }}
                    value={config.endDate}
                    onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                    helperText={t('course_editor.end_date_label')}
                  />
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

       <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          disabled={selectedIds.length === 0 || deploying}
          onClick={handleDeploy}
          startIcon={deploying ? <CircularProgress size={16} color="inherit" /> : <DateIcon />}
          sx={{ borderRadius: '12px', px: 4, fontWeight: 800, background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
        >
          {deploying ? t('inventory.connecting') : t('inventory.connect_btn', { count: selectedIds.length })}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InventoryDeploymentModal
