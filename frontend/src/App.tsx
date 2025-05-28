import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  useTheme, 
  ThemeProvider, 
  createTheme,
  Divider,
  ListSubheader,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Build as BuildIcon,
  Summarize as SummarizeIcon,
  BarChart as BarChartIcon,
  ListAlt as ListAltIcon,
  TrendingUp as TrendingUpIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Insights as InsightsIcon,
  Science as ScienceIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Menu, MenuItem } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useState } from 'react';
import { navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';

// Seiten importieren
import AnomalyDashboard from './pages/AnomalyDashboard';
import EmergencyDashboard from './pages/EmergencyDashboard';
import NotificationCenter from './pages/NotificationCenter';

// Notfall-Komponenten importieren
import EmergencyResources from './components/emergency/EmergencyResources';
import EmergencyContacts from './components/emergency/EmergencyContacts';
import EmergencyPlans from './components/emergency/EmergencyPlans';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import FeedQualityDashboard from './pages/FeedQualityDashboard';
import AnomalyDetection from './pages/AnomalyDetection';
import EmergencyManagement from './pages/EmergencyManagement';
import EscalationManagement from './pages/EscalationManagement';
import Settings from './pages/Settings';
import NotificationSettings from './components/notifications/NotificationSettings';
import EmailConfigPage from './components/notifications/EmailConfigPage';
import SMSConfigPage from './components/notifications/SMSConfigPage';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

const drawerWidth = 240;

function MainLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppNavigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${240}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

function AppHeader() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ERP-System für Futtermittelherstellung
        </Typography>
        {user && (
          <>
            <NotificationBell />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleClick}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profil</MenuItem>
              <MenuItem onClick={handleClose}>Einstellungen</MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/notifications'); }}>Benachrichtigungen</MenuItem>
              <MenuItem onClick={handleLogout}>Abmelden</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

const App: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          ERP Futtermittel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListSubheader>Hauptnavigation</ListSubheader>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/production">
          <ListItemIcon>
            <BuildIcon />
          </ListItemIcon>
          <ListItemText primary="Produktion" />
        </ListItem>
        <ListItem button component={Link} to="/inventory">
          <ListItemIcon>
            <StorageIcon />
          </ListItemIcon>
          <ListItemText primary="Lagerverwaltung" />
        </ListItem>
        <ListItem button component={Link} to="/quality">
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Qualitätssicherung" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>KI-Funktionen</ListSubheader>
        <ListItem button component={Link} to="/anomaly">
          <ListItemIcon>
            <InsightsIcon />
          </ListItemIcon>
          <ListItemText primary="Anomalieerkennung" />
        </ListItem>
        <ListItem button component={Link} to="/prediction">
          <ListItemIcon>
            <TrendingUpIcon />
          </ListItemIcon>
          <ListItemText primary="Prognosen" />
        </ListItem>
        <ListItem button component={Link} to="/analysis">
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Datenanalyse" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>Notfallmanagement</ListSubheader>
        <ListItem button component={Link} to="/emergency">
          <ListItemIcon>
            <WarningIcon />
          </ListItemIcon>
          <ListItemText primary="Notfall-Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/emergency/resources">
          <ListItemIcon>
            <BuildIcon />
          </ListItemIcon>
          <ListItemText primary="Ressourcen" />
        </ListItem>
        <ListItem button component={Link} to="/emergency/plans">
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Notfallpläne" />
        </ListItem>
        <ListItem button component={Link} to="/emergency/contacts">
          <ListItemIcon>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary="Kontakte" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/settings">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Einstellungen" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
              position="fixed"
              sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { sm: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                  KI-gesteuertes ERP-System für Futtermittelherstellung
                </Typography>
              </Toolbar>
            </AppBar>
            <Box
              component="nav"
              sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
              aria-label="mailbox folders"
            >
              {/* Die mobile Version des Drawers */}
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Bessere Performance auf Mobilgeräten
                }}
                sx={{
                  display: { xs: 'block', sm: 'none' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
              >
                {drawer}
              </Drawer>
              {/* Die permanente Version des Drawers */}
              <Drawer
                variant="permanent"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
              >
                {drawer}
              </Drawer>
            </Box>
            <Box
              component="main"
              sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
              <Toolbar /> {/* Abstand unter der AppBar */}
              <Container maxWidth="xl">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  
                  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="feed-quality" element={<FeedQualityDashboard />} />
                    <Route path="anomaly-detection" element={<AnomalyDetection />} />
                    <Route path="emergency-management" element={<EmergencyManagement />} />
                    <Route path="escalation-management" element={<EscalationManagement />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="notifications/settings" element={<NotificationSettings />} />
                    <Route path="notifications/center" element={<NotificationCenter />} />
                    <Route path="notifications/email-config" element={<EmailConfigPage />} />
                    <Route path="notifications/sms-config" element={<SMSConfigPage />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Container>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 