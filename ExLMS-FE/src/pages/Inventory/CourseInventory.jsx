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
<<<<<<< HEAD
import { alpha, useTheme } from '@mui/material/styles'
=======
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
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
<<<<<<< HEAD
  const theme = useTheme()
  const { t } = useTranslation()
=======
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
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
<<<<<<< HEAD
    <Box component={motion.div} variants={container} initial="hidden" animate="visible" sx={{ pb: 6 }}>
      
      {/* ── Page Header ─────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box sx={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
          mb: 6, mt: 2, flexWrap: 'wrap', gap: 3 
        }}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{
              position: 'absolute', top: -30, left: -30,
              width: 140, height: 140,
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
              zIndex: -1,
            }} />
            <Typography sx={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: { xs: '2.5rem', sm: '3rem' },
              color: 'var(--color-text)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              mb: 1.5,
            }}>
              Kho Khóa học
            </Typography>
            <Typography sx={{ fontSize: '1.0625rem', color: 'var(--color-text-muted)', fontWeight: 500, maxWidth: '600px' }}>
              Quản lý các bản mẫu khóa học toàn diện của bạn. Thiết kế nội dung một lần, triển khai tới nhiều nhóm học tập.
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/inventory/courses/create')} 
            sx={{ 
              height: 48, borderRadius: '14px', px: 4, fontWeight: 800,
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
              textTransform: 'none', fontSize: '1rem',
              '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)', boxShadow: '0 12px 28px rgba(79, 70, 229, 0.45)' }
            }}
          >
            Tạo khóa học mới
          </Button>
        </Box>
      </motion.div>

      {/* ── Search & Filter Toolbar ─────────────────────────────── */}
      <motion.div variants={item}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 3, mb: 5,
          p: '12px 12px 12px 24px',
          bgcolor: 'var(--color-surface-2)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--color-border)',
          borderRadius: '18px',
          flexWrap: 'wrap',
          boxShadow: `0 12px 40px rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.3 : 0.08})`,
        }}>
          <Box sx={{ 
            display: 'flex', alignItems: 'center', gap: 2, 
            px: 2, height: 44, flex: 1, minWidth: '280px',
            borderRadius: '12px',
            bgcolor: alpha(theme.palette.background.paper, 0.4),
            border: '1px solid var(--color-border)',
            '&:focus-within': { 
              borderColor: 'var(--color-primary)', 
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
            },
            transition: 'all 0.3s'
          }}>
            <SearchIcon sx={{ color: 'var(--color-text-muted)', fontSize: 20 }} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nội dung khóa học..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--color-text)', fontSize: '0.9375rem', fontWeight: 500,
                fontFamily: 'var(--font-body)',
              }}
            />
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ my: 1, borderColor: 'var(--color-border)', opacity: 0.5, display: { xs: 'none', md: 'block' } }} />
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Lọc theo thể loại">
              <IconButton sx={{ bgcolor: 'var(--color-surface-3)', borderRadius: '12px', color: 'var(--color-text-sec)', border: '1px solid var(--color-border)' }}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Chip 
              label={`${filteredCourses.length} Khóa học`}
              sx={{ 
                height: 36, px: 1, borderRadius: '10px', fontWeight: 800,
                bgcolor: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)'
              }}
            />
          </Stack>
=======
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
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
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
<<<<<<< HEAD
              <Skeleton variant="rounded" height={320} sx={{ borderRadius: '24px', bgcolor: 'var(--color-surface-3)' }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12, bgcolor: 'var(--color-surface-2)', borderRadius: '24px', border: '1px dashed var(--color-border)' }}>
          <InventoryIcon sx={{ fontSize: 80, mb: 2, color: 'var(--color-text-muted)', opacity: 0.3 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-text)', mb: 1 }}>Kho của bạn đang trống</Typography>
          <Typography sx={{ color: 'var(--color-text-muted)' }}>Bắt đầu bằng cách tạo khóa học mẫu đầu tiên của bạn.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3.5}>
          {filteredCourses.map((course, idx) => (
            <Grid item xs={12} sm={6} md={4} key={course.templateId}>
              <motion.div variants={item} style={{ height: '100%' }}>
                <Card sx={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  borderRadius: '24px', bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                  overflow: 'hidden', position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    boxShadow: `0 20px 48px rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.4 : 0.12})`,
                    '& .card-banner': { transform: 'scale(1.1)' }
                  }
                }}>
                  {/* Banner Area */}
                  <Box sx={{ height: 160, position: 'relative', overflow: 'hidden' }}>
                    <Box 
                      className="card-banner"
=======
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
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
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
<<<<<<< HEAD
                    />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-surface-2), transparent)' }} />
                    <Chip 
                      label="Template" 
                      size="small"
                      sx={{ 
                        position: 'absolute', top: 16, right: 16,
                        height: 22, fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase',
                        bgcolor: 'rgba(0,0,0,0.6)', color: '#FFF', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    />
                  </Box>

                  {/* Content Area */}
                  <CardContent sx={{ p: 3, flexGrow: 1, position: 'relative' }}>
                    <Box sx={{ 
                      width: 60, height: 60, borderRadius: '16px',
                      position: 'absolute', top: -30, left: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                      border: '4px solid var(--color-surface-2)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                      color: '#FFF'
                    }}>
                      <CourseIcon sx={{ fontSize: 28 }} />
                    </Box>

                    <Box sx={{ mt: 3.5 }}>
                      <Typography sx={{ 
                        fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', 
                        color: 'var(--color-text)', mb: 1, lineHeight: 1.3 
                      }} className="clamp-1">
                        {course.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, mb: 3, height: '4.8em' }} className="clamp-3">
                        {course.description || "Chưa có mô tả chi tiết cho bài giảng này. Vui lòng thêm mô tả để người học nắm rõ mục tiêu."}
                      </Typography>

                      <Divider sx={{ mb: 2.5, borderStyle: 'dashed', opacity: 0.3 }} />

                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button 
                          fullWidth 
                          variant="contained" 
                          onClick={() => navigate(`/inventory/courses/view/${course.templateId}`)}
                          sx={{ 
                            borderRadius: '12px', fontWeight: 800, height: 44,
                            background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.light,
                            '&:hover': { background: theme.palette.primary.main, color: '#FFF' }
                          }}
                        >
                          Chi tiết
                        </Button>
                        <Tooltip title="Sửa bản mẫu">
                          <IconButton 
                            onClick={(e) => { e.stopPropagation(); navigate(`/inventory/courses/edit/${course.templateId}`); }}
                            sx={{ borderRadius: '12px', bgcolor: 'var(--color-surface-3)', color: 'var(--color-text-sec)', border: '1px solid var(--color-border)' }}
=======
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
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
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
<<<<<<< HEAD
                            sx={{ borderRadius: '12px', bgcolor: alpha(theme.palette.error.main, 0.05), color: theme.palette.error.main, border: `1px solid ${alpha(theme.palette.error.main, 0.1)}` }}
=======
                            sx={{ 
                              borderRadius: '12px', 
                              color: 'var(--color-error)',
                              border: '1px solid transparent',
                              '&:hover': { background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }
                            }}
>>>>>>> 0309de622c986d494be08e87aad01e4be70651fa
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
