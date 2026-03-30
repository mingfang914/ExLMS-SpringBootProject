import { createTheme, alpha } from '@mui/material/styles'

// ─── Design Tokens ───────────────────────────────────────────────
const tokens = {
  // Primary brand
  primary:   '#6366F1', // Indigo-500
  primaryDk: '#4F46E5', // Indigo-600
  primaryLt: '#818CF8', // Indigo-400
  // Accent / CTA
  accent:    '#22D3EE', // Cyan-400
  accentDk:  '#06B6D4', // Cyan-500
  // Status
  success:   '#22C55E', // Green-500
  warning:   '#F59E0B', // Amber-500
  error:     '#EF4444', // Red-500
  // Neutral (dark OLED)
  bg:        '#02040A', // near-black
  surface:   '#0D1117', // GitHub-dark style
  surface2:  '#161B22',
  surface3:  '#21262D',
  border:    '#30363D',
  borderLt:  '#484F57',
  // Text
  textPrimary:   '#F0F6FC',
  textSecondary: '#8B949E',
  textMuted:     '#6E7681',
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main:         tokens.primary,
      light:        tokens.primaryLt,
      dark:         tokens.primaryDk,
      contrastText: '#ffffff',
    },
    secondary: {
      main:         tokens.accent,
      light:        '#67E8F9',
      dark:         tokens.accentDk,
      contrastText: '#0D1117',
    },
    success:  { main: tokens.success },
    warning:  { main: tokens.warning },
    error:    { main: tokens.error },
    background: {
      default: tokens.bg,
      paper:   tokens.surface,
    },
    text: {
      primary:   tokens.textPrimary,
      secondary: tokens.textSecondary,
      disabled:  tokens.textMuted,
    },
    divider: tokens.border,
  },

  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem',  fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 },
    h2: { fontSize: '2rem',    fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25 },
    h3: { fontSize: '1.625rem',fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
    h4: { fontSize: '1.375rem',fontWeight: 600, letterSpacing: '-0.015em' },
    h5: { fontSize: '1.125rem',fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontSize: '1rem',    fontWeight: 600, letterSpacing: '-0.005em' },
    subtitle1: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.6 },
    subtitle2: { fontSize: '0.875rem',  fontWeight: 500, color: tokens.textSecondary },
    body1: { fontSize: '0.9375rem', lineHeight: 1.65, color: tokens.textPrimary },
    body2: { fontSize: '0.875rem',  lineHeight: 1.6, color: tokens.textSecondary },
    caption: { fontSize: '0.75rem', lineHeight: 1.5, color: tokens.textMuted },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    overline: { textTransform: 'none', fontWeight: 600, fontSize: '0.6875rem', letterSpacing: '0.08em' },
  },

  shape: { borderRadius: 10 },

  shadows: [
    'none',
    `0 1px 2px rgba(0,0,0,0.4)`,
    `0 2px 4px rgba(0,0,0,0.4)`,
    `0 4px 8px rgba(0,0,0,0.5)`,
    `0 6px 12px rgba(0,0,0,0.5)`,
    `0 8px 16px rgba(0,0,0,0.5)`,
    `0 12px 24px rgba(0,0,0,0.55)`,
    `0 16px 32px rgba(0,0,0,0.55)`,
    `0 20px 40px rgba(0,0,0,0.6)`,
    `0 24px 48px rgba(0,0,0,0.6)`,
    `0 28px 56px rgba(0,0,0,0.65)`,
    `0 32px 64px rgba(0,0,0,0.65)`,
    `0 36px 72px rgba(0,0,0,0.7)`,
    `0 40px 80px rgba(0,0,0,0.7)`,
    `0 44px 88px rgba(0,0,0,0.7)`,
    `0 48px 96px rgba(0,0,0,0.75)`,
    `0 52px 104px rgba(0,0,0,0.75)`,
    `0 56px 112px rgba(0,0,0,0.75)`,
    `0 60px 120px rgba(0,0,0,0.8)`,
    `0 64px 128px rgba(0,0,0,0.8)`,
    `0 68px 136px rgba(0,0,0,0.8)`,
    `0 72px 144px rgba(0,0,0,0.8)`,
    `0 76px 152px rgba(0,0,0,0.8)`,
    `0 80px 160px rgba(0,0,0,0.85)`,
    `0 0 0 rgba(0,0,0,0)`,
  ],

  components: {
    // ── Global CssBaseline ──────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        body {
          margin: 0;
          background: ${tokens.bg};
          color: ${tokens.textPrimary};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${tokens.border}; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: ${tokens.borderLt}; }

        ::selection { background: ${alpha(tokens.primary, 0.35)}; }

        a { color: ${tokens.primaryLt}; text-decoration: none; transition: color 0.2s; }
        a:hover { color: ${tokens.accent}; }
      `,
    },

    // ── AppBar ──────────────────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(tokens.surface, 0.85),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${tokens.border}`,
          boxShadow: 'none',
          color: tokens.textPrimary,
        },
      },
    },

    // ── Drawer / Sidebar ─────────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surface,
          borderRight: `1px solid ${tokens.border}`,
          backgroundImage: 'none',
        },
      },
    },

    // ── Card ─────────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface2,
          border: `1px solid ${tokens.border}`,
          borderRadius: 12,
          backgroundImage: 'none',
          boxShadow: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:hover': {
            borderColor: tokens.borderLt,
            boxShadow: `0 0 0 1px ${alpha(tokens.primary, 0.1)}, 0 8px 24px rgba(0,0,0,0.4)`,
          },
        },
      },
    },

    // ── Paper ─────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
        },
        elevation3: {
          boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
        },
      },
    },

    // ── Button ────────────────────────────────────────────────────────────
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
          background: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.primaryDk} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${tokens.primaryLt} 0%, ${tokens.primary} 100%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(tokens.primary, 0.4)}`,
          },
          '&:active': { transform: 'translateY(0)' },
        },
        outlined: {
          borderColor: tokens.border,
          color: tokens.textPrimary,
          '&:hover': {
            borderColor: tokens.primary,
            backgroundColor: alpha(tokens.primary, 0.08),
          },
        },
        text: {
          color: tokens.textSecondary,
          '&:hover': {
            backgroundColor: alpha(tokens.primary, 0.08),
            color: tokens.textPrimary,
          },
        },
      },
    },

    // ── IconButton ────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: alpha(tokens.primary, 0.1),
          },
        },
      },
    },

    // ── TextField ─────────────────────────────────────────────────────────
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(tokens.surface3, 0.6),
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.border,
            transition: 'border-color 0.2s',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.borderLt,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.primary,
            borderWidth: 1,
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(tokens.primary, 0.15)}`,
          },
        },
        input: {
          color: tokens.textPrimary,
          '&::placeholder': { color: tokens.textMuted, opacity: 1 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: tokens.textSecondary,
          '&.Mui-focused': { color: tokens.primaryLt },
        },
      },
    },

    // ── Chip ──────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        filled: {
          backgroundColor: tokens.surface3,
          '&:hover': { backgroundColor: alpha(tokens.primary, 0.15) },
        },
      },
    },

    // ── ListItemButton ────────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&.Mui-selected': {
            backgroundColor: alpha(tokens.primary, 0.15),
            color: tokens.primaryLt,
            '&:hover': { backgroundColor: alpha(tokens.primary, 0.2) },
          },
          '&:hover': {
            backgroundColor: alpha(tokens.primary, 0.08),
          },
        },
      },
    },

    // ── Avatar ────────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(tokens.primary, 0.2),
          color: tokens.primaryLt,
          fontWeight: 700,
        },
      },
    },

    // ── Tooltip ───────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surface3,
          border: `1px solid ${tokens.border}`,
          color: tokens.textPrimary,
          fontSize: '0.8125rem',
          borderRadius: 6,
          boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
        },
        arrow: { color: tokens.surface3 },
      },
    },

    // ── Menu ──────────────────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surface2,
          border: `1px solid ${tokens.border}`,
          boxShadow: `0 16px 40px rgba(0,0,0,0.6)`,
          borderRadius: 10,
        },
      },
    },

    // ── MenuItem ──────────────────────────────────────────────────────────
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 6px',
          padding: '8px 10px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          '&:hover': { backgroundColor: alpha(tokens.primary, 0.1) },
        },
      },
    },

    // ── Divider ───────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: tokens.border },
      },
    },

    // ── LinearProgress ────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 99,
          backgroundColor: tokens.surface3,
          height: 6,
        },
        bar: {
          borderRadius: 99,
          background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`,
        },
      },
    },

    // ── CircularProgress ──────────────────────────────────────────────────
    MuiCircularProgress: {
      styleOverrides: {
        root: { color: tokens.primary },
      },
    },

    // ── Skeleton ──────────────────────────────────────────────────────────
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface3,
          '&::after': {
            background: `linear-gradient(90deg, transparent, ${alpha(tokens.borderLt, 0.3)}, transparent)`,
          },
        },
      },
    },

    // ── Badge ─────────────────────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 700,
          fontSize: '0.6875rem',
        },
      },
    },

    // ── Tabs ──────────────────────────────────────────────────────────────
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`,
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
          color: tokens.textSecondary,
          '&.Mui-selected': { color: tokens.textPrimary, fontWeight: 600 },
          cursor: 'pointer',
          transition: 'color 0.2s',
        },
      },
    },

    // ── Alert ─────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid',
        },
        standardError: {
          backgroundColor: alpha(tokens.error, 0.1),
          borderColor: alpha(tokens.error, 0.25),
          color: '#FCA5A5',
        },
        standardSuccess: {
          backgroundColor: alpha(tokens.success, 0.1),
          borderColor: alpha(tokens.success, 0.25),
          color: '#86EFAC',
        },
        standardWarning: {
          backgroundColor: alpha(tokens.warning, 0.1),
          borderColor: alpha(tokens.warning, 0.25),
          color: '#FDE68A',
        },
        standardInfo: {
          backgroundColor: alpha(tokens.accent, 0.1),
          borderColor: alpha(tokens.accent, 0.25),
          color: '#67E8F9',
        },
      },
    },
    // ── Table ──────────────────────────────────────────────────────────────
    MuiTable: {
      styleOverrides: {
        root: { borderCollapse: 'separate', borderSpacing: 0 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: tokens.surface,
            color: tokens.textMuted,
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            borderBottom: `1px solid ${tokens.border}`,
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
            '&:hover': { backgroundColor: `rgba(240,246,252,0.02)` },
          },
          '& .MuiTableCell-body': {
            borderBottom: `1px solid rgba(48,54,61,0.5)`,
            color: tokens.textPrimary,
            fontSize: '0.875rem',
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { color: tokens.textMuted, fontSize: '0.8125rem' },
        select: { color: tokens.textPrimary },
        displayedRows: { color: tokens.textMuted },
      },
    },

    // ── Dialog ────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surface2,
          border: `1px solid ${tokens.border}`,
          borderRadius: 14,
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
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
          color: tokens.textPrimary,
          paddingBottom: 8,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: tokens.textSecondary,
          paddingTop: '8px !important',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 20px',
          gap: 8,
        },
      },
    },

    // ── ToggleButton ──────────────────────────────────────────────────────
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.border}`,
          borderRadius: 8,
          color: tokens.textSecondary,
          fontWeight: 500,
          fontSize: '0.875rem',
          textTransform: 'none',
          padding: '8px 16px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&.Mui-selected': {
            backgroundColor: alpha(tokens.primary, 0.12),
            borderColor: alpha(tokens.primary, 0.4),
            color: tokens.primaryLt,
            '&:hover': { backgroundColor: alpha(tokens.primary, 0.18) },
          },
          '&:hover': { backgroundColor: alpha(tokens.primary, 0.06) },
        },
      },
    },

    // ── FormHelperText ───────────────────────────────────────────────────
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: tokens.textMuted,
          fontSize: '0.75rem',
          marginTop: 4,
        },
      },
    },
  },
})

export default theme
export { tokens }
