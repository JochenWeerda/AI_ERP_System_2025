import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar, Paper, Grid, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Notification from './Notification';
import SystemStatus from './SystemStatus';
import { useTheme } from '../themes/ThemeProvider';
import IconSet from './IconSet';

/**
 * Layout - Hauptlayout-Komponente im modernisierten Design
 * 
 * Diese Komponente stellt das Haupt-Layout der Anwendung bereit, bestehend aus
 * Header, Sidebar für Systemstatus und dem Hauptinhaltsbereich.
 */
const Layout = ({ children }) => {
  const { parameters } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Visuellen Abstand (Dichte) aus dem Theme verwenden
  const visualDensity = parameters?.visualDensity || 'medium';
  const paddingValue = visualDensity === 'low' ? 4 : (visualDensity === 'high' ? 2 : 3);

  // Navigation zur Startseite
  const navigateToHome = () => {
    navigate('/');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <CssBaseline />
      
      {/* Header */}
      <Header />
      
      {/* Hauptinhalt */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: 'calc(100vh - 64px)', // Höhe abzüglich Header
          marginTop: '64px', // Höhe des Headers
        }}
      >
        {/* Hauptcontainer mit Padding */}
        <Box sx={{ 
          p: paddingValue,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Dashboard Aktionsleiste */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center',
              borderLeft: `3px solid ${muiTheme.palette.primary.main}`,
              cursor: 'pointer',
              mb: 2
            }}
            onClick={navigateToHome}
          >
            <IconSet icon="home" color={muiTheme.palette.primary.main} />
            <Box sx={{ ml: 1, typography: 'h6', flexGrow: 1 }}>
              Dashboard
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconSet icon="refresh" size="small" />
              <IconSet icon="more_vert" size="small" />
            </Box>
          </Paper>
          
          {/* Hauptinhalt und System-Status Grid */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
              {/* Hauptinhalt */}
              <Grid item xs={12} md={9}>
                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  boxShadow: 1,
                  height: '100%',
                  overflow: 'hidden',
                }}>
                  {children || <div className="outlet-placeholder" />}
                </Box>
              </Grid>
              
              {/* System-Status in der Seitenleiste */}
              <Grid item xs={12} md={3}>
                <SystemStatus />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
      
      {/* Benachrichtigungssystem */}
      <Notification />
    </Box>
  );
};

export default Layout; 