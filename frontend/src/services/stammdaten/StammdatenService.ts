import axios from 'axios';
import { API_BASE_URL } from '../../config';

// Stammdaten-Service für API-Aufrufe
export class StammdatenService {
  private static instance: StammdatenService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${API_BASE_URL}/api/v1/stammdaten`;
  }

  /**
   * Gibt die Singleton-Instanz des StammdatenService zurück
   */
  public static getInstance(): StammdatenService {
    if (!StammdatenService.instance) {
      StammdatenService.instance = new StammdatenService();
    }
    return StammdatenService.instance;
  }

  // ================== Artikel-Stammdaten ==================

  /**
   * Holt alle Artikel-Stammdaten
   * @param seite Seitennummer für Paginierung
   * @param limit Anzahl der Einträge pro Seite
   * @param suchbegriff Optionaler Suchbegriff
   */
  public async getArtikel(seite: number = 1, limit: number = 20, suchbegriff?: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/artikel`, {
        params: {
          page: seite,
          limit: limit,
          search: suchbegriff
        }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Artikelstammdaten:', error);
      throw error;
    }
  }

  /**
   * Holt einen einzelnen Artikel anhand seiner ID
   * @param id Die ID des Artikels
   */
  public async getArtikelById(id: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/artikel/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Laden des Artikels mit ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Erstellt einen neuen Artikel
   * @param artikelDaten Die Daten des Artikels
   */
  public async createArtikel(artikelDaten: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/artikel`, artikelDaten);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Artikels:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert einen Artikel
   * @param id Die ID des Artikels
   * @param artikelDaten Die aktualisierten Daten des Artikels
   */
  public async updateArtikel(id: number, artikelDaten: any) {
    try {
      const response = await axios.put(`${this.baseUrl}/artikel/${id}`, artikelDaten);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren des Artikels mit ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Löscht einen Artikel
   * @param id Die ID des Artikels
   */
  public async deleteArtikel(id: number) {
    try {
      await axios.delete(`${this.baseUrl}/artikel/${id}`);
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen des Artikels mit ID ${id}:`, error);
      throw error;
    }
  }

  // ================== Partner-Stammdaten ==================

  /**
   * Holt alle Partner-Stammdaten
   * @param partnerTyp Optionaler Partnertyp (kunde, lieferant, mitarbeiter)
   * @param seite Seitennummer für Paginierung
   * @param limit Anzahl der Einträge pro Seite
   * @param suchbegriff Optionaler Suchbegriff
   */
  public async getPartner(partnerTyp?: string, seite: number = 1, limit: number = 20, suchbegriff?: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/partner`, {
        params: {
          typ: partnerTyp,
          page: seite,
          limit: limit,
          search: suchbegriff
        }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Partnerstammdaten:', error);
      throw error;
    }
  }

  /**
   * Holt einen einzelnen Partner anhand seiner ID
   * @param id Die ID des Partners
   */
  public async getPartnerById(id: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/partner/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Laden des Partners mit ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Erstellt einen neuen Partner
   * @param partnerDaten Die Daten des Partners
   */
  public async createPartner(partnerDaten: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/partner`, partnerDaten);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Partners:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert einen Partner
   * @param id Die ID des Partners
   * @param partnerDaten Die aktualisierten Daten des Partners
   */
  public async updatePartner(id: number, partnerDaten: any) {
    try {
      const response = await axios.put(`${this.baseUrl}/partner/${id}`, partnerDaten);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren des Partners mit ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Löscht einen Partner
   * @param id Die ID des Partners
   */
  public async deletePartner(id: number) {
    try {
      await axios.delete(`${this.baseUrl}/partner/${id}`);
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen des Partners mit ID ${id}:`, error);
      throw error;
    }
  }

  // ================== CPD-Konten ==================

  /**
   * Holt alle CPD-Konten
   * @param kontoTyp Optionaler Kontotyp (kreditor, debitor)
   * @param seite Seitennummer für Paginierung
   * @param limit Anzahl der Einträge pro Seite
   */
  public async getCPDKonten(kontoTyp?: string, seite: number = 1, limit: number = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/cpd-konten`, {
        params: {
          typ: kontoTyp,
          page: seite,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der CPD-Konten:', error);
      throw error;
    }
  }

  // ================== Lager-Stammdaten ==================

  /**
   * Holt alle Lagerorte
   */
  public async getLagerorte() {
    try {
      const response = await axios.get(`${this.baseUrl}/lager/orte`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Lagerorte:', error);
      throw error;
    }
  }

  /**
   * Holt alle Lagerbestände
   * @param artikelId Optionale Artikel-ID für Filterung
   * @param lagerortId Optionale Lagerort-ID für Filterung
   */
  public async getLagerbestaende(artikelId?: number, lagerortId?: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/lager/bestaende`, {
        params: {
          artikel_id: artikelId,
          lagerort_id: lagerortId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Lagerbestände:', error);
      throw error;
    }
  }
}

// Exportiere den Service als Singleton
export default StammdatenService.getInstance(); 