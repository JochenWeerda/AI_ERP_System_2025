# Theme-Modul für AI-Driven ERP

Dieses Modul stellt ein zentrales, erweiterbares Theme-System für das AI-Driven ERP bereit, das ein einheitliches Look and Feel für alle Module gewährleistet.

## Hauptfunktionen

- **Zentrale Theme-Verwaltung**: Alle Module beziehen ihre Designs aus einer zentralen Quelle
- **Multiple Theme-Varianten**: Unterstützung für Odoo, Standard, Modern und Klassisch
- **Multiple Modi**: Hell, Dunkel und Hoher Kontrast für verschiedene Nutzerpräferenzen
- **Anpassbare Parameter**: Schriftgröße, Abstände, Eckenradien und visuelle Dichte
- **LLM-Integration**: Schnittstelle für KI-gesteuerte Theme-Anpassungen

## Dateien und Struktur

- `themeTypes.ts`: Definitionen für Theme-Typen und Interfaces
- `themeService.ts`: Zentraler Theme-Service mit Theme-Generierung und -Verwaltung
- `ThemeProvider.tsx`: React Context Provider für Theme-Integration
- `llmInterface.ts`: Schnittstelle für LLM-Kommunikation
- `index.ts`: Öffentliche API des Theme-Moduls
- `variants/`: Spezifische Theme-Implementierungen
  - `odooTheme.ts`: Odoo-inspiriertes Theme
  - `defaultTheme.ts`: Standard-Theme
  - (weitere Varianten werden hinzugefügt)

## Verwendung in Komponenten

### Theme-Eigenschaften verwenden

```tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useThemeSystem } from '../themes/ThemeProvider';

const MyComponent: React.FC = () => {
  const { currentThemeConfig } = useThemeSystem();
  
  // Theme-Parameter für angepasste Komponenten verwenden
  const isHighContrast = currentThemeConfig.mode === 'high-contrast';
  const visualDensity = currentThemeConfig.parameters?.visualDensity || 'medium';
  
  return (
    <Box sx={{ 
      p: visualDensity === 'low' ? 4 : (visualDensity === 'high' ? 2 : 3),
      border: isHighContrast ? '2px solid white' : '1px solid',
      borderColor: 'divider',
    }}>
      <Typography variant="h4">Meine Komponente</Typography>
      {/* Komponenten-Inhalt */}
    </Box>
  );
};
```

### Theme aktualisieren

```tsx
import React from 'react';
import { Button } from '@mui/material';
import { useThemeSystem } from '../themes/ThemeProvider';

const ThemeSwitcher: React.FC = () => {
  const { updateTheme } = useThemeSystem();
  
  const enableDarkMode = () => {
    updateTheme({ mode: 'dark' });
  };
  
  const switchToOdooTheme = () => {
    updateTheme({ variant: 'odoo' });
  };
  
  return (
    <>
      <Button onClick={enableDarkMode}>Dark Mode aktivieren</Button>
      <Button onClick={switchToOdooTheme}>Odoo-Theme aktivieren</Button>
    </>
  );
};
```

## LLM-Integration

Das Theme-Modul bietet eine Schnittstelle zur Integration mit LLMs für dynamische Theme-Anpassungen über natürliche Sprache.

```tsx
import { LLMService } from '../services/llmService';

// Verarbeitung von Nutzeranfragen
const handleUserQuery = async (query: string) => {
  const response = await LLMService.sendQuery(query);
  // Antwort anzeigen...
};

// Direkte Theme-Anpassung
const applyHighContrastMode = async () => {
  await LLMService.updateTheme({ mode: 'high-contrast' });
};
```

## Erweiterung um neue Theme-Varianten

Um eine neue Theme-Variante hinzuzufügen:

1. Erstellen Sie eine neue Datei in `variants/` (z.B. `variants/myTheme.ts`)
2. Implementieren Sie die Theme-Funktion ähnlich wie in `odooTheme.ts`
3. Registrieren Sie die neue Variante in `themeService.ts` in der `getThemeByVariant`-Funktion
4. Fügen Sie den Varianten-Namen zu `ThemeVariant` in `themeTypes.ts` hinzu

## Nächste Entwicklungsschritte

- Implementierung von Benutzer-spezifischen Theme-Einstellungen
- Speicherung von Einstellungen im Browser (LocalStorage)
- Erweiterte LLM-Integration mit spezifischeren Anpassungsmöglichkeiten
- Unterstützung für saisonale und zeitabhängige Themes 