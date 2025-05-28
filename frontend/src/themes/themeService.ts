import { createTheme, Theme } from '@mui/material/styles';
import {
  ThemeConfig,
  ThemeMode,
  ThemeVariant,
  ThemeParameters,
  ExtendedThemeOptions,
  ThemeProviderInterface
} from './themeTypes';
import { getOdooTheme } from './variants/odooTheme';
import { getDefaultTheme } from './variants/defaultTheme';

// Standardkonfiguration für das Theme
const defaultConfig: ThemeConfig = {
  mode: 'light',
  variant: 'odoo', // Als Standard verwenden wir das Odoo-Theme
  parameters: {
    fontSize: 'medium',
    spacing: 'normal',
    borderRadius: 'small',
    visualDensity: 'medium'
  }
};

// Aktuelle Theme-Konfiguration
let currentConfig: ThemeConfig = { ...defaultConfig };

// Factory-Funktion zum Erstellen des richtigen Themes basierend auf der Variante
const getThemeByVariant = (variant: ThemeVariant, mode: ThemeMode): ExtendedThemeOptions => {
  switch (variant) {
    case 'odoo':
      return getOdooTheme(mode);
    case 'default':
      return getDefaultTheme(mode);
    case 'modern':
      // Für zukünftige Erweiterungen
      return getDefaultTheme(mode);
    case 'classic':
      // Für zukünftige Erweiterungen
      return getOdooTheme(mode);
    default:
      return getDefaultTheme(mode);
  }
};

// Anwendung der LLM-Parameter auf ein Theme
const applyThemeParameters = (
  themeOptions: ExtendedThemeOptions,
  parameters?: ThemeParameters
): ExtendedThemeOptions => {
  if (!parameters) return themeOptions;

  const adjustedTheme = { ...themeOptions };

  // Anpassung der Primär- und Sekundärfarben, falls angegeben
  if (parameters.primaryColor && adjustedTheme.palette) {
    adjustedTheme.palette.primary = {
      ...adjustedTheme.palette.primary,
      main: parameters.primaryColor
    };
  }

  if (parameters.secondaryColor && adjustedTheme.palette) {
    adjustedTheme.palette.secondary = {
      ...adjustedTheme.palette.secondary,
      main: parameters.secondaryColor
    };
  }

  // Anpassung der Schriftgröße
  if (parameters.fontSize && adjustedTheme.typography) {
    const fontSizeMultiplier = 
      parameters.fontSize === 'small' ? 0.9 :
      parameters.fontSize === 'large' ? 1.1 : 1;

    // Alle Typografie-Einstellungen anpassen
    Object.keys(adjustedTheme.typography).forEach(key => {
      const typographyKey = key as keyof typeof adjustedTheme.typography;
      if (typographyKey !== 'fontFamily' && typeof adjustedTheme.typography[typographyKey] === 'object') {
        const element = adjustedTheme.typography[typographyKey] as any;
        if (element.fontSize) {
          element.fontSize = `calc(${element.fontSize} * ${fontSizeMultiplier})`;
        }
      }
    });
  }

  // Anpassung der Abstände
  if (parameters.spacing) {
    const spacingValue = 
      parameters.spacing === 'compact' ? 6 :
      parameters.spacing === 'comfortable' ? 10 : 8;
    
    adjustedTheme.spacing = spacingValue;
  }

  // Anpassung der Eckenradien
  if (parameters.borderRadius && adjustedTheme.shape) {
    const borderRadiusValue = 
      parameters.borderRadius === 'none' ? 0 :
      parameters.borderRadius === 'small' ? 4 :
      parameters.borderRadius === 'medium' ? 8 :
      parameters.borderRadius === 'large' ? 16 : 4;
    
    adjustedTheme.shape.borderRadius = borderRadiusValue;
  }

  // Anpassung der Schriftart
  if (parameters.fontFamily && adjustedTheme.typography) {
    adjustedTheme.typography.fontFamily = parameters.fontFamily;
  }

  // Anpassung der visuellen Dichte
  if (parameters.visualDensity) {
    const densityValue = 
      parameters.visualDensity === 'low' ? -1 :
      parameters.visualDensity === 'high' ? 1 : 0;
    
    adjustedTheme.visualDensity = densityValue;
  }

  return adjustedTheme;
};

// Hauptfunktion zum Erstellen eines Themes basierend auf der Konfiguration
const createThemeFromConfig = (config: ThemeConfig): Theme => {
  // Theme-Optionen basierend auf Variante und Modus holen
  const themeOptions = getThemeByVariant(config.variant, config.mode);
  
  // LLM-Parameter anwenden, falls vorhanden
  const adjustedOptions = applyThemeParameters(themeOptions, config.parameters);
  
  // MUI-Theme erstellen
  return createTheme(adjustedOptions as any);
};

// Theme Service Interface Implementation
export const ThemeService: ThemeProviderInterface = {
  getTheme: (config: ThemeConfig): ExtendedThemeOptions => {
    currentConfig = config;
    return getThemeByVariant(config.variant, config.mode);
  },
  
  getCurrentThemeConfig: (): ThemeConfig => {
    return { ...currentConfig };
  },
  
  setThemeConfig: (config: ThemeConfig): void => {
    currentConfig = { ...config };
  }
};

// Helper-Funktion, um das aktuelle Theme zu erhalten
export const getCurrentTheme = (): Theme => {
  return createThemeFromConfig(currentConfig);
};

// Helper-Funktion zum Aktualisieren des Themes mit neuer Konfiguration
export const updateThemeConfig = (config: Partial<ThemeConfig>): Theme => {
  currentConfig = {
    ...currentConfig,
    ...config
  };
  return createThemeFromConfig(currentConfig);
};

// Exportieren des Standard-Themes
export default getCurrentTheme(); 