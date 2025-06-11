import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  PlayArrow as PlayArrowIcon,
  Done as DoneIcon,
  Print as PrintIcon,
  AccountTree as AccountTreeIcon,
  BarChart as BarChartIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Inventory as InventoryIcon,
  QrCodeScanner as QrCodeScannerIcon
} from '@mui/icons-material';

// Mock-Daten für Inventuren
const MOCK_INVENTUREN = [
  { 
    id: 1, 
    bezeichnung: 'Jahresinventur 2023', 
    stichtag: '2023-12-31', 
    status: 'abgeschlossen', 
    lager: 'Hauptlager', 
    erfasst: 2145, 
    gesamt: 2145, 
    wertDiff: -1250.75,
    benutzer: ['Max Mustermann', 'Anna Schmidt']
  },
  { 
    id: 2, 
    bezeichnung: 'Quartalsaufnahme Q1/2024', 
    stichtag: '2024-03-31', 
    status: 'in_bearbeitung', 
    lager: 'Hauptlager', 
    erfasst: 853, 
    gesamt: 2150, 
    wertDiff: 0,
    benutzer: ['Max Mustermann', 'Julia Bauer', 'Thomas Huber']
  },
  { 
    id: 3, 
    bezeichnung: 'Sonderinventur Außenlager', 
    stichtag: '2024-04-15', 
    status: 'geplant', 
    lager: 'Außenlager', 
    erfasst: 0, 
    gesamt: 845, 
    wertDiff: 0,
    benutzer: ['Julia Bauer', 'Markus Weber']
  }
];

// Tab-Panel Komponente
const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventur-tabpanel-${index}`}
      aria-labelledby={`inventur-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Funktion für Tab-Props
const a11yProps = (index: number) => {
  return {
    id: `inventur-tab-${index}`,
    'aria-controls': `inventur-tabpanel-${index}`,
  };
};

// Status-Chip Komponente
const StatusChip = ({ status }: { status: string }) => {
  let color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  let label: string;
  let icon: React.ReactNode;

  switch (status) {
    case 'geplant':
      color = 'info';
      label = 'Geplant';
      icon = <ScheduleIcon fontSize="small" />;
      break;
    case 'in_bearbeitung':
      color = 'warning';
      label = 'In Bearbeitung';
      icon = <PlayArrowIcon fontSize="small" />;
      break;
    case 'abgeschlossen':
      color = 'success';
      label = 'Abgeschlossen';
      icon = <DoneIcon fontSize="small" />;
      break;
    default:
      color = 'default';
      label = status;
      icon = <InventoryIcon fontSize="small" />;
  }

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size="small"
      variant="outlined"
    />
  );
};

const InventurModule: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Tab-Wechsel-Handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Formatieren eines Datumsstrings
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };
  
  // Berechnung des Fortschritts in Prozent
  const calculateProgress = (erfasst: number, gesamt: number) => {
    if (gesamt === 0) return 0;
    return Math.round((erfasst / gesamt) * 100);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Inventur
      </Typography>
      
      <Paper sx={{ mb: 3 }} variant="outlined">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label="Inventurübersicht" 
              icon={<AccountTreeIcon />} 
              iconPosition="start" 
              {...a11yProps(0)} 
            />
            <Tab 
              label="Aktuelle Inventuren" 
              icon={<AssignmentIcon />} 
              iconPosition="start" 
              {...a11yProps(1)} 
            />
            <Tab 
              label="Inventurauswertung" 
              icon={<BarChartIcon />} 
              iconPosition="start" 
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>
        
        {/* Inventurübersicht Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Alle Inventuren</Typography>
              <Box>
                <IconButton sx={{ mr: 1 }}>
                  <FilterListIcon />
                </IconButton>
                <IconButton sx={{ mr: 1 }}>
                  <RefreshIcon />
                </IconButton>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                >
                  Neue Inventur
                </Button>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              {MOCK_INVENTUREN.map((inventur) => (
                <Grid item xs={12} md={6} lg={4} key={inventur.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" noWrap>
                          {inventur.bezeichnung}
                        </Typography>
                        <StatusChip status={inventur.status} />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Stichtag: {formatDate(inventur.stichtag)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Lager: {inventur.lager}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          Fortschritt: {calculateProgress(inventur.erfasst, inventur.gesamt)}%
                        </Typography>
                        <Box 
                          sx={{ 
                            width: '100%', 
                            height: 8, 
                            bgcolor: 'grey.200', 
                            borderRadius: 1,
                            mt: 1
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: `${calculateProgress(inventur.erfasst, inventur.gesamt)}%`, 
                              height: '100%', 
                              bgcolor: inventur.status === 'abgeschlossen' 
                                ? 'success.main' 
                                : inventur.status === 'in_bearbeitung' 
                                  ? 'warning.main' 
                                  : 'info.main',
                              borderRadius: 1
                            }} 
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                          {inventur.erfasst} von {inventur.gesamt} Artikeln erfasst
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {inventur.status === 'abgeschlossen' ? (
                          <Typography 
                            variant="body2"
                            color={inventur.wertDiff < 0 ? 'error.main' : 'success.main'}
                            fontWeight="medium"
                          >
                            Differenz: {inventur.wertDiff.toLocaleString('de-DE')} €
                          </Typography>
                        ) : (
                          <Box sx={{ width: 24 }} /> // Platzhalter
                        )}
                        
                        {inventur.status === 'geplant' && (
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<PlayArrowIcon />}
                          >
                            Starten
                          </Button>
                        )}
                        
                        {inventur.status === 'in_bearbeitung' && (
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<QrCodeScannerIcon />}
                          >
                            Erfassen
                          </Button>
                        )}
                        
                        {inventur.status === 'abgeschlossen' && (
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<PrintIcon />}
                          >
                            Drucken
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Aktuelle Inventuren Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aktuelle Inventuren
            </Typography>
            
            {MOCK_INVENTUREN.filter(inv => inv.status === 'in_bearbeitung').length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Es gibt derzeit keine laufenden Inventuren.
              </Alert>
            ) : (
              <List>
                {MOCK_INVENTUREN
                  .filter(inv => inv.status === 'in_bearbeitung')
                  .map((inventur) => (
                    <Paper key={inventur.id} variant="outlined" sx={{ mb: 2 }}>
                      <ListItem
                        secondaryAction={
                          <Button 
                            variant="contained" 
                            startIcon={<QrCodeScannerIcon />}
                          >
                            Jetzt erfassen
                          </Button>
                        }
                      >
                        <ListItemIcon>
                          <AssignmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={inventur.bezeichnung}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {inventur.lager} | Stichtag: {formatDate(inventur.stichtag)}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  Fortschritt: {calculateProgress(inventur.erfasst, inventur.gesamt)}%
                                </Typography>
                                <Box 
                                  sx={{ 
                                    width: '100%', 
                                    maxWidth: 400,
                                    height: 8, 
                                    bgcolor: 'grey.200', 
                                    borderRadius: 1,
                                    mt: 0.5
                                  }}
                                >
                                  <Box 
                                    sx={{ 
                                      width: `${calculateProgress(inventur.erfasst, inventur.gesamt)}%`, 
                                      height: '100%', 
                                      bgcolor: 'warning.main',
                                      borderRadius: 1
                                    }} 
                                  />
                                </Box>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))
                }
              </List>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Geplante Inventuren
            </Typography>
            
            {MOCK_INVENTUREN.filter(inv => inv.status === 'geplant').length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Es gibt derzeit keine geplanten Inventuren.
              </Alert>
            ) : (
              <List>
                {MOCK_INVENTUREN
                  .filter(inv => inv.status === 'geplant')
                  .map((inventur) => (
                    <Paper key={inventur.id} variant="outlined" sx={{ mb: 2 }}>
                      <ListItem
                        secondaryAction={
                          <Button 
                            variant="outlined" 
                            startIcon={<PlayArrowIcon />}
                          >
                            Starten
                          </Button>
                        }
                      >
                        <ListItemIcon>
                          <ScheduleIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={inventur.bezeichnung}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {inventur.lager} | Stichtag: {formatDate(inventur.stichtag)}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  {inventur.gesamt} Artikel zu erfassen
                                </Typography>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))
                }
              </List>
            )}
          </Box>
        </TabPanel>
        
        {/* Inventurauswertung Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventurauswertungen
            </Typography>
            
            {MOCK_INVENTUREN.filter(inv => inv.status === 'abgeschlossen').length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Es gibt noch keine abgeschlossenen Inventuren für Auswertungen.
              </Alert>
            ) : (
              <List>
                {MOCK_INVENTUREN
                  .filter(inv => inv.status === 'abgeschlossen')
                  .map((inventur) => (
                    <Paper key={inventur.id} variant="outlined" sx={{ mb: 2 }}>
                      <ListItem
                        secondaryAction={
                          <Box>
                            <Button 
                              variant="outlined" 
                              startIcon={<BarChartIcon />}
                              sx={{ mr: 1 }}
                            >
                              Auswertung
                            </Button>
                            <Button 
                              variant="outlined" 
                              startIcon={<PrintIcon />}
                            >
                              Drucken
                            </Button>
                          </Box>
                        }
                      >
                        <ListItemIcon>
                          <DoneIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={inventur.bezeichnung}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {inventur.lager} | Stichtag: {formatDate(inventur.stichtag)}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Typography 
                                  variant="body2"
                                  color={inventur.wertDiff < 0 ? 'error.main' : 'success.main'}
                                  fontWeight="medium"
                                >
                                  Gesamtdifferenz: {inventur.wertDiff.toLocaleString('de-DE')} €
                                </Typography>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))
                }
              </List>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default InventurModule; 