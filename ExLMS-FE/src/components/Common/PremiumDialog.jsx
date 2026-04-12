import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  alpha,
  useTheme
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const iconMap = {
  success: { icon: SuccessIcon, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  error: { icon: ErrorIcon, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  warning: { icon: WarningIcon, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  info: { icon: InfoIcon, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  confirm: { icon: HelpIcon, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' }
}

const PremiumDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info', 
  confirmText, 
  cancelText,
  showCancel = true
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { t } = useTranslation()
  const themeStyles = iconMap[type] || iconMap.info
  const IconComponent = themeStyles.icon

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        sx: {
          borderRadius: '24px',
          background: isDark ? 'rgba(13,17,23,0.8)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.15)',
          boxShadow: isDark 
            ? `0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)`
            : `0 24px 48px -12px rgba(99, 102, 241, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.05)`,
          overflow: 'hidden'
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            background: isDark ? 'rgba(2, 4, 10, 0.4)' : 'rgba(255,255,255,0.2)'
          }
        }
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 5, pb: 3, px: 4 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Box
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: themeStyles.bg,
              color: themeStyles.color,
              boxShadow: `0 12px 24px -8px ${alpha(themeStyles.color, 0.4)}`
            }}
          >
            <IconComponent sx={{ fontSize: 40 }} />
          </Box>

          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={800} sx={{ fontFamily: 'var(--font-heading)', color: isDark ? 'white' : 'text.primary' }}>
              {title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {message}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, pt: 0, justifyContent: 'center', gap: 2 }}>
        {showCancel && (
          <Button
            onClick={onClose}
            fullWidth
            sx={{
              borderRadius: '14px',
              py: 1.5,
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                color: 'text.primary',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            {cancelText || t('common.cancel')}
          </Button>
        )}
        <Button
          onClick={onConfirm}
          variant="contained"
          fullWidth
          sx={{
            borderRadius: '14px',
            py: 1.5,
            fontWeight: 800,
            textTransform: 'none',
            background: type === 'error' 
              ? 'linear-gradient(135deg, #EF4444, #B91C1C)'
              : type === 'warning'
              ? 'linear-gradient(135deg, #F59E0B, #D97706)'
              : 'linear-gradient(135deg, #6366F1, #4F46E5)',
            boxShadow: `0 8px 20px -6px ${alpha(themeStyles.color, 0.5)}`,
            '&:hover': {
                filter: 'brightness(1.1)',
                transform: 'translateY(-1px)',
                boxShadow: `0 12px 24px -6px ${alpha(themeStyles.color, 0.6)}`,
            },
            transition: 'all 0.2s'
          }}
        >
          {confirmText || (type === 'confirm' ? t('common.confirm') : t('common.close'))}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PremiumDialog
