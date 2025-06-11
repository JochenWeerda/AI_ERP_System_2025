import React, { useState, ReactNode } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Tabs,
  Tab,
  useTheme,
  Avatar,
  Badge,
  Button,
  Divider
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Contrast as ContrastIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useThemeSystem } from '../../themes/ThemeProvider';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const HorizontalLayout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Valero ERP-System', 
  tabs = [],
  activeTab,
  onTabChange
}) => {
  const { mode, toggleColorMode } = useThemeSystem();
  const theme = useTheme();
  
  const [selectedTab, setSelectedTab] = useState<string>(activeTab || (tabs.length > 0 ? tabs[0].id : ''));

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="static" 
        color="primary" 
        elevation={0}
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/assets/logo.png" 
              alt="Valero Logo" 
              style={{ height: 32, marginRight: theme.spacing(2) }}
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                display: { xs: 'none', sm: 'block' } 
              }}
            >
              {title}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" size="small">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" size="small">
              <HelpIcon />
            </IconButton>
            <IconButton color="inherit" size="small" onClick={toggleColorMode}>
              {mode === 'light' ? <DarkModeIcon /> : mode === 'dark' ? <ContrastIcon /> : <LightModeIcon />}
            </IconButton>
            <IconButton color="inherit" size="small">
              <SettingsIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24 }} />
            <Button 
              startIcon={
                <Avatar 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    bgcolor: theme.palette.primary.main 
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              }
              sx={{ 
                textTransform: 'none',
                color: theme.palette.text.primary
              }}
            >
              Admin
            </Button>
          </Box>
        </Toolbar>
        
        {tabs.length > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              aria-label="application tabs"
            >
              {tabs.map((tab) => (
                <Tab 
                  key={tab.id} 
                  value={tab.id} 
                  label={tab.label} 
                  icon={tab.icon} 
                  iconPosition="start"
                  disabled={tab.disabled}
                  sx={{ 
                    textTransform: 'none',
                    minHeight: 48,
                    px: 3
                  }}
                />
              ))}
            </Tabs>
          </Box>
        )}
      </AppBar>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.grey[50] 
            : theme.palette.grey[900]
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            Valero ERP-System — {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HorizontalLayout;