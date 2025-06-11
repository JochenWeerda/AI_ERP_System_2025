import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Autocomplete,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { 
  LocalShipping as LocalShippingIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  QrCode as QrCodeIcon,
  Search as SearchIcon
} from '@mui/icons-material';

// Mock-Daten für Lieferscheine
const MOCK_LIEFERSCHEINE = [
  { id: 'LS-2024-0001', kunde: 'Meyerhof GmbH', datum: '2024-05-10', status: 'neu' },
  { id: 'LS-2024-0002', kunde: 'Landwirtschaft Schmitt', datum: '2024-05-10', status: 'in_bearbeitung' },
  { id: 'LS-2024-0003', kunde: 'Bauernhof Müller', datum: '2024-05-09', status: 'abgeschlossen' }
];

// Mock-Daten für Artikel
const MOCK_ARTIKEL = [
  { id: 1, artikelNr: 'A1001', bezeichnung: 'Futtermittel Standard', einheit: 'kg', lagerbestand: 1250 },
  { id: 2, artikelNr: 'A1002', bezeichnung: 'Futtermittel Premium', einheit: 'kg', lagerbestand: 350 },
  { id: 3, artikelNr: 'A1003', bezeichnung: 'Futtermittel Spezial', einheit: 'kg', lagerbestand: 800 },
  { id: 4, artikelNr: 'B2001', bezeichnung: 'Mineralstoffe', einheit: 'kg', lagerbestand: 125 },
  { id: 5, artikelNr: 'C3001', bezeichnung: 'Vitaminzusatz', einheit: 'kg', lagerbestand: 50 },
  { id: 6, artikelNr: 'D4001', bezeichnung: 'Verpackungsmaterial', einheit: 'Stk', lagerbestand: 3000 }
];

// Mock-Daten für Kunden
const MOCK_KUNDEN = [
  { id: 1, name: 'Meyerhof GmbH', adresse: 'Hauptstraße 1, 12345 Landau' },
  { id: 2, name: 'Landwirtschaft Schmitt', adresse: 'Feldweg 12, 23456 Neustadt' },
  { id: 3, name: 'Bauernhof Müller', adresse: 'Wiesenweg 3, 34567 Altdorf' },
  { id: 4, name: 'Agrar Neumann', adresse: 'Industriestraße 42, 45678 Waldheim' }
];

// Schritte für den Stepper
const steps = ['Lieferschein auswählen', 'Artikel kommissionieren', 'Auslieferung bestätigen'];

const WarenausgangModule: React.FC = () => {
  // State für Stepper
  const [activeStep, setActiveStep] = useState(0);
  
  // State für Lieferschein-Daten
  const [selectedLieferschein, setSelectedLieferschein] = useState<any | null>(null);
  const [artikelPositionen, setArtikelPositionen] = useState<any[]>([]);
  const [kunde, setKunde] = useState<any | null>(null);
  const [lieferdatum, setLieferdatum] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Status-States
  const [loading, setLoading] = useState<boolean>(false);
  const [erfolg, setErfolg] = useState<boolean>(false);
  const [fehler, setFehler] = useState<string | null>(null);
  
  // Lieferschein auswählen
  const handleLieferscheinSelect = (lieferschein: any) => {
    setSelectedLieferschein(lieferschein);
    
    // Simuliere das Laden der Lieferscheindaten
    setLoading(true);
    setTimeout(() => {
      // In einer echten Anwendung würden diese Daten vom Backend kommen
      const kundeData = MOCK_KUNDEN.find(k => k.name === lieferschein.kunde) || null;
      setKunde(kundeData);
      
      // Beispielpositionen für den ausgewählten Lieferschein
      setArtikelPositionen([
        { id: 1, artikel: MOCK_ARTIKEL[0], menge: 200, kommissioniert: false },
        { id: 2, artikel: MOCK_ARTIKEL[3], menge: 50, kommissioniert: false }
      ]);
      
      setLieferdatum(lieferschein.datum);
      setLoading(false);
    }, 800);
  };
  
  // Position kommissionieren
  const handleKommissionieren = (positionId: number) => {
    setArtikelPositionen(
      artikelPositionen.map(pos => 
        pos.id === positionId ? { ...pos, kommissioniert: true } : pos
      )
    );
  };
  
  // Position hinzufügen
  const handleAddPosition = () => {
    setArtikelPositionen([
      ...artikelPositionen,
      { id: Date.now(), artikel: null, menge: '', kommissioniert: false }
    ]);
  };
  
  // Position löschen
  const handleRemovePosition = (id: number) => {
    setArtikelPositionen(artikelPositionen.filter(pos => pos.id !== id));
  };
  
  // Position aktualisieren
  const handleUpdatePosition = (id: number, field: string, value: any) => {
    setArtikelPositionen(
      artikelPositionen.map(pos => 
        pos.id === id ? { ...pos, [field]: value } : pos
      )
    );
  };
  
  // Weiter zum nächsten Schritt
  const handleNext = () => {
    // Validierung für jeden Schritt
    if (activeStep === 0) {
      if (!selectedLieferschein) {
        setFehler('Bitte wählen Sie einen Lieferschein aus.');
        return;
      }
    } else if (activeStep === 1) {
      if (artikelPositionen.length === 0) {
        setFehler('Bitte fügen Sie mindestens eine Position hinzu.');
        return;
      }
      
      // Prüfen, ob alle Positionen kommissioniert sind
      const nichtKommissioniert = artikelPositionen.some(pos => !pos.kommissioniert);
      
      if (nichtKommissioniert) {
        setFehler('Bitte kommissionieren Sie alle Positionen.');
        return;
      }
    }
    
    setFehler(null);
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    
    // Wenn der letzte Schritt erreicht ist, die Auslieferung simulieren
    if (activeStep === steps.length - 1) {
      // In einer echten Anwendung würde hier der API-Aufruf erfolgen
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setErfolg(true);
      }, 1500);
    }
  };
  
  // Zurück zum vorherigen Schritt
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    setFehler(null);
  };
  
  // Formular zurücksetzen
  const handleReset = () => {
    setActiveStep(0);
    setSelectedLieferschein(null);
    setArtikelPositionen([]);
    setKunde(null);
    setLieferdatum(new Date().toISOString().split('T')[0]);
    setErfolg(false);
    setFehler(null);
  };
  
  // Prüfen, ob alle Bedingungen für den aktuellen Schritt erfüllt sind
  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return !!selectedLieferschein;
      case 1:
        return artikelPositionen.length > 0 && !artikelPositionen.some(pos => !pos.kommissioniert);
      case 2:
        return true;
      default:
        return false;
    }
  };
  
  // Rendern des aktuellen Schritts
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Lieferschein auswählen
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={MOCK_LIEFERSCHEINE}
                  getOptionLabel={(option) => `${option.id} - ${option.kunde}`}
                  value={selectedLieferschein}
                  onChange={(_, newValue) => handleLieferscheinSelect(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Lieferschein"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  sx={{ height: '56px' }}
                >
                  Lieferscheine durchsuchen
                </Button>
              </Grid>
            </Grid>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : selectedLieferschein ? (
              <Card variant="outlined" sx={{ mt: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Lieferscheindaten
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Lieferschein-Nr:
                      </Typography>
                      <Typography variant="body1">
                        {selectedLieferschein.id}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Kunde:
                      </Typography>
                      <Typography variant="body1">
                        {selectedLieferschein.kunde}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Datum:
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedLieferschein.datum).toLocaleDateString('de-DE')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Status:
                      </Typography>
                      <Typography variant="body1">
                        {selectedLieferschein.status === 'neu' ? 'Neu' : 
                         selectedLieferschein.status === 'in_bearbeitung' ? 'In Bearbeitung' : 
                         'Abgeschlossen'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ) : null}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Artikel kommissionieren
            </Typography>
            
            {artikelPositionen.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                Keine Positionen vorhanden. Fügen Sie Artikel hinzu, um sie zu kommissionieren.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, mb: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Artikel</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Menge</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Lagerbestand</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Aktionen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {artikelPositionen.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell>
                          {position.artikel ? (
                            <Typography>
                              {position.artikel.artikelNr} - {position.artikel.bezeichnung}
                            </Typography>
                          ) : (
                            <Autocomplete
                              options={MOCK_ARTIKEL}
                              getOptionLabel={(option) => `${option.artikelNr} - ${option.bezeichnung}`}
                              value={position.artikel}
                              onChange={(_, newValue) => handleUpdatePosition(position.id, 'artikel', newValue)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Artikel"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              sx={{ minWidth: 300 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {position.artikel ? (
                            <Typography>
                              {position.menge} {position.artikel.einheit}
                            </Typography>
                          ) : (
                            <TextField
                              label="Menge"
                              type="number"
                              size="small"
                              value={position.menge}
                              onChange={(e) => handleUpdatePosition(position.id, 'menge', e.target.value)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {position.artikel ? (
                            <Typography>
                              {position.artikel.lagerbestand} {position.artikel.einheit}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {position.kommissioniert ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                              <CheckIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">
                                Kommissioniert
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Offen
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {position.kommissioniert ? (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="primary"
                              startIcon={<PrintIcon />}
                            >
                              Pickliste
                            </Button>
                          ) : (
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="primary"
                              onClick={() => handleKommissionieren(position.id)}
                              startIcon={<QrCodeIcon />}
                            >
                              Kommissionieren
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleAddPosition}
              disabled={artikelPositionen.some(pos => !pos.artikel || !pos.menge)}
            >
              Position hinzufügen
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Auslieferung bestätigen
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Lieferschein-Nr:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedLieferschein.id}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Lieferdatum:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(lieferdatum).toLocaleDateString('de-DE')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1.5 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Kunde:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {kunde?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {kunde?.adresse}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1.5 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Kommissionierte Artikel:
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead sx={{ bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                          <TableRow>
                            <TableCell>Artikel-Nr.</TableCell>
                            <TableCell>Bezeichnung</TableCell>
                            <TableCell align="right">Menge</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {artikelPositionen.map((position) => (
                            <TableRow key={position.id}>
                              <TableCell>{position.artikel.artikelNr}</TableCell>
                              <TableCell>{position.artikel.bezeichnung}</TableCell>
                              <TableCell align="right">{position.menge} {position.artikel.einheit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <TextField
              label="Anmerkungen zur Auslieferung"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
            />
          </Box>
        );
      default:
        return 'Unbekannter Schritt';
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Warenausgang
      </Typography>
      
      {fehler && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {fehler}
        </Alert>
      )}
      
      {erfolg ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            Die Auslieferung wurde erfolgreich durchgeführt.
          </Alert>
          
          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom>
              Auslieferung abgeschlossen
            </Typography>
            
            <Typography variant="body1" paragraph>
              Der Lieferschein {selectedLieferschein?.id} wurde erfolgreich ausgeliefert.
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />}
                sx={{ mr: 1 }}
              >
                Lieferschein drucken
              </Button>
              
              <Button 
                variant="contained" 
                onClick={handleReset}
              >
                Neuer Warenausgang
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label} completed={isStepComplete(index) && index < activeStep}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep !== 0 && (
                <Button
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                  startIcon={<ArrowBackIcon />}
                >
                  Zurück
                </Button>
              )}
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(activeStep) || loading}
                startIcon={loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? <LocalShippingIcon /> : null}
              >
                {loading ? 'Wird bearbeitet...' : activeStep === steps.length - 1 ? 'Auslieferung bestätigen' : 'Weiter'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default WarenausgangModule; 