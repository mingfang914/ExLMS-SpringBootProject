import React from 'react';
import { IconButton, Tooltip, Menu, MenuItem, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageToggle = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(l => l.code === (i18n.language?.split('-')[0] || 'vi')) || languages[0];

  return (
    <>
      <Tooltip title={t('common.change_language') || 'Đổi ngôn ngữ'}>
        <IconButton
          onClick={handleClick}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            '&:hover': {
              bgcolor: 'var(--color-surface-3)',
              borderColor: 'var(--color-primary)',
            },
            transition: 'all 0.2s',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLanguage.code}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}
            >
              {currentLanguage.flag}
            </motion.div>
          </AnimatePresence>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '12px',
            bgcolor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            minWidth: 150,
            overflow: 'hidden',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid var(--color-border)', mb: 0.5 }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>
            {t('common.language') || 'Ngôn ngữ'}
          </Typography>
        </Box>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            selected={currentLanguage.code === lang.code}
            sx={{
              py: 1,
              px: 2,
              mx: 0.5,
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: currentLanguage.code === lang.code ? 'var(--color-primary)' : 'var(--color-text)',
              '&.Mui-selected': {
                bgcolor: 'rgba(99,102,241,0.08)',
                '&:hover': { bgcolor: 'rgba(99,102,241,0.12)' },
              },
              '&:hover': {
                bgcolor: 'var(--color-surface-2)',
              }
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{lang.flag}</span>
            {lang.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageToggle;
