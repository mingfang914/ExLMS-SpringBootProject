import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Chip,
  Fab,
  Avatar,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  FolderOpen as FolderIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import assignmentService from '../../services/assignmentService'
import { useModal } from '../../context/ModalContext'
import { useTranslation } from 'react-i18next'

const AssignmentInventory = () => {
  const { t } = useTranslation()
  const { showSuccess, showError, showConfirm } = useModal()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const data = await assignmentService.getInventory()
      setAssignments(data)
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ 
            fontWeight: 900, 
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <AssignmentIcon sx={{ fontSize: 48, color: '#FCD34D' }} />
            Kho Bài tập
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text-sec)', mt: 1 }}>
            Xây dựng và quản lý các bài tập tiêu chuẩn trước khi giao cho sinh viên.
          </Typography>
        </Box>
        <Fab 
          variant="extended" 
          onClick={() => navigate('/inventory/assignments/create')}
          sx={{ 
            px: 4, 
            fontWeight: 800, 
            borderRadius: '16px',
            textTransform: 'none',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
            color: '#000',
            boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
            '&:hover': { background: '#F59E0B' }
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Tạo bài tập mẫu
        </Fab>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {assignments.length > 0 ? (
              assignments.map((assignment, idx) => (
                <Grid item xs={12} sm={6} md={4} key={assignment.templateId}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      sx={{
                        borderRadius: '24px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': {
                          transform: 'scale(1.03)',
                          borderColor: '#FCD34D',
                          boxShadow: 'var(--glass-shadow)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar sx={{ background: 'rgba(252, 211, 77, 0.1)', color: '#FCD34D', mr: 2 }}>
                            <DescriptionIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-text)' }}>
                              {assignment.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-text-sec)' }}>
                              Loại nộp bài: {assignment.submissionType}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body2" sx={{ 
                          mb: 3, 
                          color: 'var(--color-text-sec)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 40
                        }}>
                          {assignment.description || "Chưa có nội dung mô tả chi tiết."}
                        </Typography>

                        <Divider sx={{ mb: 3, borderColor: 'var(--color-border)' }} />

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="var(--color-text-sec)">Điểm tối đa</Typography>
                            <Typography variant="body2" fontWeight={700} color="var(--color-text)">{assignment.maxScore} pts</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="var(--color-text-sec)">File max</Typography>
                            <Typography variant="body2" fontWeight={700} color="var(--color-text)">{assignment.maxFileSizeMb} MB</Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            size="large"
                            onClick={() => navigate(`/inventory/assignments/view/${assignment.templateId}`)}
                            sx={{ 
                              flex: 1,
                              borderRadius: '12px', 
                              fontWeight: 700, 
                              background: 'rgba(252, 211, 77, 0.1)', 
                              color: '#FCD34D',
                              border: '1px solid rgba(252, 211, 77, 0.2)',
                              '&:hover': { background: 'rgba(252, 211, 77, 0.2)' }
                            }}
                          >
                            Xem
                          </Button>
                          <Button 
                            variant="contained" 
                            size="large"
                            onClick={() => navigate(`/inventory/assignments/edit/${assignment.templateId}`)}
                            sx={{ 
                              flex: 1,
                              borderRadius: '12px', 
                              fontWeight: 700, 
                              background: 'rgba(255,255,255,0.05)', 
                              color: '#FFF',
                              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
                            }}
                          >
                            Thiết lập
                          </Button>
                          <IconButton 
                             onClick={async () => {
                               const confirmed = await showConfirm(
                                 t('common.confirm_delete'),
                                 'Xóa bản mẫu bài tập này?',
                                 'error'
                               );
                               if (confirmed) {
                                  try {
                                    await assignmentService.deleteTemplate(assignment.templateId)
                                    await showSuccess(t('common.success'), 'Xóa bản mẫu thành công!')
                                    fetchInventory()
                                  } catch (err) {
                                    await showError(t('common.error'), 'Không thể xóa bản mẫu')
                                  }
                               }
                             }}
                             sx={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#EF4444' }}
                           >
                             <DeleteIcon />
                           </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))
            ) : (
              <Box sx={{ width: '100%', textAlign: 'center', py: 10, opacity: 0.5 }}>
                <FolderIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h5">Thư viện bài tập trống.</Typography>
                <Typography>Khám phá tiềm năng thiết kế học liệu của bạn.</Typography>
              </Box>
            )}
          </AnimatePresence>
        </Grid>
      )}
    </Box>
  )
}

export default AssignmentInventory
