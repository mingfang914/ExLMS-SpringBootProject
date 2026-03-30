import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import forumService from '../../services/forumService'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

// ── Helpers ───────────────────────────────────────────────────────
const stripHtml = (html) => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

// ── SVG Icons ─────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const ThumbUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/>
  </svg>
)
const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const ForumEmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const container = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const ForumList = () => {
  const [posts,       setPosts]       = useState([])
  const [tags,        setTags]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [searchTerm,  setSearchTerm]  = useState('')
  const [selectedTag, setSelectedTag] = useState(null)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const data = await forumService.getPosts({ search: searchTerm, tag: selectedTag?.slug })
      setPosts(data)
    } catch {
      setError('Could not load posts.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try { setTags(await forumService.getTags()) } catch {}
  }

  useEffect(() => { fetchTags() }, [])

  useEffect(() => {
    const t = setTimeout(fetchPosts, 500)
    return () => clearTimeout(t)
  }, [searchTerm, selectedTag])

  const handleTagClick = (tag) => setSelectedTag(s => s?.id === tag.id ? null : tag)

  const timeSince = (date) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi }) }
    catch { return '' }
  }

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="visible" sx={{ pb: 6 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{
              fontFamily: 'var(--font-heading)', fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              color: 'var(--color-text)', letterSpacing: '-0.03em', mb: 0.5,
            }}>
              Community Forum
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Ask questions, share ideas, help each other
            </Typography>
          </Box>
          <Button
            component={Link} to="/forum/create"
            variant="contained"
            startIcon={<PlusIcon />}
            sx={{
              height: 38, borderRadius: '9px', fontWeight: 600, fontSize: '0.875rem',
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)', cursor: 'pointer',
              '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' },
            }}
          >
            New Post
          </Button>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* ── Main column ─────────────────────────────────────── */}
        <Grid item xs={12} md={8}>
          {/* Search */}
          <motion.div variants={item}>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 1.5, height: 44, mb: 2.5,
                borderRadius: '10px', border: '1px solid var(--color-border)',
                bgcolor: 'rgba(33,38,45,0.6)',
                '&:focus-within': { borderColor: 'var(--color-primary)', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' },
                transition: 'all 0.2s',
              }}
            >
              <Box sx={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <SearchIcon />
              </Box>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts by title or content…"
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--color-text)', fontSize: '0.875rem', fontFamily: 'var(--font-body)',
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1,
                    padding: 0, display: 'flex', alignItems: 'center',
                  }}
                >
                  ×
                </button>
              )}
            </Box>
          </motion.div>

          {/* Active tag filter indicator */}
          {selectedTag && (
            <motion.div variants={item}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Filtered by:
                </Typography>
                <Chip
                  label={selectedTag.name}
                  size="small"
                  onDelete={() => setSelectedTag(null)}
                  sx={{
                    bgcolor: (selectedTag.color || '#6366F1') + '20',
                    color: selectedTag.color || '#818CF8',
                    border: `1px solid ${(selectedTag.color || '#6366F1')}40`,
                    fontWeight: 600, height: 22,
                  }}
                />
              </Box>
            </motion.div>
          )}

          {/* Posts */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={140} sx={{ bgcolor: 'rgba(33,38,45,0.8)', borderRadius: '12px' }} />
              ))}
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '10px', bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', '& .MuiAlert-icon': { color: '#EF4444' } }}>
              {error}
            </Alert>
          ) : posts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
              <Box sx={{ width: 64, height: 64, borderRadius: '16px', bgcolor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-lt)', mx: 'auto', mb: 2 }}>
                <ForumEmptyIcon />
              </Box>
              <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)', mb: 0.75 }}>
                No posts found
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Be the first to start a discussion!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {posts.map((post) => (
                <motion.div key={post.id} variants={item}>
                  <Box
                    component={Link}
                    to={`/forum/posts/${post.id}`}
                    sx={{
                      display: 'block', textDecoration: 'none',
                      bgcolor: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      p: 2.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'rgba(99,102,241,0.4)',
                        bgcolor: 'var(--color-surface-3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {/* Author avatar */}
                      <Avatar
                        src={post.authorAvatarKey ? `/api/files/download/${post.authorAvatarKey}` : null}
                        sx={{
                          width: 38, height: 38, flexShrink: 0,
                          background: 'linear-gradient(135deg, #6366F1, #22D3EE)',
                          color: 'white', fontWeight: 700, fontSize: '0.9rem',
                          borderRadius: '10px',
                        }}
                      >
                        {post.authorName?.charAt(0).toUpperCase()}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Title row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
                          {post.pinned && (
                            <Box sx={{ color: '#818CF8', display: 'flex', alignItems: 'center' }}>
                              <PinIcon />
                            </Box>
                          )}
                          <Typography sx={{
                            fontFamily: 'var(--font-heading)', fontWeight: 700,
                            fontSize: '0.9375rem', color: 'var(--color-text)', lineHeight: 1.3,
                          }} className="clamp-2">
                            {post.title}
                          </Typography>
                        </Box>

                        {/* Snippet */}
                        <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.55, mb: 1.5 }} className="clamp-2">
                          {stripHtml(post.content)}
                        </Typography>

                        {/* Tags */}
                        {post.tags?.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                            {post.tags.map(tag => (
                              <Chip
                                key={tag.id}
                                label={tag.name}
                                size="small"
                                sx={{
                                  height: 18, fontSize: '0.625rem', fontWeight: 600,
                                  bgcolor: (tag.color || '#6366F1') + '15',
                                  color: tag.color || '#818CF8',
                                  border: `1px solid ${(tag.color || '#6366F1')}30`,
                                  '& .MuiChip-label': { px: '8px' },
                                }}
                              />
                            ))}
                          </Box>
                        )}

                        {/* Meta */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ color: 'var(--color-text-sec)', fontWeight: 500 }}>{post.authorName}</span>
                            {' · '}{timeSince(post.createdAt)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                            <ThumbUpIcon />
                            <Typography sx={{ fontSize: '0.75rem' }}>{post.upvoteCount ?? 0}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                            <EyeIcon />
                            <Typography sx={{ fontSize: '0.75rem' }}>{post.viewCount ?? 0} views</Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Arrow */}
                      <Box sx={{ color: 'var(--color-text-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <ArrowRightIcon />
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          )}
        </Grid>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <Grid item xs={12} md={4}>
          {/* Tags */}
          <motion.div variants={item}>
            <Box
              sx={{
                bgcolor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                p: 2.5,
                mb: 2.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: 'var(--color-primary-lt)' }}><TagIcon /></Box>
                <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                  Browse by Tag
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {tags.length === 0 ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} variant="rounded" width={70 + i * 8} height={24} sx={{ bgcolor: 'rgba(33,38,45,0.8)', borderRadius: '99px' }} />
                  ))
                ) : (
                  tags.map(tag => {
                    const active = selectedTag?.id === tag.id
                    return (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        onClick={() => handleTagClick(tag)}
                        size="small"
                        sx={{
                          height: 24, fontSize: '0.75rem', fontWeight: 600,
                          bgcolor: active ? (tag.color || '#6366F1') + '25' : (tag.color || '#6366F1') + '12',
                          color: tag.color || '#818CF8',
                          border: `1px solid ${(tag.color || '#6366F1')}${active ? '50' : '25'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          boxShadow: active ? `0 0 0 1px ${(tag.color || '#6366F1')}30` : 'none',
                          '& .MuiChip-label': { px: '10px' },
                          '&:hover': { bgcolor: (tag.color || '#6366F1') + '25', transform: 'scale(1.02)' },
                        }}
                      />
                    )
                  })
                )}
              </Box>
            </Box>
          </motion.div>

          {/* Community Guidelines */}
          <motion.div variants={item}>
            <Box
              sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  px: 2.5, py: 2,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))',
                  borderBottom: '1px solid rgba(99,102,241,0.15)',
                }}
              >
                <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                  Community Guidelines
                </Typography>
              </Box>

              {/* Rules */}
              <Box sx={{ bgcolor: 'var(--color-surface)', px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  'Respect and help each other',
                  'No spam or unauthorized advertising',
                  'Use accurate tags for easier discovery',
                  'Keep discussions constructive and relevant',
                ].map((rule, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        bgcolor: 'rgba(99,102,241,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mt: '1px',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#818CF8' }}>
                        {i + 1}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-sec)', lineHeight: 1.5 }}>
                      {rule}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ForumList
