import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea 
} from '@mui/material';
import { 
  ReceiptOutlined, 
  ShoppingCartOutlined, 
  LocalShippingOutlined, 
  DescriptionOutlined,
  AddShoppingCartOutlined,
  InventoryOutlined,
  ReceiptLongOutlined
} from '@mui/icons-material';

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
      id={`belegfolge-tabpanel-${index}`}
      aria-labelledby={`belegfolge-tab-${index}`}
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

// Hauptkomponente für das Belegfolge-Modul
const BelegfolgeModule: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Verkaufs-Belegarten
  const verkaufsBelege = [
    { 
      title: 'Angebote', 
      description: 'Angebote an Kunden verwalten', 
      icon: <ReceiptOutlined />, 
      path: '/belegfolge/verkauf/angebote' 
    },
    { 
      title: 'Aufträge', 
      description: 'Kundenaufträge verwalten', 
      icon: <ShoppingCartOutlined />, 
      path: '/belegfolge/verkauf/auftraege' 
    },
    { 
      title: 'Lieferscheine', 
      description: 'Lieferscheine erstellen und verwalten', 
      icon: <LocalShippingOutlined />, 
      path: '/belegfolge/verkauf/lieferscheine' 
    },
    { 
      title: 'Rechnungen', 
      description: 'Ausgangsrechnungen verwalten', 
      icon: <DescriptionOutlined />, 
      path: '/belegfolge/verkauf/rechnungen' 
    }
  ];

  // Einkaufs-Belegarten
  const einkaufsBelege = [
    { 
      title: 'Bestellungen', 
      description: 'Bestellungen an Lieferanten verwalten', 
      icon: <AddShoppingCartOutlined />, 
      path: '/belegfolge/einkauf/bestellungen' 
    },
    { 
      title: 'Eingangslieferscheine', 
      description: 'Lieferantenlieferscheine verwalten', 
      icon: <InventoryOutlined />, 
      path: '/belegfolge/einkauf/eingangslieferscheine' 
    },
    { 
      title: 'Eingangsrechnungen', 
      description: 'Eingangsrechnungen verwalten', 
      icon: <ReceiptLongOutlined />, 
      path: '/belegfolge/einkauf/eingangsrechnungen' 
    }
  ];

  // Überprüfen, ob Outlet-Komponenten vorhanden sind
  const hasChildren = Boolean((Outlet as any)().props?.children);

  // Wenn es untergeordnete Routen gibt, diese anzeigen
  if (hasChildren) {
    return <Outlet />;
  }

  // Sonst die Übersichtsseite anzeigen
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3 }}>
        Belegfolge-Verwaltung
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="belegfolge tabs">
          <Tab label="Verkauf" id="belegfolge-tab-0" />
          <Tab label="Einkauf" id="belegfolge-tab-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {verkaufsBelege.map((beleg, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea 
                  sx={{ height: '100%' }} 
                  onClick={() => navigate(beleg.path)}
                >
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}>
                      {beleg.icon}
                    </Box>
                    <Typography gutterBottom variant="h5" component="div">
                      {beleg.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {beleg.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {einkaufsBelege.map((beleg, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea 
                  sx={{ height: '100%' }} 
                  onClick={() => navigate(beleg.path)}
                >
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}>
                      {beleg.icon}
                    </Box>
                    <Typography gutterBottom variant="h5" component="div">
                      {beleg.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {beleg.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default BelegfolgeModule; 