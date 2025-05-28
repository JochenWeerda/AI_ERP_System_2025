import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor für Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor für Fehlerbehandlung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
}

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post<LoginResponse>('/auth/login', formData);
  const token = response.data.access_token;

  // Benutzerinformationen abrufen
  const userResponse = await api.get<User>('/auth/me');
  
  return {
    user: userResponse.data,
    token,
  };
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

export default api; 