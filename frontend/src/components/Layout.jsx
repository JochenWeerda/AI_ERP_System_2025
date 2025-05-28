import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar, Paper, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import Notification from './Notification';
import SystemStatus from './SystemStatus';
import { useTheme } from '../themes/ThemeProvider';
import IconSet from './IconSet';

/**
 * Layout - Hauptlayout-Komponente im Odoo-Stil
 * 
 * Diese Komponente stellt das Haupt-Layout der Anwendung bereit, bestehend aus
 * Header, Sidebar und dem Hauptinhaltsbereich. Das Design orientiert sich an Odoo's
 * Enterprise-Version mit responsiven Anpassungen.
 */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { parameters } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Automatisches Schließen der Sidebar auf mobilen Geräten
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Toggle-Funktion für die Sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Visuellen Abstand (Dichte) aus dem Theme verwenden
  const visualDensity = parameters?.visualDensity || 'medium';
  const paddingValue = visualDensity === 'low' ? 4 : (visualDensity === 'high' ? 2 : 3);
  
  // Anpassen der Breite basierend auf Sidebar-Status
  const mainWidth = isMobile ? '100%' : `calc(100% - ${sidebarOpen ? 240 : 64}px)`;
  const mainMargin = isMobile ? 0 : (sidebarOpen ? 240 : 64);

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <CssBaseline />
      
      {/* Header mit Toggle-Funktion */}
      <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Sidebar mit aktuellen Status */}
      <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Hauptinhalt */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: mainWidth,
          ml: `${mainMargin}px`,
          transition: muiTheme.transitions.create(['margin', 'width'], {
            easing: muiTheme.transitions.easing.easeOut,
            duration: muiTheme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Toolbar für korrekten Abstand unter dem Header */}
        <Toolbar />
        
        {/* System-Status-Anzeige */}
        <Box sx={{ p: paddingValue }}>
          <SystemStatus />
          
          {/* Aktionsleiste im Odoo-Stil */}
          <Paper 
            elevation={1} 
            sx={{ 
              mb: 2, 
              p: 1, 
              display: 'flex', 
              alignItems: 'center',
              borderLeft: `3px solid ${muiTheme.palette.primary.main}`,
            }}
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
          
          {/* Hauptinhalt / Outlet */}
          <Box sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            boxShadow: 1,
            overflow: 'hidden',
          }}>
            {children || <div className="outlet-placeholder" />}
          </Box>
        </Box>
      </Box>
      
      {/* Benachrichtigungssystem */}
      <Notification />
    </Box>
  );
};

export default Layout; 