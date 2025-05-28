// Zentrale Export-Datei für das Theme-Modul

// Typen für Theme-Konfiguration
export type {
  ThemeMode,
  ThemeVariant,
  ThemeParameters,
  ThemeConfig,
  ExtendedPaletteOptions,
  ExtendedThemeOptions,
  ThemeProviderInterface
} from './themeTypes';

// Theme-Service und Hilfsfunktionen
export {
  ThemeService,
  getCurrentTheme,
  updateThemeConfig
} from './themeService';

// Standard-Theme als Default-Export
export { default } from './themeService'; 