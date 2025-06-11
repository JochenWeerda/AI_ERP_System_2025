import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import aiAssistantApi, { 
  VisualizationRequest, 
  VisualizationResponse,
  DataPoint
} from '../../api/aiAssistantApi';

// Chart-Komponenten von recharts
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Farbpalette für die Diagramme
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B'];

interface DataVisualizationProps {
  initialQuery?: string;
  height?: string | number;
  width?: string | number;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  initialQuery = '',
  height = 500,
  width = '100%'
}) => {
  // State
  const [query, setQuery] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chartType, setChartType] = useState<string>('auto');
  const [visualizationData, setVisualizationData] = useState<VisualizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState<boolean>(false);
  
  // Verfügbare Diagrammtypen
  const chartTypes = [
    { value: 'auto', label: 'Automatisch', icon: <BarChartIcon /> },
    { value: 'bar', label: 'Balkendiagramm', icon: <BarChartIcon /> },
    { value: 'line', label: 'Liniendiagramm', icon: <TimelineIcon /> },
    { value: 'pie', label: 'Kreisdiagramm', icon: <PieChartIcon /> },
  ];
  
  // Funktion zum Generieren der Visualisierung
  const generateVisualization = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const request: VisualizationRequest = {
        query,
        preferred_chart_type: chartType === 'auto' ? undefined : chartType
      };
      
      const response = await aiAssistantApi.generateVisualization(request);
      setVisualizationData(response);
    } catch (err) {
      console.error('Fehler bei der Generierung der Visualisierung:', err);
      setError('Bei der Generierung der Visualisierung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funktion zum Speichern der Visualisierung
  const saveVisualization = async () => {
    if (!visualizationData) return;
    
    try {
      const result = await aiAssistantApi.saveVisualization(visualizationData.visualization_data);
      alert(`Visualisierung erfolgreich gespeichert mit ID: ${result.visualization_id}`);
    } catch (err) {
      console.error('Fehler beim Speichern der Visualisierung:', err);
      alert('Beim Speichern der Visualisierung ist ein Fehler aufgetreten.');
    }
  };
  
  // Funktion zum Anwenden einer Vorschlag-Abfrage
  const applySuggestion = (suggestion: string) => {
    setQuery(suggestion);
    // Automatisch die neue Abfrage ausführen
    setTimeout(() => {
      generateVisualization();
    }, 100);
  };
  
  // Rendert das passende Diagramm basierend auf dem Typ
  const renderChart = () => {
    if (!visualizationData) return null;
    
    const { visualization_data } = visualizationData;
    const { type, data, title, x_axis_label, y_axis_label } = visualization_data;
    
    // Formatiere die Daten für das Diagramm
    const chartData = data.map(item => ({
      name: item.label,
      value: item.value
    }));
    
    // Render basierend auf dem Diagrammtyp
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                label={{ 
                  value: x_axis_label || '', 
                  position: 'bottom', 
                  offset: 0 
                }}
              />
              <YAxis 
                label={{ 
                  value: y_axis_label || '', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Wert" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                label={{ 
                  value: x_axis_label || '', 
                  position: 'bottom', 
                  offset: 0 
                }}
              />
              <YAxis 
                label={{ 
                  value: y_axis_label || '', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="Wert" />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={type === 'donut' ? 100 : 120}
                innerRadius={type === 'donut' ? 60 : 0}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Dieser Diagrammtyp wird derzeit nicht unterstützt.
            </Typography>
          </Box>
        );
    }
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height, 
        width, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <BarChartIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          KI-gestützte Datenvisualisierung
        </Typography>
        <Tooltip title="Über dieses Feature">
          <IconButton 
            size="small" 
            sx={{ color: 'white' }}
            onClick={() => setInfoDialogOpen(true)}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Abfragebereich */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            label="Frage an die Daten (z.B. 'Zeige mir den Umsatz pro Monat')"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            multiline
            maxRows={2}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="chart-type-label">Diagrammtyp</InputLabel>
            <Select
              labelId="chart-type-label"
              value={chartType}
              label="Diagrammtyp"
              onChange={(e) => setChartType(e.target.value)}
            >
              {chartTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {type.icon}
                    <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={generateVisualization}
            disabled={!query.trim() || isLoading}
          >
            Visualisieren
          </Button>
        </Box>
      </Box>
      
      {/* Visualisierungsbereich */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Box>
        ) : visualizationData ? (
          <Box>
            {/* Titel und Beschreibung */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                {visualizationData.visualization_data.title}
              </Typography>
              {visualizationData.visualization_data.description && (
                <Typography variant="body2" color="text.secondary">
                  {visualizationData.visualization_data.description}
                </Typography>
              )}
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                <i>Interpretation: {visualizationData.query_interpretation}</i>
              </Typography>
            </Box>
            
            {/* Diagramm */}
            <Box sx={{ mb: 3 }}>
              {renderChart()}
            </Box>
            
            {/* Speichern-Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={saveVisualization}
              >
                Visualisierung speichern
              </Button>
            </Box>
            
            {/* Vorschläge */}
            {visualizationData.suggestions && visualizationData.suggestions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Divider textAlign="center" sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Weitere Abfragen, die Sie stellen könnten
                  </Typography>
                </Divider>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {visualizationData.suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      onClick={() => applySuggestion(suggestion)}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'text.secondary'
          }}>
            <BarChartIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6">Stellen Sie eine Frage zu Ihren Daten</Typography>
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', maxWidth: 600 }}>
              Beispiel: "Zeige mir den Umsatz pro Monat", "Wer sind meine Top 5 Kunden?", 
              "Wie hat sich der Lagerbestand im letzten Quartal entwickelt?"
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Infodialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
      >
        <DialogTitle>Über KI-gestützte Datenvisualisierung</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Dieses Feature ermöglicht es Ihnen, Unternehmensdaten durch einfache natürlichsprachliche Anfragen zu visualisieren.
          </Typography>
          <Typography variant="body1" paragraph>
            <b>So funktioniert es:</b>
          </Typography>
          <Typography variant="body2" component="ul">
            <li>Stellen Sie eine Frage zu Ihren Daten in natürlicher Sprache</li>
            <li>Wählen Sie optional einen bevorzugten Diagrammtyp aus</li>
            <li>Der KI-Assistent interpretiert Ihre Anfrage und generiert eine passende Visualisierung</li>
            <li>Sie können die Visualisierung speichern oder weitere vorgeschlagene Abfragen erkunden</li>
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            <b>Beispiele für Fragen:</b>
          </Typography>
          <Typography variant="body2" component="ul">
            <li>Zeige mir den Umsatz pro Monat für 2023</li>
            <li>Wer sind meine Top 5 Kunden nach Umsatz?</li>
            <li>Wie hat sich der Lagerbestand im letzten Quartal entwickelt?</li>
            <li>Vergleiche die Verkaufszahlen der letzten drei Monate</li>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DataVisualization; 