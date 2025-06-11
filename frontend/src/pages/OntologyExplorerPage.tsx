import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  Alert,
  Snackbar
} from '@mui/material';
import { OntologyViewer } from '../components/owl';
import Layout from '../components/layout/Layout';

const OntologyExplorerPage: React.FC = () => {
  const [selectedOntology, setSelectedOntology] = useState<string>('erp-ontology');
  const [error, setError] = useState<Error | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  
  // Liste der verfügbaren Ontologien (in einer realen Anwendung würde diese vom Server geladen)
  const availableOntologies = [
    { id: 'erp-ontology', name: 'ERP System Ontology' },
    { id: 'finance-ontology', name: 'Finance Domain Ontology' },
    { id: 'product-ontology', name: 'Product Management Ontology' }
  ];
  
  // Handler für Ontologie-Auswahl
  const handleOntologyChange = (event: SelectChangeEvent) => {
    setSelectedOntology(event.target.value);
  };
  
  // Handler für Fehler in der OntologyViewer-Komponente
  const handleViewerError = (error: Error) => {
    setError(error);
    setSnackbarOpen(true);
  };
  
  return (
    <Layout title="Ontologie-Explorer">
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            OWL Ontologie-Explorer
          </Typography>
          
          <Typography variant="body1" paragraph>
            Durchsuchen und Erkunden von OWL-Ontologien für semantische Datenmodellierung im ERP-System.
          </Typography>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="ontology-select-label">Ontologie auswählen</InputLabel>
                  <Select
                    labelId="ontology-select-label"
                    id="ontology-select"
                    value={selectedOntology}
                    label="Ontologie auswählen"
                    onChange={handleOntologyChange}
                  >
                    {availableOntologies.map(ontology => (
                      <MenuItem key={ontology.id} value={ontology.id}>
                        {ontology.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => window.open('/api/v1/ontologies/' + selectedOntology + '/download', '_blank')}
                  >
                    Ontologie herunterladen
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => window.open('/api/v1/ontologies/' + selectedOntology + '/visualize', '_blank')}
                  >
                    Visualisierung öffnen
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <OntologyViewer 
            ontologyId={selectedOntology} 
            onError={handleViewerError}
          />
        </Box>
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            Fehler beim Laden der Ontologie: {error?.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default OntologyExplorerPage; 