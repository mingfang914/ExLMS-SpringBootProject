import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Checkbox, TextField,
  Grid, CircularProgress, Alert, FormControl, InputLabel,
  Select, MenuItem, FormControlLabel, Switch
} from '@mui/material'
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
      setError('Không thể tải dữ liệu từ kho.')
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
      setError(err.response?.data?.message || 'Triển khai thất bại. Vui lòng thử lại.')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 800 }}>
        <InventoryIcon color="primary" />
        Kết nối {type === 'course' ? 'Khóa học' : type === 'assignment' ? 'Bài tập' : 'Trắc nghiệm'} từ Kho đồ
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={4}>
          {/* ── Danh sách học liệu ── */}
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Chọn học liệu ({selectedIds.length})
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {items.length === 0 ? (
                  <ListItem><ListItemText secondary="Kho đang trống." /></ListItem>
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
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Thiết đặt triển khai</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {/* Trạng thái chung */}
              <FormControl fullWidth>
                <InputLabel>Trạng thái hiển thị ban đầu</InputLabel>
                <Select
                  value={config.status}
                  label="Trạng thái hiển thị ban đầu"
                  onChange={(e) => setConfig({ ...config, status: e.target.value })}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="PUBLISHED">Công khai (Gửi thông báo)</MenuItem>
                  <MenuItem value="DRAFT">Bản nháp (Không thông báo)</MenuItem>
                </Select>
              </FormControl>

              {/* ─── Bài tập ─── */}
              {type === 'assignment' && (
                <>
                  <TextField
                    label="Ngày giao bài" type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: minNow }}
                    value={config.assignedAt}
                    onChange={(e) => setConfig({ ...config, assignedAt: e.target.value })}
                    helperText="Không thể chọn thời điểm đã qua"
                  />
                  <TextField
                    label="Hạn nộp bài" type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: config.assignedAt || minNow }}
                    value={config.dueAt}
                    onChange={(e) => setConfig({ ...config, dueAt: e.target.value })}
                    helperText="Phải sau ngày giao bài"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.allowLate}
                        onChange={(e) => setConfig({ ...config, allowLate: e.target.checked })}
                      />
                    }
                    label={<Typography variant="body2">Cho phép nộp muộn</Typography>}
                  />
                  {config.allowLate && (
                    <TextField
                      label="Trừ điểm nộp muộn (%)" type="number" fullWidth
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
                    label="Thời gian mở đề" type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: minNow }}
                    value={config.openAt}
                    onChange={(e) => setConfig({ ...config, openAt: e.target.value })}
                    helperText="Không thể chọn thời điểm đã qua"
                  />
                  <TextField
                    label="Thời gian đóng đề" type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: config.openAt || minNow }}
                    value={config.closeAt}
                    onChange={(e) => setConfig({ ...config, closeAt: e.target.value })}
                    helperText="Phải sau thời gian mở đề"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Hiển thị kết quả</InputLabel>
                    <Select
                      value={config.resultVisibility}
                      label="Hiển thị kết quả"
                      onChange={(e) => setConfig({ ...config, resultVisibility: e.target.value })}
                    >
                      <MenuItem value="OPEN">Công bố (Mọi người có thể xem chi tiết)</MenuItem>
                      <MenuItem value="CLOSE">Chưa công bố (Ẩn với thành viên)</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.shuffleQuestions}
                        onChange={(e) => setConfig({ ...config, shuffleQuestions: e.target.checked })}
                      />
                    }
                    label={<Typography variant="body2">Trộn câu hỏi</Typography>}
                  />
                </>
              )}

              {/* ─── Khóa học ─── */}
              {type === 'course' && (
                <>
                  <TextField
                    label="Bắt đầu lúc" type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: minNow }}
                    value={config.startDate}
                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                    helperText="Không thể chọn thời điểm đã qua"
                  />
                  <TextField
                    label="Kết thúc lúc" type="datetime-local" fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: config.startDate || minNow }}
                    value={config.endDate}
                    onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                    helperText="Phải sau thời gian bắt đầu"
                  />
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>Hủy</Button>
        <Button
          variant="contained"
          disabled={selectedIds.length === 0 || deploying}
          onClick={handleDeploy}
          startIcon={deploying ? <CircularProgress size={16} color="inherit" /> : <DateIcon />}
          sx={{ borderRadius: '12px', px: 4, fontWeight: 800, background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
        >
          {deploying ? 'Đang kết nối...' : `Kết nối ${selectedIds.length} mục`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InventoryDeploymentModal
