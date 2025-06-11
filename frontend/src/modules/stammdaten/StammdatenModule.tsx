import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  Box 
} from '@mui/material';
import { 
  Category, 
  People, 
  AccountBalance, 
  Inventory,
  Settings
} from '@mui/icons-material';

// Hauptkomponente für das Stammdaten-Modul
const StammdatenModule: React.FC = () => {
  const navigate = useNavigate();

  // Stammdaten-Kategorien
  const stammdatenKategorien = [
    { 
      title: 'Artikelstammdaten', 
      description: 'Artikel, Artikelgruppen und Preise verwalten', 
      icon: <Category fontSize="large" />, 
      path: '/stammdaten/artikel' 
    },
    { 
      title: 'Partnerstammdaten', 
      description: 'Kunden, Lieferanten und Kontakte verwalten', 
      icon: <People fontSize="large" />, 
      path: '/stammdaten/partner' 
    },
    { 
      title: 'CPD-Konten', 
      description: 'Creditor-Debitor-Konten verwalten', 
      icon: <AccountBalance fontSize="large" />, 
      path: '/stammdaten/cpd-konten' 
    },
    { 
      title: 'Lagerstammdaten', 
      description: 'Lagerorte und Lagerbestände verwalten', 
      icon: <Inventory fontSize="large" />, 
      path: '/stammdaten/lager' 
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
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3, mb: 4 }}>
        Stammdatenverwaltung
      </Typography>

      <Grid container spacing={4}>
        {stammdatenKategorien.map((kategorie, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardActionArea 
                sx={{ height: '100%', p: 2 }} 
                onClick={() => navigate(kategorie.path)}
              >
                <CardContent sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center' 
                }}>
                  <Box sx={{ 
                    fontSize: 80, 
                    color: 'primary.main', 
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {kategorie.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="div">
                    {kategorie.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {kategorie.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          <Settings fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Stammdaten-Verwaltungsbereich
        </Typography>
        <Typography variant="body2" color="text.secondary">
          In diesem Bereich können Sie alle wichtigen Stammdaten Ihres ERP-Systems verwalten. 
          Wählen Sie eine der obigen Kategorien, um die entsprechenden Daten zu bearbeiten.
          Die Stammdatenpflege ist grundlegend für den reibungslosen Betrieb des gesamten Systems.
        </Typography>
      </Box>
    </Container>
  );
};

export default StammdatenModule; 