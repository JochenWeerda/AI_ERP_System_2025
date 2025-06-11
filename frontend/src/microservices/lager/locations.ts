/**
 * Lagerorte Erweiterung für das Lager-Microservice
 * Ermöglicht die detaillierte Verwaltung von Lagerorten innerhalb von Lagern
 */

import { createStore } from '../../framework/core/StoreManager';

// Typdefinitionen
export interface Location {
  id: number;
  code: string;
  name: string;
  description?: string;
  warehouse_id: number;
  warehouse_name: string;
  active: boolean;
  capacity?: number;
  current_utilization?: number;
  position?: {
    row: string;
    rack: string;
    level: string;
    bin: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  description?: string;
  address?: string;
  active: boolean;
  location_count: number;
  created_at: string;
  updated_at: string;
}

// Basisstore für Lagerorte
export const locationsStore = createStore('lager-locations-store', {
  warehouses: [] as Warehouse[],
  locations: [] as Location[],
  isLoading: false,
  error: null as string | null,
  currentWarehouseId: null as number | null
});

// API-Funktionen für Lagerorte
export const locationsApi = {
  // Lade alle Lager
  getWarehouses: async () => {
    try {
      locationsStore.update({ isLoading: true, error: null });
      
      // Hier später durch echten API-Aufruf ersetzen
      const response = await mockApiCall('/api/warehouses');
      
      locationsStore.update({ 
        warehouses: response.data,
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Lager:', error);
      locationsStore.update({ 
        error: 'Lager konnten nicht geladen werden.', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Lade ein bestimmtes Lager mit Details
  getWarehouse: async (warehouseId: number) => {
    try {
      locationsStore.update({ isLoading: true, error: null });
      
      // Hier später durch echten API-Aufruf ersetzen
      const response = await mockApiCall(`/api/warehouses/${warehouseId}`);
      
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Laden des Lagers #${warehouseId}:`, error);
      locationsStore.update({ 
        error: 'Lager konnte nicht geladen werden.', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Lade alle Lagerorte eines Lagers
  getLocations: async (warehouseId: number) => {
    try {
      locationsStore.update({ 
        isLoading: true, 
        error: null,
        currentWarehouseId: warehouseId
      });
      
      // Hier später durch echten API-Aufruf ersetzen
      const response = await mockApiCall(`/api/warehouses/${warehouseId}/locations`);
      
      locationsStore.update({ 
        locations: response.data,
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Laden der Lagerorte für Lager #${warehouseId}:`, error);
      locationsStore.update({ 
        error: 'Lagerorte konnten nicht geladen werden.', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Erstelle einen neuen Lagerort
  createLocation: async (warehouseId: number, locationData: Partial<Location>) => {
    try {
      locationsStore.update({ isLoading: true, error: null });
      
      // Hier später durch echten API-Aufruf ersetzen
      const response = await mockApiCall(
        `/api/warehouses/${warehouseId}/locations`, 
        'POST', 
        locationData
      );
      
      // Aktualisiere den Store mit dem neuen Lagerort
      const currentLocations = [...locationsStore.state.locations];
      currentLocations.push(response.data);
      
      locationsStore.update({ 
        locations: currentLocations,
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Lagerorts:', error);
      locationsStore.update({ 
        error: 'Lagerort konnte nicht erstellt werden.', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Aktualisiere einen Lagerort
  updateLocation: async (locationId: number, locationData: Partial<Location>) => {
    try {
      locationsStore.update({ isLoading: true, error: null });
      
      // Hier später durch echten API-Aufruf ersetzen
      const response = await mockApiCall(
        `/api/locations/${locationId}`, 
        'PUT', 
        locationData
      );
      
      // Aktualisiere den Store mit dem aktualisierten Lagerort
      const currentLocations = [...locationsStore.state.locations];
      const index = currentLocations.findIndex(loc => loc.id === locationId);
      
      if (index !== -1) {
        currentLocations[index] = {
          ...currentLocations[index],
          ...response.data
        };
        
        locationsStore.update({ 
          locations: currentLocations,
          isLoading: false 
        });
      }
      
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren des Lagerorts #${locationId}:`, error);
      locationsStore.update({ 
        error: 'Lagerort konnte nicht aktualisiert werden.', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Lösche einen Lagerort
  deleteLocation: async (locationId: number) => {
    try {
      locationsStore.update({ isLoading: true, error: null });
      
      // Hier später durch echten API-Aufruf ersetzen
      await mockApiCall(
        `/api/locations/${locationId}`, 
        'DELETE'
      );
      
      // Aktualisiere den Store nach dem Löschen
      const currentLocations = [...locationsStore.state.locations];
      const updatedLocations = currentLocations.filter(loc => loc.id !== locationId);
      
      locationsStore.update({ 
        locations: updatedLocations,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Löschen des Lagerorts #${locationId}:`, error);
      locationsStore.update({ 
        error: 'Lagerort konnte nicht gelöscht werden.', 
        isLoading: false 
      });
      throw error;
    }
  }
};

// Mock-API-Funktion für die Entwicklung
const mockApiCall = async (url: string, method: string = 'GET', data: any = null) => {
  // Simuliere Netzwerklatenz
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock-Daten basierend auf der URL
  if (url === '/api/warehouses') {
    return {
      data: [
        { id: 1, code: 'HQ', name: 'Hauptlager', description: 'Zentrales Lager', address: 'Hauptstraße 1, 10115 Berlin', active: true, location_count: 24, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
        { id: 2, code: 'NL', name: 'Nordlager', description: 'Lager Nord', address: 'Nordstraße 10, 22043 Hamburg', active: true, location_count: 18, created_at: '2023-02-01T00:00:00Z', updated_at: '2023-02-01T00:00:00Z' },
        { id: 3, code: 'SL', name: 'Südlager', description: 'Lager Süd', address: 'Südstraße 5, 81675 München', active: true, location_count: 12, created_at: '2023-03-01T00:00:00Z', updated_at: '2023-03-01T00:00:00Z' }
      ]
    };
  } else if (url.match(/\/api\/warehouses\/(\d+)\/locations/)) {
    const warehouseId = parseInt(url.match(/\/api\/warehouses\/(\d+)\/locations/)![1]);
    
    let locations: Location[] = [];
    
    if (warehouseId === 1) {
      // Hauptlager Lagerorte
      locations = [
        { id: 1, code: 'HQ-A1-01', name: 'Regal A1-01', description: 'Kleinteile', warehouse_id: 1, warehouse_name: 'Hauptlager', active: true, capacity: 100, current_utilization: 65, position: { row: 'A', rack: '1', level: '0', bin: '1' }, created_at: '2023-01-05T00:00:00Z', updated_at: '2023-01-05T00:00:00Z' },
        { id: 2, code: 'HQ-A1-02', name: 'Regal A1-02', description: 'Kleinteile', warehouse_id: 1, warehouse_name: 'Hauptlager', active: true, capacity: 100, current_utilization: 35, position: { row: 'A', rack: '1', level: '0', bin: '2' }, created_at: '2023-01-05T00:00:00Z', updated_at: '2023-01-05T00:00:00Z' },
        { id: 3, code: 'HQ-B2-01', name: 'Regal B2-01', description: 'Mittelgroße Teile', warehouse_id: 1, warehouse_name: 'Hauptlager', active: true, capacity: 200, current_utilization: 120, position: { row: 'B', rack: '2', level: '0', bin: '1' }, created_at: '2023-01-06T00:00:00Z', updated_at: '2023-01-06T00:00:00Z' }
      ];
    } else if (warehouseId === 2) {
      // Nordlager Lagerorte
      locations = [
        { id: 4, code: 'NL-A1-01', name: 'Regal A1-01', description: 'Elektronik', warehouse_id: 2, warehouse_name: 'Nordlager', active: true, capacity: 80, current_utilization: 45, position: { row: 'A', rack: '1', level: '0', bin: '1' }, created_at: '2023-02-10T00:00:00Z', updated_at: '2023-02-10T00:00:00Z' },
        { id: 5, code: 'NL-B1-01', name: 'Regal B1-01', description: 'Bürobedarf', warehouse_id: 2, warehouse_name: 'Nordlager', active: true, capacity: 120, current_utilization: 80, position: { row: 'B', rack: '1', level: '0', bin: '1' }, created_at: '2023-02-10T00:00:00Z', updated_at: '2023-02-10T00:00:00Z' }
      ];
    } else if (warehouseId === 3) {
      // Südlager Lagerorte
      locations = [
        { id: 6, code: 'SL-A1-01', name: 'Regal A1-01', description: 'Werkzeuge', warehouse_id: 3, warehouse_name: 'Südlager', active: true, capacity: 150, current_utilization: 90, position: { row: 'A', rack: '1', level: '0', bin: '1' }, created_at: '2023-03-15T00:00:00Z', updated_at: '2023-03-15T00:00:00Z' },
        { id: 7, code: 'SL-A2-01', name: 'Regal A2-01', description: 'Baumaterial', warehouse_id: 3, warehouse_name: 'Südlager', active: true, capacity: 200, current_utilization: 150, position: { row: 'A', rack: '2', level: '0', bin: '1' }, created_at: '2023-03-15T00:00:00Z', updated_at: '2023-03-15T00:00:00Z' }
      ];
    }
    
    // Wenn es eine POST-Anfrage ist, simuliere das Hinzufügen eines neuen Lagerorts
    if (method === 'POST' && data) {
      const newLocation: Location = {
        id: Math.floor(Math.random() * 1000) + 100, // Generiere eine zufällige ID
        code: data.code || `${warehouseId}-NEW-${Date.now()}`,
        name: data.name || 'Neuer Lagerort',
        description: data.description,
        warehouse_id: warehouseId,
        warehouse_name: `Lager #${warehouseId}`,
        active: data.active !== undefined ? data.active : true,
        capacity: data.capacity,
        current_utilization: data.current_utilization || 0,
        position: data.position,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return { data: newLocation };
    }
    
    return { data: locations };
  } else if (url.match(/\/api\/locations\/(\d+)/) && method === 'PUT') {
    // Simuliere die Aktualisierung eines Lagerorts
    const locationId = parseInt(url.match(/\/api\/locations\/(\d+)/)![1]);
    
    return {
      data: {
        id: locationId,
        ...data,
        updated_at: new Date().toISOString()
      }
    };
  } else if (url.match(/\/api\/locations\/(\d+)/) && method === 'DELETE') {
    // Simuliere das Löschen eines Lagerorts
    return { success: true };
  }
  
  throw new Error(`Unbekannte Mock-API-URL: ${url}`);
};

export default {
  locationsStore,
  locationsApi
}; 