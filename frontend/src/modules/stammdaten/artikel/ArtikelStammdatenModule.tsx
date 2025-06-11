import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Category as CategoryIcon,
  Article as ArticleIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import StammdatenService from '../../../services/stammdaten/StammdatenService';
import { useNavigate } from 'react-router-dom';

// Dummy-Daten für Artikel
const dummyArtikel = [
  { id: 101, artikelnummer: 'ART-101', bezeichnung: 'Düngemittel Standard', gruppe: 'Düngemittel', einheit: 'Sack', bestand: 120, verkaufspreis: 45.99, aktiv: true },
  { id: 102, artikelnummer: 'ART-102', bezeichnung: 'Pflanzenschutzmittel Eco', gruppe: 'Pflanzenschutz', einheit: 'Liter', bestand: 56, verkaufspreis: 89.50, aktiv: true },
  { id: 103, artikelnummer: 'ART-103', bezeichnung: 'Saatgut Weizen Premium', gruppe: 'Saatgut', einheit: 'kg', bestand: 350, verkaufspreis: 3.75, aktiv: true },
  { id: 104, artikelnummer: 'ART-104', bezeichnung: 'Traktor-Ersatzteil XYZ', gruppe: 'Ersatzteile', einheit: 'Stück', bestand: 12, verkaufspreis: 245.00, aktiv: false },
  { id: 105, artikelnummer: 'ART-105', bezeichnung: 'Futtermittel Standard', gruppe: 'Futtermittel', einheit: 'Tonne', bestand: 8, verkaufspreis: 375.25, aktiv: true },
  { id: 106, artikelnummer: 'ART-106', bezeichnung: 'Düngemittel Premium', gruppe: 'Düngemittel', einheit: 'Sack', bestand: 75, verkaufspreis: 65.50, aktiv: true },
  { id: 107, artikelnummer: 'ART-107', bezeichnung: 'Pflanzenschutzmittel Pro', gruppe: 'Pflanzenschutz', einheit: 'Liter', bestand: 32, verkaufspreis: 112.00, aktiv: false },
  { id: 108, artikelnummer: 'ART-108', bezeichnung: 'Saatgut Gerste Standard', gruppe: 'Saatgut', einheit: 'kg', bestand: 280, verkaufspreis: 2.95, aktiv: true },
  { id: 109, artikelnummer: 'ART-109', bezeichnung: 'Bewässerungssystem Komfort', gruppe: 'Bewässerung', einheit: 'Set', bestand: 5, verkaufspreis: 1250.75, aktiv: true },
  { id: 110, artikelnummer: 'ART-110', bezeichnung: 'Futtermittel Premium', gruppe: 'Futtermittel', einheit: 'Tonne', bestand: 3, verkaufspreis: 425.50, aktiv: true },
];

// Artikelgruppen-Übersicht
const artikelGruppenStats = [
  { gruppe: 'Düngemittel', anzahl: 23 },
  { gruppe: 'Pflanzenschutz', anzahl: 45 },
  { gruppe: 'Saatgut', anzahl: 67 },
  { gruppe: 'Ersatzteile', anzahl: 128 },
  { gruppe: 'Futtermittel', anzahl: 56 },
  { gruppe: 'Bewässerung', anzahl: 18 }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel Komponente
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`artikel-tabpanel-${index}`}
      aria-labelledby={`artikel-tab-${index}`}
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

// Hauptkomponente für das Artikel-Stammdaten-Modul
const ArtikelStammdatenModule: React.FC = () => {
  const [artikel, setArtikel] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [suchbegriff, setSuchbegriff] = useState<string>('');
  const [tabValue, setTabValue] = useState<number>(0);
  const navigate = useNavigate();

  // Artikel laden (simuliert)
  useEffect(() => {
    const loadArtikel = async () => {
      try {
        // In einer realen Anwendung würden wir den Service aufrufen
        // const data = await StammdatenService.getArtikel(page + 1, rowsPerPage, suchbegriff);
        
        // Simulierte Verzögerung
        setTimeout(() => {
          setArtikel(dummyArtikel);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Fehler beim Laden der Artikel:', error);
        setLoading(false);
      }
    };

    loadArtikel();
  }, [page, rowsPerPage]);

  // Tab-Wechsel-Handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Seitenumbruch-Handler
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Zeilen pro Seite ändern
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Suche starten
  const handleSearch = () => {
    // In einer realen Anwendung würden wir hier den Server abfragen
    console.log('Suche nach:', suchbegriff);
    
    // Simulierte Filterung
    if (suchbegriff.trim() === '') {
      setArtikel(dummyArtikel);
    } else {
      const filteredArtikel = dummyArtikel.filter(
        artikel => 
          artikel.artikelnummer.toLowerCase().includes(suchbegriff.toLowerCase()) ||
          artikel.bezeichnung.toLowerCase().includes(suchbegriff.toLowerCase()) ||
          artikel.gruppe.toLowerCase().includes(suchbegriff.toLowerCase())
      );
      setArtikel(filteredArtikel);
    }
  };

  // Neuen Artikel erstellen
  const handleCreate = () => {
    navigate('/stammdaten/artikel/neu');
  };

  // Artikel bearbeiten
  const handleEdit = (id: number) => {
    navigate(`/stammdaten/artikel/${id}`);
  };

  // Artikel Details anzeigen
  const handleViewDetails = (id: number) => {
    navigate(`/stammdaten/artikel/${id}`);
  };

  // Artikel löschen
  const handleDelete = (id: number) => {
    console.log('Artikel löschen:', id);
    // Bestätigungsdialog anzeigen und dann löschen
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Artikelstammdaten
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Neuer Artikel
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="artikel stammdaten tabs">
          <Tab label="Artikel" icon={<ArticleIcon />} iconPosition="start" id="artikel-tab-0" />
          <Tab label="Artikelgruppen" icon={<CategoryIcon />} iconPosition="start" id="artikel-tab-1" />
          <Tab label="Lagerbestände" icon={<InventoryIcon />} iconPosition="start" id="artikel-tab-2" />
        </Tabs>
      </Box>

      {/* Artikel Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Suchleiste */}
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Artikel durchsuchen"
                  variant="outlined"
                  size="small"
                  value={suchbegriff}
                  onChange={(e) => setSuchbegriff(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item>
                <Button 
                  variant="outlined"
                  onClick={handleSearch}
                >
                  Suchen
                </Button>
              </Grid>
              <Grid item>
                <IconButton color="primary" title="Filter">
                  <FilterListIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Artikel-Tabelle */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="artikel tabelle">
            <TableHead>
              <TableRow>
                <TableCell>Artikelnummer</TableCell>
                <TableCell>Bezeichnung</TableCell>
                <TableCell>Gruppe</TableCell>
                <TableCell>Einheit</TableCell>
                <TableCell align="right">Bestand</TableCell>
                <TableCell align="right">Verkaufspreis (€)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Artikel werden geladen...
                  </TableCell>
                </TableRow>
              ) : artikel.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Keine Artikel gefunden
                  </TableCell>
                </TableRow>
              ) : (
                artikel
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((artikel) => (
                    <TableRow key={artikel.id}>
                      <TableCell component="th" scope="row">
                        {artikel.artikelnummer}
                      </TableCell>
                      <TableCell>{artikel.bezeichnung}</TableCell>
                      <TableCell>{artikel.gruppe}</TableCell>
                      <TableCell>{artikel.einheit}</TableCell>
                      <TableCell align="right">{artikel.bestand}</TableCell>
                      <TableCell align="right">{artikel.verkaufspreis.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={artikel.aktiv ? 'Aktiv' : 'Inaktiv'} 
                          color={artikel.aktiv ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Details anzeigen">
                          <IconButton 
                            color="info" 
                            aria-label="details"
                            onClick={() => handleViewDetails(artikel.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bearbeiten">
                          <IconButton 
                            color="primary" 
                            aria-label="bearbeiten"
                            onClick={() => handleEdit(artikel.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton 
                            color="error" 
                            aria-label="löschen"
                            onClick={() => handleDelete(artikel.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={artikel.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
          />
        </TableContainer>
      </TabPanel>

      {/* Artikelgruppen Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Artikelgruppen-Übersicht
          </Typography>
          <Grid container spacing={3}>
            {artikelGruppenStats.map((gruppe, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {gruppe.gruppe}
                    </Typography>
                    <Typography variant="h4">
                      {gruppe.anzahl}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Artikel in dieser Gruppe
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button size="small" color="primary">
                        Gruppe bearbeiten
                      </Button>
                      <Button size="small" color="secondary">
                        Artikel anzeigen
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
          >
            Neue Artikelgruppe anlegen
          </Button>
        </Box>
      </TabPanel>

      {/* Lagerbestände Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="body1">
          Lagerbestandsverwaltung für Artikel - Hier können Bestände eingesehen und angepasst werden.
        </Typography>
        {/* Lagerbestandsübersicht würde hier implementiert */}
      </TabPanel>
    </Container>
  );
};

export default ArtikelStammdatenModule; 