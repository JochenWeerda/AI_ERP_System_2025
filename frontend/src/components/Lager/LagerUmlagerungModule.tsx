import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Alert,
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import UmlagerungForm from './UmlagerungForm';

// Mock-Daten für die Lager
const MOCK_LAGER = [
  { id: 1, name: 'Hauptlager' },
  { id: 2, name: 'Außenlager' },
  { id: 3, name: 'Speziallager' },
  { id: 4, name: 'Zentrallager' },
  { id: 5, name: 'Kommissionslager' }
];

// Mock-Daten für Artikel
const MOCK_ARTIKEL = [
  { id: 1, artikelNr: 'A1001', bezeichnung: 'Futtermittel Standard', einheit: 'kg' },
  { id: 2, artikelNr: 'A1002', bezeichnung: 'Futtermittel Premium', einheit: 'kg' },
  { id: 3, artikelNr: 'A1003', bezeichnung: 'Futtermittel Spezial', einheit: 'kg' },
  { id: 4, artikelNr: 'B2001', bezeichnung: 'Mineralstoffe', einheit: 'kg' },
  { id: 5, artikelNr: 'C3001', bezeichnung: 'Vitaminzusatz', einheit: 'kg' },
  { id: 6, artikelNr: 'D4001', bezeichnung: 'Verpackungsmaterial', einheit: 'Stk' }
];

// Schritte für den Stepper
const steps = ['Quell- und Ziellager wählen', 'Artikel auswählen', 'Umlagerung bestätigen'];

const LagerUmlagerungModule: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [quellLager, setQuellLager] = useState<number | ''>('');
  const [zielLager, setZielLager] = useState<number | ''>('');
  const [umlagerungsPositionen, setUmlagerungsPositionen] = useState<any[]>([]);
  const [erfolg, setErfolg] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  
  // Hinzufügen einer leeren Position
  const addPosition = () => {
    setUmlagerungsPositionen([
      ...umlagerungsPositionen,
      { id: Date.now(), artikel: null, menge: '', bemerkung: '' }
    ]);
  };
  
  // Löschen einer Position
  const removePosition = (id: number) => {
    setUmlagerungsPositionen(umlagerungsPositionen.filter(pos => pos.id !== id));
  };
  
  // Aktualisieren einer Position
  const updatePosition = (id: number, field: string, value: any) => {
    setUmlagerungsPositionen(
      umlagerungsPositionen.map(pos => 
        pos.id === id ? { ...pos, [field]: value } : pos
      )
    );
  };
  
  // Weiter zum nächsten Schritt
  const handleNext = () => {
    // Validierung für jeden Schritt
    if (activeStep === 0) {
      if (quellLager === '' || zielLager === '') {
        setFehler('Bitte wählen Sie Quell- und Ziellager aus.');
        return;
      }
      if (quellLager === zielLager) {
        setFehler('Quell- und Ziellager dürfen nicht identisch sein.');
        return;
      }
    } else if (activeStep === 1) {
      if (umlagerungsPositionen.length === 0) {
        setFehler('Bitte fügen Sie mindestens eine Position hinzu.');
        return;
      }
      
      // Prüfen, ob alle Positionen vollständig sind
      const unvollstaendig = umlagerungsPositionen.some(
        pos => !pos.artikel || !pos.menge || pos.menge <= 0
      );
      
      if (unvollstaendig) {
        setFehler('Bitte füllen Sie alle Artikelpositionen vollständig aus.');
        return;
      }
    }
    
    setFehler(null);
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    
    // Wenn der letzte Schritt erreicht ist, die Umlagerung simulieren
    if (activeStep === steps.length - 1) {
      // In einer echten Anwendung würde hier der API-Aufruf erfolgen
      setTimeout(() => {
        setErfolg(true);
      }, 1000);
    }
  };
  
  // Zurück zum vorherigen Schritt
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    setFehler(null);
  };
  
  // Zurücksetzen des Formulars
  const handleReset = () => {
    setActiveStep(0);
    setQuellLager('');
    setZielLager('');
    setUmlagerungsPositionen([]);
    setErfolg(false);
    setFehler(null);
  };
  
  // Rendern des aktuellen Schritts
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="quell-lager-label">Quell-Lager</InputLabel>
                <Select
                  labelId="quell-lager-label"
                  value={quellLager}
                  label="Quell-Lager"
                  onChange={(e) => setQuellLager(e.target.value as number)}
                >
                  {MOCK_LAGER.map(lager => (
                    <MenuItem key={lager.id} value={lager.id}>
                      {lager.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="ziel-lager-label">Ziel-Lager</InputLabel>
                <Select
                  labelId="ziel-lager-label"
                  value={zielLager}
                  label="Ziel-Lager"
                  onChange={(e) => setZielLager(e.target.value as number)}
                >
                  {MOCK_LAGER.map(lager => (
                    <MenuItem key={lager.id} value={lager.id}>
                      {lager.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            {umlagerungsPositionen.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Keine Positionen vorhanden. Bitte fügen Sie Artikel hinzu.
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={addPosition}
                  sx={{ mt: 2 }}
                >
                  Artikel hinzufügen
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined" elevation={0}>
                  <Table>
                    <TableHead sx={{ backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Artikel</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Menge</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Bemerkung</TableCell>
                        <TableCell sx={{ width: 60 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {umlagerungsPositionen.map((position, index) => (
                        <TableRow key={position.id}>
                          <TableCell>
                            <Autocomplete
                              options={MOCK_ARTIKEL}
                              getOptionLabel={(option) => `${option.artikelNr} - ${option.bezeichnung}`}
                              value={position.artikel}
                              onChange={(_, newValue) => updatePosition(position.id, 'artikel', newValue)}
                              renderInput={(params) => (
                                <TextField {...params} label="Artikel" variant="outlined" size="small" />
                              )}
                              sx={{ minWidth: 300 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              label="Menge"
                              type="number"
                              size="small"
                              value={position.menge}
                              onChange={(e) => updatePosition(position.id, 'menge', e.target.value)}
                              InputProps={{
                                endAdornment: position.artikel && (
                                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                                    {position.artikel.einheit}
                                  </Typography>
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              label="Bemerkung"
                              size="small"
                              value={position.bemerkung}
                              onChange={(e) => updatePosition(position.id, 'bemerkung', e.target.value)}
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => removePosition(position.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={addPosition}
                  sx={{ mt: 2 }}
                >
                  Weitere Position
                </Button>
              </>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Übersicht der Umlagerung
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Von Lager:</Typography>
                <Typography variant="body1">
                  {MOCK_LAGER.find(l => l.id === quellLager)?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Nach Lager:</Typography>
                <Typography variant="body1">
                  {MOCK_LAGER.find(l => l.id === zielLager)?.name}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Positionen:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Artikel-Nr.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Bezeichnung</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Menge</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Bemerkung</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {umlagerungsPositionen.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>{position.artikel.artikelNr}</TableCell>
                      <TableCell>{position.artikel.bezeichnung}</TableCell>
                      <TableCell>{position.menge} {position.artikel.einheit}</TableCell>
                      <TableCell>{position.bemerkung}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      default:
        return 'Unbekannter Schritt';
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Lager-zu-Lager Umlagerung
      </Typography>
      
      {fehler && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {fehler}
        </Alert>
      )}
      
      {erfolg ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Die Umlagerung wurde erfolgreich durchgeführt.
          </Alert>
          
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />}
            sx={{ mr: 1 }}
          >
            Umlagerungsbeleg drucken
          </Button>
          
          <Button 
            variant="outlined"
            onClick={handleReset}
          >
            Neue Umlagerung
          </Button>
        </Box>
      ) : (
        <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
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
                  startIcon={<CancelIcon />}
                >
                  Zurück
                </Button>
              )}
              
              <Button
                variant="contained"
                onClick={handleNext}
                startIcon={activeStep === steps.length - 1 ? <SaveIcon /> : undefined}
              >
                {activeStep === steps.length - 1 ? 'Umlagerung durchführen' : 'Weiter'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default LagerUmlagerungModule; 