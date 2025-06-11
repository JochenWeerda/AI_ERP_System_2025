import axios from 'axios';
import { ThemeConfig, ThemeMode, ThemeVariant, ThemeParameters, ThemePreferences } from './themeTypes';

// Basis-URL für Theme-API
const BASE_URL = '/api/v1/themes';

/**
 * Theme REST API Service
 * Bietet Methoden zum Speichern und Abrufen von Theme-Einstellungen über eine REST-API
 */
export class ThemeRestAPIService {
  /**
   * Lädt die Theme-Einstellungen eines Benutzers
   * @param userId ID des Benutzers
   * @returns Promise mit der Theme-Konfiguration
   */
  public static async getUserTheme(userId: string): Promise<ThemeConfig> {
    try {
      const response = await axios.get(`${BASE_URL}/users/${userId}`);
      return response.data.themeConfig;
    } catch (error) {
      console.error('Fehler beim Laden des Benutzer-Themes:', error);
      throw error;
    }
  }

  /**
   * Speichert die Theme-Einstellungen eines Benutzers
   * @param userId ID des Benutzers
   * @param themeConfig Theme-Konfiguration
   * @returns Promise mit dem Ergebnis der Operation
   */
  public static async saveUserTheme(userId: string, themeConfig: ThemeConfig): Promise<any> {
    try {
      const response = await axios.post(`${BASE_URL}/users/${userId}`, {
        themeConfig,
        lastUpdated: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Speichern des Benutzer-Themes:', error);
      throw error;
    }
  }

  /**
   * Lädt alle verfügbaren Theme-Varianten
   * @returns Promise mit einer Liste aller verfügbaren Theme-Varianten
   */
  public static async getAvailableVariants(): Promise<ThemeVariant[]> {
    try {
      const response = await axios.get(`${BASE_URL}/variants`);
      return response.data.variants;
    } catch (error) {
      console.error('Fehler beim Laden der verfügbaren Theme-Varianten:', error);
      throw error;
    }
  }

  /**
   * Lädt alle verfügbaren Theme-Modi
   * @returns Promise mit einer Liste aller verfügbaren Theme-Modi
   */
  public static async getAvailableModes(): Promise<ThemeMode[]> {
    try {
      const response = await axios.get(`${BASE_URL}/modes`);
      return response.data.modes;
    } catch (error) {
      console.error('Fehler beim Laden der verfügbaren Theme-Modi:', error);
      throw error;
    }
  }

  /**
   * Lädt ein organisationsweites Standard-Theme
   * @param organizationId ID der Organisation
   * @returns Promise mit der Standard-Theme-Konfiguration
   */
  public static async getOrganizationDefaultTheme(organizationId: string): Promise<ThemeConfig> {
    try {
      const response = await axios.get(`${BASE_URL}/organizations/${organizationId}/default`);
      return response.data.themeConfig;
    } catch (error) {
      console.error('Fehler beim Laden des Organisations-Standard-Themes:', error);
      throw error;
    }
  }

  /**
   * Speichert ein organisationsweites Standard-Theme
   * @param organizationId ID der Organisation
   * @param themeConfig Theme-Konfiguration
   * @returns Promise mit dem Ergebnis der Operation
   */
  public static async saveOrganizationDefaultTheme(organizationId: string, themeConfig: ThemeConfig): Promise<any> {
    try {
      const response = await axios.post(`${BASE_URL}/organizations/${organizationId}/default`, {
        themeConfig,
        lastUpdated: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Speichern des Organisations-Standard-Themes:', error);
      throw error;
    }
  }

  /**
   * Erstellt ein neues benutzerdefiniertes Theme
   * @param name Name des benutzerdefinierten Themes
   * @param themeConfig Theme-Konfiguration
   * @param isPublic Ob das Theme öffentlich verfügbar ist
   * @returns Promise mit der ID des erstellten Themes
   */
  public static async createCustomTheme(
    name: string,
    themeConfig: ThemeConfig,
    isPublic: boolean = false
  ): Promise<string> {
    try {
      const response = await axios.post(`${BASE_URL}/custom`, {
        name,
        themeConfig,
        isPublic,
        createdAt: new Date().toISOString()
      });
      return response.data.id;
    } catch (error) {
      console.error('Fehler beim Erstellen eines benutzerdefinierten Themes:', error);
      throw error;
    }
  }

  /**
   * Lädt alle öffentlichen benutzerdefinierten Themes
   * @returns Promise mit einer Liste aller öffentlichen benutzerdefinierten Themes
   */
  public static async getPublicCustomThemes(): Promise<Array<{ id: string; name: string; themeConfig: ThemeConfig }>> {
    try {
      const response = await axios.get(`${BASE_URL}/custom/public`);
      return response.data.themes;
    } catch (error) {
      console.error('Fehler beim Laden der öffentlichen benutzerdefinierten Themes:', error);
      throw error;
    }
  }

  /**
   * Lädt die Theme-Vorlieben eines Benutzers, einschließlich Zugänglichkeitseinstellungen
   * @param userId ID des Benutzers
   * @returns Promise mit den Theme-Vorlieben des Benutzers
   */
  public static async getUserPreferences(userId: string): Promise<ThemePreferences> {
    try {
      const response = await axios.get(`${BASE_URL}/users/${userId}/preferences`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer-Theme-Vorlieben:', error);
      throw error;
    }
  }

  /**
   * Speichert die Theme-Vorlieben eines Benutzers
   * @param userId ID des Benutzers
   * @param preferences Theme-Vorlieben
   * @returns Promise mit dem Ergebnis der Operation
   */
  public static async saveUserPreferences(userId: string, preferences: Partial<ThemePreferences>): Promise<any> {
    try {
      const response = await axios.post(`${BASE_URL}/users/${userId}/preferences`, {
        ...preferences,
        lastUpdated: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Speichern der Benutzer-Theme-Vorlieben:', error);
      throw error;
    }
  }

  /**
   * Synchronisiert die Theme-Einstellungen zwischen Geräten
   * @param userId ID des Benutzers
   * @param deviceId ID des Geräts
   * @returns Promise mit der aktuellsten Theme-Konfiguration
   */
  public static async syncThemeAcrossDevices(userId: string, deviceId: string): Promise<ThemeConfig> {
    try {
      const response = await axios.post(`${BASE_URL}/users/${userId}/sync`, {
        deviceId,
        timestamp: new Date().toISOString()
      });
      return response.data.themeConfig;
    } catch (error) {
      console.error('Fehler bei der Synchronisierung des Themes zwischen Geräten:', error);
      throw error;
    }
  }
}

// Singleton-Instanz exportieren
export default ThemeRestAPIService; 