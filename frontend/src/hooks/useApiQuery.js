/**
 * useApiQuery - Ein React-Hook für Datenabfrage mit Ladestatusanzeige und Fehlerbehandlung
 * Basiert auf dem Axios-basierten API-Service
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Ein Hook für API-Abfragen mit Lade- und Fehlerstatus
 * @param {Function} apiFunction - Die zu verwendende API-Funktion
 * @param {Array} dependencies - Abhängigkeitsarray für den useEffect-Hook
 * @param {boolean} executeOnMount - Steuert, ob die Abfrage automatisch beim Mounten ausgeführt wird
 * @param {Array|Object} initialArgs - Anfangsargumente für die API-Funktion
 */
const useApiQuery = (apiFunction, dependencies = [], executeOnMount = true, initialArgs = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(executeOnMount);
  const [error, setError] = useState(null);
  const [args, setArgs] = useState(initialArgs);

  // Führt die API-Abfrage aus
  const execute = useCallback(async (executionArgs = null) => {
    // Wenn neue Argumente übergeben wurden, diese verwenden, sonst die vorhandenen
    const currentArgs = executionArgs !== null ? executionArgs : args;
    
    try {
      setLoading(true);
      setError(null);
      
      // API-Funktion mit den aktuellen Argumenten aufrufen (Array oder einzelnes Argument)
      const response = Array.isArray(currentArgs) 
        ? await apiFunction(...currentArgs) 
        : await apiFunction(currentArgs);
      
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.userMessage || 'Ein Fehler ist aufgetreten');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, args]);

  // Argumente aktualisieren ohne die Abfrage auszuführen
  const updateArgs = useCallback((newArgs) => {
    setArgs(newArgs);
  }, []);

  // Bei Montage oder Änderung der Abhängigkeiten ausführen
  useEffect(() => {
    if (executeOnMount) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    updateArgs
  };
};

export default useApiQuery; 