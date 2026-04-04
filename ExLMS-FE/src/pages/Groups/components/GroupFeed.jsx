import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Alert,
  Stack
} from '@mui/material'
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  PushPin as PinIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Book as CourseIcon,
  Assignment as AssignmentIcon,
  VideoCall as MeetingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import CKEditorWrapper from '../../../components/Common/CKEditorWrapper'
import groupFeedService from '../../../services/groupFeedService'
import { formatDistanceToNow } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

const GroupFeed = ({ groupId, currentUserRole, groupCourses = [], groupAssignments = [], groupMeetings = [] }) => {
  const { t, i18n } = useTranslation()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // New Post State
  const [isCreating, setIsCreating] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [linkedEntity, setLinkedEntity] = useState(null) // { id, type, title }
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

  // Auth Context from Redux
  const { user: currentUser } = useSelector((state) => state.auth)

  const fetchPosts = async (reset = false) => {
    try {
      if (reset) setLoading(true)
      const currentPage = reset ? 0 : page
      const data = await groupFeedService.getGroupFeed(groupId, filterType, currentPage)
      if (reset) {
        setPosts(data.content)
      } else {
        setPosts(prev => [...prev, ...data.content])
      }
      setHasMore(!data.last)
      setPage(currentPage + 1)
    } catch (err) {
      console.error('Failed to fetch feed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(true)
  }, [groupId, filterType])

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    try {
      const postData = {
        content: newPostContent,
        linkedEntityId: linkedEntity?.id,
        linkedEntityType: linkedEntity?.type,
        pinned: false
      }
      const newPost = await groupFeedService.createPost(groupId, postData)
      setPosts([newPost, ...posts])
      setNewPostContent('')
      setLinkedEntity(null)
      setIsCreating(false)
    } catch (err) {
      alert(t('common.error'))
    }
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await groupFeedService.deletePost(groupId, postId)
        setPosts(posts.filter(p => p.id !== postId))
      } catch (err) {
        alert(t('common.error'))
      }
    }
  }

  const handleTogglePin = async (postId) => {
    try {
      await groupFeedService.togglePinPost(groupId, postId)
      setPosts(posts.map(p => p.id === postId ? { ...p, pinned: !p.pinned } : p))
    } catch (err) {
      alert(t('common.error'))
    }
  }

  const handleToggleReaction = async (postId) => {
    try {
      await groupFeedService.toggleReaction(groupId, postId)
      // Note: Backend handles toggle, but we might want to refresh count accurately
      // For simplicity, we'll just refetch or manually adjust (service returns a string usually)
      fetchPosts(true) // Slightly heavy but accurate
    } catch (err) {
      console.error(err)
    }
  }

  const getEntityIcon = (type) => {
    switch (type) {
      case 'COURSE': return <CourseIcon fontSize="small" />
      case 'ASSIGNMENT': return <AssignmentIcon fontSize="small" />
      case 'MEETING': return <MeetingIcon fontSize="small" />
      default: return <LinkIcon fontSize="small" />
    }
  }

  const getAvatarUrl = (key) => key ? `/api/files/download/${key}` : null

  const formatDate = (dateInput) => {
    const locale = i18n.language === 'vi' ? vi : enUS
    if (!dateInput) return t('forum.time_just_now')
    try {
      if (Array.isArray(dateInput)) {
        const [y, mon, d, h, min, s] = dateInput
        return formatDistanceToNow(new Date(y, mon - 1, d, h, min, s), { addSuffix: true, locale })
      }
      return formatDistanceToNow(new Date(dateInput), { addSuffix: true, locale })
    } catch (err) {
      return t('forum.time_just_now')
    }
  }

  return (
    <Box sx={{ maxWidth: 840, mx: 'auto' }}>
      {/* Category Filters */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 4, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 4 } }}>
        <Chip 
          label={t('common.all')} 
          onClick={() => setFilterType('')} 
          sx={{ 
            height: 36, px: 1, borderRadius: '10px', fontWeight: 700,
            bgcolor: filterType === '' ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: filterType === '' ? '#818CF8' : 'var(--color-text-muted)',
            border: `1px solid ${filterType === '' ? 'rgba(99,102,241,0.3)' : 'var(--color-border)'}`,
            '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }
          }}
        />
        {[
          { label: t('group_detail.tabs.courses'), type: 'COURSE', icon: <CourseIcon /> },
          { label: t('group_detail.tabs.assignments'), type: 'ASSIGNMENT', icon: <AssignmentIcon /> },
          { label: t('group_detail.tabs.meetings'), type: 'MEETING', icon: <MeetingIcon /> },
          { label: t('forum.pinned'), type: 'NOTICE', icon: <PinIcon /> }
        ].map((item) => (
          <Chip 
            key={item.type}
            label={item.label} 
            onClick={() => setFilterType(item.type)} 
            icon={React.cloneElement(item.icon, { sx: { fontSize: '18px !important', color: filterType === item.type ? '#818CF8 !important' : 'inherit' } })}
            sx={{ 
              height: 36, px: 1, borderRadius: '10px', fontWeight: 700,
              bgcolor: filterType === item.type ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: filterType === item.type ? '#818CF8' : 'var(--color-text-muted)',
              border: `1px solid ${filterType === item.type ? 'rgba(99,102,241,0.3)' : 'var(--color-border)'}`,
              '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)' }
            }}
          />
        ))}
      </Stack>

      {/* Post Creator */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Paper 
          sx={{ 
            p: 3, mb: 5, borderRadius: '24px', 
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            transition: 'border-color 0.3s',
            '&:focus-within': { borderColor: 'rgba(99,102,241,0.5)' }
          }}
        >
          {!isCreating ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar 
                src={getAvatarUrl(currentUser.avatarKey)} 
                sx={{ width: 48, height: 48, border: '2px solid var(--color-surface-3)' }}
              />
              <Box 
                onClick={() => setIsCreating(true)}
                sx={{ 
                  flexGrow: 1, 
                  bgcolor: 'var(--color-surface-3)', 
                  borderRadius: '16px', 
                  px: 3, 
                  py: 1.75, 
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'var(--color-surface-4)', borderColor: 'rgba(255,255,255,0.05)' }
                }}
              >
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>{t('forum.placeholder')}</Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, mb: 2, color: 'var(--color-text)' }}>Tạo bài viết mới</Typography>
              <Box sx={{ mb: 3, '& .ck-editor__editable': { bgcolor: 'var(--color-surface-3)', border: '1px solid var(--color-border) !important', borderRadius: '12px !important' } }}>
                <CKEditorWrapper
                  value={newPostContent}
                  onChange={(data) => setNewPostContent(data)}
                  placeholder="Chia sẻ kiến thức hoặc đặt câu hỏi..."
                  minHeight="180px"
                />
              </Box>
              
              {linkedEntity && (
                <Chip
                  icon={getEntityIcon(linkedEntity.type)}
                  label={`Đính kèm: ${linkedEntity.title}`}
                  onDelete={() => setLinkedEntity(null)}
                  sx={{ 
                    mb: 3, borderRadius: '10px', fontWeight: 700,
                    bgcolor: 'rgba(99,102,241,0.1)', color: '#818CF8',
                    border: '1px solid rgba(99,102,241,0.2)'
                  }}
                />
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  startIcon={<LinkIcon />} 
                  onClick={() => setLinkDialogOpen(true)}
                  sx={{ color: 'var(--color-text-sec)', fontWeight: 600, textTransform: 'none' }}
                >
                  Gắn liên kết nội bộ
                </Button>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button 
                    onClick={() => setIsCreating(false)} 
                    sx={{ color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'none' }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleCreatePost} 
                    disabled={!newPostContent.trim()}
                    sx={{ 
                      borderRadius: '12px', px: 3, fontWeight: 800, textTransform: 'none',
                      background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                    }}
                  >
                    {t('common.create')}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Feed List */}
      <AnimatePresence>
        {loading && page === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
        ) : posts.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
            <Typography color="text.secondary">{t('forum.no_posts')}</Typography>
          </Paper>
        ) : (
          posts.map((post) => (
            <PostItem 
              key={post.id} 
              post={post} 
              currentUser={currentUser}
              currentUserRole={currentUserRole}
              onDelete={handleDeletePost}
              onTogglePin={handleTogglePin}
              onToggleReaction={handleToggleReaction}
              groupId={groupId}
              formatDate={formatDate}
              setPosts={setPosts}
              posts={posts}
            />
          ))
        )}
      </AnimatePresence>

      {hasMore && !loading && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => fetchPosts()}>{t('common.load_more')}</Button>
        </Box>
      )}

      {/* Link Selector Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Chọn nội dung để đính kèm</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom color="primary">Khóa học</Typography>
          <List size="small">
            {groupCourses.length > 0 ? groupCourses.map(c => (
              <ListItem button key={c.id} onClick={() => { setLinkedEntity({ id: c.id, type: 'COURSE', title: c.title }); setLinkDialogOpen(false); }}>
                <ListItemIcon><CourseIcon color="primary" /></ListItemIcon>
                <ListItemText primary={c.title} />
              </ListItem>
            )) : <Typography variant="caption" sx={{ pl: 2 }}>Trống</Typography>}
          </List>
          
          <Typography variant="subtitle2" gutterBottom color="success.main" sx={{ mt: 2 }}>Bài tập</Typography>
          <List size="small">
            {groupAssignments.length > 0 ? groupAssignments.map(a => (
              <ListItem button key={a.id} onClick={() => { setLinkedEntity({ id: a.id, type: 'ASSIGNMENT', title: a.title }); setLinkDialogOpen(false); }}>
                <ListItemIcon><AssignmentIcon color="success" /></ListItemIcon>
                <ListItemText primary={a.title} />
              </ListItem>
            )) : <Typography variant="caption" sx={{ pl: 2 }}>Trống</Typography>}
          </List>

          <Typography variant="subtitle2" gutterBottom color="warning.main" sx={{ mt: 2 }}>Buổi họp</Typography>
          <List size="small">
            {groupMeetings.length > 0 ? groupMeetings.map(m => (
              <ListItem button key={m.id} onClick={() => { setLinkedEntity({ id: m.id, type: 'MEETING', title: m.title }); setLinkDialogOpen(false); }}>
                <ListItemIcon><MeetingIcon color="warning" /></ListItemIcon>
                <ListItemText primary={m.title} />
              </ListItem>
            )) : <Typography variant="caption" sx={{ pl: 2 }}>Trống</Typography>}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

const PostItem = ({ post, currentUser, currentUserRole, onDelete, onTogglePin, onToggleReaction, groupId, formatDate, setPosts, posts }) => {
  const { t } = useTranslation()
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  const handleFetchComments = async () => {
    if (!showComments) {
      setLoadingComments(true)
      try {
        const data = await groupFeedService.getPostComments(groupId, post.id)
        setComments(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingComments(false)
      }
    }
    setShowComments(!showComments)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      const added = await groupFeedService.addComment(groupId, post.id, { content: newComment })
      setComments([...comments, added])
      setNewComment('')
      post.commentCount += 1 // Optimistic update
    } catch (err) {
      alert('Lỗi khi gửi bình luận!')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return
    try {
      await groupFeedService.deleteComment(groupId, commentId)
      setComments(comments.filter(c => c.id !== commentId))
      post.commentCount -= 1
    } catch (err) {
      alert('Lỗi xác thực hoặc không có quyền xóa!')
    }
  }

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) return
    try {
      const updated = await groupFeedService.updateComment(groupId, commentId, { content: editingCommentText })
      setComments(comments.map(c => c.id === commentId ? updated : c))
      setEditingCommentId(null)
    } catch (err) {
      alert('Lỗi khi cập nhật bình luận!')
    }
  }

  const handleUpdatePost = async () => {
    if (!editedContent.trim()) return
    try {
      const updated = await groupFeedService.updatePost(groupId, post.id, { 
        content: editedContent,
        linkedEntityId: post.linkedEntityId,
        linkedEntityType: post.linkedEntityType,
        pinned: post.pinned
      })
      setPosts(posts.map(p => p.id === post.id ? updated : p))
      setIsEditing(false)
    } catch (err) {
      alert('Lỗi khi cập nhật bài viết!')
    }
  }

  const getAvatarUrl = (key) => key ? `/api/files/download/${key}` : null
  
  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'OWNER': return 'error'
      case 'EDITOR': return 'warning'
      default: return 'default'
    }
  }

  const getEntityLabel = (type) => {
    switch (type) {
      case 'COURSE': return 'Khóa học'
      case 'ASSIGNMENT': return 'Bài tập'
      case 'MEETING': return 'Buổi họp'
      default: return 'Liên kết'
    }
  }

  const getEntityIcon = (type) => {
    switch (type) {
      case 'COURSE': return <CourseIcon fontSize="small" />
      case 'ASSIGNMENT': return <AssignmentIcon fontSize="small" />
      case 'MEETING': return <MeetingIcon fontSize="small" />
      default: return <LinkIcon fontSize="small" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Paper 
        sx={{ 
          p: 3, mb: 3.5, borderRadius: '24px', position: 'relative',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { 
            borderColor: 'rgba(99, 102, 241, 0.3)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)' 
          }
        }}
      >
        {post.pinned && (
          <Box
            sx={{
              position: 'absolute', top: 20, right: 24,
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1.25, py: 0.4, borderRadius: '6px',
              bgcolor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <PinIcon sx={{ fontSize: 13, color: '#818CF8' }} />
            <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pinned
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Avatar 
              src={getAvatarUrl(post.authorAvatarKey)} 
              sx={{ 
                width: 52, height: 52, 
                border: '3px solid', 
                borderColor: post.authorGroupRole === 'OWNER' ? 'rgba(239, 68, 68, 0.3)' : post.authorGroupRole === 'EDITOR' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.05)'
              }} 
            />
            <Box sx={{ pt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25 }}>
                <Typography sx={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text)' }}>{post.authorName}</Typography>
                <Chip 
                  label={post.authorGroupRole} 
                  size="small" 
                  sx={{ 
                    height: 18, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em',
                    bgcolor: post.authorGroupRole === 'OWNER' ? 'rgba(239, 68, 68, 0.1)' : post.authorGroupRole === 'EDITOR' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: post.authorGroupRole === 'OWNER' ? '#F87171' : post.authorGroupRole === 'EDITOR' ? '#FBBF24' : 'var(--color-text-muted)',
                    border: '1px solid transparent',
                    borderColor: post.authorGroupRole === 'OWNER' ? 'rgba(239, 68, 68, 0.2)' : post.authorGroupRole === 'EDITOR' ? 'rgba(245, 158, 11, 0.2)' : 'transparent'
                  }} 
                />
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {formatDate(post.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            {(currentUser.id === post.authorId || currentUserRole === 'OWNER' || currentUserRole === 'EDITOR') && (
              <>
                <IconButton 
                  size="small" 
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ color: 'var(--color-text-muted)', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    sx: { bgcolor: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: '12px', minWidth: 160 }
                  }}
                >
                  {(currentUserRole === 'OWNER' || currentUserRole === 'EDITOR') && (
                    <MenuItem onClick={() => { onTogglePin(post.id); setAnchorEl(null); }} sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      <PinIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--color-primary-lt)' }} /> {post.pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                    </MenuItem>
                  )}
                  {currentUser.id === post.authorId && (
                    <MenuItem onClick={() => { setIsEditing(true); setAnchorEl(null); }} sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Chỉnh sửa
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => { onDelete(post.id); setAnchorEl(null); }} sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#F87171' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Xóa bài viết
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {isEditing ? (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ '& .ck-editor__editable': { bgcolor: 'var(--color-surface-3)', border: '1px solid var(--color-border) !important', borderRadius: '12px !important' } }}>
              <CKEditorWrapper
                value={editedContent}
                onChange={(data) => setEditedContent(data)}
                placeholder="Chỉnh sửa nội dung..."
                minHeight="150px"
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 2 }}>
              <Button size="small" onClick={() => setIsEditing(false)} sx={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Hủy</Button>
              <Button 
                size="small" 
                variant="contained" 
                onClick={handleUpdatePost}
                sx={{ borderRadius: '8px', fontWeight: 700, background: 'var(--color-primary)' }}
              >
                Cập nhật
              </Button>
            </Box>
          </Box>
        ) : (
          <Box className="ck-content" sx={{ mb: 3, px: 0.5 }}>
            <div 
              style={{ 
                fontSize: '0.9375rem', 
                lineHeight: 1.7, 
                color: 'var(--color-text)',
                wordBreak: 'break-word'
              }} 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </Box>
        )}

        {post.linkedEntityId && (
          <Box 
            sx={{ 
              p: 2, 
              mb: 3, 
              borderRadius: '16px', 
              bgcolor: 'var(--color-surface-3)', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'var(--color-surface-4)', borderColor: 'rgba(99,102,241,0.3)' }
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: '#818CF8', width: 44, height: 44, borderRadius: '10px' }}>
              {getEntityIcon(post.linkedEntityType)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: '0.625rem', color: '#818CF8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.25 }}>
                {getEntityLabel(post.linkedEntityType)}
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>Gợi ý nội dung liên quan</Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2.5, borderStyle: 'dashed', borderColor: 'var(--color-border)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              startIcon={post.reactionCount > 0 ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
              onClick={() => onToggleReaction(post.id)}
              sx={{ 
                height: 36, px: 2, borderRadius: '10px',
                fontWeight: 700,
                color: post.reactionCount > 0 ? '#818CF8' : 'var(--color-text-sec)',
                bgcolor: post.reactionCount > 0 ? 'rgba(99,102,241,0.08)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' }
              }}
            >
              {post.reactionCount || t('forum.actions.like')}
            </Button>
            <Button 
              size="small" 
              startIcon={<CommentIcon />} 
              onClick={handleFetchComments}
              sx={{ 
                height: 36, px: 2, borderRadius: '10px',
                fontWeight: 700,
                color: showComments ? '#818CF8' : 'var(--color-text-sec)',
                bgcolor: showComments ? 'rgba(99,102,241,0.08)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' }
              }}
            >
              {post.commentCount || t('forum.actions.comment')}
            </Button>
          </Box>
        </Box>

        <Collapse in={showComments}>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {loadingComments ? <CircularProgress size={20} /> : (
              <List>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                    <Avatar 
                      src={getAvatarUrl(comment.authorAvatarKey)} 
                      sx={{ width: 32, height: 32, mr: 2, border: '1px solid', borderColor: getRoleColor(comment.authorGroupRole) + '.main' }} 
                    />
                    <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 2, flexGrow: 1, position: 'relative' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{comment.authorName}</Typography>
                        <Chip label={comment.authorGroupRole} size="small" sx={{ height: 16, fontSize: 8 }} color={getRoleColor(comment.authorGroupRole)} />
                      </Box>
                      
                      {editingCommentId === comment.id ? (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            sx={{ bgcolor: 'white' }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button size="tiny" sx={{ fontSize: 10 }} onClick={() => setEditingCommentId(null)}>Hủy</Button>
                            <Button size="tiny" sx={{ fontSize: 10 }} variant="contained" onClick={() => handleUpdateComment(comment.id)}>Sửa</Button>
                          </Box>
                        </Box>
                      ) : (
                        <>
                          <Typography variant="body2">{comment.content}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </>
                      )}
                      
                      {(currentUser.id === comment.authorId || currentUserRole === 'OWNER' || currentUserRole === 'EDITOR') && (
                        <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex' }}>
                          {currentUser.id === comment.authorId && editingCommentId !== comment.id && (
                            <IconButton 
                              size="small" 
                              onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }}
                            >
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteComment(comment.id)}
                            sx={{ color: 'error.light' }}
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
            
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Avatar src={getAvatarUrl(currentUser.avatarKey)} sx={{ width: 32, height: 32 }} />
              <TextField
                fullWidth
                size="small"
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <SendIcon fontSize="small" color="primary" />
                    </IconButton>
                  )
                }}
              />
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </motion.div>
  )
}

export default GroupFeed
