import api from './api';

// Typdefinitionen für die Chargenverwaltung
export interface Charge {
  id: number;
  chargennummer: string;
  artikel_id: number;
  artikel_name?: string;
  lieferant_id?: number;
  lieferant_name?: string;
  menge?: number;
  einheit_id?: number;
  herstelldatum?: string;
  mindesthaltbarkeitsdatum?: string;
  status: 'neu' | 'in_verwendung' | 'gesperrt' | 'freigegeben' | 'verbraucht';
  charge_typ: 'eingang' | 'produktion' | 'korrektur';
  bemerkung?: string;
  erstellt_am?: string;
  geaendert_am?: string;
  qualitaetsstatus?: 'nicht_geprueft' | 'in_pruefung' | 'freigegeben' | 'gesperrt';
}

export interface ChargeQualitaet {
  id: number;
  charge_id: number;
  pruefung_datum: string;
  ergebnis: 'bestanden' | 'nicht_bestanden';
  pruefer: string;
  parameter: string;
  wert: string;
  einheit: string;
  bemerkung?: string;
}

export interface ChargeDokument {
  id: number;
  charge_id: number;
  dokument_typ: string;
  dateiname: string;
  dateipfad: string;
  upload_datum: string;
  benutzer_id: number;
  bemerkung?: string;
}

export interface ChargenVerfolgung {
  id: number;
  quell_charge_id: number;
  ziel_charge_id: number;
  menge: number;
  einheit_id: number;
  prozess_id?: number;
  prozess_typ: 'produktion' | 'umfuellung' | 'mischung' | 'verbrauch';
  bemerkung?: string;
  erstellt_am: string;
  benutzer_id?: number;
}

export interface ChargeVorwaerts {
  charge: {
    id: number;
    chargennummer: string;
    artikel_name: string;
  };
  verwendungen: {
    id: number;
    prozess_typ: string;
    prozess_name: string;
    datum: string;
    menge: number;
    einheit: string;
    ziel_charge: {
      id: number;
      chargennummer: string;
      artikel_name: string;
      weitere_verwendungen: boolean;
    };
  }[];
}

export interface ChargeRueckwaerts {
  charge: {
    id: number;
    chargennummer: string;
    artikel_name: string;
  };
  bestandteile: {
    id: number;
    prozess_typ: string;
    prozess_name: string;
    datum: string;
    menge: number;
    einheit: string;
    quell_charge: {
      id: number;
      chargennummer: string;
      artikel_name: string;
      weitere_bestandteile: boolean;
    };
  }[];
}

// API-Funktionen für die Chargenverwaltung
export const getAllChargen = async (): Promise<Charge[]> => {
  const response = await api.get<Charge[]>('/chargen');
  return response.data;
};

export const getChargeById = async (id: number): Promise<Charge> => {
  const response = await api.get<Charge>(`/chargen/${id}`);
  return response.data;
};

export const createCharge = async (data: Partial<Charge>): Promise<Charge> => {
  const response = await api.post<Charge>('/chargen', data);
  return response.data;
};

export const updateCharge = async (id: number, data: Partial<Charge>): Promise<Charge> => {
  const response = await api.put<Charge>(`/chargen/${id}`, data);
  return response.data;
};

export const searchChargen = async (params: Record<string, string | number>): Promise<Charge[]> => {
  const response = await api.get<Charge[]>('/chargen/suche', { params });
  return response.data;
};

export const getChargeVorwaerts = async (id: number): Promise<ChargeVorwaerts> => {
  const response = await api.get<ChargeVorwaerts>(`/chargen/${id}/vorwaerts`);
  return response.data;
};

export const getChargeRueckwaerts = async (id: number): Promise<ChargeRueckwaerts> => {
  const response = await api.get<ChargeRueckwaerts>(`/chargen/${id}/rueckwaerts`);
  return response.data;
};

export const verknuepfeChargen = async (data: Partial<ChargenVerfolgung>): Promise<ChargenVerfolgung> => {
  const response = await api.post<ChargenVerfolgung>('/chargen/verknuepfen', data);
  return response.data;
}; 