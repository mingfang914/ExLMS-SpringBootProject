import React, { useState, useEffect } from 'react'

import {
  Box,
  Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button,
  Select, MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Avatar,
  Skeleton,
  CircularProgress,
  Snackbar,
  Alert,
  Checkbox,
  Fade,
} from '@mui/material'
import adminService from '../../services/adminService'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

// ── SVG Icons ─────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)
const BlockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const ManageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const roleConfig = {
  ADMIN: { color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  INSTRUCTOR: { color: '#818CF8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
  STUDENT: { color: '#8B949E', bg: 'rgba(139,148,158,0.12)', border: 'rgba(139,148,158,0.2)' },
}
const statusConfig = {
  ACTIVE: { color: '#86EFAC', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
  PENDING: { color: '#FDE68A', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  SUSPENDED: { color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
}

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const cfg = statusConfig[status] ?? statusConfig.PENDING
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', px: '10px', py: '2.5px', borderRadius: '99px', bgcolor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color, letterSpacing: '0.02em' }}>
        {t(`admin.users.status.${status.toLowerCase()}`, { defaultValue: status })}
      </Typography>
    </Box>
  )
}

const RoleBadge = ({ role }) => {
  const { t } = useTranslation();
  const cfg = roleConfig[role] ?? roleConfig.STUDENT
  return (
    <Box sx={{ display: 'inline-flex', px: '10px', py: '2.5px', borderRadius: '99px', bgcolor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color, letterSpacing: '0.04em' }}>
        {t(`admin.users.roles.${role.toLowerCase()}`, { defaultValue: role })}
      </Typography>
    </Box>
  )
}

const headerSx = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-text-sec)',
  borderBottom: '1px solid var(--color-border)',
  py: 2.5,
  bgcolor: 'transparent',
}

const cellSx = {
  borderBottom: '1px solid rgba(48,54,61,0.4)',
  py: 2.25,
  color: 'var(--color-text)',
  fontSize: '0.875rem',
}

const Users = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)

  const [selectedIds, setSelectedIds] = useState([])
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('STUDENT')
  const [statusToChange, setStatusToChange] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [bulkActionType, setBulkActionType] = useState(null)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const { user: currentUser } = useSelector(s => s.auth)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getUsers(page, rowsPerPage, keyword)
      setUsers(data.content)
      setTotalElements(data.totalElements)
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t('admin.users.errors.load_failed'), severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page, rowsPerPage, keyword, t])

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(0)
  }

  const handleStatusChange = async () => {
    setActionLoading(true)
    try {
      if (bulkActionType) {
        // Bulk action
        await Promise.all(selectedIds.map(id => adminService.changeUserStatus(id, statusToChange)))
        setSelectedIds([])
        setBulkActionType(null)
      } else {
        // Single action
        await adminService.changeUserStatus(selectedUser.id, statusToChange)
      }
      setStatusDialogOpen(false)
      fetchUsers()
      setSnackbar({ open: true, message: t('admin.users.messages.status_success'), severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t('admin.users.errors.update_failed'), severity: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRoleChange = async () => {
    setActionLoading(true)
    try {
      await adminService.changeUserRole(selectedUser.id, newRole)
      setRoleDialogOpen(false)
      fetchUsers()
      setSnackbar({ open: true, message: t('admin.users.messages.role_success'), severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t('admin.users.errors.update_failed'), severity: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleExportExcel = () => {
    const token = localStorage.getItem('token')
    fetch(adminService.exportUsersCsvUrl(), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = Object.assign(document.createElement('a'), { href: url, download: 'users_export_admin.xlsx', style: 'display:none' })
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch(() => setSnackbar({ open: true, message: t('admin.users.errors.export_failed'), severity: 'error' }))
  }

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableIds = users.filter(u => u.email !== currentUser.email).map(u => u.id)
      setSelectedIds(selectableIds)
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const initials = (name = '') => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      sx={{ pb: 10, position: 'relative' }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Box className="icon-badge icon-badge--indigo"><UsersIcon /></Box>
            <Typography className="gradient-text" sx={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2.25rem' },
              letterSpacing: '-0.04em',
            }}>
              {t('admin.users.title')}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', ml: 7.5 }}>
            {t('admin.users.count', { count: totalElements })} REGISTERED ACCOUNTS
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportExcel}
          sx={{
            height: 44, borderRadius: '12px', fontWeight: 700, px: 3,
            bgcolor: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            '&:hover': { bgcolor: 'var(--color-surface-2)', borderColor: 'var(--color-border-lt)' }
          }}
        >
          {t('admin.users.export_excel')}
        </Button>
      </Box>

      {/* ── Filter Bar ───────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, px: 2, height: 46, flex: 1, maxWidth: 460,
            borderRadius: '14px', border: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)',
            transition: 'all 0.3s',
            '&:focus-within': { borderColor: 'var(--color-primary)', boxShadow: '0 0 0 4px rgba(99,102,241,0.1)' },
          }}
        >
          <Box sx={{ color: 'var(--color-text-muted)', display: 'flex' }}><SearchIcon /></Box>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('admin.users.search_placeholder')}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--color-text)', fontSize: '0.925rem', fontFamily: 'var(--font-body)',
            }}
          />
        </Box>
      </Box>

      {/* ── User Table ───────────────────────────────────────────── */}
      <Box className="glass-panel" sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...headerSx, width: 50, px: 2 }}>
                  <Checkbox
                    size="small"
                    indeterminate={selectedIds.length > 0 && selectedIds.length < users.filter(u => u.email !== currentUser.email).length}
                    checked={users.length > 0 && selectedIds.length === users.filter(u => u.email !== currentUser.email).length}
                    onChange={toggleSelectAll}
                    sx={{ color: 'var(--color-border)', '&.Mui-checked': { color: 'var(--color-primary)' } }}
                  />
                </TableCell>
                {[
                  t('admin.users.table.user'),
                  t('admin.users.table.role'),
                  t('admin.users.table.status'),
                  t('admin.users.table.joined'),
                  t('common.actions')
                ].map(h => (
                  <TableCell key={h} sx={headerSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j} sx={cellSx}><Skeleton height={24} sx={{ opacity: i === 0 ? 0.3 : 0.1 }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ ...cellSx, textAlign: 'center', py: 10 }}>
                    <Typography sx={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      {t('admin.users.errors.no_users_found')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const isSelected = selectedIds.includes(u.id)
                  const isSelf = u.email === currentUser.email
                  return (
                    <TableRow
                      key={u.id}
                      sx={{
                        bgcolor: isSelected ? 'rgba(99,102,241,0.04)' : 'transparent',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.015)' },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell sx={{ ...cellSx, px: 2 }}>
                        <Checkbox
                          size="small"
                          disabled={isSelf}
                          checked={isSelected}
                          onChange={() => toggleSelect(u.id)}
                          sx={{ color: 'var(--color-border)', '&.Mui-checked': { color: 'var(--color-primary)' } }}
                        />
                      </TableCell>

                      <TableCell sx={cellSx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={u.avatarKey ? `/api/files/download/${u.avatarKey}` : null}
                            sx={{
                              width: 38, height: 38, fontSize: '0.875rem', fontWeight: 800,
                              background: 'linear-gradient(135deg, #6366F1, #22D3EE)', color: 'white',
                              borderRadius: '12px', border: '2px solid var(--color-surface-3)'
                            }}
                          >
                            {initials(u.fullName)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-text)' }}>
                              {u.fullName} {isSelf && <Chip label="YOU" size="small" sx={{ height: 16, fontSize: '0.625rem', bgcolor: 'var(--color-primary)', color: 'white', ml: 1 }} />}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              {u.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={cellSx}><RoleBadge role={u.role} /></TableCell>
                      <TableCell sx={cellSx}><StatusBadge status={u.status} /></TableCell>
                      <TableCell sx={{ ...cellSx, color: 'var(--color-text-sec)', fontSize: '0.8125rem' }}>
                        {new Date(u.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>

                      <TableCell sx={cellSx}>
                        {!isSelf ? (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {u.status !== 'ACTIVE' ? (
                              <Tooltip title={t('admin.users.actions.activate')}>
                                <IconButton
                                  size="small"
                                  onClick={() => { setSelectedUser(u); setStatusToChange('ACTIVE'); setStatusDialogOpen(true) }}
                                  sx={{ color: 'var(--color-success)', '&:hover': { bgcolor: 'rgba(34,197,94,0.1)' } }}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title={t('admin.users.actions.suspend')}>
                                <IconButton
                                  size="small"
                                  onClick={() => { setSelectedUser(u); setStatusToChange('SUSPENDED'); setStatusDialogOpen(true) }}
                                  sx={{ color: 'var(--color-error)', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}
                                >
                                  <BlockIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title={t('admin.users.actions.change_role')}>
                              <IconButton
                                size="small"
                                onClick={() => { setSelectedUser(u); setNewRole(u.role); setRoleDialogOpen(true) }}
                                sx={{ color: 'var(--color-primary-lt)', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}
                              >
                                <ManageIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Protected</Typography>}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{
              color: 'var(--color-text-muted)',
              border: 'none',
              '& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.75rem', fontWeight: 600 },
              '& .MuiTablePagination-select': { color: 'var(--color-text)' },
            }}
          />
        </Box>
      </Box>

      {/* ── Bulk Action FAB ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <Box
            component={motion.div}
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            sx={{
              position: 'fixed', bottom: 40, left: '50%',
              bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-primary)',
              borderRadius: '20px', px: 4, py: 2,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5), var(--shadow-glow-primary)',
              display: 'flex', alignItems: 'center', gap: 4, zIndex: 1000
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-primary-lt)' }}>
                {selectedIds.length}
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {t('common.actions')}
              </Typography>
            </Box>

            <Box sx={{ width: 1, height: 24, bgcolor: 'var(--color-border)' }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined" color="success" size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => { setBulkActionType('STATUS'); setStatusToChange('ACTIVE'); setStatusDialogOpen(true) }}
                sx={{ borderRadius: '10px', fontWeight: 700, borderColor: 'rgba(34,197,94,0.3)', bgcolor: 'rgba(34,197,94,0.05)', '&:hover': { bgcolor: 'rgba(34,197,94,0.15)' } }}
              >
                {t('admin.users.actions.activate')}
              </Button>
              <Button
                variant="outlined" color="error" size="small"
                startIcon={<BlockIcon />}
                onClick={() => { setBulkActionType('STATUS'); setStatusToChange('SUSPENDED'); setStatusDialogOpen(true) }}
                sx={{ borderRadius: '10px', fontWeight: 700, borderColor: 'rgba(239,68,68,0.3)', bgcolor: 'rgba(239,68,68,0.05)', '&:hover': { bgcolor: 'rgba(239,68,68,0.15)' } }}
              >
                {t('admin.users.actions.suspend')}
              </Button>
            </Box>

            <IconButton size="small" onClick={() => setSelectedIds([])} sx={{ color: 'var(--color-text-muted)', ml: 1 }}>
              <XIcon />
            </IconButton>
          </Box>
        )}
      </AnimatePresence>

      {/* ── Dialogs ──────────────────────────────────────────────── */}
      {/* Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        PaperProps={{ className: 'glass-panel', sx: { bgcolor: 'var(--color-surface-2)', minWidth: 400, borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-text)', pb: 1 }}>
          {t('admin.users.dialogs.role_title')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontSize: '0.925rem', color: 'var(--color-text-sec)', mb: 3 }}>
            Updating role for <strong style={{ color: 'var(--color-text)' }}>{selectedUser?.fullName}</strong>
          </Typography>
          <Select
            fullWidth
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="modern-input"
            sx={{
              bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
            }}
          >
            {['STUDENT', 'INSTRUCTOR', 'ADMIN'].map(r => (
              <MenuItem key={r} value={r} sx={{ fontSize: '0.875rem', py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: r === 'ADMIN' ? '#EF4444' : r === 'INSTRUCTOR' ? '#6366F1' : '#6E7681' }} />
                  {t(`admin.users.roles.${r.toLowerCase()}`)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button onClick={() => setRoleDialogOpen(false)} sx={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleRoleChange} sx={{ px: 3, borderRadius: '10px', fontWeight: 700, background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dk))' }}>
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Dialog (Used for both single/bulk) */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => { setStatusDialogOpen(false); setBulkActionType(null); }}
        PaperProps={{ className: 'glass-panel', sx: { bgcolor: 'var(--color-surface-2)', minWidth: 400, borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-text)', pb: 1 }}>
          {t('admin.users.dialogs.status_title')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontSize: '0.925rem', color: 'var(--color-text-sec)', mb: 1, lineHeight: 1.6 }}>
            {bulkActionType ? (
              <span>
                Are you sure you want to change status of <strong style={{ color: 'var(--color-primary-lt)' }}>{selectedIds.length} users</strong> to {' '}
                <strong style={{ color: statusToChange === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-error)' }}>{statusToChange}</strong>?
              </span>
            ) : (
              <span>
                Update status for <strong style={{ color: 'var(--color-text)' }}>{selectedUser?.fullName}</strong> to {' '}
                <strong style={{ color: statusToChange === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-error)' }}>{statusToChange}</strong>?
              </span>
            )}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            This action will take effect immediately.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleStatusChange}
            sx={{
              px: 3, borderRadius: '10px', fontWeight: 700,
              bgcolor: statusToChange === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-error)',
              '&:hover': { bgcolor: statusToChange === 'ACTIVE' ? '#15803D' : '#B91C1C' }
            }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '12px', fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: 300 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Users
