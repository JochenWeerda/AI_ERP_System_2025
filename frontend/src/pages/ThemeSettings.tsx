import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  SelectChangeEvent,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useThemeContext } from '../themes/ThemeProvider';
import { ThemeMode, ThemeVariant, CustomTheme } from '../themes/themeTypes';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import AI from '../components/AI';

const ThemeSettings: React.FC = () => {
  const { 
    currentThemeConfig, 
    setThemeMode, 
    setThemeVariant, 
    updateThemeParameters, 
    resetTheme,
    createCustomTheme,
    loadPublicThemes 
  } = useThemeContext();
  
  const { isAuthenticated } = useAuth();
  
  const [mode, setMode] = useState<ThemeMode>(currentThemeConfig.mode);
  const [variant, setVariant] = useState<ThemeVariant>(currentThemeConfig.variant);
  const [parameters, setParameters] = useState(currentThemeConfig.parameters);
  const [syncEnabled, setSyncEnabled] = useState<boolean>(true);
  
  // State für benutzerdefinierte Themes
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [newThemeName, setNewThemeName] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Öffentliche Themes laden
  useEffect(() => {
    if (loadPublicThemes) {
      const fetchThemes = async () => {
        try {
          const themes = await loadPublicThemes();
          setCustomThemes(themes.map(theme => ({
            id: theme.id,
            name: theme.name,
            themeConfig: theme.themeConfig,
            isPublic: true,
            createdAt: new Date().toISOString()
          })));
        } catch (error) {
          console.error('Fehler beim Laden der öffentlichen Themes:', error);
          showSnackbar('Fehler beim Laden der Themes', 'error');
        }
      };
      fetchThemes();
    }
  }, [loadPublicThemes]);

  const handleModeChange = (event: SelectChangeEvent<string>) => {
    const newMode = event.target.value as ThemeMode;
    setMode(newMode);
    setThemeMode(newMode);
  };

  const handleVariantChange = (event: SelectChangeEvent<string>) => {
    const newVariant = event.target.value as ThemeVariant;
    setVariant(newVariant);
    setThemeVariant(newVariant);
  };

  const handleFontSizeChange = (event: SelectChangeEvent<string>) => {
    const fontSize = event.target.value as 'small' | 'medium' | 'large';
    setParameters(prev => ({ ...prev, fontSize }));
    updateThemeParameters({ fontSize });
  };

  const handleSpacingChange = (event: SelectChangeEvent<string>) => {
    const spacing = event.target.value as 'compact' | 'normal' | 'comfortable';
    setParameters(prev => ({ ...prev, spacing }));
    updateThemeParameters({ spacing });
  };

  const handleBorderRadiusChange = (event: SelectChangeEvent<string>) => {
    const borderRadius = event.target.value as 'none' | 'small' | 'medium' | 'large';
    setParameters(prev => ({ ...prev, borderRadius }));
    updateThemeParameters({ borderRadius });
  };
  
  const handleSyncToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSyncEnabled(event.target.checked);
  };
  
  const handleResetTheme = () => {
    resetTheme();
    setMode(currentThemeConfig.mode);
    setVariant(currentThemeConfig.variant);
    setParameters(currentThemeConfig.parameters);
    showSnackbar('Theme auf Standardwerte zurückgesetzt', 'success');
  };
  
  // Dialog zum Erstellen eines benutzerdefinierten Themes öffnen
  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
    setNewThemeName('');
    setIsPublic(false);
  };
  
  // Benutzerdefiniertes Theme erstellen
  const handleCreateCustomTheme = async () => {
    if (!newThemeName.trim()) {
      showSnackbar('Bitte geben Sie einen Namen für das Theme ein', 'error');
      return;
    }
    
    try {
      if (createCustomTheme) {
        const themeId = await createCustomTheme(newThemeName, isPublic);
        showSnackbar('Theme erfolgreich erstellt', 'success');
        
        // Neues Theme zur Liste hinzufügen
        const newTheme: CustomTheme = {
          id: themeId,
          name: newThemeName,
          themeConfig: currentThemeConfig,
          isPublic,
          createdAt: new Date().toISOString()
        };
        
        setCustomThemes(prev => [...prev, newTheme]);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Themes:', error);
      showSnackbar('Fehler beim Erstellen des Themes', 'error');
    }
    
    setCreateDialogOpen(false);
  };
  
  // Benutzerdefiniertes Theme anwenden
  const applyCustomTheme = (theme: CustomTheme) => {
    setThemeMode(theme.themeConfig.mode);
    setThemeVariant(theme.themeConfig.variant);
    updateThemeParameters(theme.themeConfig.parameters);
    
    setMode(theme.themeConfig.mode);
    setVariant(theme.themeConfig.variant);
    setParameters(theme.themeConfig.parameters);
    
    showSnackbar(`Theme "${theme.name}" angewendet`, 'success');
  };
  
  // Snackbar anzeigen
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Snackbar schließen
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Layout title="Theme-Einstellungen">
      <Typography variant="h4" gutterBottom>
        Theme-Einstellungen
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Grundeinstellungen
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="theme-mode-label">Modus</InputLabel>
              <Select
                labelId="theme-mode-label"
                id="theme-mode"
                value={mode}
                label="Modus"
                onChange={handleModeChange}
              >
                <MenuItem value="light">Hell</MenuItem>
                <MenuItem value="dark">Dunkel</MenuItem>
                <MenuItem value="highContrast">Hoher Kontrast</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="theme-variant-label">Variante</InputLabel>
              <Select
                labelId="theme-variant-label"
                id="theme-variant"
                value={variant}
                label="Variante"
                onChange={handleVariantChange}
              >
                <MenuItem value="odoo">Odoo</MenuItem>
                <MenuItem value="default">Standard</MenuItem>
                <MenuItem value="modern">Modern</MenuItem>
                <MenuItem value="classic">Klassisch</MenuItem>
              </Select>
            </FormControl>
            
            {isAuthenticated && (
              <FormControlLabel
                control={
                  <Switch
                    checked={syncEnabled}
                    onChange={handleSyncToggle}
                    color="primary"
                  />
                }
                label="Theme-Einstellungen mit Server synchronisieren"
                sx={{ mt: 2, display: 'block' }}
              />
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleResetTheme}
                startIcon={<RefreshIcon />}
              >
                Zurücksetzen
              </Button>
              
              {isAuthenticated && createCustomTheme && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenCreateDialog}
                  startIcon={<SaveIcon />}
                >
                  Als neues Theme speichern
                </Button>
              )}
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Erweiterte Einstellungen
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="font-size-label">Schriftgröße</InputLabel>
              <Select
                labelId="font-size-label"
                id="font-size"
                value={parameters.fontSize || 'medium'}
                label="Schriftgröße"
                onChange={handleFontSizeChange}
              >
                <MenuItem value="small">Klein</MenuItem>
                <MenuItem value="medium">Mittel</MenuItem>
                <MenuItem value="large">Groß</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="spacing-label">Abstände</InputLabel>
              <Select
                labelId="spacing-label"
                id="spacing"
                value={parameters.spacing || 'normal'}
                label="Abstände"
                onChange={handleSpacingChange}
              >
                <MenuItem value="compact">Kompakt</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="comfortable">Komfortabel</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="border-radius-label">Eckenradius</InputLabel>
              <Select
                labelId="border-radius-label"
                id="border-radius"
                value={parameters.borderRadius || 'small'}
                label="Eckenradius"
                onChange={handleBorderRadiusChange}
              >
                <MenuItem value="none">Keine Abrundung</MenuItem>
                <MenuItem value="small">Leicht abgerundet</MenuItem>
                <MenuItem value="medium">Mittel abgerundet</MenuItem>
                <MenuItem value="large">Stark abgerundet</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Aktuelle Theme-Konfiguration" />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                <strong>Modus:</strong> {mode === 'light' ? 'Hell' : mode === 'dark' ? 'Dunkel' : 'Hoher Kontrast'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Variante:</strong> {variant}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Schriftgröße:</strong> {parameters.fontSize === 'small' ? 'Klein' : parameters.fontSize === 'large' ? 'Groß' : 'Mittel'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Abstände:</strong> {parameters.spacing === 'compact' ? 'Kompakt' : parameters.spacing === 'comfortable' ? 'Komfortabel' : 'Normal'}
              </Typography>
              <Typography variant="body1">
                <strong>Eckenradius:</strong> {
                  parameters.borderRadius === 'none' ? 'Keine Abrundung' : 
                  parameters.borderRadius === 'small' ? 'Leicht abgerundet' : 
                  parameters.borderRadius === 'medium' ? 'Mittel abgerundet' : 
                  'Stark abgerundet'
                }
              </Typography>
            </CardContent>
          </Card>
          
          {customThemes.length > 0 && (
            <Paper sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Verfügbare Themes
              </Typography>
              <List>
                {customThemes.map((theme) => (
                  <ListItem key={theme.id} divider>
                    <ListItemText
                      primary={theme.name}
                      secondary={`Erstellt: ${new Date(theme.createdAt).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Theme anwenden">
                        <IconButton edge="end" onClick={() => applyCustomTheme(theme)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              KI-Assistent für Theme-Anpassungen
            </Typography>
            <Typography variant="body2" paragraph>
              Nutzen Sie den KI-Assistenten, um das Theme mit natürlichsprachlichen Befehlen anzupassen.
            </Typography>
            <AI />
          </Box>
        </Grid>
      </Grid>
      
      {/* Dialog zum Erstellen eines benutzerdefinierten Themes */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Neues Theme erstellen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="theme-name"
            label="Theme-Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                color="primary"
              />
            }
            label="Öffentlich für alle Benutzer verfügbar machen"
            sx={{ mt: 2, display: 'block' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleCreateCustomTheme} variant="contained" color="primary">
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar für Benachrichtigungen */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ThemeSettings; 