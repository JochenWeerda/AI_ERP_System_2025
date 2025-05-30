import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Divider,
  Autocomplete,
  Tooltip,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import deLocale from 'date-fns/locale/de';
import {
  Assignment as AssignmentIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  FilterAlt as FilterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CloudUpload as UploadIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import ChargenLebenszyklus from './ChargenLebenszyklus';

// Typen für die Komponente
interface ChargeBericht {
  id: string;
  name: string;
  beschreibung: string;
  berichtsTyp: 'lebenszyklus' | 'qualitaet' | 'verwendung' | 'nachverfolgung';
  chargenIds: string[];
  filterKriterien: {
    zeitraum?: {
      von: Date | null;
      bis: Date | null;
    };
    status?: string[];
    artikel?: string[];
    standorte?: string[];
    benutzer?: string[];
  };
  zeitplan?: {
    aktiv: boolean;
    intervall: 'taeglich' | 'woechentlich' | 'monatlich';
    tag?: number;
    uhrzeit?: string;
    empfaenger: string[];
  };
  erstellt: Date;
  letzteAusfuehrung?: Date;
  naechsteAusfuehrung?: Date;
}

// Beispiel-Daten für die Demonstration
const beispielBerichte: ChargeBericht[] = [
  {
    id: 'B001',
    name: 'Wöchentlicher Chargen-Lebenszyklus-Bericht',
    beschreibung: 'Automatischer wöchentlicher Bericht über den Lebenszyklus aller aktiven Chargen',
    berichtsTyp: 'lebenszyklus',
    chargenIds: [],
    filterKriterien: {
      zeitraum: {
        von: new Date(new Date().setDate(new Date().getDate() - 7)),
        bis: new Date()
      },
      status: ['aktiv'],
      artikel: [],
      standorte: [],
      benutzer: []
    },
    zeitplan: {
      aktiv: true,
      intervall: 'woechentlich',
      tag: 1, // Montag
      uhrzeit: '08:00',
      empfaenger: ['qualitaet@beispiel.de', 'produktion@beispiel.de']
    },
    erstellt: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    letzteAusfuehrung: new Date(new Date().setDate(new Date().getDate() - 7)),
    naechsteAusfuehrung: new Date(new Date().setDate(new Date().getDate() + 1))
  },
  {
    id: 'B002',
    name: 'Monatlicher Qualitätsbericht',
    beschreibung: 'Detaillierte Qualitätsübersicht aller Chargen aus dem letzten Monat',
    berichtsTyp: 'qualitaet',
    chargenIds: [],
    filterKriterien: {
      zeitraum: {
        von: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        bis: new Date()
      },
      status: ['aktiv', 'inaktiv', 'gesperrt'],
      artikel: ['Bio Weizen', 'Bio Roggen'],
      standorte: [],
      benutzer: []
    },
    zeitplan: {
      aktiv: true,
      intervall: 'monatlich',
      tag: 1, // 1. des Monats
      uhrzeit: '06:00',
      empfaenger: ['qualitaet@beispiel.de', 'management@beispiel.de']
    },
    erstellt: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    letzteAusfuehrung: new Date(new Date().setDate(new Date().getDate() - 14)),
    naechsteAusfuehrung: new Date(new Date().setDate(1))
  }
];

// Beispiel-Daten für Chargen
const beispielChargen = [
  { id: 'CH123456', bezeichnung: 'CH-2023-05-001 (Bio Weizen)' },
  { id: 'CH123457', bezeichnung: 'CH-2023-05-002 (Bio Roggen)' },
  { id: 'CH123458', bezeichnung: 'CH-2023-05-003 (Dünger XYZ)' },
  { id: 'CH123459', bezeichnung: 'CH-2023-06-001 (Saatgut ABC)' },
  { id: 'CH123460', bezeichnung: 'CH-2023-06-002 (Bio Hafer)' }
];

// Hauptkomponente
const ChargenBerichteGenerator: React.FC = () => {
  const theme = useTheme();
  const [berichte, setBerichte] = useState<ChargeBericht[]>(beispielBerichte);
  const [selectedBericht, setSelectedBericht] = useState<ChargeBericht | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [newBericht, setNewBericht] = useState<Partial<ChargeBericht>>({
    name: '',
    beschreibung: '',
    berichtsTyp: 'lebenszyklus',
    chargenIds: [],
    filterKriterien: {
      zeitraum: {
        von: new Date(new Date().setDate(new Date().getDate() - 30)),
        bis: new Date()
      },
      status: [],
      artikel: [],
      standorte: [],
      benutzer: []
    },
    zeitplan: {
      aktiv: false,
      intervall: 'woechentlich',
      tag: 1,
      uhrzeit: '08:00',
      empfaenger: []
    }
  });
  
  // Lade die Berichte beim Komponenten-Mount
  useEffect(() => {
    // In einer realen Anwendung würde hier ein API-Aufruf erfolgen
    // Hier simulieren wir einen API-Aufruf
    setLoading(true);
    setTimeout(() => {
      setBerichte(beispielBerichte);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Öffnet den Dialog zum Erstellen eines neuen Berichts
  const handleCreateNew = useCallback(() => {
    setNewBericht({
      name: '',
      beschreibung: '',
      berichtsTyp: 'lebenszyklus',
      chargenIds: [],
      filterKriterien: {
        zeitraum: {
          von: new Date(new Date().setDate(new Date().getDate() - 30)),
          bis: new Date()
        },
        status: [],
        artikel: [],
        standorte: [],
        benutzer: []
      },
      zeitplan: {
        aktiv: false,
        intervall: 'woechentlich',
        tag: 1,
        uhrzeit: '08:00',
        empfaenger: []
      }
    });
    setDialogOpen(true);
  }, []);
  
  // Schließt den Dialog
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);
  
  // Öffnet die Berichtsvorschau
  const handleOpenPreview = useCallback((bericht: ChargeBericht) => {
    setSelectedBericht(bericht);
    setPreviewOpen(true);
  }, []);
  
  // Schließt die Berichtsvorschau
  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
    setSelectedBericht(null);
  }, []);
  
  // Speichert einen neuen Bericht
  const handleSaveBericht = useCallback(() => {
    setLoading(true);
    // In einer realen Anwendung würde hier ein API-Aufruf erfolgen
    setTimeout(() => {
      const neuerBericht: ChargeBericht = {
        id: `B${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
        name: newBericht.name || 'Neuer Bericht',
        beschreibung: newBericht.beschreibung || '',
        berichtsTyp: newBericht.berichtsTyp || 'lebenszyklus',
        chargenIds: newBericht.chargenIds || [],
        filterKriterien: newBericht.filterKriterien || {
          zeitraum: { von: null, bis: null },
          status: [],
          artikel: [],
          standorte: [],
          benutzer: []
        },
        zeitplan: newBericht.zeitplan || {
          aktiv: false,
          intervall: 'woechentlich',
          tag: 1,
          uhrzeit: '08:00',
          empfaenger: []
        },
        erstellt: new Date(),
        naechsteAusfuehrung: newBericht.zeitplan?.aktiv ? new Date(new Date().setDate(new Date().getDate() + 7)) : undefined
      };
      
      setBerichte(prev => [...prev, neuerBericht]);
      setDialogOpen(false);
      setLoading(false);
    }, 1000);
  }, [newBericht]);
  
  // Generiert einen Bericht manuell
  const handleGenerateReport = useCallback((bericht: ChargeBericht) => {
    setGeneratingReport(true);
    setSelectedBericht(bericht);
    
    // In einer realen Anwendung würde hier ein API-Aufruf erfolgen
    setTimeout(() => {
      setGeneratingReport(false);
      setPreviewOpen(true);
    }, 2000);
  }, []);
  
  // Löscht einen Bericht
  const handleDeleteReport = useCallback((berichtId: string) => {
    setLoading(true);
    // In einer realen Anwendung würde hier ein API-Aufruf erfolgen
    setTimeout(() => {
      setBerichte(prev => prev.filter(bericht => bericht.id !== berichtId));
      setLoading(false);
    }, 1000);
  }, []);
  
  // Aktualisiert die Berichtsliste
  const handleRefresh = useCallback(() => {
    setLoading(true);
    // In einer realen Anwendung würde hier ein API-Aufruf erfolgen
    setTimeout(() => {
      // Simuliere aktualisierte Daten
      const aktualisierteBerichte = [...berichte];
      setBerichte(aktualisierteBerichte);
      setLoading(false);
    }, 1000);
  }, [berichte]);
  
  // Aktualisiert ein Feld im neuen Bericht
  const handleUpdateNewBericht = useCallback((field: string, value: any) => {
    setNewBericht(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // Aktualisiert ein Feld in den Filterkriterien des neuen Berichts
  const handleUpdateFilter = useCallback((field: string, value: any) => {
    setNewBericht(prev => ({
      ...prev,
      filterKriterien: {
        ...prev.filterKriterien,
        [field]: value
      }
    }));
  }, []);
  
  // Aktualisiert ein Feld im Zeitplan des neuen Berichts
  const handleUpdateZeitplan = useCallback((field: string, value: any) => {
    setNewBericht(prev => ({
      ...prev,
      zeitplan: {
        ...prev.zeitplan,
        [field]: value
      } as any
    }));
  }, []);
  
  // Formatiert ein Datum für die Anzeige
  const formatDatum = useCallback((datum?: Date | null) => {
    if (!datum) return '-';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(datum);
  }, []);
  
  // Rendert den Status-Chip für einen Bericht
  const renderStatusChip = useCallback((bericht: ChargeBericht) => {
    if (!bericht.zeitplan?.aktiv) {
      return <Chip label="Manuell" size="small" color="default" />;
    }
    
    const heute = new Date();
    const naechsteAusfuehrung = bericht.naechsteAusfuehrung;
    
    if (!naechsteAusfuehrung) {
      return <Chip label="Geplant" size="small" color="info" />;
    }
    
    const istHeute = 
      naechsteAusfuehrung.getDate() === heute.getDate() &&
      naechsteAusfuehrung.getMonth() === heute.getMonth() &&
      naechsteAusfuehrung.getFullYear() === heute.getFullYear();
    
    if (istHeute) {
      return <Chip label="Heute fällig" size="small" color="warning" />;
    }
    
    if (naechsteAusfuehrung < heute) {
      return <Chip label="Überfällig" size="small" color="error" />;
    }
    
    return <Chip label="Geplant" size="small" color="info" />;
  }, []);
  
  // Rendert einen Ladeindikator, wenn Daten geladen werden
  if (loading && berichte.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Automatisierte Chargenberichte
          </Typography>
          <Box>
            <Tooltip title="Berichte aktualisieren">
              <IconButton 
                color="primary" 
                onClick={handleRefresh}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
            >
              Neuen Bericht erstellen
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {berichte.map((bericht) => (
            <Grid item xs={12} md={6} key={bericht.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{bericht.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{bericht.beschreibung}</Typography>
                    </Box>
                    {renderStatusChip(bericht)}
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Berichtstyp:</strong> {bericht.berichtsTyp.charAt(0).toUpperCase() + bericht.berichtsTyp.slice(1)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Erstellt am:</strong> {formatDatum(bericht.erstellt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Letzte Ausführung:</strong> {formatDatum(bericht.letzteAusfuehrung)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nächste Ausführung:</strong> {formatDatum(bericht.naechsteAusfuehrung)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Chip 
                        icon={<ScheduleIcon />}
                        label={bericht.zeitplan?.aktiv 
                          ? `${bericht.zeitplan.intervall}, ${bericht.zeitplan.uhrzeit} Uhr` 
                          : 'Kein Zeitplan'
                        }
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        icon={<FilterIcon />}
                        label={`Filter: ${Object.values(bericht.filterKriterien).flat().filter(Boolean).length}`}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleGenerateReport(bericht)}
                        color="primary"
                        disabled={generatingReport}
                        sx={{ mr: 1 }}
                      >
                        {generatingReport && selectedBericht?.id === bericht.id ? 
                          <CircularProgress size={20} /> : 
                          <AssignmentIcon />
                        }
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteReport(bericht.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {berichte.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Keine Berichte vorhanden. Erstellen Sie einen neuen Bericht, um zu beginnen.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              sx={{ mt: 2 }}
            >
              Neuen Bericht erstellen
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Dialog zum Erstellen eines neuen Berichts */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Neuen Bericht erstellen</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Berichtsname"
                fullWidth
                value={newBericht.name}
                onChange={(e) => handleUpdateNewBericht('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Beschreibung"
                fullWidth
                multiline
                rows={2}
                value={newBericht.beschreibung}
                onChange={(e) => handleUpdateNewBericht('beschreibung', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Berichtstyp</InputLabel>
                <Select
                  value={newBericht.berichtsTyp}
                  label="Berichtstyp"
                  onChange={(e) => handleUpdateNewBericht('berichtsTyp', e.target.value)}
                >
                  <MenuItem value="lebenszyklus">Lebenszyklus</MenuItem>
                  <MenuItem value="qualitaet">Qualität</MenuItem>
                  <MenuItem value="verwendung">Verwendung</MenuItem>
                  <MenuItem value="nachverfolgung">Nachverfolgung</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={beispielChargen}
                getOptionLabel={(option) => option.bezeichnung}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Spezifische Chargen (optional)"
                    placeholder="Chargen auswählen"
                  />
                )}
                onChange={(_, value) => handleUpdateNewBericht('chargenIds', value.map(v => v.id))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Filterkriterien</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
                <DatePicker
                  label="Zeitraum von"
                  value={newBericht.filterKriterien?.zeitraum?.von}
                  onChange={(date) => handleUpdateFilter('zeitraum', { 
                    ...newBericht.filterKriterien?.zeitraum, 
                    von: date 
                  })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
                <DatePicker
                  label="Zeitraum bis"
                  value={newBericht.filterKriterien?.zeitraum?.bis}
                  onChange={(date) => handleUpdateFilter('zeitraum', { 
                    ...newBericht.filterKriterien?.zeitraum, 
                    bis: date 
                  })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={newBericht.filterKriterien?.status || []}
                  label="Status"
                  onChange={(e) => handleUpdateFilter('status', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="aktiv">Aktiv</MenuItem>
                  <MenuItem value="inaktiv">Inaktiv</MenuItem>
                  <MenuItem value="gesperrt">Gesperrt</MenuItem>
                  <MenuItem value="aufgebraucht">Aufgebraucht</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Artikel (durch Komma getrennt)"
                fullWidth
                value={newBericht.filterKriterien?.artikel?.join(', ') || ''}
                onChange={(e) => handleUpdateFilter('artikel', e.target.value.split(', ').filter(Boolean))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Zeitplan (optional)</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Intervall</InputLabel>
                <Select
                  value={newBericht.zeitplan?.intervall || 'woechentlich'}
                  label="Intervall"
                  onChange={(e) => handleUpdateZeitplan('intervall', e.target.value)}
                  disabled={!newBericht.zeitplan?.aktiv}
                >
                  <MenuItem value="taeglich">Täglich</MenuItem>
                  <MenuItem value="woechentlich">Wöchentlich</MenuItem>
                  <MenuItem value="monatlich">Monatlich</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={newBericht.zeitplan?.aktiv || false}
                  onChange={(e) => handleUpdateZeitplan('aktiv', e.target.checked)}
                />
                <Typography>Zeitplan aktivieren</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Uhrzeit (HH:MM)"
                fullWidth
                value={newBericht.zeitplan?.uhrzeit || '08:00'}
                onChange={(e) => handleUpdateZeitplan('uhrzeit', e.target.value)}
                disabled={!newBericht.zeitplan?.aktiv}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="E-Mail-Empfänger (durch Komma getrennt)"
                fullWidth
                value={newBericht.zeitplan?.empfaenger?.join(', ') || ''}
                onChange={(e) => handleUpdateZeitplan('empfaenger', e.target.value.split(', ').filter(Boolean))}
                disabled={!newBericht.zeitplan?.aktiv}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button 
            onClick={handleSaveBericht} 
            variant="contained"
            disabled={!newBericht.name}
          >
            Bericht speichern
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog für die Berichtsvorschau */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="lg" fullWidth>
        <DialogTitle>
          Berichtsvorschau: {selectedBericht?.name}
        </DialogTitle>
        <DialogContent dividers>
          {selectedBericht?.berichtsTyp === 'lebenszyklus' && (
            <ChargenLebenszyklus chargenId={selectedBericht.chargenIds[0] || 'CH123456'} />
          )}
          {selectedBericht?.berichtsTyp !== 'lebenszyklus' && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1">
                Vorschau für Berichtstyp "{selectedBericht?.berichtsTyp}" wird implementiert.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<EmailIcon />}
            onClick={() => console.log('Bericht per E-Mail senden')}
          >
            Per E-Mail senden
          </Button>
          <Button 
            startIcon={<PdfIcon />}
            onClick={() => console.log('Als PDF herunterladen')}
          >
            Als PDF
          </Button>
          <Button 
            startIcon={<TableIcon />}
            onClick={() => console.log('Als Excel herunterladen')}
          >
            Als Excel
          </Button>
          <Button onClick={handleClosePreview} variant="contained">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChargenBerichteGenerator; 