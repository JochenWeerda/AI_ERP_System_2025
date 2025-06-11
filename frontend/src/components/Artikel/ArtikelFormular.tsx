import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`artikel-form-tabpanel-${index}`}
      aria-labelledby={`artikel-form-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Dummy-Daten für Dropdowns
const artikelGruppen = [
  'Düngemittel',
  'Pflanzenschutz',
  'Saatgut',
  'Ersatzteile',
  'Futtermittel',
  'Bewässerung'
];

const einheiten = [
  'Stück',
  'Sack',
  'Liter',
  'kg',
  'Tonne',
  'Set',
  'Palette',
  'Karton'
];

const gewichtEinheiten = [
  'g',
  'kg',
  't'
];

const artikelTypen = [
  'Handelsware',
  'Eigenprodukt',
  'Dienstleistung',
  'Verbrauchsmaterial'
];

const mwstSaetze = [
  { wert: 19, label: '19% (Standard)' },
  { wert: 7, label: '7% (Ermäßigt)' },
  { wert: 0, label: '0% (Befreit)' }
];

interface ArtikelFormularProps {
  artikel?: any;
  onSave: (artikel: any) => void;
  onCancel: () => void;
}

const ArtikelFormular: React.FC<ArtikelFormularProps> = ({ artikel, onSave, onCancel }) => {
  // Standardwerte für neuen Artikel
  const defaultArtikel = {
    artikelnummer: '',
    bezeichnung: '',
    beschreibung: '',
    gruppe: '',
    einheit: 'Stück',
    gewicht: 0,
    gewichtEinheit: 'kg',
    bestand: 0,
    mindestBestand: 0,
    einkaufspreis: 0,
    verkaufspreis: 0,
    mwstSatz: 19,
    herkunft: 'Inland',
    eanCode: '',
    artikelTyp: 'Handelsware',
    lieferant: '',
    lieferantenArtikelNr: '',
    lagerplaetze: [],
    preise: [
      { preisTyp: 'Standard', preis: 0, mengeAb: 1 }
    ],
    aktiv: true
  };

  const [formData, setFormData] = useState(artikel || defaultArtikel);
  const [tabValue, setTabValue] = useState(0);
  const [errors, setErrors] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Beim ersten Laden oder wenn sich der Artikel ändert
  useEffect(() => {
    if (artikel) {
      setFormData(artikel);
    } else {
      setFormData(defaultArtikel);
    }
    setHasChanges(false);
  }, [artikel]);

  // Tab-Wechsel
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Textfeld-Änderung
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    
    // Fehler für dieses Feld zurücksetzen
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Numerisches Feld ändern
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({ ...prev, [name]: numValue }));
    setHasChanges(true);
  };

  // Select-Änderung
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  // Switch-Änderung
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    setHasChanges(true);
  };

  // Preis hinzufügen
  const handleAddPreis = () => {
    const newPreise = [...formData.preise];
    // Höchste mengeAb finden und eine neue Staffel darüber anlegen
    const maxMengeAb = Math.max(...newPreise.map(p => p.mengeAb));
    newPreise.push({ preisTyp: `Staffel ${newPreise.length}`, preis: formData.verkaufspreis, mengeAb: maxMengeAb + 10 });
    setFormData(prev => ({ ...prev, preise: newPreise }));
    setHasChanges(true);
  };

  // Preis entfernen
  const handleRemovePreis = (index: number) => {
    if (index === 0) return; // Standard-Preis nicht löschen
    const newPreise = [...formData.preise];
    newPreise.splice(index, 1);
    setFormData(prev => ({ ...prev, preise: newPreise }));
    setHasChanges(true);
  };

  // Preis ändern
  const handlePreisChange = (index: number, field: string, value: any) => {
    const newPreise = [...formData.preise];
    newPreise[index] = { ...newPreise[index], [field]: field === 'preis' || field === 'mengeAb' ? parseFloat(value) : value };
    setFormData(prev => ({ ...prev, preise: newPreise }));
    setHasChanges(true);
  };

  // Lagerplatz hinzufügen
  const handleAddLagerplatz = () => {
    const newLagerplaetze = [...formData.lagerplaetze];
    newLagerplaetze.push({ lager: 'Hauptlager', platz: '', bestand: 0 });
    setFormData(prev => ({ ...prev, lagerplaetze: newLagerplaetze }));
    setHasChanges(true);
  };

  // Lagerplatz entfernen
  const handleRemoveLagerplatz = (index: number) => {
    const newLagerplaetze = [...formData.lagerplaetze];
    newLagerplaetze.splice(index, 1);
    setFormData(prev => ({ ...prev, lagerplaetze: newLagerplaetze }));
    setHasChanges(true);
  };

  // Lagerplatz ändern
  const handleLagerplatzChange = (index: number, field: string, value: any) => {
    const newLagerplaetze = [...formData.lagerplaetze];
    newLagerplaetze[index] = { ...newLagerplaetze[index], [field]: field === 'bestand' ? parseFloat(value) : value };
    setFormData(prev => ({ ...prev, lagerplaetze: newLagerplaetze }));
    setHasChanges(true);
  };

  // Formular validieren
  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.artikelnummer.trim()) {
      newErrors.artikelnummer = 'Artikelnummer ist erforderlich';
    }
    
    if (!formData.bezeichnung.trim()) {
      newErrors.bezeichnung = 'Bezeichnung ist erforderlich';
    }
    
    if (!formData.gruppe) {
      newErrors.gruppe = 'Bitte Artikelgruppe auswählen';
    }
    
    if (formData.verkaufspreis < 0) {
      newErrors.verkaufspreis = 'Verkaufspreis darf nicht negativ sein';
    }
    
    // Preise validieren
    let hasPreisErrors = false;
    formData.preise.forEach((preis: any, index: number) => {
      if (preis.preis < 0) {
        newErrors[`preis_${index}`] = 'Preis darf nicht negativ sein';
        hasPreisErrors = true;
      }
      if (preis.mengeAb <= 0) {
        newErrors[`mengeAb_${index}`] = 'Menge muss größer als 0 sein';
        hasPreisErrors = true;
      }
    });
    
    if (hasPreisErrors) {
      setTabValue(1); // Zu Preise-Tab wechseln
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formular absenden
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="artikel formular tabs">
            <Tab label="Grunddaten" id="artikel-form-tab-0" />
            <Tab label="Preise" id="artikel-form-tab-1" />
            <Tab label="Lager" id="artikel-form-tab-2" />
          </Tabs>
        </Box>

        {/* Grunddaten Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Artikelstammdaten
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Artikelnummer"
                name="artikelnummer"
                value={formData.artikelnummer}
                onChange={handleChange}
                required
                error={!!errors.artikelnummer}
                helperText={errors.artikelnummer}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={8}>
              <TextField
                fullWidth
                label="Bezeichnung"
                name="bezeichnung"
                value={formData.bezeichnung}
                onChange={handleChange}
                required
                error={!!errors.bezeichnung}
                helperText={errors.bezeichnung}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth error={!!errors.gruppe}>
                <InputLabel id="gruppe-label">Artikelgruppe</InputLabel>
                <Select
                  labelId="gruppe-label"
                  name="gruppe"
                  value={formData.gruppe}
                  onChange={handleSelectChange}
                  label="Artikelgruppe"
                  required
                >
                  <MenuItem value="">
                    <em>Bitte wählen</em>
                  </MenuItem>
                  {artikelGruppen.map(gruppe => (
                    <MenuItem key={gruppe} value={gruppe}>{gruppe}</MenuItem>
                  ))}
                </Select>
                {errors.gruppe && (
                  <Typography variant="caption" color="error">
                    {errors.gruppe}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="einheit-label">Einheit</InputLabel>
                <Select
                  labelId="einheit-label"
                  name="einheit"
                  value={formData.einheit}
                  onChange={handleSelectChange}
                  label="Einheit"
                >
                  {einheiten.map(einheit => (
                    <MenuItem key={einheit} value={einheit}>{einheit}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="artikelTyp-label">Artikeltyp</InputLabel>
                <Select
                  labelId="artikelTyp-label"
                  name="artikelTyp"
                  value={formData.artikelTyp}
                  onChange={handleSelectChange}
                  label="Artikeltyp"
                >
                  {artikelTypen.map(typ => (
                    <MenuItem key={typ} value={typ}>{typ}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Beschreibung"
                name="beschreibung"
                value={formData.beschreibung}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Gewicht und Maße
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Gewicht"
                name="gewicht"
                value={formData.gewicht}
                onChange={handleNumberChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <FormControl variant="standard" sx={{ minWidth: 60 }}>
                        <Select
                          name="gewichtEinheit"
                          value={formData.gewichtEinheit}
                          onChange={handleSelectChange}
                        >
                          {gewichtEinheiten.map(einheit => (
                            <MenuItem key={einheit} value={einheit}>{einheit}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="EAN-Code"
                name="eanCode"
                value={formData.eanCode}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Einkauf und Verkauf
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Lieferant"
                name="lieferant"
                value={formData.lieferant}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Lieferanten-Artikelnummer"
                name="lieferantenArtikelNr"
                value={formData.lieferantenArtikelNr}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Herkunft"
                name="herkunft"
                value={formData.herkunft}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Einkaufspreis"
                name="einkaufspreis"
                value={formData.einkaufspreis}
                onChange={handleNumberChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Verkaufspreis"
                name="verkaufspreis"
                value={formData.verkaufspreis}
                onChange={handleNumberChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                error={!!errors.verkaufspreis}
                helperText={errors.verkaufspreis}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="mwstSatz-label">MwSt-Satz</InputLabel>
                <Select
                  labelId="mwstSatz-label"
                  name="mwstSatz"
                  value={formData.mwstSatz}
                  onChange={handleSelectChange}
                  label="MwSt-Satz"
                >
                  {mwstSaetze.map(satz => (
                    <MenuItem key={satz.wert} value={satz.wert}>{satz.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.aktiv}
                    onChange={handleSwitchChange}
                    name="aktiv"
                    color="primary"
                  />
                }
                label="Artikel ist aktiv"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Preise Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Preisstaffeln
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {formData.preise.map((preis: any, index: number) => (
              <Grid item xs={12} key={index}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Preistyp"
                        value={preis.preisTyp}
                        onChange={(e) => handlePreisChange(index, 'preisTyp', e.target.value)}
                        disabled={index === 0} // Standard-Preis nicht änderbar
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Ab Menge"
                        value={preis.mengeAb}
                        onChange={(e) => handlePreisChange(index, 'mengeAb', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{formData.einheit}</InputAdornment>,
                        }}
                        disabled={index === 0} // Standard-Preis immer ab 1
                        error={!!errors[`mengeAb_${index}`]}
                        helperText={errors[`mengeAb_${index}`]}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Preis"
                        value={preis.preis}
                        onChange={(e) => handlePreisChange(index, 'preis', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">€</InputAdornment>,
                        }}
                        error={!!errors[`preis_${index}`]}
                        helperText={errors[`preis_${index}`]}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{ textAlign: 'right' }}>
                      {index > 0 && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleRemovePreis(index)}
                        >
                          Entfernen
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddPreis}
              >
                Preisstaffel hinzufügen
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Lager Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Bestandsinformationen
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Aktueller Bestand"
                name="bestand"
                value={formData.bestand}
                onChange={handleNumberChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{formData.einheit}</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Mindestbestand"
                name="mindestBestand"
                value={formData.mindestBestand}
                onChange={handleNumberChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{formData.einheit}</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Der Gesamtbestand setzt sich aus den Beständen an den einzelnen Lagerplätzen zusammen.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Lagerplätze
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {formData.lagerplaetze.map((lagerplatz: any, index: number) => (
              <Grid item xs={12} key={index}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Lager"
                        value={lagerplatz.lager}
                        onChange={(e) => handleLagerplatzChange(index, 'lager', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Lagerplatz"
                        value={lagerplatz.platz}
                        onChange={(e) => handleLagerplatzChange(index, 'platz', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Bestand"
                        value={lagerplatz.bestand}
                        onChange={(e) => handleLagerplatzChange(index, 'bestand', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{formData.einheit}</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{ textAlign: 'right' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleRemoveLagerplatz(index)}
                      >
                        Entfernen
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddLagerplatz}
              >
                Lagerplatz hinzufügen
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          onClick={onCancel}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={!hasChanges}
        >
          Speichern
        </Button>
      </Box>
    </form>
  );
};

export default ArtikelFormular; 