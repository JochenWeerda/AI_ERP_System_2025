import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Breadcrumbs,
  Link,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArtikelFormular from '../components/Artikel/ArtikelFormular';
import StammdatenService from '../services/stammdaten/StammdatenService';

const ArtikelCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Zurück zur Übersicht
  const handleBack = () => {
    navigate('/stammdaten/artikel');
  };

  // Artikel speichern
  const handleSave = async (artikel: any) => {
    setLoading(true);
    try {
      // Artikel über den Service speichern
      await StammdatenService.createArtikel(artikel);
      setSuccess('Artikel wurde erfolgreich erstellt');
      
      // Nach erfolgreicher Erstellung zur Artikelübersicht navigieren
      setTimeout(() => {
        navigate('/stammdaten/artikel');
      }, 1500);
    } catch (err) {
      console.error('Fehler beim Speichern des Artikels:', err);
      setError('Der Artikel konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Abbrechen
  const handleCancel = () => {
    // Navigiere zurück zur Artikelübersicht
    navigate('/stammdaten/artikel');
  };

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
          <Typography color="text.primary">Neuer Artikel</Typography>
        </Breadcrumbs>
      </Box>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Neuen Artikel anlegen
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Bitte füllen Sie alle erforderlichen Felder aus und klicken Sie auf "Speichern".
      </Alert>
      
      <ArtikelFormular 
        onSave={handleSave} 
        onCancel={handleCancel}
        loading={loading} 
      />

      {/* Erfolgs-Meldung */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />

      {/* Fehler-Meldung */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
    </Container>
  );
};

export default ArtikelCreatePage; 