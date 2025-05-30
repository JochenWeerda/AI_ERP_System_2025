import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector
} from '@mui/lab';
import {
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  Science as ScienceIcon,
  Factory as FactoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Event as EventIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';

// Typen für die Komponente
interface ChargenEreignis {
  id: string;
  typ: 'eingang' | 'ausgang' | 'produktion' | 'qualitaet' | 'lagerung' | 'verwendung' | 'status';
  datum: string;
  beschreibung: string;
  details?: string;
  menge?: number;
  einheit?: string;
  ort?: string;
  benutzer?: string;
  status?: 'normal' | 'warnung' | 'kritisch';
}

interface ChargenLebenszyklus {
  chargenId: string;
  chargenNummer: string;
  artikel: {
    id: string;
    bezeichnung: string;
    artikelNummer: string;
  };
  erstelltAm: string;
  mhd?: string;
  status: 'aktiv' | 'inaktiv' | 'gesperrt' | 'aufgebraucht';
  initialeMenge: number;
  aktuelleMenge: number;
  einheit: string;
  ereignisse: ChargenEreignis[];
}

interface ChargenLebenszyklusProps {
  chargenId: string;
}

// Styled Komponenten
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(to right, ${theme.palette.success.main} 0%, ${theme.palette.success.main} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

// Hauptkomponente
const ChargenLebenszyklus: React.FC<ChargenLebenszyklusProps> = ({ chargenId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [daten, setDaten] = useState<ChargenLebenszyklus | null>(null);
  
  // Simuliert einen API-Aufruf zum Laden der Daten
  useEffect(() => {
    const ladeChargenLebenszyklus = async () => {
      setLoading(true);
      try {
        // In einer realen Anwendung würde hier ein API-Aufruf erfolgen
        // const response = await fetch(`/api/chargen/${chargenId}/lebenszyklus`);
        // const data = await response.json();
        
        // Simulierte Daten für die Demonstration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const simulierteDaten: ChargenLebenszyklus = {
          chargenId: "CH123456",
          chargenNummer: "CH-2023-05-001",
          artikel: {
            id: "ART789",
            bezeichnung: "Bio Weizen",
            artikelNummer: "BW-001"
          },
          erstelltAm: "2023-05-01T08:30:00",
          mhd: "2023-11-01",
          status: "aktiv",
          initialeMenge: 5000,
          aktuelleMenge: 3200,
          einheit: "kg",
          ereignisse: [
            {
              id: "E001",
              typ: "eingang",
              datum: "2023-05-01T08:30:00",
              beschreibung: "Wareneingang",
              details: "Lieferung von Landwirt Meyer",
              menge: 5000,
              einheit: "kg",
              ort: "Wareneingang Nord",
              benutzer: "Max Mustermann",
              status: "normal"
            },
            {
              id: "E002",
              typ: "qualitaet",
              datum: "2023-05-01T10:15:00",
              beschreibung: "Qualitätsprüfung",
              details: "Feuchtigkeit: 14%, Protein: 12%, Fallzahl: 320",
              benutzer: "Martina Schmidt",
              status: "normal"
            },
            {
              id: "E003",
              typ: "lagerung",
              datum: "2023-05-01T11:30:00",
              beschreibung: "Einlagerung",
              details: "Silo 3, Zelle B",
              menge: 5000,
              einheit: "kg",
              ort: "Silo 3",
              benutzer: "Klaus Weber",
              status: "normal"
            },
            {
              id: "E004",
              typ: "status",
              datum: "2023-05-02T08:00:00",
              beschreibung: "Statusänderung",
              details: "Freigabe für Produktion",
              benutzer: "Sandra Meier",
              status: "normal"
            },
            {
              id: "E005",
              typ: "verwendung",
              datum: "2023-05-15T09:45:00",
              beschreibung: "Verwendung in Produktion",
              details: "Produktionsauftrag PA-2023-0123",
              menge: 800,
              einheit: "kg",
              ort: "Produktionshalle 1",
              benutzer: "Thomas Schulz",
              status: "normal"
            },
            {
              id: "E006",
              typ: "qualitaet",
              datum: "2023-05-20T14:30:00",
              beschreibung: "Nachkontrolle",
              details: "Feuchtigkeit: 14.2%, keine Auffälligkeiten",
              benutzer: "Martina Schmidt",
              status: "normal"
            },
            {
              id: "E007",
              typ: "verwendung",
              datum: "2023-06-05T08:15:00",
              beschreibung: "Verwendung in Produktion",
              details: "Produktionsauftrag PA-2023-0156",
              menge: 1000,
              einheit: "kg",
              ort: "Produktionshalle 1",
              benutzer: "Thomas Schulz",
              status: "normal"
            }
          ]
        };
        
        setDaten(simulierteDaten);
      } catch (error) {
        console.error("Fehler beim Laden des Chargen-Lebenszyklus:", error);
        // Hier könnte eine Fehlerbehandlung erfolgen
      } finally {
        setLoading(false);
      }
    };
    
    ladeChargenLebenszyklus();
  }, [chargenId]);
  
  // Gibt das passende Icon für einen Ereignistyp zurück
  const getIconForEreignisTyp = useCallback((typ: string) => {
    switch (typ) {
      case 'eingang':
        return <InventoryIcon />;
      case 'ausgang':
        return <ShippingIcon />;
      case 'produktion':
        return <FactoryIcon />;
      case 'qualitaet':
        return <ScienceIcon />;
      case 'lagerung':
        return <InventoryIcon />;
      case 'verwendung':
        return <ShoppingCartIcon />;
      case 'status':
        return <AssignmentIcon />;
      default:
        return <EventIcon />;
    }
  }, []);
  
  // Gibt die Farbe für den Status zurück
  const getColorForStatus = useCallback((status: string) => {
    switch (status) {
      case 'normal':
        return theme.palette.success.main;
      case 'warnung':
        return theme.palette.warning.main;
      case 'kritisch':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  }, [theme]);
  
  // Berechnet den Fortschritt der Charge (wie viel wurde bereits verwendet)
  const fortschritt = useMemo(() => {
    if (!daten) return 0;
    return ((daten.initialeMenge - daten.aktuelleMenge) / daten.initialeMenge) * 100;
  }, [daten]);
  
  // Formatiert ein Datum für die Anzeige
  const formatDatum = useCallback((datumString: string) => {
    const datum = new Date(datumString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(datum);
  }, []);
  
  // Gibt die Phasen des Lebenszyklus zurück
  const lebenszyklus = useMemo(() => {
    if (!daten) return [];
    
    return [
      { label: 'Wareneingang', completed: true },
      { label: 'Qualitätsprüfung', completed: daten.ereignisse.some(e => e.typ === 'qualitaet') },
      { label: 'Lagerung', completed: daten.ereignisse.some(e => e.typ === 'lagerung') },
      { label: 'Produktion', completed: daten.ereignisse.some(e => e.typ === 'verwendung' || e.typ === 'produktion') },
      { label: 'Auslieferung', completed: daten.ereignisse.some(e => e.typ === 'ausgang') }
    ];
  }, [daten]);
  
  const activeStep = useMemo(() => {
    return lebenszyklus.filter(phase => phase.completed).length;
  }, [lebenszyklus]);
  
  // Rendert die Ladeanzeige
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Rendert eine Meldung, wenn keine Daten gefunden wurden
  if (!daten) {
    return (
      <Paper sx={{ p: 3, my: 2 }}>
        <Typography variant="h6" color="error">
          Keine Daten für die angegebene Charge gefunden.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Chargen-Lebenszyklus
          </Typography>
          <Box>
            <Tooltip title="Bericht drucken">
              <IconButton color="primary" sx={{ mr: 1 }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bericht herunterladen">
              <IconButton color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Charge</Typography>
                <Typography variant="h6">{daten.chargenNummer}</Typography>
                <Typography variant="body2">{daten.artikel.bezeichnung} ({daten.artikel.artikelNummer})</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Erstellt am:</strong> {formatDatum(daten.erstelltAm)}
                  </Typography>
                  {daten.mhd && (
                    <Typography variant="body2">
                      <strong>Mindesthaltbarkeitsdatum:</strong> {new Date(daten.mhd).toLocaleDateString('de-DE')}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Status</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={daten.status.charAt(0).toUpperCase() + daten.status.slice(1)} 
                    color={daten.status === 'aktiv' ? 'success' : daten.status === 'gesperrt' ? 'error' : 'default'}
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="body2">
                    {daten.aktuelleMenge} {daten.einheit} von {daten.initialeMenge} {daten.einheit} verfügbar
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Box sx={{ 
                    height: 10, 
                    backgroundColor: theme.palette.grey[200], 
                    borderRadius: 5, 
                    position: 'relative' 
                  }}>
                    <Box sx={{ 
                      height: '100%', 
                      width: `${fortschritt}%`, 
                      backgroundColor: theme.palette.primary.main, 
                      borderRadius: 5, 
                      position: 'absolute', 
                      top: 0, 
                      left: 0 
                    }} />
                  </Box>
                </Box>
                <Typography variant="body2">
                  {Math.round(fortschritt)}% verwendet
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Lebenszyklus-Phasen</Typography>
          <Stepper activeStep={activeStep} alternativeLabel connector={<ColorlibConnector />}>
            {lebenszyklus.map((phase, index) => (
              <Step key={phase.label} completed={phase.completed}>
                <StepLabel>{phase.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Ereignisverlauf</Typography>
        <Timeline position="alternate">
          {daten.ereignisse.map((ereignis) => (
            <TimelineItem key={ereignis.id}>
              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: getColorForStatus(ereignis.status || 'normal') }}>
                  {getIconForEreignisTyp(ereignis.typ)}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1">{ereignis.beschreibung}</Typography>
                      <Typography variant="caption">{formatDatum(ereignis.datum)}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {ereignis.details}
                    </Typography>
                    {(ereignis.menge !== undefined && ereignis.einheit) && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Menge:</strong> {ereignis.menge} {ereignis.einheit}
                      </Typography>
                    )}
                    {ereignis.ort && (
                      <Typography variant="body2">
                        <strong>Ort:</strong> {ereignis.ort}
                      </Typography>
                    )}
                    {ereignis.benutzer && (
                      <Typography variant="body2">
                        <strong>Benutzer:</strong> {ereignis.benutzer}
                      </Typography>
                    )}
                    {ereignis.status === 'warnung' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: theme.palette.warning.main }}>
                        <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="inherit">
                          Warnung: Abweichung festgestellt
                        </Typography>
                      </Box>
                    )}
                    {ereignis.status === 'kritisch' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: theme.palette.error.main }}>
                        <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="inherit">
                          Kritisch: Sofortige Überprüfung erforderlich
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => console.log('Download vollständigen Bericht')}
          >
            Vollständigen Bericht herunterladen
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChargenLebenszyklus; 