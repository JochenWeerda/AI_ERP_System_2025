import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Breadcrumbs,
  Link,
  CircularProgress
} from '@mui/material';

/**
 * ModuleLoader - Universelle Komponente zum Laden von Modulen mit Tabs
 * Diese Komponente dient als einheitliche Basis für alle Fachmodule
 */
const ModuleLoader = ({ 
  title, 
  tabs = [], 
  defaultTab = 0,
  breadcrumbItems = [],
  loading = false
}) => {
  const [tabValue, setTabValue] = useState(defaultTab);
  
  // Handler für Tab-Wechsel
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // TabPanel-Komponente
  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`module-tabpanel-${index}`}
        aria-labelledby={`module-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  // Render Breadcrumbs
  const renderBreadcrumbs = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary">{item.label}</Typography>
            ) : (
              <Link 
                key={index} 
                color="inherit" 
                href={item.href || "#"} 
                onClick={item.onClick || (() => {})}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      
      {breadcrumbItems.length > 0 && renderBreadcrumbs()}
      
      <Paper sx={{ width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexGrow: 1 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabs.map((tab, index) => (
                  <Tab 
                    key={index}
                    icon={tab.icon}
                    label={tab.label} 
                    id={`module-tab-${index}`}
                    aria-controls={`module-tabpanel-${index}`}
                  />
                ))}
              </Tabs>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {tabs.map((tab, index) => (
                <TabPanel key={index} value={tabValue} index={index}>
                  {tab.content}
                </TabPanel>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ModuleLoader; 