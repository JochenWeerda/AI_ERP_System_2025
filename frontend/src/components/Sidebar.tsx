import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  SmartToy as AIIcon,
  Store as StoreIcon,
  Apps as AppsIcon,
} from '@mui/icons-material';
import { useThemeSystem } from '../themes/ThemeProvider';

// Props-Interface für die Sidebar
interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

// Dummy Link-Komponente, bis react-router-dom korrekt eingebunden ist
const Link = ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => (
  <div {...props} style={{ cursor: 'pointer' }}>{children}</div>
);

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  // Dummy location, bis react-router-dom korrekt eingebunden ist
  const location = { pathname: '/' };
  
  const { currentThemeConfig } = useThemeSystem();
  
  // Theme-spezifische Anpassungen für die Sidebar
  const isHighContrast = currentThemeConfig.mode === 'high-contrast';
  const customBgColor = currentThemeConfig.mode === 'dark' ? '#2c2c2c' : '#f5f5f5';
  const visualDensity = currentThemeConfig.parameters?.visualDensity || 'medium';
  
  // Visuelle Dichte für Sidebar-Elemente anpassen
  const itemPadding = visualDensity === 'low' ? '12px 16px' : (visualDensity === 'high' ? '6px 16px' : '8px 16px');

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Apps', icon: <AppsIcon />, path: '/apps' },
    { text: 'Folkerts Landhandel', icon: <SmartToy as AIIcon />, path: '/landhandel' },
    { text: 'Produkte', icon: <InventoryIcon />, path: '/products' },
    { text: 'Kunden', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Bestellungen', icon: <ShoppingCartIcon />, path: '/orders' },
    { text: 'Inventar', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'E-Commerce', icon: <StoreIcon />, path: '/ecommerce' },
    { text: 'KI-Assistent', icon: <AIIcon />, path: '/ai' },
    { text: 'Einstellungen', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: customBgColor,
          border: isHighContrast ? '1px solid white' : undefined,
        },
      }}
    >
      <Box sx={{ pt: 6, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: isHighContrast ? 'white' : 'primary.main' }}>
          AI-Driven ERP
        </Typography>
      </Box>
      <Divider sx={{ borderColor: isHighContrast ? 'white' : 'divider' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
            sx={{
              padding: itemPadding,
              '&.Mui-selected': {
                bgcolor: isHighContrast ? 'rgba(255, 255, 255, 0.2)' : 'action.selected',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
              '&:hover': {
                bgcolor: isHighContrast ? 'rgba(255, 255, 255, 0.1)' : 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isHighContrast ? 'white' : 'text.secondary',
                minWidth: visualDensity === 'low' ? 42 : (visualDensity === 'high' ? 36 : 40),
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiTypography-root': {
                  fontSize: visualDensity === 'low' ? '1rem' : (visualDensity === 'high' ? '0.85rem' : '0.9rem'),
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 