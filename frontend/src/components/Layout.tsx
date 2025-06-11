import React, { useState, ReactNode } from 'react';
import { Box, CssBaseline, Toolbar, Paper, useMediaQuery, useTheme, Container } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import Notification from './Notification';
import SystemStatus from './SystemStatus';
import { useThemeContext } from '../themes/ThemeProvider';
import IconSet from './IconSet';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: ReactNode;
}

/**
 * Layout - Hauptlayout-Komponente im modernen Design
 * 
 * Diese Komponente stellt das Haupt-Layout der Anwendung bereit, bestehend aus
 * Header, Sidebar und dem Hauptinhaltsbereich mit großzügigem Weißraum.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentThemeConfig } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Automatisches Schließen der Sidebar auf mobilen Geräten
  React.useEffect(() => {
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
  const visualDensity = currentThemeConfig.parameters?.visualDensity || 'medium';
  const paddingValue = visualDensity === 'compact' ? 3 : (visualDensity === 'comfortable' ? 5 : 4);
  
  // Anpassen der Breite basierend auf Sidebar-Status
  const mainWidth = isMobile ? '100%' : `calc(100% - ${sidebarOpen ? 240 : 64}px)`;
  const mainMargin = isMobile ? 0 : (sidebarOpen ? 240 : 64);

  // Bestimme die Hintergrundfarbe basierend auf dem aktuellen Theme-Modus
  const isDarkMode = theme.palette.mode === 'dark';
  const backgroundColor = isDarkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(248, 249, 250, 0.8)';
  const paperBgColor = isDarkMode ? 'rgba(37, 37, 37, 0.7)' : 'rgba(255, 255, 255, 0.9)';

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)' 
        : 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)',
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
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflow: 'auto',
          height: '100vh',
        }}
      >
        {/* Toolbar für korrekten Abstand unter dem Header */}
        <Toolbar />
        
        {/* Container für maximale Breite und zentrierten Inhalt */}
        <Container maxWidth="xl" disableGutters sx={{ px: isMobile ? 2 : 4 }}>
          {/* Inhalt mit Abstand */}
          <Box sx={{ 
            p: paddingValue,
            pt: isMobile ? 2 : 3,
          }}>
            {/* System-Status-Anzeige */}
            <SystemStatus />
            
            {/* Hauptinhalt / Outlet mit subtilen Effekten */}
            <Box sx={{ 
              bgcolor: paperBgColor,
              borderRadius: (theme) => theme.shape.borderRadius * 2,
              boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.06)',
              p: { xs: 2, sm: 3, md: 4 },
              mt: 3,
              overflow: 'hidden',
              transition: 'all 0.3s ease-in-out',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.02)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                boxShadow: isDarkMode ? '0 10px 28px rgba(0,0,0,0.25)' : '0 10px 28px rgba(0,0,0,0.08)',
                transform: 'translateY(-2px)',
              }
            }}>
              {children || <Outlet />}
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Benachrichtigungssystem */}
      <Notification />
    </Box>
  );
};

export default Layout; 