import { createTheme, Theme } from '@mui/material/styles';
import {
  ThemeConfig,
  ThemeMode,
  ThemeVariant,
  ThemeParameters,
  ExtendedThemeOptions,
  ThemeProviderInterface,
  DEFAULT_THEME_CONFIG,
  ThemeStorage
} from './themeTypes';
import ThemeRestAPIService from './themeRestAPI';

// Theme-Varianten importieren
import defaultTheme from './variants/defaultTheme';
import odooTheme from './variants/odooTheme';
import modernTheme from './variants/modernTheme';
import classicTheme from './variants/classicTheme';

// Hilfsfunktionen importieren
import highContrastMode from './variants/highContrastMode';
import accessibilityUtils from './variants/accessibilityUtils';

/**
 * Theme-Service
 * Zentraler Dienst für Theme-Management und -Anwendung
 */
export class ThemeService {
  private static instance: ThemeService;
  private currentConfig: ThemeConfig;
  private storage: ThemeStorage;
  private currentUserId: string | null = null;
  private synchronizationEnabled: boolean = false;
  
  private constructor() {
    this.storage = {
      getStoredTheme: () => {
        try {
          const storedTheme = localStorage.getItem('erp_theme_config');
          return storedTheme ? JSON.parse(storedTheme) : null;
        } catch (error) {
          console.error('Fehler beim Laden des gespeicherten Themes:', error);
          return null;
        }
      },
      
      storeTheme: (config: ThemeConfig) => {
        try {
          localStorage.setItem('erp_theme_config', JSON.stringify(config));
          
          // Falls ein Benutzer angemeldet ist und Synchronisierung aktiviert ist, auf den Server synchronisieren
          if (this.currentUserId && this.synchronizationEnabled) {
            this.syncWithServer(config);
          }
        } catch (error) {
          console.error('Fehler beim Speichern des Themes:', error);
        }
      },
      
      clearStoredTheme: () => {
        try {
          localStorage.removeItem('erp_theme_config');
        } catch (error) {
          console.error('Fehler beim Löschen des gespeicherten Themes:', error);
        }
      }
    };
    
    // Gespeichertes Theme laden oder Standardwerte verwenden
    const storedTheme = this.storage.getStoredTheme();
    this.currentConfig = storedTheme || { ...DEFAULT_THEME_CONFIG };
  }
  
  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }
  
  /**
   * Aktuelles Theme abrufen
   * @returns Aktuelle Theme-Konfiguration
   */
  public getCurrentConfig(): ThemeConfig {
    return { ...this.currentConfig };
  }
  
  /**
   * Theme-Modus ändern
   * @param mode Neuer Theme-Modus
   */
  public setThemeMode(mode: ThemeMode): void {
    this.currentConfig = {
      ...this.currentConfig,
      mode
    };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Theme-Variante ändern
   * @param variant Neue Theme-Variante
   */
  public setThemeVariant(variant: ThemeVariant): void {
    this.currentConfig = {
      ...this.currentConfig,
      variant
    };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Theme-Parameter aktualisieren
   * @param parameters Neue Theme-Parameter
   */
  public updateParameters(parameters: Partial<ThemeParameters>): void {
    this.currentConfig = {
      ...this.currentConfig,
      parameters: {
        ...this.currentConfig.parameters,
        ...parameters
      }
    };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Vollständige Theme-Konfiguration setzen
   * @param config Neue Theme-Konfiguration
   */
  public setThemeConfig(config: ThemeConfig): void {
    this.currentConfig = { ...config };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Theme zurücksetzen auf Standardwerte
   */
  public resetTheme(): void {
    this.currentConfig = { ...DEFAULT_THEME_CONFIG };
    this.storage.storeTheme(this.currentConfig);
  }
  
  /**
   * Benutzer-ID setzen für serverseitige Synchronisation
   * @param userId ID des angemeldeten Benutzers
   */
  public setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
    
    // Wenn ein Benutzer gesetzt wurde, Theme vom Server laden
    if (userId) {
      this.loadThemeFromServer(userId);
    }
  }
  
  /**
   * Server-Synchronisation aktivieren oder deaktivieren
   * @param enabled Ob die Synchronisation aktiviert werden soll
   */
  public enableSynchronization(enabled: boolean): void {
    this.synchronizationEnabled = enabled;
  }
  
  /**
   * Theme vom Server laden
   * @param userId Benutzer-ID
   */
  private async loadThemeFromServer(userId: string): Promise<void> {
    try {
      const serverTheme = await ThemeRestAPIService.getUserTheme(userId);
      
      // Nur aktualisieren, wenn vom Server ein Theme zurückgegeben wurde
      if (serverTheme) {
        this.currentConfig = serverTheme;
        
        // Lokalen Speicher aktualisieren, aber keine Serverpersistenz auslösen
        const tempSync = this.synchronizationEnabled;
        this.synchronizationEnabled = false;
        this.storage.storeTheme(this.currentConfig);
        this.synchronizationEnabled = tempSync;
      }
    } catch (error) {
      console.error('Fehler beim Laden des Themes vom Server:', error);
      // Bei Fehlern die lokale Konfiguration beibehalten
    }
  }
  
  /**
   * Theme auf den Server synchronisieren
   * @param config Theme-Konfiguration, die synchronisiert werden soll
   */
  private async syncWithServer(config: ThemeConfig): Promise<void> {
    if (!this.currentUserId) return;
    
    try {
      await ThemeRestAPIService.saveUserTheme(this.currentUserId, config);
    } catch (error) {
      console.error('Fehler beim Synchronisieren des Themes mit dem Server:', error);
      // Bei Fehlern einfach weitermachen, die lokale Konfiguration ist bereits gespeichert
    }
  }
  
  /**
   * Theme-Objekt für Material-UI basierend auf der aktuellen Konfiguration erstellen
   * @returns Material-UI Theme-Objekt
   */
  public createCurrentTheme(): Theme {
    const { mode, variant, parameters } = this.currentConfig;
    
    // Theme-Variante wählen
    let themeCreator;
    switch (variant) {
      case 'odoo':
        themeCreator = odooTheme;
        break;
      case 'modern':
        themeCreator = modernTheme;
        break;
      case 'classic':
        themeCreator = classicTheme;
        break;
      case 'default':
      default:
        themeCreator = defaultTheme;
    }
    
    // Basis-Theme erstellen
    let theme = themeCreator(mode, parameters);
    
    // Hohen Kontrast anwenden, wenn der Modus 'highContrast' ist
    if (mode === 'highContrast') {
      theme = createTheme(highContrastMode(theme));
    }
    
    // Zusätzliche Barrierefreiheitsanpassungen anwenden
    if (parameters.enhancedFocus) {
      theme = createTheme(accessibilityUtils.enhanceContrast(theme));
    }
    
    if (parameters.motionReduced) {
      // Animationen reduzieren für Nutzer, die Bewegung reduzieren möchten
      theme = createTheme({
        ...theme,
        transitions: {
          ...theme.transitions,
          create: () => 'none',
        },
      });
    }
    
    return theme;
  }
  
  /**
   * Prüfen, ob der aktuelle Kontrast WCAG-Richtlinien entspricht
   * @returns Boolean, ob der Kontrast ausreichend ist
   */
  public hasAdequateContrast(): boolean {
    const { mode, parameters } = this.currentConfig;
    const theme = this.createCurrentTheme();
    
    // Primärfarbe gegen Hintergrund prüfen
    const primary = theme.palette.primary.main;
    const background = theme.palette.background.default;
    
    return accessibilityUtils.hasAdequateContrast(primary, background);
  }
  
  /**
   * CSS-Variablen für globale Theme-Anpassungen generieren
   * @returns CSS-Variablen als String
   */
  public generateCSSVariables(): string {
    const theme = this.createCurrentTheme();
    
    return `
      :root {
        --primary-color: ${theme.palette.primary.main};
        --secondary-color: ${theme.palette.secondary.main};
        --background-color: ${theme.palette.background.default};
        --paper-color: ${theme.palette.background.paper};
        --text-primary: ${theme.palette.text.primary};
        --text-secondary: ${theme.palette.text.secondary};
        --border-radius: ${theme.shape.borderRadius}px;
        --spacing-unit: ${theme.spacing(1)}px;
        --font-family: ${theme.typography.fontFamily};
        --font-size: ${theme.typography.fontSize}px;
      }
    `;
  }
  
  /**
   * Laden der verfügbaren Theme-Varianten vom Server
   * @returns Liste der verfügbaren Theme-Varianten
   */
  public async getAvailableVariants(): Promise<ThemeVariant[]> {
    try {
      return await ThemeRestAPIService.getAvailableVariants();
    } catch (error) {
      console.error('Fehler beim Laden der verfügbaren Theme-Varianten:', error);
      // Fallback zu statischen Varianten
      return ['default', 'odoo', 'modern', 'classic'];
    }
  }
  
  /**
   * Benutzerdefiniertes Theme erstellen und auf den Server hochladen
   * @param name Name des Themes
   * @param isPublic Ob das Theme öffentlich verfügbar sein soll
   * @returns ID des erstellten Themes
   */
  public async createCustomTheme(name: string, isPublic: boolean = false): Promise<string> {
    try {
      return await ThemeRestAPIService.createCustomTheme(name, this.currentConfig, isPublic);
    } catch (error) {
      console.error('Fehler beim Erstellen eines benutzerdefinierten Themes:', error);
      throw error;
    }
  }
  
  /**
   * Laden aller öffentlichen benutzerdefinierten Themes
   * @returns Liste aller öffentlichen benutzerdefinierten Themes
   */
  public async getPublicCustomThemes(): Promise<Array<{ id: string; name: string; themeConfig: ThemeConfig }>> {
    try {
      return await ThemeRestAPIService.getPublicCustomThemes();
    } catch (error) {
      console.error('Fehler beim Laden der öffentlichen benutzerdefinierten Themes:', error);
      return [];
    }
  }
}

// Singleton-Instanz exportieren
const themeService = ThemeService.getInstance();

/**
 * Hilfsfunktion, um das aktuelle Theme zu erhalten
 * @returns Material-UI Theme-Objekt
 */
export const getCurrentTheme = (): Theme => {
  return themeService.createCurrentTheme();
};

/**
 * Hilfsfunktion, um die Theme-Konfiguration zu aktualisieren
 * @param config Neue Theme-Konfiguration
 */
export const updateThemeConfig = (config: Partial<ThemeConfig>): void => {
  const currentConfig = themeService.getCurrentConfig();
  
  themeService.setThemeConfig({
    ...currentConfig,
    ...config,
    parameters: {
      ...currentConfig.parameters,
      ...config.parameters || {}
    }
  });
};

export default themeService; 