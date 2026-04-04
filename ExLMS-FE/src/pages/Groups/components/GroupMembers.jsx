import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import { MoreVert as MoreVertIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import groupService from '../../../services/groupService'

// Decode JWT to get current user email (sub in JWT is email for this system)
const getCurrentUserEmail = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || payload.email || null
  } catch (e) {
    return null
  }
}

const GroupMembers = ({ groupId, groupRole }) => {
  const { t } = useTranslation()
  const [members, setMembers] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Action Menu State
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', content: '', action: null })

  const currentUserEmail = getCurrentUserEmail()
  const currentUserMember = members.find(m => m.email === currentUserEmail)
  const currentUserRole = groupRole || (currentUserMember ? currentUserMember.role : 'MEMBER')

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await groupService.getGroupMembers(groupId)
      setMembers(data)
    } catch (err) {
      setError(t('groups.errors.fetch_failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [groupId])

  const fetchPendingRequests = async () => {
    if (currentUserRole !== 'OWNER' && currentUserRole !== 'EDITOR') return
    try {
      const data = await groupService.getPendingJoinRequests(groupId)
      setPendingRequests(data)
    } catch (err) {
      console.error('Failed to load pending requests')
    }
  }

  useEffect(() => {
    if (currentUserRole === 'OWNER' || currentUserRole === 'EDITOR') {
      fetchPendingRequests()
    }
  }, [currentUserRole, groupId])

  const handleReviewRequest = async (requestId, approve) => {
    try {
      const resMsg = await groupService.reviewJoinRequest(requestId, approve)
      showSnackbar(resMsg || (approve ? t('common.success') : t('common.error')), 'success')
      fetchPendingRequests()
      if (approve) fetchMembers()
    } catch (err) {
      showSnackbar(err.response?.data?.message || t('common.error'), 'error')
    }
  }

  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget)
    setSelectedMember(member)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedMember(null)
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const executeAction = async (actionFn, successMsg) => {
    try {
      const response = await actionFn()
      showSnackbar(response || successMsg)
      fetchMembers()
    } catch (err) {
      showSnackbar(err.response?.data?.message || t('common.error'), 'error')
    } finally {
      setConfirmDialog({ open: false })
      handleMenuClose()
    }
  }

  const handlePromote = () => {
    setConfirmDialog({
      open: true,
      title: 'Promote to Editor',
      content: `Are you sure you want to promote ${selectedMember?.fullName} to Editor?`,
      action: () => executeAction(
        () => groupService.changeMemberRole(groupId, selectedMember.userId, 'EDITOR'),
        'Promoted to Editor smoothly.'
      )
    })
  }

  const handleDemote = () => {
    setConfirmDialog({
      open: true,
      title: 'Demote to Member',
      content: `Are you sure you want to demote ${selectedMember?.fullName} to Member?`,
      action: () => executeAction(
        () => groupService.changeMemberRole(groupId, selectedMember.userId, 'MEMBER'),
        'Demoted to Member smoothly.'
      )
    })
  }

  const handleKick = () => {
    setConfirmDialog({
      open: true,
      title: 'Remove Member',
      content: `Are you sure you want to remove ${selectedMember?.fullName} from the group?`,
      action: () => executeAction(
        () => groupService.removeMember(groupId, selectedMember.userId),
        'Member removed.'
      )
    })
  }

  const handleTransferOwnership = () => {
    setConfirmDialog({
      open: true,
      title: 'Transfer Ownership',
      content: `WARNING: You are about to transfer ownership to ${selectedMember?.fullName}. You will be demoted to Editor. Continue?`,
      action: () => executeAction(
        () => groupService.transferOwnership(groupId, selectedMember.userId),
        'Ownership transferred.'
      )
    })
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">{t('group_detail.tabs.members')} ({members.length})</Typography>
      </Box>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#FBBF24', fontFamily: 'var(--font-heading)' }}>
              Yêu cầu tham gia chờ duyệt
            </Typography>
            <Chip 
              label={pendingRequests.length} 
              size="small" 
              sx={{ bgcolor: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', fontWeight: 900, borderRadius: '6px', height: 20 }} 
            />
          </Box>
          <Grid container spacing={2}>
            {pendingRequests.map((req) => (
              <Grid item xs={12} md={6} key={req.requestId}>
                <Card sx={{ 
                  p: 2.5, borderRadius: '16px', bgcolor: 'var(--color-surface-2)', 
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  display: 'flex', flexDirection: 'column', gap: 2
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'var(--color-surface-3)', fontWeight: 800 }}>{req.studentName.charAt(0)}</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: 'var(--color-text)' }}>{req.studentName}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{req.studentEmail}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {req.message && (
                    <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                      <Typography sx={{ fontSize: '0.8125rem', italic: true, color: 'var(--color-text-sec)' }}>"{req.message}"</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => handleReviewRequest(req.requestId, true)}
                      sx={{ borderRadius: '10px', fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', '&:hover': { bgcolor: '#10B981', color: '#FFF' } }}
                    >
                      Duyệt
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      onClick={() => handleReviewRequest(req.requestId, false)}
                      sx={{ borderRadius: '10px', fontWeight: 800, borderColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', '&:hover': { borderColor: '#F87171', bgcolor: 'rgba(239, 68, 68, 0.05)' } }}
                    >
                      Từ chối
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <TableContainer 
        component={Paper} 
        sx={{ 
          background: 'var(--color-surface-2)', 
          border: '1px solid var(--color-border)', 
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: 'var(--color-text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', py: 2.5 }}>{t('group_detail.founder')}</TableCell>
              <TableCell sx={{ color: 'var(--color-text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('auth.email')}</TableCell>
              <TableCell sx={{ color: 'var(--color-text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Role</TableCell>
              <TableCell sx={{ color: 'var(--color-text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('group_detail.created')}</TableCell>
              <TableCell align="right" sx={{ color: 'var(--color-text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow 
                key={member.userId}
                sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, transition: 'background 0.2s' }}
              >
                <TableCell sx={{ py: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 40, height: 40, fontSize: '1rem', fontWeight: 800,
                        bgcolor: 'var(--color-surface-3)', color: 'var(--color-text)',
                        border: '2px solid',
                        borderColor: member.role === 'OWNER' ? 'rgba(239, 68, 68, 0.4)' : member.role === 'EDITOR' ? 'rgba(245, 158, 11, 0.4)' : 'transparent'
                      }}
                    >
                      {member.fullName?.charAt(0) || '?'}
                    </Avatar>
                    <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>{member.fullName}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{member.email}</TableCell>
                <TableCell>
                  <Chip
                    label={member.role}
                    size="small"
                    sx={{ 
                      height: 20, fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase',
                      bgcolor: member.role === 'OWNER' ? 'rgba(239, 68, 68, 0.1)' : member.role === 'EDITOR' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: member.role === 'OWNER' ? '#F87171' : member.role === 'EDITOR' ? '#FBBF24' : 'var(--color-text-muted)',
                      border: '1px solid transparent',
                      borderColor: member.role === 'OWNER' ? 'rgba(239, 68, 68, 0.2)' : member.role === 'EDITOR' ? 'rgba(245, 158, 11, 0.2)' : 'transparent'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  {new Date(member.joinedAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  {(currentUserRole === 'OWNER' || (currentUserRole === 'EDITOR' && member.role === 'MEMBER')) && member.email !== currentUserEmail && (
                    <IconButton 
                      onClick={(e) => handleMenuOpen(e, member)}
                      sx={{ color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-text)', bgcolor: 'rgba(255,255,255,0.05)' } }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu Options */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {currentUserRole === 'OWNER' && selectedMember?.role === 'MEMBER' && (
          <MenuItem onClick={handlePromote}>Promote to Editor</MenuItem>
        )}
        {currentUserRole === 'OWNER' && selectedMember?.role === 'EDITOR' && (
          <MenuItem onClick={handleDemote}>Demote to Member</MenuItem>
        )}
        {(currentUserRole === 'OWNER' || (currentUserRole === 'EDITOR' && selectedMember?.role === 'MEMBER')) && (
          <MenuItem onClick={handleKick} sx={{ color: 'error.main' }}>Remove Member</MenuItem>
        )}
        {currentUserRole === 'OWNER' && (
          <MenuItem onClick={handleTransferOwnership} sx={{ color: 'error.main', fontWeight: 'bold' }}>
            Transfer Ownership
          </MenuItem>
        )}
      </Menu>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false })}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>{t('common.cancel')}</Button>
          <Button onClick={confirmDialog.action} variant="contained" color="error" autoFocus>{t('common.confirm')}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default GroupMembers
