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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="warning.main" sx={{ mb: 2 }}>Yêu cầu tham gia chờ duyệt ({pendingRequests.length})</Typography>
          <TableContainer component={Paper} sx={{ border: '1px solid orange' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Người yêu cầu</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Lời nhắn</TableCell>
                  <TableCell>Thời gian gửi</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests.map((req) => (
                  <TableRow key={req.requestId}>
                    <TableCell>{req.studentName}</TableCell>
                    <TableCell>{req.studentEmail}</TableCell>
                    <TableCell>{req.message}</TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleReviewRequest(req.requestId, true)}>Duyệt</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => handleReviewRequest(req.requestId, false)}>Từ chối</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('group_detail.founder')}</TableCell>
              <TableCell>{t('auth.email')}</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>{t('group_detail.created')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.userId}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{member.fullName?.charAt(0) || '?'}</Avatar>
                    <Typography>{member.fullName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Chip
                    label={member.role}
                    color={member.role === 'OWNER' ? 'error' : member.role === 'EDITOR' ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  {currentUserRole === 'OWNER' && member.email !== currentUserEmail && (
                    <IconButton onClick={(e) => handleMenuOpen(e, member)}>
                      <MoreVertIcon />
                    </IconButton>
                  )}
                  {currentUserRole === 'EDITOR' && member.role === 'MEMBER' && (
                    <IconButton onClick={(e) => handleMenuOpen(e, member)}>
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
        {currentUserRole === 'OWNER' && selectedMember?.role === 'MEMBER' && selectedMember?.platformRole !== 'STUDENT' && (
          <MenuItem onClick={handlePromote}>Promote to Editor</MenuItem>
        )}
        {currentUserRole === 'OWNER' && selectedMember?.role === 'EDITOR' && (
          <MenuItem onClick={handleDemote}>Demote to Member</MenuItem>
        )}
        {(currentUserRole === 'OWNER' || (currentUserRole === 'EDITOR' && selectedMember?.role === 'MEMBER')) && (
          <MenuItem onClick={handleKick} sx={{ color: 'error.main' }}>Remove Member</MenuItem>
        )}
        {currentUserRole === 'OWNER' && selectedMember?.platformRole !== 'STUDENT' && (
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
