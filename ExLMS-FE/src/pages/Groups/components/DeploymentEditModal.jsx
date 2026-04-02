import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Divider,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material'
import {
  Settings as SettingsIcon,
} from '@mui/icons-material'
import courseService from '../../../services/courseService'
import assignmentService from '../../../services/assignmentService'
import * as quizService from '../../../services/quizService'

const DeploymentEditModal = ({ open, onClose, type, resource, onUpdateSuccess }) => {
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && resource) {
      if (type === 'course') {
        setConfig({
          startDate: resource.startDate ? resource.startDate.slice(0, 10) : '',
          endDate: resource.endDate ? resource.endDate.slice(0, 10) : '',
          status: resource.status || 'PUBLISHED'
        })
      } else if (type === 'assignment') {
        setConfig({
          assignedAt: resource.assignedAt ? resource.assignedAt.slice(0, 16) : '',
          dueAt: resource.dueAt ? resource.dueAt.slice(0, 16) : '',
          allowLate: resource.allowLate || false,
          latePenaltyPercent: resource.latePenaltyPercent || 0,
          status: resource.status || 'PUBLISHED'
        })
      } else if (type === 'quiz') {
        setConfig({
          openAt: resource.openAt ? resource.openAt.slice(0, 16) : '',
          closeAt: resource.closeAt ? resource.closeAt.slice(0, 16) : '',
          shuffleQuestions: resource.shuffleQuestions || false,
          resultVisibility: resource.resultVisibility || 'IMMEDIATE',
          status: resource.status || 'PUBLISHED'
        })
      }
    }
  }, [open, resource, type])


  const handleUpdate = async () => {
    setLoading(true)
    try {
      if (type === 'course') {
        await courseService.updateCourse(resource.groupId, resource.id, config)
      } else if (type === 'assignment') {
        await assignmentService.updateAssignment(resource.id, config)
      } else if (type === 'quiz') {
        await quizService.updateQuiz(resource.id, config)
      }
      onUpdateSuccess()
      onClose()
    } catch (err) {
      console.error('Update failed:', err)
      alert(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (!resource) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 800 }}>
        <SettingsIcon color="primary" />
        Thiết đặt {type === 'course' ? 'Khóa học' : type === 'assignment' ? 'Bài tập' : 'Trắc nghiệm'}
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Tên học liệu: <strong>{resource.title}</strong>
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {type === 'assignment' && (
            <>
              <TextField 
                label="Ngày giao bài" type="datetime-local" fullWidth 
                InputLabelProps={{ shrink: true }}
                value={config.assignedAt}
                onChange={(e) => setConfig({...config, assignedAt: e.target.value})}
              />
              <TextField 
                label="Hạn nộp bài" type="datetime-local" fullWidth 
                InputLabelProps={{ shrink: true }}
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
                value={config.openAt}
                onChange={(e) => setConfig({...config, openAt: e.target.value})}
              />
              <TextField 
                label="Thời gian đóng đề" type="datetime-local" fullWidth 
                InputLabelProps={{ shrink: true }}
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
                label="Ngày bắt đầu" type="date" fullWidth 
                InputLabelProps={{ shrink: true }}
                value={config.startDate}
                onChange={(e) => setConfig({...config, startDate: e.target.value})}
              />
              <TextField 
                label="Ngày kết thúc" type="date" fullWidth 
                InputLabelProps={{ shrink: true }}
                value={config.endDate}
                onChange={(e) => setConfig({...config, endDate: e.target.value})}
              />
            </>
          )}

          <Divider sx={{ my: 1 }} />
          
          <FormControl fullWidth size="small">
            <InputLabel>Trạng thái hiển thị</InputLabel>
            <Select
              value={config.status}
              label="Trạng thái hiển thị"
              onChange={(e) => setConfig({...config, status: e.target.value})}
            >
              {(type === 'course' || type === 'assignment' || type === 'quiz') && (
                <MenuItem value="DRAFT">Bản nháp (Chỉ giảng viên thấy)</MenuItem>
              )}
              <MenuItem value="PUBLISHED">Công khai (Học sinh thấy & làm bài)</MenuItem>
              {(type === 'course' || type === 'assignment' || type === 'quiz') && (
                <MenuItem value="CLOSED">Đã đóng (Học sinh thấy nhưng không làm bài)</MenuItem>
              )}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 1, display: 'block' }}>
              * Chỉ trạng thái Công khai (PUBLISHED) học sinh mới có thể tương tác.
            </Typography>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>Hủy</Button>
        <Button 
          variant="contained" 
          disabled={loading}
          onClick={handleUpdate}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
          sx={{ 
            borderRadius: '12px', px: 4, fontWeight: 800,
            background: 'linear-gradient(135deg, #10B981, #059669)'
          }}
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeploymentEditModal
