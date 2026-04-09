import React, { useState, useEffect } from 'react'
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Skeleton,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  IconButton
} from '@mui/material'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import dashboardService from '../services/dashboardService'

// ───────────────────────────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#6366F1', '#22D3EE', '#F59E0B', '#10B981', '#F43F5E', '#A855F7']

const Icons = {
  groups: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  courses: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  assignments: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  meetings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  chevronLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  play: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  notification: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  education: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

const NEWS_SLIDES = [
  {
    id: 1,
    title: "Tối ưu hóa thời gian học tập với ExLMS",
    desc: "Khám phá cách sử dụng bộ công cụ Calendar và Task Management để nhân đôi hiệu suất học tập mỗi ngày.",
    color: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    tag: "Education",
    icon: Icons.education
  },
  {
    id: 2,
    title: "7 bí quyết để học nhóm hiệu quả",
    desc: "Xây dựng văn hóa cộng tác trong nhóm học tập chính là chìa khóa để giải quyết những dự án phức tạp một cách nhanh chóng.",
    color: "linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)",
    tag: "Tips",
    icon: Icons.groups
  },
  {
    id: 3,
    title: "Xu hướng Hybrid Learning năm 2024",
    desc: "Cùng điểm qua những công nghệ giáo dục đang làm thay đổi cách thức chúng ta tiếp cận tri thức trong kỷ nguyên số.",
    color: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
    tag: "Trends",
    icon: Icons.courses
  }
]

const containerArr = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemArr = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ───────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, colorClass, loading, trend }) => (
  <Card
    sx={{
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      bgcolor: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-5px)',
        borderColor: `var(--color-${colorClass})`,
        boxShadow: `0 12px 24px rgba(0,0,0,0.1)`,
      }
    }}
  >
    <CardContent sx={{ p: 3 }}>
      {loading ? (
        <Skeleton variant="rectangular" height={80} />
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>{label}</Typography>
            <Typography sx={{ color: 'var(--color-text)', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
            {trend && (
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 600 }}>{trend}</Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: alpha(colorClass === 'indigo' ? '#6366F1' : colorClass === 'cyan' ? '#22D3EE' : colorClass === 'amber' ? '#F59E0B' : '#EF4444', 0.15),
              color: colorClass === 'indigo' ? '#818CF8' : colorClass === 'cyan' ? '#22D3EE' : colorClass === 'amber' ? '#FBBF24' : '#F87171',
            }}
          >
            {icon}
          </Box>
        </Box>
      )}
    </CardContent>
  </Card>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: '10px', p: 1.5, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', mb: 0.5 }}>{label}</Typography>
        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary-lt)' }}>
          {payload[0].value} Hoạt động
        </Typography>
      </Box>
    )
  }
  return null
}

const NewsCarousel = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % NEWS_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const slide = NEWS_SLIDES[index]

  return (
    <Card 
      sx={{ 
        position: 'relative', 
        height: 180, 
        background: slide.color, 
        color: 'white', 
        borderRadius: '16px', 
        overflow: 'hidden',
        border: 'none',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
           key={slide.id}
           initial={{ x: 20, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           exit={{ x: -20, opacity: 0 }}
           transition={{ duration: 0.4 }}
           style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', alignItems: 'center' }}
        >
           <Box sx={{ flex: 1 }}>
              <Chip label={slide.tag} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, mb: 1.5, border: 'none' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.125rem', sm: '1.5rem' } }}>
                {slide.title}
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', opacity: 0.9, lineHeight: 1.5, display: { xs: 'none', sm: 'block' }, maxWidth: '80%' }} className="clamp-2">
                {slide.desc}
              </Typography>
           </Box>
           <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 3, opacity: 0.4 }}>
              {slide.icon}
           </Box>
        </motion.div>
      </AnimatePresence>

      <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 1 }}>
        <IconButton
           size="small"
           onClick={() => setIndex((prev) => (prev - 1 + NEWS_SLIDES.length) % NEWS_SLIDES.length)}
           sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
        >
           {Icons.chevronLeft}
        </IconButton>
        <IconButton
           size="small"
           onClick={() => setIndex((prev) => (prev + 1) % NEWS_SLIDES.length)}
           sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
        >
           {Icons.chevronRight}
        </IconButton>
      </Box>
    </Card>
  )
}

// ───────────────────────────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getStats()
        setStatsData(data)
      } catch (err) {
        console.error('Error fetching dashboard stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const username = user?.name || user?.fullName || user?.email?.split('@')[0] || t('common.student')
  const h = new Date().getHours()
  const greeting = h < 12 ? t('dashboard.greetings.morning') : h < 18 ? t('dashboard.greetings.afternoon') : t('dashboard.greetings.evening')

  const stats = [
    { label: t('dashboard.stats.groups'), value: statsData?.joinedGroups ?? 0, icon: Icons.groups, colorClass: 'indigo', trend: statsData?.joinedGroups > 0 ? `+${statsData.joinedGroups}` : null },
    { label: t('dashboard.stats.courses'), value: statsData?.coursesInProgress ?? 0, icon: Icons.courses, colorClass: 'cyan' },
    { label: t('dashboard.stats.assignments'), value: statsData?.pendingAssignments ?? 0, icon: Icons.assignments, colorClass: 'amber' },
    { label: t('dashboard.stats.meetings'), value: statsData?.upcomingMeetings ?? 0, icon: Icons.meetings, colorClass: 'red' },
  ]

  // Filter for empty weekly data to decide chart display
  const hasWeeklyData = statsData?.weeklyPerformance?.some(d => d.value > 0)
  const hasCategoryData = statsData?.groupCategories?.length > 0

  return (
    <Box component={motion.div} variants={containerArr} initial="hidden" animate="visible" sx={{ pb: 6 }}>
      {/* ── Greeting Header ───────────────────────────────────────── */}
      <motion.div variants={itemArr}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem' }, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--color-text)' }}>
              {greeting}, <Box component="span" sx={{ background: 'linear-gradient(90deg, #6366F1, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{username.split(' ')[0]}</Box>
            </Typography>
            <Typography sx={{ color: 'var(--color-text-muted)', fontSize: '1rem', mt: 0.5 }}>{t('dashboard.hero_desc')}</Typography>
          </Box>
        </Box>
      </motion.div>

      {/* ── Education Highlights Carousel ────────────────────────── */}
      <motion.div variants={itemArr} style={{ marginBottom: '32px' }}>
         <NewsCarousel />
      </motion.div>

      {/* ── Top Stats ─────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <motion.div variants={itemArr} transition={{ delay: idx * 0.05 }}>
              <StatCard {...s} loading={loading} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* ── Middle Row ────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Learning Chart */}
        <Grid item xs={12} lg={8}>
          <motion.div variants={itemArr}>
            <Card sx={{ bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', height: '100%' }}>
              <CardHeader 
                title={t('dashboard.learning_hours')} 
                titleTypographyProps={{ fontSize: '1.125rem', fontWeight: 700 }}
                action={<Chip label={t('dashboard.activity_last_7_days')} size="small" variant="outlined" />}
                sx={{ px: 3, pt: 3 }}
              />
              <CardContent sx={{ height: 350, pt: 0, position: 'relative' }}>
                {loading ? <Skeleton variant="rectangular" height="100%" /> : (
                  <>
                    {!hasWeeklyData && (
                      <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(2px)', borderRadius: '12px' }}>
                         <Typography sx={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Chưa có hoạt động trong 7 ngày qua</Typography>
                         <Typography sx={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Hãy bắt đầu bằng việc làm bài tập hoặc tham gia thảo luận!</Typography>
                      </Box>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statsData?.weeklyPerformance || []} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#6E7681', 0.1)} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6E7681', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6E7681', fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Progress Card */}
        <Grid item xs={12} lg={4}>
          <motion.div variants={itemArr}>
            <Card sx={{ bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title={t('dashboard.continue_learning')} titleTypographyProps={{ fontSize: '1.125rem', fontWeight: 700 }} sx={{ px: 3, pt: 3 }} />
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 3 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', mb: 1 }}>{t('dashboard.achievement', { score: statsData?.totalAchievement || 0 })}</Typography>
                  <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-primary-lt)' }}>{Math.round(statsData?.averageCompletion || 0)}%</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', mt: -1 }}>Tiến độ trung bình</Typography>
                </Box>
                <Box sx={{ px: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={statsData?.averageCompletion || 0} 
                    sx={{ height: 10, borderRadius: 5, bgcolor: alpha('#6366F1', 0.1), '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #6366F1, #22D3EE)' } }} 
                  />
                </Box>
                <Button 
                  component={Link} to="/courses"
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 4, py: 1.5, borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', fontWeight: 700 }}
                >
                  {t('dashboard.continue_learning_btn')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* ── Bottom Row ───────────────────────────────────────────── */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={7}>
          <motion.div variants={itemArr}>
            <Card sx={{ bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <CardHeader title={t('dashboard.recent_activity')} titleTypographyProps={{ fontSize: '1.125rem', fontWeight: 700 }} sx={{ px: 3, pt: 3 }} />
              <CardContent sx={{ p: 0, minHeight: 300 }}>
                {loading ? <Skeleton height={300} /> : (
                  <Box sx={{ px: 3, pb: 2.5 }}>
                    {(statsData?.recentActivities?.length > 0) ? (
                      <AnimatePresence>
                        {statsData.recentActivities.map((act, i) => (
                          <Box key={act.id || i} sx={{ display: 'flex', gap: 2, mb: 3, position: 'relative' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(act.type === 'SUCCESS' ? '#10B981' : '#6366F1', 0.15), color: act.type === 'SUCCESS' ? '#34D399' : '#818CF8', zIndex: 1 }}>
                                {act.type === 'SUCCESS' ? Icons.play : Icons.notification}
                              </Box>
                              {i !== (statsData.recentActivities.length - 1) && <Box sx={{ width: '2px', flex: 1, bgcolor: alpha('#6E7681', 0.2), my: 0.5 }} />}
                            </Box>
                            <Box sx={{ pt: 1, pb: 2 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text)' }}>{act.title || act.text}</Typography>
                              <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', mt: 0.5 }}>{act.time}</Typography>
                            </Box>
                          </Box>
                        ))}
                      </AnimatePresence>
                    ) : (
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                         <Typography sx={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Chưa có hoạt động nào được ghi nhận.</Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={5}>
          <motion.div variants={itemArr}>
            <Card sx={{ bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', height: '100%' }}>
              <CardHeader title={t('dashboard.group_category_dist')} titleTypographyProps={{ fontSize: '1.125rem', fontWeight: 700 }} sx={{ px: 3, pt: 3 }} />
              <CardContent sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {loading ? <Skeleton variant="circular" width={200} height={200} /> : (
                   <>
                    {!hasCategoryData && (
                      <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3 }}>
                         <Typography sx={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Bạn chưa tham gia nhóm nào để thống kê lĩnh vực.</Typography>
                      </Box>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={hasCategoryData ? statsData.groupCategories : [{ name: 'Trống', value: 1 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {(hasCategoryData ? statsData.groupCategories : [{ name: 'Trống', value: 1 }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={hasCategoryData ? PIE_COLORS[index % PIE_COLORS.length] : alpha('#6E7681', 0.2)} stroke="none" />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        {hasCategoryData && <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />}
                      </PieChart>
                    </ResponsiveContainer>
                   </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
