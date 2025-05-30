import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { format } from 'date-fns';

// Typdefinitionen
interface ChargenBericht {
  id: number;
  berichtstyp: string;
  erstellungsdatum: string;
  zeitraum: {
    von: string;
    bis: string;
  };
  status: string;
  ersteller: string;
  chargenanzahl: number;
  dateipfad: string;
}

interface BerichtsFilter {
  berichtstyp: string;
  zeitraumVon: Date | null;
  zeitraumBis: Date | null;
  status: string;
}

// Mock-Daten
const MOCK_BERICHTE: ChargenBericht[] = [
  {
    id: 1,
    berichtstyp: 'Chargenübersicht',
    erstellungsdatum: '2025-05-15T08:30:00',
    zeitraum: {
      von: '2025-04-01',
      bis: '2025-04-30'
    },
    status: 'abgeschlossen',
    ersteller: 'System',
    chargenanzahl: 156,
    dateipfad: '/berichte/chargen_04_2025.pdf'
  },
  {
    id: 2,
    berichtstyp: 'Rückverfolgbarkeit',
    erstellungsdatum: '2025-05-10T14:15:00',
    zeitraum: {
      von: '2025-04-15',
      bis: '2025-05-10'
    },
    status: 'abgeschlossen',
    ersteller: 'Max Mustermann',
    chargenanzahl: 83,
    dateipfad: '/berichte/rueckverfolgung_04-05_2025.pdf'
  },
  {
    id: 3,
    berichtstyp: 'QS-Auswertung',
    erstellungsdatum: '2025-05-28T10:00:00',
    zeitraum: {
      von: '2025-05-01',
      bis: '2025-05-28'
    },
    status: 'in_bearbeitung',
    ersteller: 'System',
    chargenanzahl: 92,
    dateipfad: ''
  }
];

// Berichtstypen für Filter
const BERICHTSTYPEN = [
  { value: 'alle', label: 'Alle Typen' },
  { value: 'Chargenübersicht', label: 'Chargenübersicht' },
  { value: 'Rückverfolgbarkeit', label: 'Rückverfolgbarkeit' },
  { value: 'QS-Auswertung', label: 'QS-Auswertung' },
  { value: 'Chargendokumentation', label: 'Chargendokumentation' }
];

// Status-Optionen für Filter
const STATUS_OPTIONEN = [
  { value: 'alle', label: 'Alle Status' },
  { value: 'abgeschlossen', label: 'Abgeschlossen' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung' },
  { value: 'archiviert', label: 'Archiviert' }
];

const ChargenBerichte: React.FC = () => {
  const [berichte, setBerichte] = useState<ChargenBericht[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BerichtsFilter>({
    berichtstyp: 'alle',
    zeitraumVon: null,
    zeitraumBis: null,
    status: 'alle'
  });

  useEffect(() => {
    // Simuliere API-Aufruf mit einem Timeout
    const fetchBerichte = async () => {
      setLoading(true);
      try {
        // Hier würde normalerweise der API-Aufruf stehen
        await new Promise(resolve => setTimeout(resolve, 800));
        setBerichte(MOCK_BERICHTE);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Chargenberichte:', err);
        setError('Die Berichte konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchBerichte();
  }, []);

  // Filter-Funktion für Berichte
  const filteredBerichte = berichte.filter(bericht => {
    // Berichtstyp-Filter
    if (filter.berichtstyp !== 'alle' && bericht.berichtstyp !== filter.berichtstyp) {
      return false;
    }

    // Status-Filter
    if (filter.status !== 'alle' && bericht.status !== filter.status) {
      return false;
    }

    // Zeitraum-Filter "von"
    if (filter.zeitraumVon && new Date(bericht.zeitraum.von) < filter.zeitraumVon) {
      return false;
    }

    // Zeitraum-Filter "bis"
    if (filter.zeitraumBis && new Date(bericht.zeitraum.bis) > filter.zeitraumBis) {
      return false;
    }

    return true;
  });

  const handleFilterChange = (name: string, value: any) => {
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'abgeschlossen':
        return <Chip size="small" label="Abgeschlossen" color="success" />;
      case 'in_bearbeitung':
        return <Chip size="small" label="In Bearbeitung" color="warning" />;
      case 'archiviert':
        return <Chip size="small" label="Archiviert" color="default" />;
      default:
        return <Chip size="small" label={status} color="primary" />;
    }
  };

  const handleDownload = (berichtId: number) => {
    const bericht = berichte.find(b => b.id === berichtId);
    if (!bericht || !bericht.dateipfad) {
      alert('Dieser Bericht steht noch nicht zum Download bereit.');
      return;
    }
    
    // Hier würde der tatsächliche Download implementiert werden
    alert(`Download des Berichts "${bericht.berichtstyp}" wurde gestartet.`);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AssessmentIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h2">
              Chargenberichte
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Übersicht aller Chargenberichte des Systems. Filtern Sie nach Berichtstyp, Zeitraum oder Status.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Filter-Bereich */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterAltIcon fontSize="small" sx={{ mr: 1 }} />
              Filter
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="berichtstyp-label">Berichtstyp</InputLabel>
                  <Select
                    labelId="berichtstyp-label"
                    value={filter.berichtstyp}
                    label="Berichtstyp"
                    onChange={(e) => handleFilterChange('berichtstyp', e.target.value)}
                  >
                    {BERICHTSTYPEN.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                  <DatePicker
                    label="Zeitraum von"
                    value={filter.zeitraumVon}
                    onChange={(date) => handleFilterChange('zeitraumVon', date)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                  <DatePicker
                    label="Zeitraum bis"
                    value={filter.zeitraumBis}
                    onChange={(date) => handleFilterChange('zeitraumBis', date)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={filter.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    {STATUS_OPTIONEN.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          
          {/* Berichte-Tabelle */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Berichtstyp</TableCell>
                    <TableCell>Zeitraum</TableCell>
                    <TableCell>Erstellungsdatum</TableCell>
                    <TableCell>Ersteller</TableCell>
                    <TableCell>Chargenanzahl</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBerichte.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Keine Berichte gefunden, die den Filterkriterien entsprechen.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBerichte.map(bericht => (
                      <TableRow key={bericht.id}>
                        <TableCell>{bericht.berichtstyp}</TableCell>
                        <TableCell>
                          {formatDate(bericht.zeitraum.von)} - {formatDate(bericht.zeitraum.bis)}
                        </TableCell>
                        <TableCell>{formatDate(bericht.erstellungsdatum)}</TableCell>
                        <TableCell>{bericht.ersteller}</TableCell>
                        <TableCell>{bericht.chargenanzahl}</TableCell>
                        <TableCell>{getStatusChip(bericht.status)}</TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            disabled={!bericht.dateipfad}
                            onClick={() => handleDownload(bericht.id)}
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChargenBerichte; 