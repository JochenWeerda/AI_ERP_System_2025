import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Box,
  Drawer,
  List,
  ListItem,
  Badge,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useThemeSystem } from '../themes/ThemeProvider';

import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './notification/NotificationBell';

// Header-Komponenten-Props
interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

// Header-Komponente mit Navigationsleiste, Toolbar-Optionen und Profilmenü
const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const theme = useTheme();
  const { toggleColorMode } = useThemeSystem();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Responsive Design-Anpassungen
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Verkürzter Titel für mobile Ansicht
  const appTitle = isMobile ? "ERP System" : "ERP für Futtermittelherstellung";
  
  // Handler für Profilmenü öffnen
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handler für Profilmenü schließen
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handler für Abmelden
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };
  
  // Mobile Menü öffnen/schließen
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Mobiles Menü-Element-Handler
  const handleMobileMenuClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };
  
  // Mobile Menü-Komponente
  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={toggleMobileMenu}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 280,
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: theme.palette.primary.main,
              mr: 2 
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user?.name || 'Benutzer'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'benutzer@example.com'}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <List>
          <ListItem button onClick={() => handleMobileMenuClick('/dashboard')}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem button onClick={() => handleMobileMenuClick('/profile')}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profil" />
          </ListItem>
          
          <ListItem button onClick={() => handleMobileMenuClick('/settings')}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Einstellungen" />
          </ListItem>
          
          <ListItem button onClick={() => handleMobileMenuClick('/notifications')}>
            <ListItemIcon>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Benachrichtigungen" />
          </ListItem>
          
          <ListItem button onClick={() => handleMobileMenuClick('/help')}>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Hilfe" />
          </ListItem>
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Divider sx={{ mt: 2, mb: 2 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2">Theme</Typography>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <ListItem 
            button 
            onClick={handleLogout} 
            sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: 1
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Abmelden" />
          </ListItem>
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        color="primary"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'width 0.25s',
          width: '100%',
          boxShadow: 3,
        }}
      >
        <Toolbar
          sx={{
            pr: 2,
            minHeight: { xs: 56, sm: 64 }, // Kleinere Höhe auf mobilen Geräten
          }}
        >
          {/* Nur auf nicht-mobilen Geräten anzeigen */}
          {!isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="toggle sidebar"
              onClick={toggleSidebar}
              sx={{
                marginRight: 2,
              }}
            >
              {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          )}
          
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }, // Kleinere Schriftgröße auf mobilen Geräten
            }}
          >
            {appTitle}
          </Typography>
          
          {/* Desktop-Menü - nur anzeigen, wenn nicht mobil */}
          {!isMobile && (
            <>
              <NotificationBell />
              
              <Tooltip title={theme.palette.mode === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}>
                <IconButton color="inherit" onClick={toggleColorMode} sx={{ ml: 1 }}>
                  {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Profil">
                <IconButton
                  color="inherit"
                  aria-label="account"
                  onClick={handleMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    minWidth: 200,
                    mt: 1.5,
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => navigate('/profile')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profil</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={() => navigate('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Einstellungen</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={() => navigate('/notifications')}>
                  <ListItemIcon>
                    <NotificationsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Benachrichtigungen</ListItemText>
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Abmelden</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
          
          {/* Mobile-Menü-Button - nur auf mobilen Geräten anzeigen */}
          {isMobile && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  color="inherit"
                  aria-label="mobile menu"
                  onClick={toggleMobileMenu}
                  edge="end"
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Mobiles Menü */}
      {mobileMenu}
    </>
  );
};

export default Header; 