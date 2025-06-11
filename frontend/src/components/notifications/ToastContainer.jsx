import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import notificationService from '../../services/notification';
import './Toast.css';

/**
 * Container für Toast-Benachrichtigungen
 * Abonniert den Notification-Service und zeigt Toasts an
 */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const maxToasts = 5; // Maximale Anzahl gleichzeitig angezeigter Toasts

  useEffect(() => {
    // Abonniere alle Benachrichtigungstypen
    const unsubscribe = notificationService.subscribeToAll((notification) => {
      // Füge einen neuen Toast hinzu
      setToasts(currentToasts => {
        // Prüfe, ob ein Toast mit derselben ID bereits existiert
        const existingIndex = currentToasts.findIndex(toast => toast.id === notification.id);
        
        if (existingIndex >= 0) {
          // Ersetze den bestehenden Toast
          const updatedToasts = [...currentToasts];
          updatedToasts[existingIndex] = notification;
          return updatedToasts;
        } else {
          // Füge einen neuen Toast hinzu und begrenze die Anzahl
          const updatedToasts = [notification, ...currentToasts];
          return updatedToasts.slice(0, maxToasts);
        }
      });
    });

    // Cleanup-Funktion
    return () => {
      unsubscribe();
    };
  }, []);

  // Toast schließen
  const handleClose = (id) => {
    setToasts(currentToasts => 
      currentToasts.filter(toast => toast.id !== id)
    );
  };

  // Keine Toasts, kein Rendering
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          timeout={toast.timeout}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default ToastContainer; 