import React from 'react';
import AppTiles from '../components/apps/AppTiles';
import ChatPanel from '../components/chat/ChatPanel';
import SystemStatus from '../components/SystemStatus';
import './Home.css';

/**
 * Home-Komponente - Startseite mit App-Kacheln und Chat-Integration
 */
const Home = () => {
  return (
    <div className="home-container">
      <div className="home-status-widget">
        <SystemStatus />
      </div>

      <AppTiles />
      
      <ChatPanel />
      
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-title">Offene Aufgaben</div>
          <div className="stat-value">12</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Nachrichten</div>
          <div className="stat-value">5</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Neue Belege</div>
          <div className="stat-value">8</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">System-Status</div>
          <div className="stat-value status-good">Gut</div>
        </div>
      </div>

      <div className="recent-activities">
        <h2>Letzte Aktivitäten</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="activity-content">
              <div className="activity-title">Neue Rechnung erstellt</div>
              <div className="activity-meta">
                <span className="activity-time">Heute, 14:32</span>
                <span className="activity-user">Max Mustermann</span>
              </div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <div className="activity-content">
              <div className="activity-title">Auftragsbestätigung gesendet</div>
              <div className="activity-meta">
                <span className="activity-time">Heute, 11:15</span>
                <span className="activity-user">Anna Schmidt</span>
              </div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="activity-content">
              <div className="activity-title">Neuer Kunde angelegt</div>
              <div className="activity-meta">
                <span className="activity-time">Gestern, 16:48</span>
                <span className="activity-user">Thomas Weber</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
