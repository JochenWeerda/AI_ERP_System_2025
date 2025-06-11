import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Toast.css';

/**
 * Toast-Komponente für Benachrichtigungen
 * @param {Object} props - Die Props
 * @param {string} props.id - Eindeutige ID des Toasts
 * @param {string} props.type - Typ des Toasts (success, error, warning, info)
 * @param {string} props.message - Nachricht
 * @param {number} props.timeout - Zeit in Millisekunden, nach der der Toast automatisch geschlossen wird
 * @param {Function} props.onClose - Callback-Funktion, die beim Schließen aufgerufen wird
 */
const Toast = ({ id, type = 'info', message, timeout = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  // Toast nach timeout automatisch schließen
  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onClose && onClose(id);
        }, 300); // Kleine Verzögerung für die Ausblend-Animation
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [id, timeout, onClose]);

  // Toast manuell schließen
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose && onClose(id);
    }, 300); // Kleine Verzögerung für die Ausblend-Animation
  };

  // Icons für die verschiedenen Toast-Typen
  const icons = {
    success: (
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  return (
    <div
      className={`toast toast-${type} ${visible ? 'visible' : 'hidden'}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-content">
        <p>{message}</p>
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Schließen">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  timeout: PropTypes.number,
  onClose: PropTypes.func
};

export default Toast; 