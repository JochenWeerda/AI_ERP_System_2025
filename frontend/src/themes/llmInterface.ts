import { ThemeConfig, ThemeParameters } from './themeTypes';
import { updateThemeConfig, getCurrentTheme } from './themeService';

// Interface für LLM-Anfragen an das Theme-System
export interface ThemeUpdateRequest {
  mode?: 'light' | 'dark' | 'high-contrast';
  variant?: 'odoo' | 'default' | 'modern' | 'classic';
  parameters?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
    spacing?: 'compact' | 'normal' | 'comfortable';
    borderRadius?: 'none' | 'small' | 'medium' | 'large';
    fontFamily?: string;
    visualDensity?: 'low' | 'medium' | 'high';
  };
}

// Funktion zum Parsen und Verarbeiten von LLM-Anfragen zur Theme-Aktualisierung
export const processLLMThemeRequest = (request: string | ThemeUpdateRequest): void => {
  let themeRequest: Partial<ThemeConfig> = {};

  // Wenn die Anfrage als String übergeben wird, versuchen, sie zu parsen
  if (typeof request === 'string') {
    try {
      // Einfaches Parsen von Schlüsselwörtern in der Anfrage
      if (request.toLowerCase().includes('dark mode') || request.toLowerCase().includes('dunkelmodus')) {
        themeRequest.mode = 'dark';
      } else if (request.toLowerCase().includes('light mode') || request.toLowerCase().includes('hellmodus')) {
        themeRequest.mode = 'light';
      } else if (request.toLowerCase().includes('high contrast') || request.toLowerCase().includes('hoher kontrast')) {
        themeRequest.mode = 'high-contrast';
      }

      // Parsen von Theme-Varianten
      if (request.toLowerCase().includes('odoo')) {
        themeRequest.variant = 'odoo';
      } else if (request.toLowerCase().includes('default') || request.toLowerCase().includes('standard')) {
        themeRequest.variant = 'default';
      } else if (request.toLowerCase().includes('modern')) {
        themeRequest.variant = 'modern';
      } else if (request.toLowerCase().includes('classic') || request.toLowerCase().includes('klassisch')) {
        themeRequest.variant = 'classic';
      }

      // Parsen von Parameter-Anfragen
      const parameters: ThemeParameters = {};

      // Schriftgröße
      if (request.toLowerCase().includes('kleine schrift') || request.toLowerCase().includes('small font')) {
        parameters.fontSize = 'small';
      } else if (request.toLowerCase().includes('große schrift') || request.toLowerCase().includes('large font')) {
        parameters.fontSize = 'large';
      }

      // Abstände
      if (request.toLowerCase().includes('kompakt') || request.toLowerCase().includes('compact')) {
        parameters.spacing = 'compact';
      } else if (request.toLowerCase().includes('komfortabel') || request.toLowerCase().includes('comfortable')) {
        parameters.spacing = 'comfortable';
      }

      // Eckenradius
      if (request.toLowerCase().includes('keine ecken') || request.toLowerCase().includes('no corners')) {
        parameters.borderRadius = 'none';
      } else if (request.toLowerCase().includes('abgerundete ecken') || request.toLowerCase().includes('rounded corners')) {
        parameters.borderRadius = 'medium';
      } else if (request.toLowerCase().includes('stark abgerundete ecken') || request.toLowerCase().includes('very rounded')) {
        parameters.borderRadius = 'large';
      }

      // Visuelle Dichte
      if (request.toLowerCase().includes('weniger elemente') || request.toLowerCase().includes('low density')) {
        parameters.visualDensity = 'low';
      } else if (request.toLowerCase().includes('mehr elemente') || request.toLowerCase().includes('high density')) {
        parameters.visualDensity = 'high';
      }

      // Parameter nur hinzufügen, wenn sie nicht leer sind
      if (Object.keys(parameters).length > 0) {
        themeRequest.parameters = parameters;
      }
    } catch (error) {
      console.error('Fehler beim Parsen der LLM-Theme-Anfrage:', error);
      return;
    }
  } else {
    // Wenn die Anfrage bereits als Objekt übergeben wird
    themeRequest = {
      mode: request.mode,
      variant: request.variant,
      parameters: request.parameters
    };
  }

  // Theme aktualisieren, wenn Änderungen vorhanden sind
  if (Object.keys(themeRequest).length > 0) {
    updateThemeConfig(themeRequest);
  }
};

// Funktion zum Generieren einer Beschreibung des aktuellen Themes für das LLM
export const getThemeDescriptionForLLM = (): string => {
  const currentTheme = getCurrentTheme();
  const { palette, typography, shape, spacing } = currentTheme;

  return `
Aktuelles Theme:
- Modus: ${palette.mode === 'dark' ? 'Dunkelmodus' : 'Hellmodus'}
- Primärfarbe: ${palette.primary.main}
- Sekundärfarbe: ${palette.secondary.main}
- Schriftart: ${typography.fontFamily}
- Randradius: ${shape.borderRadius}px
- Standardabstand: ${spacing(1)}px
`;
}; 