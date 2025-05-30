import axios from 'axios';

// Basiseinstellungen für axios
const api = axios.create({
  baseURL: 'http://localhost:8000', // URL des Backend-Servers
  timeout: 10000, // 10 Sekunden Timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request-Interceptor für Authentifizierung
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response-Interceptor für Error-Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Automatische Behandlung von 401-Fehlern (Nicht authentifiziert)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Netzwerkfehler anpassen
    if (!error.response) {
      error.message = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
    }
    
    return Promise.reject(error);
  }
);

// Authentifizierungsfunktionen
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getProfile: async () => {
    return await api.get('/api/v1/auth/me');
  }
};

// Export der login-Funktion direkt für die Login.tsx-Komponente
export const login = async (email, password) => {
  return await authService.login(email, password);
};

export default api; 