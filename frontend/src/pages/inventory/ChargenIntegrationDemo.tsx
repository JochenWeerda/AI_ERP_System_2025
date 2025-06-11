import React, { useState } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  Breadcrumbs,
  Link
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ChargenAuswahlDemo from "../../components/inventory/ChargenAuswahlDemo";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demo-tabpanel-${index}`}
      aria-labelledby={`demo-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `demo-tab-${index}`,
    "aria-controls": `demo-tabpanel-${index}`,
  };
}

const ChargenIntegrationDemo: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Start
          </Link>
          <Link
            component={RouterLink}
            to="/inventory"
            underline="hover"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <InventoryIcon sx={{ mr: 0.5 }} fontSize="small" />
            Lager
          </Link>
          <Typography
            sx={{ display: "flex", alignItems: "center" }}
            color="text.primary"
          >
            <SwapHorizIcon sx={{ mr: 0.5 }} fontSize="small" />
            Chargen-Integration
          </Typography>
        </Breadcrumbs>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        Chargen-Integration
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Demonstration der Chargenauswahl und -verfolgung im Materialfluss
      </Typography>

      <Paper sx={{ width: "100%", mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="Chargen-Integration Tabs"
          >
            <Tab label="Chargen-Auswahl" {...a11yProps(0)} />
            <Tab label="Wareneingang" {...a11yProps(1)} />
            <Tab label="Warenausgang" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <ChargenAuswahlDemo />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Box p={3}>
            <Typography variant="h5" gutterBottom>
              Wareneingang mit Chargen
            </Typography>
            <Typography>
              In diesem Bereich könnte die Erfassung von Chargen beim Wareneingang demonstriert werden.
              Hier würden neue Chargen angelegt und ins System eingebucht werden.
            </Typography>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Box p={3}>
            <Typography variant="h5" gutterBottom>
              Warenausgang mit Chargen
            </Typography>
            <Typography>
              In diesem Bereich könnte die Verwendung der Chargenauswahl bei der Entnahme/Auslieferung
              demonstriert werden. Hier würde das FIFO-Prinzip für normale Artikel und das LIFO-Prinzip 
              für Schüttgut wie Dünger umgesetzt.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      <Box p={3} bgcolor="background.paper" borderRadius={1}>
        <Typography variant="h6" gutterBottom>
          Implementierungshinweise
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" paragraph>
          Die Chargenauswahl wurde so konzipiert, dass sie an verschiedenen Stellen im Anwendungsfluss
          eingesetzt werden kann:
        </Typography>
        <Typography component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Wareneingang:</strong> Erfassung neuer Chargen mit automatischer oder manueller Chargennummer
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Warenausgang/Kommissionierung:</strong> Intelligente Vorschlagsliste nach FIFO/LIFO
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Produktionsauftrag:</strong> Chargen-Zuordnung für verwendete Materialien
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Qualitätssicherung:</strong> Verknüpfung mit dem QS-Modul für chargenbezogene Prüfungen
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Rückverfolgbarkeit:</strong> Vollständige Nachverfolgung des Materialflusses von Chargen
            </Typography>
          </li>
        </Typography>
      </Box>
    </Container>
  );
};

export default ChargenIntegrationDemo;
