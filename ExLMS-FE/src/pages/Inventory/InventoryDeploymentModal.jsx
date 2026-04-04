import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Divider
} from '@mui/material'
import {
  Inventory2 as InventoryIcon,
  DateRange as DateIcon,
  School as CourseIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Visibility as VisibilityIcon,
  Shuffle as ShuffleIcon
} from '@mui/icons-material'
import { 
  FormControl, InputLabel, Select, MenuItem, 
  FormControlLabel, Switch 
} from '@mui/material'
import courseService from '../../services/courseService'
import assignmentService from '../../services/assignmentService'
import * as quizService from '../../services/quizService'

const InventoryDeploymentModal = ({ open, onClose, type, groupId, onDeploySuccess }) => {
  const [items, setItems] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState(null)
  
  // Deployment config
  const [config, setConfig] = useState({
    assignedAt: new Date().toISOString().slice(0, 16),
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    openAt: new Date().toISOString().slice(0, 16),
    closeAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    shuffleQuestions: false,
    resultVisibility: 'IMMEDIATE',
    allowLate: false,
    latePenaltyPercent: 0,
  })

  useEffect(() => {
    if (open) {
      fetchInventory()
      setSelectedIds([])
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
    
    // Validation
    const now = new Date()
    let startVal, endVal
    if (type === 'course') { startVal = new Date(config.startDate); endVal = new Date(config.endDate); }
    else if (type === 'assignment') { startVal = new Date(config.assignedAt); endVal = new Date(config.dueAt); }
    else { startVal = new Date(config.openAt); endVal = new Date(config.closeAt); }

    if (startVal < new Date(now.getTime() - 60000)) {
       setError('Thời gian bắt đầu không được nhỏ hơn hiện tại.')
       return
    }
    if (endVal < startVal) {
       setError('Thời gian kết thúc không được nhỏ hơn bắt đầu.')
       return
    }

    setDeploying(true)
    setError(null)
    try {
      if (type === 'course') {
        await courseService.deployToGroup(groupId, selectedIds, config)
      } else if (type === 'assignment') {
        await assignmentService.deployToGroup(groupId, selectedIds, config)
      } else if (type === 'quiz') {
        await quizService.deployToGroup(groupId, selectedIds, config)
      }
      onDeploySuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Triển khai thất bại. Vui lòng thử lại.')
    } finally {
      setDeploying(false)
    }
  }

  const getIcon = () => {
    if (type === 'course') return <CourseIcon />
    if (type === 'assignment') return <AssignmentIcon />
    return <QuizIcon />
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
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Chọn học liệu ({selectedIds.length})</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                {items.length === 0 ? (
                  <ListItem><ListItemText secondary="Kho đang trống." /></ListItem>
                ) : (
                  items.map((item) => (
                    <ListItem key={item.templateId} disablePadding>
                      <ListItemButton onClick={() => handleToggle(item.templateId)}>
                        <ListItemIcon>
                          <Checkbox checked={selectedIds.includes(item.templateId)} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.title} 
                          secondary={item.description?.substring(0, 60) + '...'} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Thiết đặt thời gian giao</Typography>
            {(() => {
               const now = new Date();
               const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
               return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {type === 'assignment' && (
                <>
                  <TextField 
                    label="Ngày giao bài" type="datetime-local" fullWidth 
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: minDateTime }}
                    value={config.assignedAt}
                    onChange={(e) => setConfig({...config, assignedAt: e.target.value})}
                  />
                  <TextField 
                    label="Hạn nộp bài" type="datetime-local" fullWidth 
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: config.assignedAt || minDateTime }}
                    value={config.dueAt}
                    onChange={(e) => setConfig({...config, dueAt: e.target.value})}
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={config.allowLate} 
                        onChange={(e) => setConfig({...config, allowLate: e.target.checked})}
                      />
                    }
                    label={<Typography variant="body2">Cho phép nộp muộn</Typography>}
                  />
                  {config.allowLate && (
                    <TextField 
                      label="Trừ điểm nộp muộn (%)" type="number" fullWidth 
                      value={config.latePenaltyPercent}
                      onChange={(e) => setConfig({...config, latePenaltyPercent: parseInt(e.target.value) || 0})}
                      InputProps={{ endAdornment: '%' }}
                    />
                  )}
                </>
              )}
              {type === 'quiz' && (
                <>
                  <TextField 
                    label="Thời gian mở đề" type="datetime-local" fullWidth 
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: minDateTime }}
                    value={config.openAt}
                    onChange={(e) => setConfig({...config, openAt: e.target.value})}
                  />
                  <TextField 
                    label="Thời gian đóng đề" type="datetime-local" fullWidth 
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: config.openAt || minDateTime }}
                    value={config.closeAt}
                    onChange={(e) => setConfig({...config, closeAt: e.target.value})}
                  />
                  <Divider sx={{ my: 1 }} />
                  <FormControl fullWidth size="small">
                    <InputLabel>Hiển thị kết quả</InputLabel>
                    <Select
                      value={config.resultVisibility}
                      label="Hiển thị kết quả"
                      onChange={(e) => setConfig({...config, resultVisibility: e.target.value})}
                    >
                      <MenuItem value="IMMEDIATE">Sau khi làm bài</MenuItem>
                      <MenuItem value="AFTER_DEADLINE">Sau khi hết hạn</MenuItem>
                      <MenuItem value="OPENED">Mở thủ công</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={config.shuffleQuestions} 
                        onChange={(e) => setConfig({...config, shuffleQuestions: e.target.checked})}
                      />
                    }
                    label={<Typography variant="body2">Trộn câu hỏi</Typography>}
                  />
                </>
              )}
              {type === 'course' && (
                <>
                  <TextField 
                    label="Bắt đầu lúc" type="datetime-local" fullWidth 
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: minDateTime }}
                    value={config.startDate}
                    onChange={(e) => setConfig({...config, startDate: e.target.value})}
                  />
                  <TextField 
                    label="Kết thúc lúc" type="datetime-local" fullWidth 
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: config.startDate || minDateTime }}
                    value={config.endDate}
                    onChange={(e) => setConfig({...config, endDate: e.target.value})}
                  />
                </>
              )}
            </Box>
               );
            })()}
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
          sx={{ 
            borderRadius: '12px', px: 4, fontWeight: 800,
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
          }}
        >
          {deploying ? 'Đang kết nối...' : `Kết nối ${selectedIds.length} mục`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InventoryDeploymentModal
