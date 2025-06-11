import axios from 'axios';
import { API_BASE_URL } from '../config';

// Types für ChatERP
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface SystemAction {
  id: string;
  action_type: string;
  description: string;
  parameters: Record<string, any>;
  requires_confirmation: boolean;
}

export interface ChatResponse {
  message: ChatMessage;
  suggested_actions?: SystemAction[];
  has_visualization_data: boolean;
  confidence_score?: number;
  context_items?: string[];
}

export interface ChatRequest {
  message: string;
  context?: Record<string, any>;
  session_id?: string;
}

// Types für Visualisierungen
export interface DataPoint {
  label: string;
  value: number;
  category?: string;
  color?: string;
  tooltip?: string;
}

export interface DataSeries {
  name: string;
  data: DataPoint[];
  color?: string;
}

export interface DataVisualizationMetadata {
  title: string;
  description?: string;
  x_axis_label?: string;
  y_axis_label?: string;
  created_at: string;
  creator_id?: string;
  tags: string[];
}

export interface DataVisualization {
  id: string;
  type: string;
  metadata: DataVisualizationMetadata;
  series?: DataSeries[];
  single_series_data?: DataPoint[];
}

export interface VisualizationRequest {
  query: string;
  preferred_chart_type?: string;
  context?: Record<string, any>;
}

export interface VisualizationResponse {
  visualization_data: {
    title: string;
    type: string;
    data: DataPoint[];
    x_axis_label?: string;
    y_axis_label?: string;
    description?: string;
  };
  query_interpretation: string;
  raw_data?: Record<string, any>[];
  suggestions?: string[];
}

// ChatERP API Client
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API-Funktionen für den KI-Assistenten
export const aiAssistantApi = {
  // Chat-Funktion: Sendet eine Nachricht an den KI-Assistenten
  sendChatMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await apiClient.post('/ai-assistant/chat', request);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Senden der Chat-Nachricht:', error);
      throw error;
    }
  },

  // Systemaktion ausführen
  executeSystemAction: async (action: SystemAction): Promise<any> => {
    try {
      const response = await apiClient.post('/ai-assistant/actions', action);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Ausführen der Systemaktion:', error);
      throw error;
    }
  },

  // Chat-Verlauf abrufen
  getChatHistory: async (sessionId: string, limit: number = 20): Promise<ChatMessage[]> => {
    try {
      const response = await apiClient.get(`/ai-assistant/history?session_id=${sessionId}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen des Chat-Verlaufs:', error);
      throw error;
    }
  },

  // Visualisierung generieren
  generateVisualization: async (request: VisualizationRequest): Promise<VisualizationResponse> => {
    try {
      const response = await apiClient.post('/ai-visualization/generate', request);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Generieren der Visualisierung:', error);
      throw error;
    }
  },

  // Verfügbare Diagrammtypen abrufen
  getAvailableChartTypes: async (): Promise<{ id: string; name: string; description: string }[]> => {
    try {
      const response = await apiClient.get('/ai-visualization/chart-types');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Diagrammtypen:', error);
      throw error;
    }
  },

  // Visualisierung speichern
  saveVisualization: async (visualizationData: any): Promise<{ status: string; message: string; visualization_id: string }> => {
    try {
      const response = await apiClient.post('/ai-visualization/save', visualizationData);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Speichern der Visualisierung:', error);
      throw error;
    }
  }
};

export default aiAssistantApi; 