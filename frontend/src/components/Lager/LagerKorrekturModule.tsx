import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Autocomplete,
  Alert,
  Card,
  CardContent,
  FormHelperText,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Save as SaveIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import LagerkorrekturForm from './LagerkorrekturForm';

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
  { id: 1, artikelNr: 'A1001', bezeichnung: 'Futtermittel Standard', einheit: 'kg', bestand: { 1: 1250, 2: 500, 3: 300 } },
  { id: 2, artikelNr: 'A1002', bezeichnung: 'Futtermittel Premium', einheit: 'kg', bestand: { 1: 350, 2: 150, 3: 0 } },
  { id: 3, artikelNr: 'A1003', bezeichnung: 'Futtermittel Spezial', einheit: 'kg', bestand: { 1: 800, 2: 0, 3: 200 } },
  { id: 4, artikelNr: 'B2001', bezeichnung: 'Mineralstoffe', einheit: 'kg', bestand: { 1: 125, 2: 75, 3: 50 } },
  { id: 5, artikelNr: 'C3001', bezeichnung: 'Vitaminzusatz', einheit: 'kg', bestand: { 1: 50, 2: 0, 3: 25 } },
  { id: 6, artikelNr: 'D4001', bezeichnung: 'Verpackungsmaterial', einheit: 'Stk', bestand: { 1: 3000, 2: 1000, 3: 500 } }
];

// Korrekturarten
const KORREKTURARTEN = [
  { id: 'zugang', name: 'Zugang buchen' },
  { id: 'abgang', name: 'Abgang buchen' },
  { id: 'inventur', name: 'Inventurkorrektur' }
];

// Korrekturgruende
const KORREKTURGRUENDE = [
  { id: 'bruch', name: 'Bruch/Beschädigung' },
  { id: 'schwund', name: 'Schwund' },
  { id: 'spende', name: 'Spende/Entnahme' },
  { id: 'qualitaet', name: 'Qualitätsprobleme' },
  { id: 'mhd', name: 'MHD abgelaufen' },
  { id: 'nachlieferung', name: 'Nachlieferung' },
  { id: 'inventur', name: 'Inventurabgleich' },
  { id: 'sonstiges', name: 'Sonstiges' }
];

const LagerKorrekturModule: React.FC = () => {
  const [lager, setLager] = useState<number | ''>('');
  const [artikel, setArtikel] = useState<any | null>(null);
  const [korrekturArt, setKorrekturArt] = useState<string>('');
  const [korrekturGrund, setKorrekturGrund] = useState<string>('');
  const [menge, setMenge] = useState<string>('');
  const [bemerkung, setBemerkung] = useState<string>('');
  const [erfolg, setErfolg] = useState<boolean>(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [aktuellerBestand, setAktuellerBestand] = useState<number | null>(null);
  const [neuerBestand, setNeuerBestand] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Aktuellen Bestand aktualisieren, wenn Lager oder Artikel geändert wird
  React.useEffect(() => {
    if (lager && artikel) {
      const bestand = artikel.bestand[lager] || 0;
      setAktuellerBestand(bestand);
      
      // Neuen Bestand berechnen, wenn auch eine Menge eingegeben wurde
      if (menge && !isNaN(parseFloat(menge))) {
        berechneNeuenBestand(bestand, parseFloat(menge));
      } else {
        setNeuerBestand(bestand);
      }
    } else {
      setAktuellerBestand(null);
      setNeuerBestand(null);
    }
  }, [lager, artikel]);
  
  // Neuen Bestand berechnen, wenn sich die Menge ändert
  React.useEffect(() => {
    if (aktuellerBestand !== null && menge && !isNaN(parseFloat(menge))) {
      berechneNeuenBestand(aktuellerBestand, parseFloat(menge));
    }
  }, [menge, korrekturArt]);
  
  // Berechnung des neuen Bestands basierend auf Korrekturart
  const berechneNeuenBestand = (aktuell: number, korrekturMenge: number) => {
    let neu = aktuell;
    
    switch (korrekturArt) {
      case 'zugang':
        neu = aktuell + korrekturMenge;
        break;
      case 'abgang':
        neu = aktuell - korrekturMenge;
        break;
      case 'inventur':
        neu = korrekturMenge; // Bei Inventur wird der Bestand direkt gesetzt
        break;
    }
    
    setNeuerBestand(neu);
  };
  
  // Korrektur durchführen
  const handleKorrektur = () => {
    // Validierung
    if (!lager) {
      setFehler('Bitte wählen Sie ein Lager aus.');
      return;
    }
    
    if (!artikel) {
      setFehler('Bitte wählen Sie einen Artikel aus.');
      return;
    }
    
    if (!korrekturArt) {
      setFehler('Bitte wählen Sie eine Korrekturart aus.');
      return;
    }
    
    if (!korrekturGrund) {
      setFehler('Bitte wählen Sie einen Korrekturgrund aus.');
      return;
    }
    
    if (!menge || isNaN(parseFloat(menge)) || parseFloat(menge) <= 0) {
      setFehler('Bitte geben Sie eine gültige Menge ein (größer als 0).');
      return;
    }
    
    // Bei Abgang prüfen, ob genügend Bestand vorhanden ist
    if (korrekturArt === 'abgang' && neuerBestand! < 0) {
      setFehler(`Nicht genügend Bestand vorhanden. Aktueller Bestand: ${aktuellerBestand} ${artikel.einheit}`);
      return;
    }
    
    // Fehler zurücksetzen
    setFehler(null);
    
    // Korrektur simulieren (in einer echten Anwendung würde hier ein API-Aufruf erfolgen)
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setErfolg(true);
      
      // In einer echten Anwendung würde der Bestand aktualisiert werden
      // und der aktuelle Bestand würde vom Backend aktualisiert zurückkommen
    }, 1000);
  };
  
  // Formular zurücksetzen
  const handleReset = () => {
    setLager('');
    setArtikel(null);
    setKorrekturArt('');
    setKorrekturGrund('');
    setMenge('');
    setBemerkung('');
    setErfolg(false);
    setFehler(null);
    setAktuellerBestand(null);
    setNeuerBestand(null);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Lagerkorrektur
      </Typography>
      
      {fehler && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {fehler}
        </Alert>
      )}
      
      {erfolg ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            Die Lagerkorrektur wurde erfolgreich durchgeführt.
          </Alert>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Zusammenfassung der Korrektur
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Lager:</Typography>
                  <Typography variant="body1">
                    {MOCK_LAGER.find(l => l.id === lager)?.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Artikel:</Typography>
                  <Typography variant="body1">
                    {artikel?.artikelNr} - {artikel?.bezeichnung}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Korrekturart:</Typography>
                  <Typography variant="body1">
                    {KORREKTURARTEN.find(k => k.id === korrekturArt)?.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Korrekturgrund:</Typography>
                  <Typography variant="body1">
                    {KORREKTURGRUENDE.find(k => k.id === korrekturGrund)?.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Menge:</Typography>
                  <Typography variant="body1">
                    {menge} {artikel?.einheit}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Neuer Bestand:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {neuerBestand?.toLocaleString('de-DE')} {artikel?.einheit}
                  </Typography>
                </Grid>
                
                {bemerkung && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Bemerkung:</Typography>
                    <Typography variant="body1">
                      {bemerkung}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={handleReset}
              sx={{ mr: 1 }}
            >
              Neue Korrektur
            </Button>
            
            <Button 
              variant="contained" 
              startIcon={<HistoryIcon />}
            >
              Korrekturen anzeigen
            </Button>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }} variant="outlined">
              <Typography variant="h6" gutterBottom>
                Lagerkorrektur durchführen
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="lager-label">Lager</InputLabel>
                    <Select
                      labelId="lager-label"
                      value={lager}
                      label="Lager"
                      onChange={(e) => setLager(e.target.value as number)}
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
                  <Autocomplete
                    options={MOCK_ARTIKEL}
                    getOptionLabel={(option) => `${option.artikelNr} - ${option.bezeichnung}`}
                    value={artikel}
                    onChange={(_, newValue) => setArtikel(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Artikel" variant="outlined" />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="korrekturart-label">Korrekturart</InputLabel>
                    <Select
                      labelId="korrekturart-label"
                      value={korrekturArt}
                      label="Korrekturart"
                      onChange={(e) => setKorrekturArt(e.target.value)}
                    >
                      {KORREKTURARTEN.map(art => (
                        <MenuItem key={art.id} value={art.id}>
                          {art.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="korrekturgrund-label">Korrekturgrund</InputLabel>
                    <Select
                      labelId="korrekturgrund-label"
                      value={korrekturGrund}
                      label="Korrekturgrund"
                      onChange={(e) => setKorrekturGrund(e.target.value)}
                    >
                      {KORREKTURGRUENDE.map(grund => (
                        <MenuItem key={grund.id} value={grund.id}>
                          {grund.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label={korrekturArt === 'inventur' ? 'Neuer Bestand' : 'Menge'}
                    type="number"
                    fullWidth
                    value={menge}
                    onChange={(e) => setMenge(e.target.value)}
                    InputProps={{
                      endAdornment: artikel && (
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                          {artikel.einheit}
                        </Typography>
                      )
                    }}
                    helperText={korrekturArt === 'inventur' 
                      ? 'Geben Sie den neuen Sollbestand ein' 
                      : korrekturArt === 'zugang' 
                        ? 'Menge, die hinzugebucht werden soll' 
                        : 'Menge, die abgebucht werden soll'
                    }
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Bemerkung"
                    fullWidth
                    value={bemerkung}
                    onChange={(e) => setBemerkung(e.target.value)}
                    helperText="Optional: Zusätzliche Informationen zur Korrektur"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleReset}
                      startIcon={<RefreshIcon />}
                      sx={{ mr: 1 }}
                    >
                      Zurücksetzen
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      onClick={handleKorrektur}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Wird durchgeführt...' : 'Korrektur durchführen'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bestandsinformationen
                </Typography>
                
                {artikel && lager ? (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Artikel:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {artikel.artikelNr} - {artikel.bezeichnung}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Lager:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {MOCK_LAGER.find(l => l.id === lager)?.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Aktueller Bestand:
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {aktuellerBestand?.toLocaleString('de-DE')} {artikel.einheit}
                      </Typography>
                    </Box>
                    
                    {neuerBestand !== null && korrekturArt && (
                      <Box>
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" color="textSecondary">
                          Neuer Bestand nach Korrektur:
                        </Typography>
                        <Typography 
                          variant="h5" 
                          fontWeight="bold"
                          color={neuerBestand < 0 ? 'error.main' : (neuerBestand > aktuellerBestand! ? 'success.main' : (neuerBestand < aktuellerBestand! ? 'warning.main' : 'inherit'))}
                        >
                          {neuerBestand < 0 ? 'FEHLER: Negativer Bestand' : `${neuerBestand.toLocaleString('de-DE')} ${artikel.einheit}`}
                        </Typography>
                        
                        {neuerBestand < 0 && (
                          <FormHelperText error>
                            Der Bestand kann nicht negativ werden. Bitte reduzieren Sie die Abgangsmenge.
                          </FormHelperText>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Bitte wählen Sie einen Artikel und ein Lager aus, um Bestandsinformationen zu sehen.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default LagerKorrekturModule; 