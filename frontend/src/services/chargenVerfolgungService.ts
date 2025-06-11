import axios from 'axios';
import { Charge, ChargenVerfolgung, ChargeVorwaerts, ChargeRueckwaerts } from './inventoryApi';

export interface ChargenMovement {
  timestamp: string;
  prozess_typ: string;
  menge: number;
  einheit: string;
  quell_charge?: {
    id: number;
    chargennummer: string;
  };
  ziel_charge?: {
    id: number;
    chargennummer: string;
  };
  standort?: string;
  benutzer?: string;
}

export interface ChargenTransformation {
  von_charge_id: number;
  zu_charge_id: number;
  menge: number;
  einheit_id: number;
  prozess_id?: number;
  prozess_typ: 'produktion' | 'umverpackung' | 'umlagerung' | 'qualitaetssicherung';
  bemerkung?: string;
}

export interface ChargeStatusAenderung {
  charge_id: number;
  neuer_status: 'neu' | 'freigegeben' | 'gesperrt' | 'in_verwendung' | 'verbraucht';
  grund?: string;
  qualitaets_freigabe_id?: number;
}

export interface VerfuegbareChargenFilter {
  artikel_id?: number;
  lagerort_id?: number;
  mindest_menge?: number;
  nur_freigegeben?: boolean;
  mhd_nicht_ueberschritten?: boolean;
  sortierung?: 'fifo' | 'lifo';
}

/**
 * Service für die Chargen-Verfolgung und -Verwaltung
 */
class ChargenVerfolgungService {
  /**
   * Ruft die Verfolgungsdaten einer Charge ab (was aus der Charge wurde)
   * @param chargeId ID der Charge
   * @returns Vorwärtsverfolgungsdaten
   */
  async getChargeVorwaertsVerfolgung(chargeId: number): Promise<ChargeVorwaerts> {
    try {
      const response = await axios.get(`/api/v1/chargen/${chargeId}/vorwaerts`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Chargen-Vorwärtsverfolgung:', error);
      // Testdaten für die Entwicklung
      return {
        charge: {
          id: chargeId,
          chargennummer: `CH-${chargeId}`,
          artikel_name: 'Testprodukt'
        },
        verwendungen: [
          {
            id: 1001,
            prozess_typ: 'produktion',
            prozess_name: 'Mischvorgang',
            datum: new Date().toISOString(),
            menge: 500,
            einheit: 'kg',
            ziel_charge: {
              id: 2001,
              chargennummer: 'PROD-2001',
              artikel_name: 'Fertigprodukt',
              weitere_verwendungen: false
            }
          }
        ]
      };
    }
  }

  /**
   * Ruft die Rückverfolgungsdaten einer Charge ab (woraus die Charge entstanden ist)
   * @param chargeId ID der Charge
   * @returns Rückwärtsverfolgungsdaten
   */
  async getChargeRueckwaertsVerfolgung(chargeId: number): Promise<ChargeRueckwaerts> {
    try {
      const response = await axios.get(`/api/v1/chargen/${chargeId}/rueckwaerts`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Chargen-Rückwärtsverfolgung:', error);
      // Testdaten für die Entwicklung
      return {
        charge: {
          id: chargeId,
          chargennummer: `CH-${chargeId}`,
          artikel_name: 'Fertigprodukt'
        },
        bestandteile: [
          {
            id: 1001,
            prozess_typ: 'produktion',
            prozess_name: 'Mischvorgang',
            datum: new Date().toISOString(),
            menge: 300,
            einheit: 'kg',
            quell_charge: {
              id: 3001,
              chargennummer: 'ROH-3001',
              artikel_name: 'Rohstoff A',
              weitere_bestandteile: true
            }
          },
          {
            id: 1002,
            prozess_typ: 'produktion',
            prozess_name: 'Mischvorgang',
            datum: new Date().toISOString(),
            menge: 200,
            einheit: 'kg',
            quell_charge: {
              id: 3002,
              chargennummer: 'ROH-3002',
              artikel_name: 'Rohstoff B',
              weitere_bestandteile: false
            }
          }
        ]
      };
    }
  }

  /**
   * Ruft verfügbare Chargen für einen Artikel ab
   * @param filter Filter für die Chargensuche
   * @returns Liste verfügbarer Chargen mit Mengenangaben
   */
  async getVerfuegbareChargen(filter: VerfuegbareChargenFilter): Promise<{
    charge: Charge;
    verfuegbareMenge: number;
    lagerort?: string;
  }[]> {
    try {
      const params = new URLSearchParams();
      if (filter.artikel_id) params.append('artikel_id', filter.artikel_id.toString());
      if (filter.lagerort_id) params.append('lagerort_id', filter.lagerort_id.toString());
      if (filter.mindest_menge) params.append('mindest_menge', filter.mindest_menge.toString());
      if (filter.nur_freigegeben !== undefined) params.append('nur_freigegeben', filter.nur_freigegeben.toString());
      if (filter.mhd_nicht_ueberschritten !== undefined) params.append('mhd_nicht_ueberschritten', filter.mhd_nicht_ueberschritten.toString());
      if (filter.sortierung) params.append('sortierung', filter.sortierung);
      
      const response = await axios.get(`/api/v1/chargen/verfuegbar?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen verfügbarer Chargen:', error);
      
      // Testdaten für die Entwicklung
      const isLifo = filter.sortierung === 'lifo';
      return [
        {
          charge: {
            id: 1,
            artikel_id: filter.artikel_id || 1001,
            artikel_name: 'Testprodukt',
            chargennummer: 'CH-2023-001',
            herstelldatum: '2023-01-15',
            mindesthaltbarkeitsdatum: '2023-12-31',
            status: 'freigegeben',
            charge_typ: 'fertigprodukt',
            erstellt_am: '2023-01-16'
          },
          verfuegbareMenge: 850,
          lagerort: 'Hauptlager A01'
        },
        {
          charge: {
            id: 2,
            artikel_id: filter.artikel_id || 1001,
            artikel_name: 'Testprodukt',
            chargennummer: 'CH-2023-002',
            herstelldatum: '2023-02-20',
            mindesthaltbarkeitsdatum: '2024-02-28',
            status: 'freigegeben',
            charge_typ: 'fertigprodukt',
            erstellt_am: '2023-02-21'
          },
          verfuegbareMenge: 1200,
          lagerort: 'Hauptlager A02'
        },
        {
          charge: {
            id: 3,
            artikel_id: filter.artikel_id || 1001,
            artikel_name: 'Testprodukt',
            chargennummer: 'CH-2023-003',
            herstelldatum: '2023-04-10',
            mindesthaltbarkeitsdatum: '2024-04-30',
            status: 'freigegeben',
            charge_typ: 'fertigprodukt',
            erstellt_am: '2023-04-11'
          },
          verfuegbareMenge: 800,
          lagerort: 'Hauptlager B01'
        },
        {
          charge: {
            id: 4,
            artikel_id: filter.artikel_id || 1001,
            artikel_name: 'Testprodukt',
            chargennummer: 'CH-2023-004',
            herstelldatum: '2023-06-05',
            mindesthaltbarkeitsdatum: '2024-06-30',
            status: filter.nur_freigegeben ? 'freigegeben' : 'gesperrt',
            charge_typ: 'fertigprodukt',
            erstellt_am: '2023-06-06'
          },
          verfuegbareMenge: 1200,
          lagerort: 'Hauptlager B02'
        },
        {
          charge: {
            id: 5,
            artikel_id: filter.artikel_id || 1001,
            artikel_name: 'Testprodukt',
            chargennummer: 'CH-2023-005',
            herstelldatum: '2023-08-15',
            mindesthaltbarkeitsdatum: '2024-08-31',
            status: 'freigegeben',
            charge_typ: 'fertigprodukt',
            erstellt_am: '2023-08-16'
          },
          verfuegbareMenge: 1500,
          lagerort: 'Hauptlager C01'
        }
      ].sort((a, b) => {
        if (!a.charge.herstelldatum || !b.charge.herstelldatum) return 0;
        const dateA = new Date(a.charge.herstelldatum).getTime();
        const dateB = new Date(b.charge.herstelldatum).getTime();
        return isLifo ? dateB - dateA : dateA - dateB;
      });
    }
  }

  /**
   * Erstellt eine Chargen-Transformation (Umwandlung einer Charge in eine andere)
   * @param transformation Transformationsdaten
   * @returns Ergebnis der Transformation
   */
  async createChargenTransformation(transformation: ChargenTransformation): Promise<{
    erfolg: boolean;
    quell_charge_id: number;
    ziel_charge_id: number;
    nachricht?: string;
  }> {
    try {
      const response = await axios.post('/api/v1/chargen/transformation', transformation);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen der Chargen-Transformation:', error);
      return {
        erfolg: false,
        quell_charge_id: transformation.von_charge_id,
        ziel_charge_id: transformation.zu_charge_id,
        nachricht: 'Fehler bei der Verbindung zum Server. Dies ist eine Simulation.'
      };
    }
  }

  /**
   * Ändert den Status einer Charge
   * @param statusAenderung Daten zur Statusänderung
   * @returns Ergebnis der Statusänderung
   */
  async updateChargeStatus(statusAenderung: ChargeStatusAenderung): Promise<{
    erfolg: boolean;
    charge_id: number;
    neuer_status: string;
    nachricht?: string;
  }> {
    try {
      const response = await axios.put(`/api/v1/chargen/${statusAenderung.charge_id}/status`, statusAenderung);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Ändern des Charge-Status:', error);
      return {
        erfolg: false,
        charge_id: statusAenderung.charge_id,
        neuer_status: statusAenderung.neuer_status,
        nachricht: 'Fehler bei der Verbindung zum Server. Dies ist eine Simulation.'
      };
    }
  }
}

export const chargenVerfolgungService = new ChargenVerfolgungService();
export default chargenVerfolgungService;
