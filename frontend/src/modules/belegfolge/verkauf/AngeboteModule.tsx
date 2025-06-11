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
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import BelegfolgeService from '../../../services/belegfolge/BelegfolgeService';

// Dummy-Daten für Angebote
const dummyAngebote = [
  { id: 1001, nummer: 'ANG-2023-1001', kunde: 'Landwirtschaft Meyer GmbH', datum: '2023-05-15', betrag: 1250.99, status: 'offen' },
  { id: 1002, nummer: 'ANG-2023-1002', kunde: 'Agrar Schulze KG', datum: '2023-05-16', betrag: 3450.50, status: 'angenommen' },
  { id: 1003, nummer: 'ANG-2023-1003', kunde: 'Bauernhof Schmidt', datum: '2023-05-17', betrag: 890.00, status: 'abgelehnt' },
  { id: 1004, nummer: 'ANG-2023-1004', kunde: 'Landtechnik Müller', datum: '2023-05-18', betrag: 12500.75, status: 'offen' },
  { id: 1005, nummer: 'ANG-2023-1005', kunde: 'Bio-Hof Naturkost', datum: '2023-05-19', betrag: 4350.25, status: 'angenommen' },
  { id: 1006, nummer: 'ANG-2023-1006', kunde: 'Landwirtschaft Meyer GmbH', datum: '2023-05-20', betrag: 2780.00, status: 'offen' },
  { id: 1007, nummer: 'ANG-2023-1007', kunde: 'Agrar Schulze KG', datum: '2023-05-21', betrag: 1950.50, status: 'abgelehnt' },
  { id: 1008, nummer: 'ANG-2023-1008', kunde: 'Bauernhof Schmidt', datum: '2023-05-22', betrag: 3200.00, status: 'angenommen' },
  { id: 1009, nummer: 'ANG-2023-1009', kunde: 'Landtechnik Müller', datum: '2023-05-23', betrag: 5600.25, status: 'offen' },
  { id: 1010, nummer: 'ANG-2023-1010', kunde: 'Bio-Hof Naturkost', datum: '2023-05-24', betrag: 1800.75, status: 'angenommen' },
];

// Status-Farben für Chips
const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  'offen': 'info',
  'angenommen': 'success',
  'abgelehnt': 'error'
};

// Hauptkomponente für das Angebote-Modul
const AngeboteModule: React.FC = () => {
  const [angebote, setAngebote] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [suchbegriff, setSuchbegriff] = useState<string>('');

  // Angebote laden (simuliert)
  useEffect(() => {
    const loadAngebote = async () => {
      try {
        // In einer realen Anwendung würden wir den Service aufrufen
        // const data = await BelegfolgeService.getBelege('angebote', page + 1, rowsPerPage);
        
        // Simulierte Verzögerung
        setTimeout(() => {
          setAngebote(dummyAngebote);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Fehler beim Laden der Angebote:', error);
        setLoading(false);
      }
    };

    loadAngebote();
  }, [page, rowsPerPage]);

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
      setAngebote(dummyAngebote);
    } else {
      const filteredAngebote = dummyAngebote.filter(
        angebot => 
          angebot.nummer.toLowerCase().includes(suchbegriff.toLowerCase()) ||
          angebot.kunde.toLowerCase().includes(suchbegriff.toLowerCase())
      );
      setAngebote(filteredAngebote);
    }
  };

  // Neues Angebot erstellen
  const handleCreate = () => {
    console.log('Neues Angebot erstellen');
    // Navigation zur Erstellungsseite
  };

  // Angebot bearbeiten
  const handleEdit = (id: number) => {
    console.log('Angebot bearbeiten:', id);
    // Navigation zur Bearbeitungsseite
  };

  // Angebot löschen
  const handleDelete = (id: number) => {
    console.log('Angebot löschen:', id);
    // Bestätigungsdialog anzeigen und dann löschen
  };

  // In Auftrag umwandeln
  const handleConvertToAuftrag = (id: number) => {
    console.log('In Auftrag umwandeln:', id);
    // In einer realen Anwendung würden wir den Service aufrufen
    // BelegfolgeService.erzeugeFollgebeleg('angebot', id, 'auftrag');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Angebotsverwaltung
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Neues Angebot
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Suchleiste */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Angebote durchsuchen"
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
              <IconButton color="primary">
                <FilterListIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Angebote-Tabelle */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="angebote tabelle">
          <TableHead>
            <TableRow>
              <TableCell>Angebotsnummer</TableCell>
              <TableCell>Kunde</TableCell>
              <TableCell>Datum</TableCell>
              <TableCell align="right">Betrag (€)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Angebote werden geladen...
                </TableCell>
              </TableRow>
            ) : angebote.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Keine Angebote gefunden
                </TableCell>
              </TableRow>
            ) : (
              angebote
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((angebot) => (
                  <TableRow key={angebot.id}>
                    <TableCell component="th" scope="row">
                      {angebot.nummer}
                    </TableCell>
                    <TableCell>{angebot.kunde}</TableCell>
                    <TableCell>{angebot.datum}</TableCell>
                    <TableCell align="right">{angebot.betrag.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={angebot.status} 
                        color={statusColors[angebot.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        aria-label="bearbeiten"
                        onClick={() => handleEdit(angebot.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        aria-label="löschen"
                        onClick={() => handleDelete(angebot.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      {angebot.status === 'offen' && (
                        <IconButton 
                          color="success" 
                          aria-label="in auftrag umwandeln"
                          onClick={() => handleConvertToAuftrag(angebot.id)}
                          title="In Auftrag umwandeln"
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={angebote.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
        />
      </TableContainer>
    </Container>
  );
};

export default AngeboteModule; 