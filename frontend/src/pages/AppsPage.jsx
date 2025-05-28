import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import ColumnLayout from '../components/dashboard/ColumnLayout';
import AppSection from '../components/dashboard/AppSection';
import ChatPanel from '../components/dashboard/ChatPanel';
import '../components/dashboard/Dashboard.css';

/**
 * AppsPage-Komponente im exakt gleichen Layout wie das ERP-Dashboard
 * mit standardmäßig geöffnetem Chat-Bereich
 */
const AppsPage = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  // Handler für Klicks auf das Overlay im mobilen Modus
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('with-chat-panel') && window.innerWidth <= 992) {
      setIsChatOpen(false);
    }
  };
  
  // Event-Listener für Klicks auf den Hintergrund
  useEffect(() => {
    if (isChatOpen) {
      document.addEventListener('click', handleBackdropClick);
    }
    
    return () => {
      document.removeEventListener('click', handleBackdropClick);
    };
  }, [isChatOpen]);
  
  // Daten für die App-Anzeige im ERP-Dashboard-Stil organisieren
  const appsData = {
    columns: [
      {
        title: 'Standardanwendungen',
        sections: [
          {
            title: 'Dashboard & Navigation',
            apps: [
              { icon: 'health_and_safety', title: 'Health und Konnektoren', onClick: () => navigate('/health-connectors') },
              { icon: 'settings', title: 'Einstellungen', onClick: () => navigate('/settings') }
            ]
          },
          {
            title: 'Stammdaten',
            apps: [
              { icon: 'people', title: 'Kunden', hasStammdatenBadge: true, onClick: () => navigate('/kunden') },
              { icon: 'account_balance', title: 'CPD-Konten', hasStammdatenBadge: true, onClick: () => navigate('/cpd-konten') },
              { icon: 'inventory_2', title: 'Artikel', hasStammdatenBadge: true },
              { icon: 'local_shipping', title: 'Lieferanten', hasStammdatenBadge: true }
            ]
          }
        ]
      },
      {
        title: 'Geschäftsprozesse',
        sections: [
          {
            title: 'Vertrieb',
            apps: [
              { icon: 'point_of_sale', title: 'Verkauf' },
              { icon: 'description', title: 'Angebote' },
              { icon: 'shopping_bag', title: 'Aufträge' },
              { icon: 'receipt', title: 'Rechnungen' }
            ]
          },
          {
            title: 'Einkauf',
            apps: [
              { icon: 'shopping_cart', title: 'Bestellungen' },
              { icon: 'input', title: 'Wareneingang' },
              { icon: 'receipt_long', title: 'Lieferantenrechnungen' },
              { icon: 'payment', title: 'Zahlungen' }
            ]
          },
          {
            title: 'Logistik',
            apps: [
              { icon: 'warehouse', title: 'Lagerbestand' },
              { icon: 'inventory', title: 'Lagerorte' },
              { icon: 'qr_code_2', title: 'Chargenverwaltung', onClick: () => navigate('/chargen') },
              { icon: 'list_alt', title: 'Ladelisten' },
              { icon: 'route', title: 'Tourenplanung' }
            ]
          }
        ]
      },
      {
        title: 'Fachbereiche',
        sections: [
          {
            title: 'Landwirtschaft',
            apps: [
              { icon: 'scale', title: 'Waage' },
              { icon: 'agriculture', title: 'Getreideannahme' },
              { icon: 'eco', title: 'Pflanzenschutz' },
              { icon: 'co2', title: 'THG-Erfassung' }
            ]
          },
          {
            title: 'Qualitätssicherung',
            apps: [
              { icon: 'verified', title: 'QS-Futtermittel', onClick: () => navigate('/qs-futtermittel') }
            ]
          },
          {
            title: 'Finanzen',
            apps: [
              { icon: 'account_balance_wallet', title: 'Kontenplan' },
              { icon: 'euro_symbol', title: 'Buchungen' },
              { icon: 'trending_up', title: 'BWA' },
              { icon: 'upload_file', title: 'DATEV-Export' }
            ]
          },
          {
            title: 'Reporting',
            apps: [
              { icon: 'insights', title: 'Dashboards' },
              { icon: 'bar_chart', title: 'Berichte' },
              { icon: 'analytics', title: 'Analysen' },
              { icon: 'history', title: 'Auswertungen' }
            ]
          }
        ]
      }
    ]
  };
  
  return (
    <div className={isChatOpen ? 'with-chat-panel' : ''}>
      <ChatPanel isOpen={isChatOpen} onToggle={toggleChat} />
      
      <div className="dashboard-content">
        <DashboardHeader />
        
        <div className="container">
          <div className="dashboard-grid">
            {appsData.columns.map((column, columnIndex) => (
              <ColumnLayout key={`column-${columnIndex}`} title={column.title}>
                {column.sections.map((section, sectionIndex) => (
                  <AppSection 
                    key={`section-${columnIndex}-${sectionIndex}`}
                    title={section.title}
                    apps={section.apps}
                  />
                ))}
              </ColumnLayout>
            ))}
          </div>
        </div>
        
        <DashboardFooter />
      </div>
    </div>
  );
};

export default AppsPage; 