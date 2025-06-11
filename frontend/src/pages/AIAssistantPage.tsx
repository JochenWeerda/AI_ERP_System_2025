import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import ChatAssistant from '../components/ai/ChatAssistant';
import DataVisualization from '../components/ai/DataVisualization';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BarChartIcon from '@mui/icons-material/BarChart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PageHeader from '../components/common/PageHeader';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
      style={{ height: 'calc(100vh - 220px)', overflow: 'hidden' }}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AIAssistantPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <PageHeader 
        title="KI-Assistent" 
        subtitle="Interagieren Sie mit dem ERP-System durch natürliche Sprache und gewinnen Sie wertvolle Erkenntnisse aus Ihren Daten."
        icon={<SmartToyIcon fontSize="large" />}
      />
      
      <Paper elevation={2} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="KI-Assistent Tabs"
            variant="fullWidth"
          >
            <Tab 
              icon={<SmartToyIcon />} 
              label="Chat-Assistent" 
              id="ai-tab-0" 
              aria-controls="ai-tabpanel-0" 
            />
            <Tab 
              icon={<BarChartIcon />} 
              label="Datenvisualisierung" 
              id="ai-tab-1" 
              aria-controls="ai-tabpanel-1" 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <ChatAssistant 
            initialMessage="Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute mit dem ERP-System helfen?"
            containerHeight="calc(100vh - 220px)"
            showHeader={false}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <DataVisualization 
            initialQuery=""
            height="calc(100vh - 220px)"
            width="100%"
          />
        </TabPanel>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SmartToyIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Häufig gestellte Fragen</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Was kann der KI-Assistent für Sie tun?</Typography>
            <Typography variant="body2" paragraph>
              Der KI-Assistent kann Ihnen bei vielen Aufgaben im ERP-System helfen, z.B. bei der Suche nach Informationen, 
              der Erstellung neuer Einträge oder der Analyse von Daten.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>Beispiele für Fragen:</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>
                <Typography variant="body2">Wie erstelle ich einen neuen Kunden?</Typography>
              </li>
              <li>
                <Typography variant="body2">Zeige mir die Top 5 Kunden nach Umsatz</Typography>
              </li>
              <li>
                <Typography variant="body2">Wie hoch ist der aktuelle Lagerbestand für Produkt XYZ?</Typography>
              </li>
              <li>
                <Typography variant="body2">Erstelle eine neue Bestellung für Kunde ABC</Typography>
              </li>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BarChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Datenvisualisierung</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Visualisieren Sie Ihre Daten mit einfachen Fragen</Typography>
            <Typography variant="body2" paragraph>
              Mit dem Datenvisualisierungstool können Sie Ihre Unternehmensdaten durch natürlichsprachliche 
              Anfragen visualisieren, ohne komplexe Abfragen schreiben zu müssen.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>Beispiele für Visualisierungen:</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>
                <Typography variant="body2">Umsatz pro Monat für das laufende Jahr</Typography>
              </li>
              <li>
                <Typography variant="body2">Top 10 Produkte nach Verkaufsmenge</Typography>
              </li>
              <li>
                <Typography variant="body2">Kundenverteilung nach Regionen</Typography>
              </li>
              <li>
                <Typography variant="body2">Entwicklung des Lagerbestands über die Zeit</Typography>
              </li>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HelpOutlineIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Tipps zur Verwendung</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Für beste Ergebnisse:</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>
                <Typography variant="body2">Formulieren Sie Ihre Fragen klar und präzise</Typography>
              </li>
              <li>
                <Typography variant="body2">Geben Sie relevante Details an (z.B. Zeiträume, Kundennamen)</Typography>
              </li>
              <li>
                <Typography variant="body2">Nutzen Sie die vorgeschlagenen Aktionen für Folgeschritte</Typography>
              </li>
              <li>
                <Typography variant="body2">Speichern Sie nützliche Visualisierungen für späteren Zugriff</Typography>
              </li>
            </Box>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button variant="outlined" color="primary">
                Ausführliche Dokumentation
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AIAssistantPage; 