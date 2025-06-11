import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Paper,
  Divider,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PageHeader from '../components/common/PageHeader';

/**
 * Placeholder-Komponente für einen Chart
 */
const ChartPlaceholder: React.FC<{ title: string; icon: React.ReactNode; height?: number }> = ({ 
  title, 
  icon,
  height = 300
}) => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        height: height, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 2
      }}
    >
      <Box sx={{ mb: 2, fontSize: '3rem', color: 'primary.main', opacity: 0.7 }}>
        {icon}
      </Box>
      <Typography variant="h6" align="center" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 1 }}>
        Stellen Sie eine Anfrage, um Daten zu analysieren und zu visualisieren.
      </Typography>
    </Paper>
  );
};

/**
 * Analytics-Seite für KI-basierte Datenanalyse
 */
const AnalyticsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsLoading(true);
    
    // Hier würde in einer echten Anwendung die API-Anfrage stattfinden
    setTimeout(() => {
      setIsLoading(false);
      setHasResults(true);
    }, 1500);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <PageHeader 
        title="Datenanalyse" 
        subtitle="Nutzen Sie KI, um Ihre Unternehmensdaten zu analysieren und wertvolle Erkenntnisse zu gewinnen."
        icon={<BarChartIcon fontSize="large" />}
      />
      
      <Paper elevation={2} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Was möchten Sie analysieren?</Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Stellen Sie Ihre Frage in natürlicher Sprache. Zum Beispiel: "Zeige mir den Umsatz nach Produktkategorie für das letzte Quartal"
        </Typography>
        
        <form onSubmit={handleQuerySubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ihre Analyseanfrage..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ mb: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                fullWidth 
                variant="contained" 
                color="primary" 
                type="submit" 
                disabled={!query || isLoading}
                sx={{ height: '56px' }}
              >
                {isLoading ? 'Analysiere...' : 'Analysieren'}
              </Button>
            </Grid>
          </Grid>
        </form>
        
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
            Vorschläge:
          </Typography>
          <Chip 
            label="Umsatz nach Region" 
            size="small" 
            onClick={() => setQuery('Zeige Umsatz nach Region für dieses Jahr')} 
            sx={{ mr: 1 }}
          />
          <Chip 
            label="Top 10 Kunden" 
            size="small" 
            onClick={() => setQuery('Liste die Top 10 Kunden nach Umsatz')} 
            sx={{ mr: 1 }}
          />
          <Chip 
            label="Verkaufstrend" 
            size="small" 
            onClick={() => setQuery('Wie hat sich der Verkauf in den letzten 6 Monaten entwickelt?')} 
            sx={{ mr: 1 }}
          />
          <Chip 
            label="Bestandsanalyse" 
            size="small" 
            onClick={() => setQuery('Analyse der Lagerbestände nach Produktkategorie')} 
          />
        </Box>
      </Paper>
      
      {hasResults ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Ergebnisse: Umsatz nach Produktkategorie (Q1 2023)</Typography>
              <Box>
                <IconButton size="small" title="Filter">
                  <FilterListIcon />
                </IconButton>
                <IconButton size="small" title="Aktualisieren">
                  <RefreshIcon />
                </IconButton>
                <IconButton size="small" title="Speichern">
                  <SaveIcon />
                </IconButton>
                <IconButton size="small" title="Teilen">
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: 400 }}>
              <Typography variant="subtitle1" gutterBottom>Hauptdiagramm</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ 
                height: 330, 
                background: 'linear-gradient(45deg, rgba(100,150,220,0.1) 0%, rgba(100,150,220,0.3) 100%)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChartIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: 400 }}>
              <Typography variant="subtitle1" gutterBottom>Statistiken</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Gesamtumsatz</Typography>
                <Typography variant="h4">€2.456.789</Typography>
                <Typography variant="body2" color="success.main">+12.3% zum Vorjahr</Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Top-Kategorie</Typography>
                <Typography variant="h6">Elektronik</Typography>
                <Typography variant="body2">€987.654 (40.2%)</Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">Niedrigste Kategorie</Typography>
                <Typography variant="h6">Bürobedarf</Typography>
                <Typography variant="body2" color="error.main">€123.456 (5.0%)</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Durchschnitt</Typography>
                <Typography variant="h6">€409.465</Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ChartPlaceholder 
              title="Umsatzentwicklung im Zeitverlauf" 
              icon={<TimelineIcon sx={{ fontSize: 60 }} />} 
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ChartPlaceholder 
              title="Prozentuale Verteilung" 
              icon={<PieChartIcon sx={{ fontSize: 60 }} />} 
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="KI-Erkenntnisse" />
              <CardContent>
                <Typography variant="body2" paragraph>
                  <strong>Trend erkannt:</strong> Die Kategorie Elektronik zeigt ein kontinuierliches Wachstum über die letzten 3 Quartale.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Anomalie entdeckt:</strong> Der Umsatz in der Kategorie Bürobedarf ist um 15% gesunken.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Empfehlung:</strong> Eine gezielte Marketingkampagne für Bürobedarfsprodukte könnte helfen, den Umsatzrückgang umzukehren.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<RefreshIcon />}>
                    Mehr Erkenntnisse
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<HelpOutlineIcon />}>
                    Erklären
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ChartPlaceholder 
              title="Umsatzanalyse" 
              icon={<BarChartIcon sx={{ fontSize: 80 }} />} 
              height={400}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartPlaceholder 
              title="Zeitreihenanalyse" 
              icon={<TimelineIcon sx={{ fontSize: 80 }} />} 
              height={400}
            />
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>So funktioniert die KI-Datenanalyse</Typography>
              <Typography variant="body2" paragraph>
                Mit unserem KI-Analysetool können Sie komplexe Datenabfragen in natürlicher Sprache stellen. Das System versteht Ihre Anfrage und erzeugt automatisch die passenden Visualisierungen und Erkenntnisse.
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant="subtitle1" gutterBottom>1. Frage stellen</Typography>
                    <Typography variant="body2">
                      Formulieren Sie Ihre Anfrage in normaler Sprache, z.B. "Zeige mir den Umsatz pro Monat für 2023"
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant="subtitle1" gutterBottom>2. Analyse erhalten</Typography>
                    <Typography variant="body2">
                      Die KI analysiert Ihre Daten und erstellt automatisch relevante Visualisierungen und Statistiken
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant="subtitle1" gutterBottom>3. Erkenntnisse gewinnen</Typography>
                    <Typography variant="body2">
                      Entdecken Sie Trends, Muster und Anomalien in Ihren Daten und erhalten Sie KI-generierte Handlungsempfehlungen
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AnalyticsPage; 