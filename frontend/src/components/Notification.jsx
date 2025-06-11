import React, { useState, useEffect } from 'react';
import './Notification.css';

/**
 * Notification-Komponente für Benachrichtigungen im VALEO-Design
 * 
 * @param {Object} props - Die Komponenten-Properties
 * @param {string} props.type - Der Typ der Benachrichtigung ('success', 'error', 'warning', 'info')
 * @param {string} props.message - Die Nachricht, die angezeigt werden soll
 * @param {number} props.duration - Wie lange die Benachrichtigung angezeigt werden soll (in ms, 0 für dauerhaft)
 * @param {Function} props.onClose - Callback, wenn die Benachrichtigung geschlossen wird
 */
const Notification = ({ type = 'info', message, duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);
  
  // Automatisches Schließen nach der angegebenen Zeit (wenn nicht 0)
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  // Manuelles Schließen
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  if (!visible) return null;
  
  // Bestimme das Icon basierend auf dem Typ
  const getIcon = () => {
    switch(type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  };
  
  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        <i className={`fas ${getIcon()}`}></i>
      </div>
      <div className="notification-content">
        {message}
      </div>
      <button className="notification-close" onClick={handleClose}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Notification; 