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
  HelpOutline as QuizIcon,
  Timer as TimeIcon,
  EmojiEvents as GradeIcon,
  Layers as LayersIcon,
  Delete as DeleteIcon,
  ContentPaste as ListIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import * as quizService from '../../services/quizService'

const QuizInventory = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const data = await quizService.getInventory()
      setQuizzes(data)
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    return mins + " phút"
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box 
        className="glass-card"
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ 
            fontWeight: 900, 
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, #FFF 0%, #AAA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <QuizIcon sx={{ fontSize: 48, color: '#10B981' }} />
            Ngân hàng Đề thi
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-text-muted)', mt: 1 }}>
            Kho lưu trữ và quản lý các bộ câu hỏi, trắc nghiệm trực tuyến chuyên nghiệp.
          </Typography>
        </Box>
        <Fab 
          variant="extended" 
          onClick={() => navigate('/inventory/quizzes/create')}
          sx={{ 
            px: 4, 
            fontWeight: 800, 
            borderRadius: '16px',
            textTransform: 'none',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFF',
            '&:hover': { background: '#059669' }
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Tạo bộ đề mới
        </Fab>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: '24px' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {quizzes.length > 0 ? (
              quizzes.map((quiz, idx) => (
                <Grid item xs={12} sm={6} md={3} key={quiz.templateId}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      sx={{
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                          borderColor: '#10B981',
                          '& .quiz-badge': { transform: 'scale(1.1)' }
                        }
                      }}
                    >
                      <Avatar 
                        className="quiz-badge"
                        sx={{ 
                          width: 56, height: 56, 
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          position: 'absolute',
                          top: -20,
                          left: 20,
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                          border: '4px solid #1c2128'
                        }}
                      >
                        <QuizIcon />
                      </Avatar>

                      <CardContent sx={{ pt: 6, p: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#FFF' }}>
                          {quiz.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', display: 'block', mb: 3 }}>
                          ID: {quiz.templateId.substring(0, 8).toUpperCase()}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <TimeIcon sx={{ color: '#818CF8', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#FFF' }}>Thời gian: {formatTime(quiz.timeLimitSec)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LayersIcon sx={{ color: '#34D399', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#FFF' }}>Số lần nộp: kịch kim {quiz.maxAttempts}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <GradeIcon sx={{ color: '#FCD34D', fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: '#FFF' }}>Điểm đạt: {quiz.passingScore}%</Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.05)' }} />

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            fullWidth 
                            variant="contained" 
                            size="large"
                            onClick={() => navigate(`/inventory/quizzes/edit/${quiz.templateId}`)}
                            sx={{ 
                              borderRadius: '12px', 
                              fontWeight: 700, 
                              background: 'rgba(16, 185, 129, 0.1)', 
                              color: '#10B981',
                              '&:hover': { background: '#10B981', color: '#FFF' }
                            }}
                          >
                            Chỉnh sửa đề
                          </Button>
                          <IconButton 
                            onClick={async () => {
                              if (window.confirm('Xóa bản mẫu trắc nghiệm này?')) {
                                await quizService.deleteTemplate(quiz.templateId)
                                fetchInventory()
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
                <ListIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h5">Ngân hàng đề thi đang trống.</Typography>
                <Typography>Khởi tạo nguồn cảm hứng trí tuệ của bạn.</Typography>
              </Box>
            )}
          </AnimatePresence>
        </Grid>
      )}
    </Box>
  )
}

export default QuizInventory
