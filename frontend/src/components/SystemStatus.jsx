import React from 'react';
import { Box, Paper, Typography, Chip, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * SystemStatus-Komponente zur Anzeige des Systemstatus
 */
const SystemStatus = () => {
  // Dummy-Daten für Systemstatus
  const systemStatusData = {
    components: [
      { name: 'Backend API', status: 'online', responseTime: '42ms' },
      { name: 'Datenbank', status: 'online', responseTime: '68ms' },
      { name: 'Authentifizierung', status: 'online', responseTime: '35ms' },
      { name: 'Speicher', status: 'warning', responseTime: '210ms', message: '85% belegt' }
    ]
  };
  
  return (
    <Box sx={{ display: 'none' }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>System-Status</Typography>
        <Grid container spacing={2}>
          {systemStatusData.components.map((component) => (
            <Grid item xs={12} sm={6} md={3} key={component.name}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {component.status === 'online' ? (
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                )}
                <Box>
                  <Typography variant="body2">{component.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {component.responseTime} {component.message && `(${component.message})`}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default SystemStatus; 