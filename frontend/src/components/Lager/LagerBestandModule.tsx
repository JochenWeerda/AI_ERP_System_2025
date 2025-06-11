import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

// Beispiel-Daten für die Lagerbestandsanzeige
const MOCK_INVENTORY_DATA = [
  { id: 1, artikelNr: 'A1001', bezeichnung: 'Futtermittel Standard', lagerort: 'Hauptlager', bestand: 1250, einheit: 'kg', minBestand: 500, maxBestand: 2000, wert: 3750, status: 'optimal' },
  { id: 2, artikelNr: 'A1002', bezeichnung: 'Futtermittel Premium', lagerort: 'Hauptlager', bestand: 350, einheit: 'kg', minBestand: 400, maxBestand: 1000, wert: 1750, status: 'niedrig' },
  { id: 3, artikelNr: 'A1003', bezeichnung: 'Futtermittel Spezial', lagerort: 'Außenlager', bestand: 800, einheit: 'kg', minBestand: 300, maxBestand: 900, wert: 4800, status: 'hoch' },
  { id: 4, artikelNr: 'B2001', bezeichnung: 'Mineralstoffe', lagerort: 'Hauptlager', bestand: 125, einheit: 'kg', minBestand: 100, maxBestand: 300, wert: 1875, status: 'optimal' },
  { id: 5, artikelNr: 'C3001', bezeichnung: 'Vitaminzusatz', lagerort: 'Speziallager', bestand: 50, einheit: 'kg', minBestand: 40, maxBestand: 100, wert: 2500, status: 'optimal' },
  { id: 6, artikelNr: 'D4001', bezeichnung: 'Verpackungsmaterial', lagerort: 'Hauptlager', bestand: 3000, einheit: 'Stk', minBestand: 1000, maxBestand: 5000, wert: 1500, status: 'optimal' },
  { id: 7, artikelNr: 'D4002', bezeichnung: 'Etiketten', lagerort: 'Hauptlager', bestand: 500, einheit: 'Stk', minBestand: 2000, maxBestand: 10000, wert: 250, status: 'kritisch' },
  { id: 8, artikelNr: 'E5001', bezeichnung: 'Reinigungsmittel', lagerort: 'Außenlager', bestand: 75, einheit: 'l', minBestand: 50, maxBestand: 200, wert: 675, status: 'optimal' },
];

// Statusfarben für Lagerbestände
const getStatusColor = (status: string) => {
  switch (status) {
    case 'optimal': return { bg: '#e6f4ea', color: '#137333' };
    case 'niedrig': return { bg: '#fef7e0', color: '#b06000' };
    case 'hoch': return { bg: '#e8f0fe', color: '#1967d2' };
    case 'kritisch': return { bg: '#fce8e6', color: '#c5221f' };
    default: return { bg: '#f1f3f4', color: '#3c4043' };
  }
};

const LagerBestandModule: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('artikelNr');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);

  // Daten laden (würde in einer echten Anwendung von einer API kommen)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simuliere API-Aufruf
        setTimeout(() => {
          setInventory(MOCK_INVENTORY_DATA);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Fehler beim Laden der Lagerbestandsdaten');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Suchfunktion
  const filteredInventory = inventory.filter(item => 
    item.artikelNr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bezeichnung.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lagerort.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sortierfunktion
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sortierte Daten
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (typeof fieldA === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    } else {
      return sortDirection === 'asc' 
        ? fieldA - fieldB 
        : fieldB - fieldA;
    }
  });

  // Statistiken berechnen
  const totalValue = inventory.reduce((sum, item) => sum + item.wert, 0);
  const lowStockItems = inventory.filter(item => item.status === 'niedrig' || item.status === 'kritisch').length;
  const highStockItems = inventory.filter(item => item.status === 'hoch').length;
  const optimalStockItems = inventory.filter(item => item.status === 'optimal').length;

  // Sortier-Indikator-Komponente
  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5, fontSize: '0.8rem' }} /> 
      : <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5, fontSize: '0.8rem' }} />;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Lagerbestand
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Dashboard-Übersicht */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Gesamtbestandswert
              </Typography>
              <Typography variant="h5" component="div" fontWeight="bold">
                {totalValue.toLocaleString('de-DE')} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Niedrige Bestände
              </Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="#b06000">
                {lowStockItems} Artikel
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hohe Bestände
              </Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="#1967d2">
                {highStockItems} Artikel
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Optimale Bestände
              </Typography>
              <Typography variant="h5" component="div" fontWeight="bold" color="#137333">
                {optimalStockItems} Artikel
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Suchleiste und Aktionen */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Suche nach Artikel, Bezeichnung oder Lagerort..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 400 }}
          />
          <Tooltip title="Filter">
            <IconButton sx={{ ml: 1 }}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 500);
            }}
            sx={{ mr: 1 }}
          >
            Aktualisieren
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            sx={{ mr: 1 }}
          >
            Drucken
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
          >
            Exportieren
          </Button>
        </Box>
      </Box>
      
      {/* Tabelle */}
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table sx={{ minWidth: 700 }} size="medium">
          <TableHead sx={{ backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell 
                onClick={() => handleSort('artikelNr')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Artikel-Nr.
                <SortIndicator field="artikelNr" />
              </TableCell>
              <TableCell 
                onClick={() => handleSort('bezeichnung')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Bezeichnung
                <SortIndicator field="bezeichnung" />
              </TableCell>
              <TableCell 
                onClick={() => handleSort('lagerort')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Lagerort
                <SortIndicator field="lagerort" />
              </TableCell>
              <TableCell 
                onClick={() => handleSort('bestand')}
                sx={{ cursor: 'pointer', fontWeight: 'bold', textAlign: 'right' }}
                align="right"
              >
                Bestand
                <SortIndicator field="bestand" />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }} align="center">
                Status
              </TableCell>
              <TableCell 
                onClick={() => handleSort('wert')}
                sx={{ cursor: 'pointer', fontWeight: 'bold', textAlign: 'right' }}
                align="right"
              >
                Wert (€)
                <SortIndicator field="wert" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  <Typography variant="body2" display="inline">
                    Lade Lagerbestandsdaten...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : sortedInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2">
                    Keine Lagerbestandsdaten gefunden
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedInventory.map((item) => {
                const statusStyle = getStatusColor(item.status);
                
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.artikelNr}</TableCell>
                    <TableCell>{item.bezeichnung}</TableCell>
                    <TableCell>{item.lagerort}</TableCell>
                    <TableCell align="right">{item.bestand.toLocaleString('de-DE')} {item.einheit}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} 
                        size="small"
                        sx={{ 
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 'medium'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">{item.wert.toLocaleString('de-DE')}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          {filteredInventory.length} von {inventory.length} Artikel angezeigt
        </Typography>
        
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<InventoryIcon />}
            onClick={() => window.location.href = '/lager/umlagerung'}
            sx={{ mr: 1 }}
          >
            Umlagerung
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => window.location.href = '/lager/korrektur'}
          >
            Korrektur
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LagerBestandModule; 