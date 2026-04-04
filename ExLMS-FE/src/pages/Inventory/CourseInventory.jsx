import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Chip,
  Fab
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as CourseIcon,
  Inventory2 as InventoryIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import courseService from '../../services/courseService'

const CourseInventory = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const data = await courseService.getInventory()
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header section with glassmorphism */}
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
            <InventoryIcon sx={{ fontSize: 48, color: '#6366F1' }} />
            Kho Khóa học
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text-sec)', mt: 1 }}>
            Quản lý các bản mẫu khóa học toàn diện của bạn trước khi đưa vào giảng dạy.
          </Typography>
        </Box>
        <Fab 
          variant="extended" 
          color="primary" 
          onClick={() => navigate('/inventory/courses/create')} 
          sx={{ 
            px: 4, 
            fontWeight: 800, 
            borderRadius: '16px',
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Tạo khóa học mới
        </Fab>
      </Box>

      {/* Course Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={240} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={4}>
          <AnimatePresence>
            {courses.length > 0 ? (
              courses.map((course, idx) => (
                <Grid item xs={12} sm={6} md={4} key={course.templateId}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '24px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 'var(--glass-shadow)',
                          borderColor: 'var(--color-primary)',
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={course.thumbnailUrl || '/DefaultCourseImg.png'}
                        alt={course.title}
                      />
                      
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Chip 
                            icon={<CourseIcon sx={{ fontSize: '1rem !important' }} />}
                            label="Template" 
                            size="small"
                            sx={{ 
                              background: 'rgba(99, 102, 241, 0.1)', 
                              color: 'var(--color-primary)', 
                              fontWeight: 700,
                              borderRadius: '8px'
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.3, color: 'var(--color-text)' }}>
                          {course.title}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ 
                          color: 'var(--color-text-sec)', 
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '40px',
                          mb: 3
                        }}>
                          {course.description || "Chưa có mô tả chi tiết cho khóa học này."}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Button 
                            variant="contained" 
                            onClick={() => navigate(`/inventory/courses/view/${course.templateId}`)}
                            sx={{ 
                              flex: 2,
                              borderRadius: '12px', 
                              background: 'rgba(99, 102, 241, 0.08)', 
                              color: 'var(--color-primary)',
                              fontWeight: 800,
                              textTransform: 'none',
                              '&:hover': { background: 'rgba(99, 102, 241, 0.15)' }
                            }}
                          >
                            Xem chi tiết
                          </Button>
                          <Button 
                            variant="outlined" 
                            onClick={() => navigate(`/inventory/courses/edit/${course.templateId}`)}
                            sx={{ 
                              flex: 1,
                              borderRadius: '12px', 
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-text-sec)',
                              fontWeight: 700,
                              textTransform: 'none',
                              '&:hover': { background: 'rgba(0,0,0,0.02)', borderColor: 'var(--color-text-muted)' }
                            }}
                          >
                            Sửa
                          </Button>
                          <IconButton 
                            onClick={async () => {
                              if (window.confirm('Xóa bản mẫu khóa học này?')) {
                                await courseService.deleteTemplate(course.templateId)
                                fetchInventory()
                              }
                            }}
                            sx={{ 
                              borderRadius: '12px', 
                              color: 'var(--color-error)',
                              border: '1px solid transparent',
                              '&:hover': { background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }
                            }}
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
                <InventoryIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h5">Kho của bạn đang trống.</Typography>
                <Typography>Hãy bắt đầu bằng cách tạo khóa học đầu tiên!</Typography>
              </Box>
            )}
          </AnimatePresence>
        </Grid>
      )}
    </Box>
  )
}

export default CourseInventory
