/**
 * Zentrale API-Service-Datei für die Kommunikation mit dem Backend
 * Verwendet Axios für HTTP-Anfragen und bietet einheitliche Fehlerbehandlung
 */
import axios from 'axios';

// Basiseinstellungen für API-Anfragen
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8085/api';

// Flag für Entwicklungsmodus mit Mock-Daten
const USE_MOCK_DATA = true; // Auf false setzen, um echte API-Anfragen zu verwenden

// Mock-Daten für die Entwicklung
const MOCK_DATA = {
  '/api/v1/kundenstamm': [
    { id: 1, name: 'Mustermann GmbH', ansprechpartner: 'Max Mustermann', email: 'max@mustermann.de', telefon: '+49 123 45678', ort: 'Musterstadt', plz: '12345', strasse: 'Musterstraße 1', kundennummer: 'K-10001', status: 'aktiv' },
    { id: 2, name: 'Beispiel AG', ansprechpartner: 'Erika Beispiel', email: 'erika@beispiel.de', telefon: '+49 234 56789', ort: 'Beispieldorf', plz: '23456', strasse: 'Beispielweg 2', kundennummer: 'K-10002', status: 'aktiv' },
    { id: 3, name: 'Test KG', ansprechpartner: 'Thomas Test', email: 'thomas@test.de', telefon: '+49 345 67890', ort: 'Teststadt', plz: '34567', strasse: 'Testplatz 3', kundennummer: 'K-10003', status: 'inaktiv' }
  ],
  '/api/v1/lieferanten': [
    { id: 1, name: 'Zulieferer GmbH', ansprechpartner: 'Zoe Zulieferer', email: 'zoe@zulieferer.de', telefon: '+49 456 78901', ort: 'Zulieferstadt', plz: '45678', strasse: 'Zulieferallee 4', lieferantennummer: 'L-20001', status: 'aktiv' },
    { id: 2, name: 'Versorgung AG', ansprechpartner: 'Viktor Versorger', email: 'viktor@versorgung.de', telefon: '+49 567 89012', ort: 'Versorgungsdorf', plz: '56789', strasse: 'Versorgungsweg 5', lieferantennummer: 'L-20002', status: 'aktiv' },
    { id: 3, name: 'Logistik KG', ansprechpartner: 'Lena Logistik', email: 'lena@logistik.de', telefon: '+49 678 90123', ort: 'Logistikstadt', plz: '67890', strasse: 'Logistikstraße 6', lieferantennummer: 'L-20003', status: 'inaktiv' }
  ],
  '/api/v1/artikel': [
    { id: 1, artikelnummer: 'A-30001', bezeichnung: 'Premium Saatgut Weizen', einheit: 'kg', preis: 2.99, mwst: 7, kategorie: 'Saatgut', lagerbestand: 1500 },
    { id: 2, artikelnummer: 'A-30002', bezeichnung: 'Bio Düngemittel', einheit: 'l', preis: 12.49, mwst: 19, kategorie: 'Dünger', lagerbestand: 250 },
    { id: 3, artikelnummer: 'A-30003', bezeichnung: 'Landwirtschaftlicher Schlauch', einheit: 'Stk', preis: 34.95, mwst: 19, kategorie: 'Ausrüstung', lagerbestand: 75 }
  ],
  '/api/health': { status: 'UP', version: '1.0.0', timestamp: new Date().toISOString() }
};

// Funktion zur Simulation einer API-Antwort mit Mock-Daten
const getMockResponse = (url) => {
  console.log('Verwende Mock-Daten für URL:', url);
  
  // URL-Pfad extrahieren (ohne Query-Parameter)
  const path = url.split('?')[0];
  
  // Passende Mock-Daten suchen
  for (const mockUrl in MOCK_DATA) {
    if (path.includes(mockUrl) || url.includes(mockUrl)) {
      return [200, MOCK_DATA[mockUrl]];
    }
  }
  
  // Fallback für unbekannte URLs
  return [404, { message: 'Ressource nicht gefunden (Mock)' }];
};

// Erstelle eine Axios-Instanz mit Standardkonfiguration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor für Request (kann für Auth-Token verwendet werden)
apiClient.interceptors.request.use(
  config => {
    // Token aus localStorage holen, falls vorhanden
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor für Response (zentrale Fehlerbehandlung)
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Bei aktivierten Mock-Daten und Netzwerkfehlern Mock-Daten zurückgeben
    if (USE_MOCK_DATA && (error.message === 'Network Error' || !error.response)) {
      const url = error.config.url;
      const [status, data] = getMockResponse(url);
      
      if (status === 200) {
        console.log(`Mock-Daten für ${url} bereitgestellt:`, data);
        return Promise.resolve({ data });
      }
    }
    
    const { response } = error;
    
    // Standard-Fehlermeldung
    let errorMessage = 'Ein unbekannter Fehler ist aufgetreten';
    
    if (response) {
      // Der Server hat geantwortet
      switch (response.status) {
        case 401:
          errorMessage = 'Nicht autorisiert. Bitte melden Sie sich an.';
          // Optional: Zum Login weiterleiten
          // window.location.href = '/login';
          break;
        case 403:
          errorMessage = 'Zugriff verweigert. Sie haben keine Berechtigung für diese Aktion.';
          break;
        case 404:
          errorMessage = 'Die angeforderte Ressource wurde nicht gefunden.';
          break;
        case 500:
          errorMessage = 'Interner Serverfehler. Bitte versuchen Sie es später erneut.';
          break;
        default:
          errorMessage = response.data?.message || 
                         'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      }
    } else if (error.request) {
      // Keine Antwort vom Server erhalten
      errorMessage = 'Keine Antwort vom Server. Bitte überprüfen Sie Ihre Internetverbindung.';
    }
    
    // Hier könnte ein zentraler Toast/Notification-Service genutzt werden
    console.error('API-Fehler:', errorMessage);
    
    return Promise.reject({ ...error, userMessage: errorMessage });
  }
);

// Service-Funktionen für verschiedene API-Endpunkte
const documentService = {
  getAllDocuments: (params) => apiClient.get('/documents', { params }),
  getDocument: (id) => apiClient.get(`/documents/${id}`),
  createDocument: (data) => apiClient.post('/documents', data),
  updateDocument: (id, data) => apiClient.put(`/documents/${id}`, data),
  deleteDocument: (id) => apiClient.delete(`/documents/${id}`)
};

const financeService = {
  getTransactions: (params) => apiClient.get('/finance/transactions', { params }),
  getTransaction: (id) => apiClient.get(`/finance/transactions/${id}`),
  createTransaction: (data) => apiClient.post('/finance/transactions', data),
  updateTransaction: (id, data) => apiClient.put(`/finance/transactions/${id}`, data),
  deleteTransaction: (id) => apiClient.delete(`/finance/transactions/${id}`),
  getAccounts: () => apiClient.get('/finance/accounts'),
  getReports: (type, params) => apiClient.get(`/finance/reports/${type}`, { params })
};

const belegeService = {
  getAllBelege: (params) => apiClient.get('/belege', { params }),
  getBeleg: (id) => apiClient.get(`/belege/${id}`),
  createBeleg: (data) => apiClient.post('/belege', data),
  updateBeleg: (id, data) => apiClient.put(`/belege/${id}`, data),
  deleteBeleg: (id) => apiClient.delete(`/belege/${id}`)
};

const observerService = {
  getSystemStatus: () => apiClient.get('/observer/status'),
  getServiceHealth: () => apiClient.get('/observer/health'),
  getMetrics: (service) => apiClient.get(`/observer/metrics/${service}`),
  registerService: (data) => apiClient.post('/observer/register', data)
};

// Neue Services für Stammdaten
const kundenService = {
  getAllKunden: () => apiClient.get('/v1/kundenstamm'),
  getKunde: (id) => apiClient.get(`/v1/kundenstamm/${id}`),
  createKunde: (data) => apiClient.post('/v1/kundenstamm', data),
  updateKunde: (id, data) => apiClient.put(`/v1/kundenstamm/${id}`, data),
  deleteKunde: (id) => apiClient.delete(`/v1/kundenstamm/${id}`)
};

const lieferantenService = {
  getAllLieferanten: () => apiClient.get('/v1/lieferanten'),
  getLieferant: (id) => apiClient.get(`/v1/lieferanten/${id}`),
  createLieferant: (data) => apiClient.post('/v1/lieferanten', data),
  updateLieferant: (id, data) => apiClient.put(`/v1/lieferanten/${id}`, data),
  deleteLieferant: (id) => apiClient.delete(`/v1/lieferanten/${id}`)
};

const artikelService = {
  getAllArtikel: () => apiClient.get('/v1/artikel'),
  getArtikel: (id) => apiClient.get(`/v1/artikel/${id}`),
  createArtikel: (data) => apiClient.post('/v1/artikel', data),
  updateArtikel: (id, data) => apiClient.put(`/v1/artikel/${id}`, data),
  deleteArtikel: (id) => apiClient.delete(`/v1/artikel/${id}`)
};

// Export aller Services
export {
  apiClient,
  documentService,
  financeService,
  belegeService,
  observerService,
  kundenService,
  lieferantenService,
  artikelService
};

// Für einfachen Import als Default
export default {
  documents: documentService,
  finance: financeService,
  belege: belegeService,
  observer: observerService,
  kunden: kundenService,
  lieferanten: lieferantenService,
  artikel: artikelService
}; 