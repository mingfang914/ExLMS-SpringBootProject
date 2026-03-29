import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

const Logo = ({ variant = 'colored', onClick, sx = {} }) => {
  const isWhite = variant === 'white';

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
    >
      <Avatar
        sx={{
          bgcolor: isWhite ? 'rgba(255, 255, 255, 0.2)' : 'primary.main',
          color: 'white',
          width: 36,
          height: 36,
          fontWeight: 'bold',
          border: isWhite ? '1px solid rgba(255, 255, 255, 0.5)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        E
      </Avatar>
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: isWhite ? 'white' : 'text.primary',
          transition: 'all 0.3s ease',
        }}
      >
        ExLMS<span style={{ color: isWhite ? 'white' : '#4f46e5', transition: 'color 0.3s ease' }}>.</span>
      </Typography>
    </Box>
  );
};

export default Logo;
