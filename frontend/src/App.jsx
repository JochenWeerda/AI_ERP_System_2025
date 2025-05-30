import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppsPage from './pages/AppsPage';
import CustomerListPage from './pages/CustomerListPage';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './pages/CustomerForm';
import SupplierListPage from './pages/SupplierListPage';
import SupplierDetail from './pages/SupplierDetail';
import SupplierForm from './pages/SupplierForm';
import EmployeeListPage from './pages/EmployeeListPage';
import EmployeeDetail from './pages/EmployeeDetail';
import EmployeeForm from './pages/EmployeeForm';
import CPDAccountsListPage from './pages/CPDAccountsListPage';
import CPDAccountForm from './pages/CPDAccountForm';
import SettingsPage from './pages/SettingsPage';
import HealthConnectors from './pages/HealthConnectors';
import QSFuttermittelDashboard from './pages/QSFuttermittelDashboard';
import EmergencyDashboard from './pages/EmergencyDashboard';
import NotificationCenter from './pages/NotificationCenter';
import AnomalyDashboard from './pages/AnomalyDashboard';
import EcommerceOrders from './pages/EcommerceOrders';
import AI from './pages/AI';
import Ecommerce from './pages/Ecommerce';
import Login from './pages/Login';
import { ChargenPage, ChargenBerichtePage } from './pages/inventory';
import Test from './Test';

// Platzhalter-Komponenten für die fehlenden Routen
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1 style={{ color: '#4a7c59' }}>{title}</h1>
    <p>Diese Seite ist noch in Entwicklung.</p>
    <button 
      onClick={() => window.history.back()} 
      style={{ 
        background: '#4a7c59', 
        color: 'white', 
        border: 'none', 
        padding: '0.5rem 1rem', 
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '1rem'
      }}
    >
      Zurück
    </button>
  </div>
);

/**
 * App-Komponente mit allen Routen für die verschiedenen App-Bereiche
 */
function App() {
  console.log("App-Komponente wird gerendert");
  
  return (
    <Routes>
      <Route exact path="/" element={<Navigate to="/apps" replace />} />
      <Route exact path="/apps" element={<><AppsPage /><Test /></>} />
      
      {/* Stammdaten */}
      <Route exact path="/kunden" element={<CustomerListPage />} />
      <Route exact path="/kunden/neu" element={<CustomerForm />} />
      <Route exact path="/kunden/:id" element={<CustomerDetail />} />
      <Route exact path="/cpd-konten" element={<CPDAccountsListPage />} />
      <Route exact path="/cpd-konten/neu" element={<CPDAccountForm />} />
      <Route exact path="/artikel" element={<PlaceholderPage title="Artikel" />} />
      <Route exact path="/lieferanten" element={<SupplierListPage />} />
      <Route exact path="/lieferanten/neu" element={<SupplierForm />} />
      <Route exact path="/lieferanten/:id" element={<SupplierDetail />} />
      <Route exact path="/mitarbeiter" element={<EmployeeListPage />} />
      <Route exact path="/mitarbeiter/neu" element={<EmployeeForm />} />
      <Route exact path="/mitarbeiter/:id" element={<EmployeeDetail />} />
      
      {/* System */}
      <Route exact path="/settings" element={<SettingsPage />} />
      <Route exact path="/health-connectors" element={<HealthConnectors />} />
      <Route exact path="/benachrichtigungen" element={<NotificationCenter />} />
      <Route exact path="/anomalien" element={<AnomalyDashboard />} />
      <Route exact path="/notfall" element={<EmergencyDashboard />} />
      <Route exact path="/ai" element={<AI />} />
      <Route exact path="/login" element={<Login />} />
      
      {/* Prozesse */}
      <Route exact path="/verkauf" element={<PlaceholderPage title="Verkauf" />} />
      <Route exact path="/angebote" element={<PlaceholderPage title="Angebote" />} />
      <Route exact path="/auftraege" element={<PlaceholderPage title="Aufträge" />} />
      <Route exact path="/rechnungen" element={<PlaceholderPage title="Rechnungen" />} />
      <Route exact path="/bestellungen" element={<PlaceholderPage title="Bestellungen" />} />
      <Route exact path="/wareneingang" element={<PlaceholderPage title="Wareneingang" />} />
      <Route exact path="/lieferantenrechnungen" element={<PlaceholderPage title="Lieferantenrechnungen" />} />
      <Route exact path="/zahlungen" element={<PlaceholderPage title="Zahlungen" />} />
      <Route exact path="/ecommerce" element={<Ecommerce />} />
      <Route exact path="/ecommerce/bestellungen" element={<EcommerceOrders />} />
      
      {/* Logistik */}
      <Route exact path="/lagerbestand" element={<PlaceholderPage title="Lagerbestand" />} />
      <Route exact path="/lagerorte" element={<PlaceholderPage title="Lagerorte" />} />
      <Route exact path="/chargen" element={<ChargenPage />} />
      <Route exact path="/chargen/berichte" element={<ChargenBerichtePage />} />
      <Route exact path="/ladelisten" element={<PlaceholderPage title="Ladelisten" />} />
      <Route exact path="/touren" element={<PlaceholderPage title="Tourenplanung" />} />
      
      {/* Fachbereiche */}
      <Route exact path="/waage" element={<PlaceholderPage title="Waage" />} />
      <Route exact path="/getreideannahme" element={<PlaceholderPage title="Getreideannahme" />} />
      <Route exact path="/pflanzenschutz" element={<PlaceholderPage title="Pflanzenschutz" />} />
      <Route exact path="/thg-erfassung" element={<PlaceholderPage title="THG-Erfassung" />} />
      <Route exact path="/qs-futtermittel" element={<QSFuttermittelDashboard />} />
      
      {/* Finanzen */}
      <Route exact path="/kontenplan" element={<PlaceholderPage title="Kontenplan" />} />
      <Route exact path="/buchungen" element={<PlaceholderPage title="Buchungen" />} />
      <Route exact path="/bwa" element={<PlaceholderPage title="BWA" />} />
      <Route exact path="/datev-export" element={<PlaceholderPage title="DATEV-Export" />} />
      
      {/* Reporting */}
      <Route exact path="/dashboards" element={<PlaceholderPage title="Dashboards" />} />
      <Route exact path="/berichte" element={<PlaceholderPage title="Berichte" />} />
      <Route exact path="/analysen" element={<PlaceholderPage title="Analysen" />} />
      <Route exact path="/auswertungen" element={<PlaceholderPage title="Auswertungen" />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/apps" replace />} />
    </Routes>
  );
}

export default App;
