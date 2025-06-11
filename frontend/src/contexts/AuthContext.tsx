import React, { createContext, useContext, useState, useEffect } from 'react';

// Benutzertyp-Definition
export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

// Auth-Kontext-Typ-Definition
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Erstellen des Auth-Kontexts
const AuthContext = createContext<AuthContextType | null>(null);

// Auth-Provider-Props
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Komponente
 * Verwaltet den Authentifizierungsstatus der Anwendung
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Beim Laden der Anwendung prüfen, ob ein Benutzer eingeloggt ist
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In einer realen Anwendung würde hier ein API-Aufruf stattfinden
        // z.B. const response = await api.get('/auth/me');
        
        // Für Demozwecke verwenden wir den localStorage
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        setError('Fehler beim Laden des Benutzerprofils');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  /**
   * Benutzeranmeldung
   * @param username Benutzername
   * @param password Passwort
   * @returns True, wenn die Anmeldung erfolgreich war
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // In einer realen Anwendung würde hier ein API-Aufruf stattfinden
      // z.B. const response = await api.post('/auth/login', { username, password });
      
      // Für Demozwecke simulieren wir eine erfolgreiche Anmeldung
      if (username && password) {
        const mockUser: User = {
          id: 'user-123',
          username,
          email: `${username}@example.com`,
          roles: ['user'],
        };
        
        // Benutzer im localStorage speichern
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        return true;
      } else {
        throw new Error('Ungültige Anmeldedaten');
      }
    } catch (err: any) {
      setError(err.message || 'Fehler bei der Anmeldung');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Benutzerabmeldung
   */
  const logout = (): void => {
    // Benutzer aus dem localStorage entfernen
    localStorage.removeItem('auth_user');
    
    setUser(null);
  };
  
  // Context-Wert
  const contextValue: AuthContextType = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    loading,
    error,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook zum Zugriff auf den Auth-Kontext
 * @returns AuthContextType Objekt mit Authentifizierungsinformationen und -funktionen
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
  }
  
  return context;
};

export default AuthProvider; 