import React, { useState, useEffect } from 'react';
import SystemStatus from '../SystemStatus';
import './Dashboard.css';

/**
 * Dashboard-Komponente mit Übersicht über alle Microservices und System-Status
 * Diese Komponente ist mit dem VALEO-Dashboard-Design kompatibel.
 */
const Dashboard = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Aktualisiere die Daten
  const handleRefresh = () => {
    setLastUpdated(new Date());
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>System-Dashboard</h1>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
        >
          Aktualisieren
        </button>
      </div>
      
      {/* System-Übersicht */}
      <div className="system-overview">
        <div className="system-stats">
          <div className="stat-card">
            <h3>Letzte Aktualisierung</h3>
            <p className="stat-value">{lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
      
      {/* SystemStatus-Komponente einbinden */}
      <SystemStatus />
      
      {/* Modulkacheln */}
      <div className="dashboard-grid">
        <div className="widget">
          <div className="widget-header">
            <h3>Finanzmodul</h3>
          </div>
          <div className="widget-content">
            <div className="stat-item">
              <span className="status-label">Offene Posten:</span>
              <span className="status-value">12</span>
            </div>
            <div className="stat-item">
              <span className="status-label">Offene Rechnungen:</span>
              <span className="status-value">5</span>
            </div>
            <div className="stat-item">
              <span className="status-label">Zu bestätigende Zahlungen:</span>
              <span className="status-value">3</span>
            </div>
          </div>
        </div>
        
        <div className="widget">
          <div className="widget-header">
            <h3>Lagerbestand</h3>
          </div>
          <div className="widget-content">
            <div className="stat-item">
              <span className="status-label">Bestand unter Mindestbestand:</span>
              <span className="status-value">8</span>
            </div>
            <div className="stat-item">
              <span className="status-label">Ausstehende Inventuren:</span>
              <span className="status-value">1</span>
            </div>
            <div className="stat-item">
              <span className="status-label">Ausstehende Warenausgänge:</span>
              <span className="status-value">4</span>
            </div>
          </div>
        </div>
        
        <div className="widget">
          <div className="widget-header">
            <h3>Aufgaben</h3>
          </div>
          <div className="widget-content">
            <div className="stat-item">
              <span className="status-label">Fällige Aufgaben:</span>
              <span className="status-value">7</span>
            </div>
            <div className="stat-item">
              <span className="status-label">Heute erstellte Aufgaben:</span>
              <span className="status-value">3</span>
            </div>
            <div className="stat-item">
              <span className="status-label">Zugewiesene Aufgaben:</span>
              <span className="status-value">10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 