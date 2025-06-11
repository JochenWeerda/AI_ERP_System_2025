import axios from 'axios';
import { API_BASE_URL } from '../../config';

// Belegfolge-Service für API-Aufrufe
export class BelegfolgeService {
  private static instance: BelegfolgeService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${API_BASE_URL}/api/v1/belege`;
  }

  /**
   * Gibt die Singleton-Instanz des BelegfolgeService zurück
   */
  public static getInstance(): BelegfolgeService {
    if (!BelegfolgeService.instance) {
      BelegfolgeService.instance = new BelegfolgeService();
    }
    return BelegfolgeService.instance;
  }

  /**
   * Holt die Belegstatistik vom Server
   */
  public async getBelegStatistik() {
    try {
      const response = await axios.get(`${this.baseUrl}/statistik`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Belegstatistik:', error);
      throw error;
    }
  }

  /**
   * Holt alle Belege eines bestimmten Typs
   * @param belegTyp Der Typ des Belegs (angebot, auftrag, lieferschein, rechnung, bestellung, eingangslieferschein)
   * @param seite Seitennummer für Paginierung
   * @param limit Anzahl der Einträge pro Seite
   */
  public async getBelege(belegTyp: string, seite: number = 1, limit: number = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/${belegTyp}`, {
        params: {
          page: seite,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Laden der ${belegTyp}:`, error);
      throw error;
    }
  }

  /**
   * Holt einen einzelnen Beleg anhand seiner ID
   * @param belegTyp Der Typ des Belegs
   * @param id Die ID des Belegs
   */
  public async getBeleg(belegTyp: string, id: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/${belegTyp}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Laden des ${belegTyp} mit ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Erstellt einen neuen Beleg
   * @param belegTyp Der Typ des zu erstellenden Belegs
   * @param belegDaten Die Daten des Belegs
   */
  public async createBeleg(belegTyp: string, belegDaten: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/${belegTyp}`, belegDaten);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Erstellen des ${belegTyp}:`, error);
      throw error;
    }
  }

  /**
   * Aktualisiert einen Beleg
   * @param belegTyp Der Typ des zu aktualisierenden Belegs
   * @param id Die ID des Belegs
   * @param belegDaten Die aktualisierten Daten des Belegs
   */
  public async updateBeleg(belegTyp: string, id: number, belegDaten: any) {
    try {
      const response = await axios.put(`${this.baseUrl}/${belegTyp}/${id}`, belegDaten);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren des ${belegTyp} mit ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Löscht einen Beleg
   * @param belegTyp Der Typ des zu löschenden Belegs
   * @param id Die ID des Belegs
   */
  public async deleteBeleg(belegTyp: string, id: number) {
    try {
      await axios.delete(`${this.baseUrl}/${belegTyp}/${id}`);
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen des ${belegTyp} mit ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Erzeugt einen Folgebeleg
   * @param quellBelegTyp Der Typ des Quellbelegs
   * @param quellBelegId Die ID des Quellbelegs
   * @param zielBelegTyp Der Typ des zu erzeugenden Zielbelegs
   */
  public async erzeugeFollgebeleg(quellBelegTyp: string, quellBelegId: number, zielBelegTyp: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/folgebeleg`, {
        quellBelegTyp,
        quellBelegId,
        zielBelegTyp
      });
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Erzeugen des Folgebelegs ${zielBelegTyp} aus ${quellBelegTyp} ${quellBelegId}:`, error);
      throw error;
    }
  }
}

// Exportiere den Service als Singleton
export default BelegfolgeService.getInstance(); 