import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  useTheme,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Skeleton,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  FeaturedPlayList as AngebotIcon,
  Assignment as AuftragIcon,
  LocalShipping as LieferscheinIcon,
  Receipt as RechnungIcon,
  ShoppingBasket as BestellungIcon,
  Sync as EingangslieferscheinIcon,
  AddCircle as AddIcon,
  Visibility as ViewIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface BelegCount {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
}

interface BelegData {
  angebote: BelegCount;
  auftraege: BelegCount;
  lieferscheine: BelegCount;
  rechnungen: BelegCount;
  bestellungen: BelegCount;
  eingangslieferscheine: BelegCount;
}

// Memoized BelegCard Component für Performance-Optimierung
const BelegCard = memo(({ 
  title, 
  count, 
  icon, 
  path, 
  color,
  onCreateNew,
  onViewAll
}: { 
  title: string; 
  count: BelegCount; 
  icon: React.ReactNode; 
  path: string;
  color: string;
  onCreateNew: (path: string) => void;
  onViewAll: (path: string) => void;
}) => (
  <Card 
    elevation={3}
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderTop: `4px solid ${color}`
    }}
  >
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          backgroundColor: `${color}20`, // 20% opacity
          borderRadius: '50%',
          p: 1,
          mr: 2
        }}>
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Gesamt
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          {count.total}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid item xs={4}>
          <Chip 
            label={`${count.open} offen`} 
            size="small" 
            color="warning" 
            sx={{ width: '100%' }}
          />
        </Grid>
        <Grid item xs={4}>
          <Chip 
            label={`${count.inProgress} aktiv`} 
            size="small" 
            color="info" 
            sx={{ width: '100%' }}
          />
        </Grid>
        <Grid item xs={4}>
          <Chip 
            label={`${count.completed} abg.`} 
            size="small" 
            color="success" 
            sx={{ width: '100%' }}
          />
        </Grid>
      </Grid>
    </CardContent>
    <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
      <Button 
        size="small" 
        startIcon={<AddIcon />}
        onClick={() => onCreateNew(path)}
      >
        Neu
      </Button>
      <Button 
        size="small" 
        endIcon={<ViewIcon />}
        onClick={() => onViewAll(path)}
      >
        Alle anzeigen
      </Button>
    </CardActions>
  </Card>
));

// Skeleton-Komponente für das Laden
const BelegCardSkeleton = () => (
  <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Skeleton variant="text" width={120} height={32} />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Skeleton variant="text" width={60} />
        <Skeleton variant="text" width={30} />
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid item xs={4}>
          <Skeleton variant="rectangular" height={24} width="100%" />
        </Grid>
        <Grid item xs={4}>
          <Skeleton variant="rectangular" height={24} width="100%" />
        </Grid>
        <Grid item xs={4}>
          <Skeleton variant="rectangular" height={24} width="100%" />
        </Grid>
      </Grid>
    </CardContent>
    <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
      <Skeleton variant="rectangular" width={80} height={30} />
      <Skeleton variant="rectangular" width={120} height={30} />
    </CardActions>
  </Card>
);

const BelegfolgeDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [belegData, setBelegData] = useState<BelegData>({
    angebote: { total: 0, open: 0, inProgress: 0, completed: 0 },
    auftraege: { total: 0, open: 0, inProgress: 0, completed: 0 },
    lieferscheine: { total: 0, open: 0, inProgress: 0, completed: 0 },
    rechnungen: { total: 0, open: 0, inProgress: 0, completed: 0 },
    bestellungen: { total: 0, open: 0, inProgress: 0, completed: 0 },
    eingangslieferscheine: { total: 0, open: 0, inProgress: 0, completed: 0 }
  });

  // Bestimme den aktiven Tab basierend auf der aktuellen URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/angebote')) {
      setActiveTab(0);
    } else if (path.includes('/auftraege')) {
      setActiveTab(1);
    } else if (path.includes('/lieferscheine')) {
      setActiveTab(2);
    } else if (path.includes('/rechnungen')) {
      setActiveTab(3);
    } else if (path.includes('/bestellungen')) {
      setActiveTab(4);
    } else if (path.includes('/eingangslieferscheine')) {
      setActiveTab(5);
    } else {
      // Dashboard als Standard
      setActiveTab(0);
    }
  }, [location]);

  // Daten nur laden, wenn die Komponente gemounted ist
  useEffect(() => {
    let isMounted = true;

    // Verwende einen AbortController für abbrechen der API-Anfrage
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In einem realen Szenario würde hier eine API-Abfrage erfolgen
        // API-Aufruf mit AbortSignal
        // const response = await fetch('/api/belegfolge/dashboard', { signal });
        // const data = await response.json();
        
        // Simuliere einen API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (isMounted) {
          setBelegData({
            angebote: { total: 12, open: 3, inProgress: 4, completed: 5 },
            auftraege: { total: 25, open: 5, inProgress: 12, completed: 8 },
            lieferscheine: { total: 18, open: 2, inProgress: 7, completed: 9 },
            rechnungen: { total: 20, open: 4, inProgress: 3, completed: 13 },
            bestellungen: { total: 15, open: 1, inProgress: 6, completed: 8 },
            eingangslieferscheine: { total: 14, open: 0, inProgress: 5, completed: 9 }
          });
          setLoading(false);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Fehler beim Laden der Dashboard-Daten:', error);
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup-Funktion
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Geänderte handleTabChange-Funktion, um zur entsprechenden Route zu navigieren
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    switch (newValue) {
      case 0:
        navigate('/belegfolge/angebote');
        break;
      case 1:
        navigate('/belegfolge/auftraege');
        break;
      case 2:
        navigate('/belegfolge/lieferscheine');
        break;
      case 3:
        navigate('/belegfolge/rechnungen');
        break;
      case 4:
        navigate('/belegfolge/bestellungen');
        break;
      case 5:
        navigate('/belegfolge/eingangslieferscheine');
        break;
      default:
        navigate('/belegfolge');
    }
  }, [navigate]);

  const handleCreateNew = useCallback((type: string) => {
    navigate(`/belegfolge/${type}/neu`);
  }, [navigate]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Belegfolge-Navigation */}
      <Paper 
        elevation={2} 
        square 
        sx={{ 
          mb: 3, 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000, 
          borderBottom: `1px solid ${theme.palette.divider}` 
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            '& .MuiTab-root': { 
              minHeight: '56px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              '& .MuiSvgIcon-root': {
                marginRight: 1,
                marginBottom: '0 !important'
              }
            } 
          }}
        >
          <Tab icon={<AngebotIcon />} label="Angebote" iconPosition="start" />
          <Tab icon={<AuftragIcon />} label="Aufträge" iconPosition="start" />
          <Tab icon={<LieferscheinIcon />} label="Lieferscheine" iconPosition="start" />
          <Tab icon={<RechnungIcon />} label="Rechnungen" iconPosition="start" />
          <Tab icon={<BestellungIcon />} label="Bestellungen" iconPosition="start" />
          <Tab icon={<EingangslieferscheinIcon />} label="Eingangslieferscheine" iconPosition="start" />
        </Tabs>
      </Paper>

      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
        Belegfolge Übersicht
      </Typography>

      {/* Vorhandener Dashboard-Inhalt */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <BelegCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <BelegCard 
              title="Angebote" 
              count={belegData.angebote} 
              icon={<AngebotIcon sx={{ color: theme.palette.primary.main }} />} 
              path="angebote"
              color={theme.palette.primary.main}
              onCreateNew={handleCreateNew}
              onViewAll={(path) => navigate(`/belegfolge/${path}`)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <BelegCard 
              title="Aufträge" 
              count={belegData.auftraege} 
              icon={<AuftragIcon sx={{ color: theme.palette.secondary.main }} />} 
              path="auftraege"
              color={theme.palette.secondary.main}
              onCreateNew={handleCreateNew}
              onViewAll={(path) => navigate(`/belegfolge/${path}`)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <BelegCard 
              title="Lieferscheine" 
              count={belegData.lieferscheine} 
              icon={<LieferscheinIcon sx={{ color: theme.palette.success.main }} />} 
              path="lieferscheine"
              color={theme.palette.success.main}
              onCreateNew={handleCreateNew}
              onViewAll={(path) => navigate(`/belegfolge/${path}`)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <BelegCard 
              title="Rechnungen" 
              count={belegData.rechnungen} 
              icon={<RechnungIcon sx={{ color: theme.palette.info.main }} />} 
              path="rechnungen"
              color={theme.palette.info.main}
              onCreateNew={handleCreateNew}
              onViewAll={(path) => navigate(`/belegfolge/${path}`)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <BelegCard 
              title="Bestellungen" 
              count={belegData.bestellungen} 
              icon={<BestellungIcon sx={{ color: theme.palette.warning.main }} />} 
              path="bestellungen"
              color={theme.palette.warning.main}
              onCreateNew={handleCreateNew}
              onViewAll={(path) => navigate(`/belegfolge/${path}`)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <BelegCard 
              title="Eingangslieferscheine" 
              count={belegData.eingangslieferscheine} 
              icon={<EingangslieferscheinIcon sx={{ color: theme.palette.error.main }} />} 
              path="eingangslieferscheine"
              color={theme.palette.error.main}
              onCreateNew={handleCreateNew}
              onViewAll={(path) => navigate(`/belegfolge/${path}`)}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default React.memo(BelegfolgeDashboard); 