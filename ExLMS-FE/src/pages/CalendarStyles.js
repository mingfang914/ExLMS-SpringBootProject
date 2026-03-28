import { styled, alpha, darken, lighten } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

export const CalendarContainer = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(3),
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8)
    : alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.1)',
  },

  /* Overriding FullCalendar default styles */
  '& .fc': {
    '--fc-border-color': alpha(theme.palette.divider, 0.1),
    '--fc-today-bg-color': alpha(theme.palette.primary.main, 0.05),
    '--fc-bg-event-color': theme.palette.primary.main,
    '--fc-bg-event-opacity': 0.1,
    '--fc-event-bg-color': theme.palette.primary.main,
    '--fc-event-border-color': theme.palette.primary.main,
    fontFamily: theme.typography.fontFamily,
  },

  '& .fc-theme-standard td, & .fc-theme-standard th': {
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },

  '& .fc-scrollgrid': {
    border: 'none',
  },

  '& .fc-col-header-cell': {
    padding: theme.spacing(1.5, 0),
    background: 'transparent',
    '& .fc-col-header-cell-cushion': {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
  },

  '& .fc-daygrid-day': {
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.hover, 0.03),
    },
  },

  '& .fc-day-today': {
    background: `${alpha(theme.palette.primary.main, 0.05)} !important`,
    '& .fc-daygrid-day-number': {
      color: theme.palette.primary.main,
      fontWeight: 'bold',
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '4px',
    },
  },

  '& .fc-daygrid-day-number': {
    padding: '8px 12px',
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
  },

  '& .fc-event': {
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontWeight: 500,
    border: 'none !important',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },

  '& .fc-daygrid-event-dot': {
    display: 'none',
  },

  '& .fc-list-event:hover td': {
    backgroundColor: alpha(theme.palette.action.hover, 0.05),
  },

  '& .fc-list-day-side-text': {
    fontWeight: 600,
    color: theme.palette.primary.main,
  },

  /* Responsive Grid Tweaks */
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    '& .fc-toolbar': {
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
  },
}));

export const CustomToolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const EventBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'type',
})(({ theme, type }) => {
  const colors = {
    MEETING: { hex: '#6c63ff' },
    ASSIGNMENT_DUE: { hex: '#ef4444' },
    QUIZ: { hex: '#f59e0b' },
    COURSE_START: { hex: '#22c55e' },
    COURSE_END: { hex: '#94a3b8' },
    COURSE_SESSION: { hex: '#10b981' },
    PERSONAL: { hex: '#00d4ff' },
    SYSTEM: { hex: '#a855f7' },
    DEFAULT: { hex: theme.palette.grey[500] },
  };

  const config = colors[type] || colors.DEFAULT;
  const mainColor = config.hex;
  const isDark = theme.palette.mode === 'dark';

  // Improve contrast: Darker text in light mode, lighter text in dark mode
  const textColor = isDark ? lighten(mainColor, 0.3) : darken(mainColor, 0.3);
  const bgColor = alpha(mainColor, isDark ? 0.15 : 0.1);

  return {
    backgroundColor: bgColor,
    color: textColor,
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 700, // Thicker font for better legibility
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    borderLeft: `4px solid ${mainColor}`,
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
  };
});

export const LegendContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  margin: theme.spacing(0, 3, 3, 3),
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.4) 
    : alpha(theme.palette.background.paper, 0.6),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
}));

export const LegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& .dot': {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  '& .label': {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
}));
