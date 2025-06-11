import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, Typography, Badge, Box, useTheme } from '@mui/material';

/**
 * AppTile-Komponente - Zeigt eine einzelne App-Kachel an
 * 
 * @param {object} props - Komponenten-Props
 * @param {string} props.title - Titel der App
 * @param {React.ReactNode} props.icon - Icon-Komponente
 * @param {string} props.path - Pfad für die Verlinkung
 * @param {number|null} props.badge - Badge-Zahl (optional)
 * @param {boolean} props.isStammdaten - Ist die App eine Stammdaten-App (optional)
 */
const AppTile = ({ title, icon, path, badge, isStammdaten }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Spezielle Abzeichen für Stammdaten
  const isStammdatenBadge = isStammdaten && (
    <Box
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.07)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
        fontSize: '0.65rem',
        fontWeight: 600,
        padding: '3px 6px',
        borderRadius: '4px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}
    >
      Stammdaten
    </Box>
  );

  return (
    <Card
      component={RouterLink}
      to={path}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textDecoration: 'none',
        position: 'relative',
        border: '1px solid',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        boxShadow: isDarkMode 
          ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
          : '0 2px 8px rgba(0, 0, 0, 0.05)',
        borderRadius: theme.shape.borderRadius * 2,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDarkMode 
            ? '0 8px 16px rgba(0, 0, 0, 0.4)' 
            : '0 8px 16px rgba(0, 0, 0, 0.1)',
          borderColor: isDarkMode 
            ? theme.palette.primary.dark 
            : theme.palette.primary.light,
          '& .app-tile-icon': {
            color: theme.palette.primary.main,
            transform: 'scale(1.1)',
          },
          '& .app-tile-title': {
            color: theme.palette.primary.main,
          },
        },
        '&:focus': {
          outline: 'none',
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
        },
      }}
      aria-label={title}
    >
      {isStammdatenBadge}
      
      <CardContent 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: 3,
          flex: 1,
          textAlign: 'center',
        }}
      >
        <Badge 
          badgeContent={badge} 
          color="primary"
          invisible={badge === null || badge === undefined}
          sx={{ 
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              height: '22px',
              minWidth: '22px',
              borderRadius: '11px',
              fontWeight: 'bold',
            }
          }}
        >
          <Box 
            className="app-tile-icon"
            sx={{ 
              color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
              fontSize: 40,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              '& svg': {
                width: 40,
                height: 40,
              }
            }}
          >
            {icon}
          </Box>
        </Badge>
        
        <Typography 
          variant="subtitle1" 
          component="h3"
          className="app-tile-title"
          sx={{ 
            fontWeight: 500,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
            fontSize: '1rem',
            lineHeight: 1.3,
            transition: 'color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            mt: 1,
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AppTile; 