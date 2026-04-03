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
} from '@mui/material'
import adminService from '../../services/adminService'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

// ── SVG Icons ─────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const BlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const ManageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const roleConfig = {
  ADMIN:      { color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
  INSTRUCTOR: { color: '#818CF8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
  STUDENT:    { color: '#8B949E', bg: 'rgba(139,148,158,0.12)',border: 'rgba(139,148,158,0.2)' },
}
const statusConfig = {
  ACTIVE:    { color: '#86EFAC', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)' },
  PENDING:   { color: '#FDE68A', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  SUSPENDED: { color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
}

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const cfg = statusConfig[status] ?? statusConfig.PENDING
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px', px: '9px', py: '2px', borderRadius: '99px', bgcolor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: cfg.color, letterSpacing: '0.04em' }}>
        {t(`admin.users.status.${status.toLowerCase()}`, { defaultValue: status })}
      </Typography>
    </Box>
  )
}

const RoleBadge = ({ role }) => {
  const { t } = useTranslation();
  const cfg = roleConfig[role] ?? roleConfig.STUDENT
  return (
    <Box sx={{ display: 'inline-flex', px: '9px', py: '2px', borderRadius: '99px', bgcolor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: cfg.color, letterSpacing: '0.04em' }}>
        {t(`admin.users.roles.${role.toLowerCase()}`, { defaultValue: role })}
      </Typography>
    </Box>
  )
}

const headerSx = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  borderBottom: '1px solid var(--color-border)',
  py: 1.5,
  bgcolor: 'var(--color-surface)',
}

const cellSx = {
  borderBottom: '1px solid rgba(48,54,61,0.5)',
  py: 1.5,
  color: 'var(--color-text)',
  fontSize: '0.875rem',
}

const Users = () => {
  const { t, i18n } = useTranslation();
  const [users,         setUsers]         = useState([])
  const [page,          setPage]          = useState(0)
  const [rowsPerPage,   setRowsPerPage]   = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [keyword,       setKeyword]       = useState('')
  const [searchInput,   setSearchInput]   = useState('')
  const [loading,       setLoading]       = useState(false)

  const [roleDialogOpen,   setRoleDialogOpen]   = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedUser,     setSelectedUser]     = useState(null)
  const [newRole,          setNewRole]          = useState('STUDENT')
  const [statusToChange,   setStatusToChange]   = useState(null)
  const [actionLoading,    setActionLoading]    = useState(false)

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
    setPage(page === 0 ? 0 : 0) // Force re-fetch by keeping 0 if already 0
    if (page === 0) fetchUsers();
  }

  const handleStatusChange = async () => {
    setActionLoading(true)
    try {
      await adminService.changeUserStatus(selectedUser.id, statusToChange)
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
        const a   = Object.assign(document.createElement('a'), { href: url, download: 'users_export.xlsx', style: 'display:none' })
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch(() => setSnackbar({ open: true, message: t('admin.users.errors.export_failed'), severity: 'error' }))
  }

  const initials = (name = '') => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ pb: 6 }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ color: 'var(--color-primary-lt)' }}><UsersIcon /></Box>
            <Typography sx={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2rem' },
              color: 'var(--color-text)', letterSpacing: '-0.03em',
            }}>
              {t('admin.users.title')}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {t('admin.users.count', { count: totalElements })}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportExcel}
          sx={{
            height: 38, borderRadius: '9px', fontSize: '0.875rem',
            borderColor: 'var(--color-border)', color: 'var(--color-text-sec)',
            cursor: 'pointer',
            '&:hover': { borderColor: 'var(--color-border-lt)', color: 'var(--color-text)', bgcolor: 'rgba(240,246,252,0.04)' },
          }}
        >
          {t('admin.users.export_excel')}
        </Button>
      </Box>

      {/* ── Search ───────────────────────────────────────────────── */}
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: 'flex', gap: 1.5, mb: 3 }}
      >
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 1.5, height: 40, flex: '1 1 320px', maxWidth: 420,
            borderRadius: '10px', border: '1px solid var(--color-border)', bgcolor: 'rgba(33,38,45,0.6)',
            transition: 'all 0.2s',
            '&:focus-within': { borderColor: 'var(--color-primary)', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' },
          }}
        >
          <Box sx={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <SearchIcon />
          </Box>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('admin.users.search_placeholder')}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--color-text)', fontSize: '0.875rem', fontFamily: 'var(--font-body)',
            }}
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          sx={{
            height: 40, borderRadius: '10px', fontWeight: 600, px: 2.5, fontSize: '0.875rem', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)' },
          }}
        >
          {t('common.search')}
        </Button>
      </Box>

      {/* ── Table ────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  t('admin.users.table.user'),
                  t('admin.users.table.email'),
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
                      <TableCell key={j} sx={cellSx}>
                        <Skeleton height={20} sx={{ bgcolor: 'rgba(33,38,45,0.8)' }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ ...cellSx, textAlign: 'center', py: 6, color: 'var(--color-text-muted)' }}>
                    {t('admin.users.errors.no_users_found')}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow
                    key={u.id}
                    sx={{
                      '&:hover': { bgcolor: 'rgba(240,246,252,0.02)' },
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <TableCell sx={cellSx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={u.avatarKey ? `/api/files/download/${u.avatarKey}` : null}
                          sx={{
                            width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700,
                            background: 'linear-gradient(135deg, #6366F1, #22D3EE)', color: 'white',
                            borderRadius: '8px',
                          }}
                        >
                          {initials(u.fullName)}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                          {u.fullName}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ ...cellSx, color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {u.email}
                    </TableCell>

                    <TableCell sx={cellSx}>
                      <RoleBadge role={u.role} />
                    </TableCell>

                    <TableCell sx={cellSx}>
                      <StatusBadge status={u.status} />
                    </TableCell>

                    <TableCell sx={{ ...cellSx, color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {new Date(u.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>

                    <TableCell sx={cellSx}>
                      {currentUser?.role === 'ADMIN' && u.email !== currentUser.email ? (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {u.status !== 'ACTIVE' && (
                            <Tooltip title={t('admin.users.actions.activate')}>
                              <IconButton
                                size="small"
                                onClick={() => { setSelectedUser(u); setStatusToChange('ACTIVE'); setStatusDialogOpen(true) }}
                                sx={{ color: '#22C55E', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(34,197,94,0.1)' }, borderRadius: '7px' }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {u.status === 'ACTIVE' && (
                            <Tooltip title={t('admin.users.actions.suspend')}>
                              <IconButton
                                size="small"
                                onClick={() => { setSelectedUser(u); setStatusToChange('SUSPENDED'); setStatusDialogOpen(true) }}
                                sx={{ color: '#EF4444', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' }, borderRadius: '7px' }}
                              >
                                <BlockIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={t('admin.users.actions.change_role')}>
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedUser(u); setNewRole(u.role); setRoleDialogOpen(true) }}
                              sx={{ color: '#818CF8', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' }, borderRadius: '7px' }}
                            >
                              <ManageIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ borderTop: '1px solid var(--color-border)' }}>
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              color: 'var(--color-text-muted)',
              '& .MuiTablePagination-select': { color: 'var(--color-text)' },
              '& .MuiTablePagination-displayedRows': { color: 'var(--color-text-muted)' },
              '& .MuiIconButton-root': { color: 'var(--color-text-muted)', cursor: 'pointer', '&.Mui-disabled': { opacity: 0.3 }, '&:hover': { color: 'var(--color-text)', bgcolor: 'rgba(99,102,241,0.08)' } },
            }}
          />
        </Box>
      </Box>

      {/* ── Role Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '14px', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', minWidth: 360 } }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)', pb: 1 }}>
          {t('admin.users.dialogs.role_title')}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', mb: 2 }}>
            {t('admin.users.dialogs.role_desc')} <strong style={{ color: 'var(--color-text)' }}>{selectedUser?.fullName}</strong>
          </Typography>
          <Select
            fullWidth
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            sx={{
              bgcolor: 'rgba(33,38,45,0.6)', borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border-lt)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-primary)' },
            }}
          >
            {['STUDENT', 'INSTRUCTOR', 'ADMIN'].map(r => (
              <MenuItem key={r} value={r} sx={{ fontSize: '0.875rem' }}>{t(`admin.users.roles.${r.toLowerCase()}`)}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setRoleDialogOpen(false)} sx={{ borderRadius: '8px', color: 'var(--color-text-sec)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(240,246,252,0.04)' } }}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" onClick={handleRoleChange} disabled={actionLoading} sx={{ borderRadius: '8px', fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', '&:hover': { background: 'linear-gradient(135deg, #818CF8, #6366F1)' } }}>
            {actionLoading ? <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.7)' }} /> : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Status Dialog ────────────────────────────────────────── */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '14px', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', minWidth: 360 } }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)', pb: 1 }}>
          {t('admin.users.dialogs.status_title')}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {t('admin.users.dialogs.status_desc1')} {' '}
            <strong style={{ color: 'var(--color-text)' }}>{selectedUser?.fullName}</strong>{' '}
            {t('admin.users.dialogs.status_desc2')} {' '}
            <strong style={{ color: statusToChange === 'ACTIVE' ? '#86EFAC' : '#FCA5A5' }}>
              {statusToChange ? t(`admin.users.status.${statusToChange.toLowerCase()}`) : ''}
            </strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ borderRadius: '8px', color: 'var(--color-text-sec)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(240,246,252,0.04)' } }}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusChange}
            disabled={actionLoading}
            sx={{
              borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
              bgcolor: statusToChange === 'ACTIVE' ? '#16A34A' : '#DC2626',
              '&:hover': { bgcolor: statusToChange === 'ACTIVE' ? '#15803D' : '#B91C1C' },
              '&.Mui-disabled': { bgcolor: 'rgba(99,102,241,0.25)', color: 'rgba(255,255,255,0.3)' },
            }}
          >
            {actionLoading ? <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.7)' }} /> : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ borderRadius: '10px', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Users
