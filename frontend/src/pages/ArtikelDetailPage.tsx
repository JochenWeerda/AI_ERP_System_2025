import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Divider, 
  Button, 
  Chip, 
  Tabs, 
  Tab,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  LocalOffer as LocalOfferIcon,
  Inventory as InventoryIcon,
  PriceChange as PriceChangeIcon,
  History as HistoryIcon,
  Description as DescriptionIcon,
  GridView as GridViewIcon,
  ImageNotSupported as ImageNotSupportedIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import ArtikelFormular from '../components/Artikel/ArtikelFormular';

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
      id={`artikel-detail-tabpanel-${index}`}
      aria-labelledby={`artikel-detail-tab-${index}`}
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

// Dummy-Artikeldaten (im realen Einsatz durch API-Abfrage ersetzt)
const dummyArtikel = {
  id: 101,
  artikelnummer: 'ART-101',
  bezeichnung: 'Düngemittel Standard',
  beschreibung: 'Hochwertiges Düngemittel für den professionellen Einsatz in der Landwirtschaft. Optimierte Nährstoffzusammensetzung für maximalen Ertrag.',
  gruppe: 'Düngemittel',
  einheit: 'Sack',
  gewicht: 25,
  gewichtEinheit: 'kg',
  bestand: 120,
  mindestBestand: 20,
  einkaufspreis: 32.50,
  verkaufspreis: 45.99,
  mwstSatz: 19,
  herkunft: 'Inland',
  eanCode: '4012345678901',
  artikelTyp: 'Handelsware',
  lieferant: 'Landw. Großhandel GmbH',
  lieferantenArtikelNr: 'LG-DM-001',
  lagerplaetze: [
    { lager: 'Hauptlager', platz: 'A-12-3', bestand: 100 },
    { lager: 'Außenlager', platz: 'B-05-2', bestand: 20 }
  ],
  preise: [
    { preisTyp: 'Standard', preis: 45.99, mengeAb: 1 },
    { preisTyp: 'Staffel 1', preis: 43.50, mengeAb: 10 },
    { preisTyp: 'Staffel 2', preis: 41.99, mengeAb: 25 }
  ],
  erstelltAm: '2023-01-15',
  geaendertAm: '2023-05-22',
  aktiv: true
};

const ArtikelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artikel, setArtikel] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Artikel laden (simuliert)
  useEffect(() => {
    const loadArtikel = async () => {
      try {
        // In einer realen Anwendung würden wir den Service aufrufen
        // const response = await StammdatenService.getArtikelById(id);
        // setArtikel(response.data);

        // Simulierte Verzögerung
        setTimeout(() => {
          setArtikel(dummyArtikel);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Fehler beim Laden des Artikels:', error);
        setError('Der Artikel konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
        setLoading(false);
      }
    };

    loadArtikel();
  }, [id]);

  // Tab-Wechsel-Handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Zurück zur Übersicht
  const handleBack = () => {
    navigate('/stammdaten/artikel');
  };

  // Bearbeiten starten
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Artikel löschen
  const handleDelete = () => {
    if (window.confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
      // In einer realen Anwendung würden wir den Service aufrufen
      // await StammdatenService.deleteArtikel(id);
      console.log('Artikel löschen:', id);
      navigate('/stammdaten/artikel');
    }
  };

  // Speichern nach Bearbeitung
  const handleSave = (updatedArtikel: any) => {
    // In einer realen Anwendung würden wir den Service aufrufen
    // await StammdatenService.updateArtikel(id, updatedArtikel);
    console.log('Artikel speichern:', updatedArtikel);
    setArtikel(updatedArtikel);
    setIsEditing(false);
  };

  // Abbrechen der Bearbeitung
  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Zurück zur Übersicht
        </Button>
      </Container>
    );
  }

  if (!artikel) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 3 }}>Artikel nicht gefunden</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Zurück zur Übersicht
        </Button>
      </Container>
    );
  }

  if (isEditing) {
    return (
      <Container>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="#" onClick={handleBack}>
              Stammdaten
            </Link>
            <Link color="inherit" href="#" onClick={handleBack}>
              Artikel
            </Link>
            <Typography color="text.primary">Bearbeiten: {artikel.artikelnummer}</Typography>
          </Breadcrumbs>
        </Box>
        <ArtikelFormular 
          artikel={artikel} 
          onSave={handleSave} 
          onCancel={handleCancel} 
        />
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#" onClick={handleBack}>
            Stammdaten
          </Link>
          <Link color="inherit" href="#" onClick={handleBack}>
            Artikel
          </Link>
          <Typography color="text.primary">{artikel.artikelnummer}</Typography>
        </Breadcrumbs>
      </Box>
      
      <Paper sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {artikel.bezeichnung}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mr: 2 }}>
                Artikelnummer: {artikel.artikelnummer}
              </Typography>
              <Chip 
                label={artikel.gruppe} 
                color="primary" 
                size="small" 
                icon={<LocalOfferIcon />} 
              />
              <Chip 
                label={artikel.aktiv ? 'Aktiv' : 'Inaktiv'} 
                color={artikel.aktiv ? 'success' : 'default'} 
                size="small" 
                sx={{ ml: 1 }} 
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Tooltip title="Bearbeiten">
              <IconButton color="primary" onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Löschen">
              <IconButton color="error" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zurück">
              <IconButton onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="artikel detail tabs">
          <Tab label="Allgemein" icon={<DescriptionIcon />} iconPosition="start" id="artikel-detail-tab-0" />
          <Tab label="Lagerbestand" icon={<InventoryIcon />} iconPosition="start" id="artikel-detail-tab-1" />
          <Tab label="Preise" icon={<PriceChangeIcon />} iconPosition="start" id="artikel-detail-tab-2" />
          <Tab label="Historie" icon={<HistoryIcon />} iconPosition="start" id="artikel-detail-tab-3" />
        </Tabs>
      </Box>

      {/* Allgemeine Informationen */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Grunddaten
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Bezeichnung</Typography>
                  <Typography variant="body2">{artikel.bezeichnung}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Artikelgruppe</Typography>
                  <Typography variant="body2">{artikel.gruppe}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Einheit</Typography>
                  <Typography variant="body2">{artikel.einheit}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Gewicht</Typography>
                  <Typography variant="body2">{artikel.gewicht} {artikel.gewichtEinheit}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Artikel-Typ</Typography>
                  <Typography variant="body2">{artikel.artikelTyp}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">EAN-Code</Typography>
                  <Typography variant="body2">{artikel.eanCode || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Beschreibung</Typography>
                  <Typography variant="body2">{artikel.beschreibung || '-'}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Lieferantendaten
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Lieferant</Typography>
                  <Typography variant="body2">{artikel.lieferant || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Lieferanten-Art.-Nr.</Typography>
                  <Typography variant="body2">{artikel.lieferantenArtikelNr || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Herkunft</Typography>
                  <Typography variant="body2">{artikel.herkunft || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Einkaufspreis</Typography>
                  <Typography variant="body2">{artikel.einkaufspreis?.toFixed(2)} €</Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Verkaufsdaten
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Verkaufspreis</Typography>
                    <Typography variant="body2">{artikel.verkaufspreis?.toFixed(2)} €</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">MwSt-Satz</Typography>
                    <Typography variant="body2">{artikel.mwstSatz} %</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 200, 
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box>
                  <ImageNotSupportedIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  <Typography variant="body2" color="text.secondary">
                    Kein Bild verfügbar
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Lagerbestand */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Bestandsdaten
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Gesamtbestand</Typography>
                  <Typography variant="h4">{artikel.bestand} {artikel.einheit}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Mindestbestand</Typography>
                  <Typography variant="body1">{artikel.mindestBestand} {artikel.einheit}</Typography>
                </Grid>
              </Grid>
              
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 3 }}
                startIcon={<GridViewIcon />}
              >
                Bestandshistorie
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Lagerplätze
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {artikel.lagerplaetze && artikel.lagerplaetze.length > 0 ? (
                <Grid container spacing={2}>
                  {artikel.lagerplaetze.map((lagerplatz: any, index: number) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper 
                        variant="outlined" 
                        sx={{ p: 2, borderColor: 'divider' }}
                      >
                        <Typography variant="subtitle1">{lagerplatz.lager}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Platz: {lagerplatz.platz}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {lagerplatz.bestand} {artikel.einheit}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Keine Lagerplätze definiert
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Preise */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Preisstaffeln
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {artikel.preise && artikel.preise.length > 0 ? (
            <Grid container spacing={2}>
              {artikel.preise.map((preis: any, index: number) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2, borderColor: 'divider' }}
                  >
                    <Typography variant="subtitle1">{preis.preisTyp}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ab {preis.mengeAb} {artikel.einheit}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, color: 'primary.main' }}>
                      {preis.preis.toFixed(2)} €
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Keine Preisstaffeln definiert
            </Typography>
          )}
        </Paper>
      </TabPanel>

      {/* Historie */}
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Änderungsverlauf
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Erstellt am</Typography>
              <Typography variant="body1">{artikel.erstelltAm}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Letzte Änderung</Typography>
              <Typography variant="body1">{artikel.geaendertAm}</Typography>
            </Grid>
          </Grid>
          
          <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
            Detaillierte Änderungshistorie ist in dieser Version nicht verfügbar.
          </Typography>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default ArtikelDetailPage; 