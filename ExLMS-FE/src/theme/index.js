import { createTheme, alpha } from '@mui/material/styles'

// ─── Shared Brand Colors (same in both modes) ────────────────────
export const brand = {
  primary:   '#6366F1',
  primaryDk: '#4F46E5',
  primaryLt: '#818CF8',
  accent:    '#22D3EE',
  accentDk:  '#06B6D4',
  success:   '#22C55E',
  warning:   '#F59E0B',
  error:     '#EF4444',
}

// ─── Dark Token Set ───────────────────────────────────────────────
const darkTokens = {
  ...brand,
  bg:           '#02040A',
  surface:      '#0D1117',
  surface2:     '#161B22',
  surface3:     '#21262D',
  border:       '#30363D',
  borderLt:     '#484F57',
  textPrimary:  '#F0F6FC',
  textSec:      '#8B949E',
  textMuted:    '#6E7681',
}

// ─── Light Token Set ──────────────────────────────────────────────
const lightTokens = {
  ...brand,
  bg:           '#F5F7FA',
  surface:      '#FFFFFF',
  surface2:     '#F0F4F8',
  surface3:     '#E2E8F0',
  border:       '#CBD5E1',
  borderLt:     '#94A3B8',
  textPrimary:  '#0F172A',
  textSec:      '#475569',
  textMuted:    '#94A3B8',
}

// ─── Factory ──────────────────────────────────────────────────────
export const buildTheme = (mode = 'dark') => {
  const t = mode === 'dark' ? darkTokens : lightTokens

  return createTheme({
    palette: {
      mode,
      primary:   { main: t.primary,   light: t.primaryLt, dark: t.primaryDk, contrastText: '#fff' },
      secondary: { main: t.accent,    light: '#67E8F9',   dark: t.accentDk,  contrastText: mode === 'dark' ? '#0D1117' : '#fff' },
      success:   { main: t.success  },
      warning:   { main: t.warning  },
      error:     { main: t.error    },
      background: { default: t.bg, paper: t.surface },
      text:       { primary: t.textPrimary, secondary: t.textSec, disabled: t.textMuted },
      divider:    t.border,
    },

    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem',   fontWeight: 800, letterSpacing: '-0.03em',  lineHeight: 1.2 },
      h2: { fontSize: '2rem',     fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25 },
      h3: { fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.02em',  lineHeight: 1.3 },
      h4: { fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.015em' },
      h5: { fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontSize: '1rem',     fontWeight: 600, letterSpacing: '-0.005em' },
      subtitle1: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.6 },
      subtitle2: { fontSize: '0.875rem',  fontWeight: 500, color: t.textSec },
      body1:     { fontSize: '0.9375rem', lineHeight: 1.65, color: t.textPrimary },
      body2:     { fontSize: '0.875rem',  lineHeight: 1.6,  color: t.textSec },
      caption:   { fontSize: '0.75rem',   lineHeight: 1.5,  color: t.textMuted },
      button:    { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
      overline:  { textTransform: 'none', fontWeight: 600, fontSize: '0.6875rem', letterSpacing: '0.08em' },
    },

    shape: { borderRadius: 10 },

    shadows: [
      'none',
      `0 1px 2px rgba(0,0,0,${mode === 'dark' ? 0.4 : 0.06})`,
      `0 2px 4px rgba(0,0,0,${mode === 'dark' ? 0.4 : 0.07})`,
      `0 4px 8px rgba(0,0,0,${mode === 'dark' ? 0.5 : 0.08})`,
      `0 6px 12px rgba(0,0,0,${mode === 'dark' ? 0.5 : 0.08})`,
      `0 8px 16px rgba(0,0,0,${mode === 'dark' ? 0.5 : 0.09})`,
      `0 12px 24px rgba(0,0,0,${mode === 'dark' ? 0.55 : 0.1})`,
      `0 16px 32px rgba(0,0,0,${mode === 'dark' ? 0.55 : 0.1})`,
      `0 20px 40px rgba(0,0,0,${mode === 'dark' ? 0.6 : 0.11})`,
      `0 24px 48px rgba(0,0,0,${mode === 'dark' ? 0.6 : 0.12})`,
      `0 28px 56px rgba(0,0,0,${mode === 'dark' ? 0.65 : 0.13})`,
      `0 32px 64px rgba(0,0,0,${mode === 'dark' ? 0.65 : 0.13})`,
      `0 36px 72px rgba(0,0,0,${mode === 'dark' ? 0.7 : 0.14})`,
      `0 40px 80px rgba(0,0,0,${mode === 'dark' ? 0.7 : 0.14})`,
      `0 44px 88px rgba(0,0,0,${mode === 'dark' ? 0.7 : 0.15})`,
      `0 48px 96px rgba(0,0,0,${mode === 'dark' ? 0.75 : 0.15})`,
      `0 52px 104px rgba(0,0,0,${mode === 'dark' ? 0.75 : 0.16})`,
      `0 56px 112px rgba(0,0,0,${mode === 'dark' ? 0.75 : 0.16})`,
      `0 60px 120px rgba(0,0,0,${mode === 'dark' ? 0.8 : 0.17})`,
      `0 64px 128px rgba(0,0,0,${mode === 'dark' ? 0.8 : 0.17})`,
      `0 68px 136px rgba(0,0,0,${mode === 'dark' ? 0.8 : 0.18})`,
      `0 72px 144px rgba(0,0,0,${mode === 'dark' ? 0.8 : 0.18})`,
      `0 76px 152px rgba(0,0,0,${mode === 'dark' ? 0.8 : 0.19})`,
      `0 80px 160px rgba(0,0,0,${mode === 'dark' ? 0.85 : 0.2})`,
      `0 0 0 rgba(0,0,0,0)`,
    ],

    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
          body {
            margin: 0;
            background: ${t.bg};
            color: ${t.textPrimary};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 99px; }
          ::-webkit-scrollbar-thumb:hover { background: ${t.borderLt}; }
          ::selection { background: ${alpha(t.primary, 0.35)}; }
          a { color: ${t.primaryLt}; text-decoration: none; transition: color 0.2s; }
          a:hover { color: ${t.accent}; }
        `,
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark'
              ? 'rgba(13, 17, 23, 0.88)'
              : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${t.border}`,
            boxShadow: 'none',
            color: t.textPrimary,
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: t.surface,
            borderRight: `1px solid ${t.border}`,
            backgroundImage: 'none',
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface2,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            backgroundImage: 'none',
            boxShadow: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            '&:hover': {
              borderColor: t.borderLt,
              boxShadow: `0 0 0 1px ${alpha(t.primary, 0.1)}, 0 8px 24px rgba(0,0,0,${mode === 'dark' ? 0.4 : 0.1})`,
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: t.surface,
            border: `1px solid ${t.border}`,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '9px 18px',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { boxShadow: 'none' },
          },
          contained: {
            background: `linear-gradient(135deg, ${t.primary} 0%, ${t.primaryDk} 100%)`,
            color: '#fff',
            '&:hover': {
              background: `linear-gradient(135deg, ${t.primaryLt} 0%, ${t.primary} 100%)`,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(t.primary, 0.4)}`,
            },
            '&:active': { transform: 'translateY(0)' },
          },
          outlined: {
            borderColor: t.border,
            color: t.textPrimary,
            '&:hover': {
              borderColor: t.primary,
              backgroundColor: alpha(t.primary, 0.08),
            },
          },
          text: {
            color: t.textSec,
            '&:hover': {
              backgroundColor: alpha(t.primary, 0.08),
              color: t.textPrimary,
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': { backgroundColor: alpha(t.primary, 0.1) },
          },
        },
      },

      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark'
              ? alpha(t.surface3, 0.6)
              : '#FFFFFF',
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: t.border,
              transition: 'border-color 0.2s',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.borderLt },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: t.primary,
              borderWidth: 1,
            },
            '&.Mui-focused': { 
              boxShadow: `0 0 0 3px ${alpha(t.primary, 0.15)}`,
              backgroundColor: mode === 'dark' ? alpha(t.surface3, 0.8) : '#FFFFFF',
            },
            '&.Mui-disabled': {
              backgroundColor: mode === 'dark' ? alpha(t.surface, 0.5) : '#F1F5F9',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border },
            },
          },
          input: {
            color: t.textPrimary,
            fontWeight: 500,
            '&::placeholder': { 
              color: t.textMuted, 
              opacity: 1,
            },
            '&.Mui-disabled': {
              WebkitTextFillColor: mode === 'dark' ? t.textMuted : t.textSec,
            }
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: t.textSec,
            '&.Mui-focused': { color: t.primaryLt },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 500, fontSize: '0.75rem' },
          filled: {
            backgroundColor: t.surface3,
            '&:hover': { backgroundColor: alpha(t.primary, 0.15) },
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&.Mui-selected': {
              backgroundColor: alpha(t.primary, 0.15),
              color: t.primaryLt,
              '&:hover': { backgroundColor: alpha(t.primary, 0.2) },
            },
            '&:hover': { backgroundColor: alpha(t.primary, 0.08) },
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(t.primary, 0.2),
            color: t.primaryLt,
            fontWeight: 700,
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: t.surface3,
            border: `1px solid ${t.border}`,
            color: t.textPrimary,
            fontSize: '0.8125rem',
            borderRadius: 6,
            boxShadow: `0 4px 12px rgba(0,0,0,${mode === 'dark' ? 0.5 : 0.15})`,
          },
          arrow: { color: t.surface3 },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: t.surface2,
            border: `1px solid ${t.border}`,
            boxShadow: `0 16px 40px rgba(0,0,0,${mode === 'dark' ? 0.6 : 0.2})`,
            borderRadius: 10,
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            margin: '2px 6px',
            padding: '8px 10px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            '&:hover': { backgroundColor: alpha(t.primary, 0.1) },
          },
        },
      },

      MuiDivider: {
        styleOverrides: { root: { borderColor: t.border } },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 99, backgroundColor: t.surface3, height: 6 },
          bar: {
            borderRadius: 99,
            background: `linear-gradient(90deg, ${t.primary}, ${t.accent})`,
          },
        },
      },

      MuiCircularProgress: {
        styleOverrides: { root: { color: t.primary } },
      },

      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface3,
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${alpha(t.borderLt, 0.3)}, transparent)`,
            },
          },
        },
      },

      MuiBadge: {
        styleOverrides: {
          badge: { fontWeight: 700, fontSize: '0.6875rem' },
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: {
            '& .MuiTabs-indicator': {
              background: `linear-gradient(90deg, ${t.primary}, ${t.accent})`,
              height: 2,
              borderRadius: 1,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            color: t.textSec,
            '&.Mui-selected': { color: t.textPrimary, fontWeight: 600 },
            cursor: 'pointer',
            transition: 'color 0.2s',
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8, border: '1px solid' },
          standardError:   { backgroundColor: alpha(t.error,   0.1), borderColor: alpha(t.error,   0.25), color: '#FCA5A5' },
          standardSuccess: { backgroundColor: alpha(t.success, 0.1), borderColor: alpha(t.success, 0.25), color: '#86EFAC' },
          standardWarning: { backgroundColor: alpha(t.warning, 0.1), borderColor: alpha(t.warning, 0.25), color: '#FDE68A' },
          standardInfo:    { backgroundColor: alpha(t.accent,  0.1), borderColor: alpha(t.accent,  0.25), color: '#67E8F9' },
        },
      },

      MuiTable: {
        styleOverrides: { root: { borderCollapse: 'separate', borderSpacing: 0 } },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: t.surface,
              color: t.textMuted,
              fontWeight: 700,
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderBottom: `1px solid ${t.border}`,
              padding: '12px 16px',
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              transition: 'background-color 0.15s',
              '&:hover': {
                backgroundColor: mode === 'dark'
                  ? 'rgba(240,246,252,0.02)'
                  : 'rgba(99,102,241,0.04)',
              },
            },
            '& .MuiTableCell-body': {
              borderBottom: `1px solid ${alpha(t.border, 0.7)}`,
              color: t.textPrimary,
              fontSize: '0.875rem',
              padding: '12px 16px',
            },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: { color: t.textMuted, fontSize: '0.8125rem' },
          select: { color: t.textPrimary },
          displayedRows: { color: t.textMuted },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: t.surface2,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            boxShadow: `0 24px 60px rgba(0,0,0,${mode === 'dark' ? 0.7 : 0.25})`,
            backgroundImage: 'none',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: t.textPrimary,
            paddingBottom: 8,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: { root: { color: t.textSec, paddingTop: '8px !important' } },
      },
      MuiDialogActions: {
        styleOverrides: { root: { padding: '16px 24px 20px', gap: 8 } },
      },

      MuiToggleButton: {
        styleOverrides: {
          root: {
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            color: t.textSec,
            fontWeight: 500,
            fontSize: '0.875rem',
            textTransform: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&.Mui-selected': {
              backgroundColor: alpha(t.primary, 0.12),
              borderColor: alpha(t.primary, 0.4),
              color: t.primaryLt,
              '&:hover': { backgroundColor: alpha(t.primary, 0.18) },
            },
            '&:hover': { backgroundColor: alpha(t.primary, 0.06) },
          },
        },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: { color: t.textMuted, fontSize: '0.75rem', marginTop: 4 },
        },
      },

      MuiSelect: {
        styleOverrides: {
          icon: { color: t.textMuted },
        },
      },
    },
  })
}

// Legacy default export for backward-compat (dark mode)
const theme = buildTheme('dark')
export default theme
export { darkTokens as tokens, lightTokens }
