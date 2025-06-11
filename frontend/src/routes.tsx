import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Import pages
import Home from './pages/Home';
import InterneFinanzbuchhaltungPage from './pages/InterneFinanzbuchhaltungPage';
import FinanzbuchhaltungExportPage from './pages/FinanzbuchhaltungExportPage';
import FinanzDashboardPage from './pages/FinanzDashboardPage';
import OffenePostenPage from './pages/OffenePostenPage';
import KassenImportPage from './pages/KassenImportPage';
import ThemeSettings from './pages/ThemeSettings';
import ThemeDemo from './pages/ThemeDemo';
import NotificationCenter from './pages/NotificationCenter';
import ArticleMasterData from './pages/inventory/ArticleMasterData';
import EmergencyDashboard from './pages/EmergencyDashboard';
import ArtikelDetailPage from './pages/ArtikelDetailPage';
import ArtikelCreatePage from './pages/ArtikelCreatePage';
import ArtikelkontoPage from './pages/ArtikelkontoPage';
import QSFuttermittelDashboard from './pages/QSFuttermittelDashboard';
import AnomalyDashboard from './pages/AnomalyDashboard';
import EcommerceOrders from './pages/EcommerceOrders';
import Ecommerce from './pages/Ecommerce';
import HealthConnectors from './pages/HealthConnectors';
import AI from './pages/AI';
import AIAssistantPage from './pages/AIAssistantPage';
import TransactionManagement from './pages/TransactionManagement';
import TransactionReports from './pages/reports/TransactionReports';
import ArticleMasterData from './pages/inventory/ArticleMasterData';

// Direkt importierte Dashboard-Komponente
import DashboardComponent from './components/dashboard/Dashboard';

// Lazy Loading Komponenten
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy Loading für Kunden/Lieferanten/Mitarbeiter
const CustomerListPage = lazy(() => import('./pages/CustomerListPage'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const CustomerForm = lazy(() => import('./pages/CustomerForm'));
const SupplierListPage = lazy(() => import('./pages/SupplierListPage'));
const SupplierDetail = lazy(() => import('./pages/SupplierDetail'));
const SupplierForm = lazy(() => import('./pages/SupplierForm'));
const EmployeeListPage = lazy(() => import('./pages/EmployeeListPage'));
const EmployeeDetail = lazy(() => import('./pages/EmployeeDetail'));
const EmployeeForm = lazy(() => import('./pages/EmployeeForm'));
const CPDAccountsListPage = lazy(() => import('./pages/CPDAccountsListPage'));
const CPDAccountForm = lazy(() => import('./pages/CPDAccountForm'));

// Lazy Loading für Belegfolge-Module
const BelegfolgeModule = lazy(() => import('./modules/belegfolge/BelegfolgeModule'));
const AngeboteModule = lazy(() => import('./modules/belegfolge/verkauf/AngeboteModule'));
const AuftraegeModule = lazy(() => import('./modules/belegfolge/verkauf/AuftraegeModule'));
const LieferscheineModule = lazy(() => import('./modules/belegfolge/verkauf/LieferscheineModule'));
const RechnungenModule = lazy(() => import('./modules/belegfolge/verkauf/RechnungenModule'));
const BestellungenModule = lazy(() => import('./modules/belegfolge/einkauf/BestellungenModule'));
const EingangslieferscheineModule = lazy(() => import('./modules/belegfolge/einkauf/EingangslieferscheineModule'));
const EingangsrechnungenModule = lazy(() => import('./modules/belegfolge/einkauf/EingangsrechnungenModule'));

// Lazy Loading für Stammdaten-Module
const StammdatenModule = lazy(() => import('./modules/stammdaten/StammdatenModule'));
const ArtikelStammdatenModule = lazy(() => import('./modules/stammdaten/artikel/ArtikelStammdatenModule'));
const PartnerStammdatenModule = lazy(() => import('./modules/stammdaten/partner/PartnerStammdatenModule'));
const CPDKontenModule = lazy(() => import('./modules/stammdaten/cpd/CPDKontenModule'));
const LagerStammdatenModule = lazy(() => import('./modules/stammdaten/lager/LagerStammdatenModule'));

// Lazy Loading für Lager- und Inventur-Module
const LagerBestandModule = lazy(() => import('./components/Lager/LagerBestandModule'));
const LagerUmlagerungModule = lazy(() => import('./components/Lager/LagerUmlagerungModule'));
const LagerKorrekturModule = lazy(() => import('./components/Lager/LagerKorrekturModule'));
const InventurModule = lazy(() => import('./components/Inventur/InventurModule'));
const WarenausgangModule = lazy(() => import('./components/Warenausgang/WarenausgangModule'));

// Lazy Loading für Qualitäts- und Chargen-Module
const ChargenBerichtModule = lazy(() => import('./components/ChargenBericht/ChargenBerichtModule'));
const QualitaetModule = lazy(() => import('./components/Qualitaet/QualitaetModule'));
const QualitaetsHandbuchModule = lazy(() => import('./components/QualitaetsHandbuch/QualitaetsHandbuchModule'));

// Lazy Loading für weitere Module
const TSEModule = lazy(() => import('./components/TSE/TSEModule'));
const MobileModule = lazy(() => import('./components/Mobile/MobileModule'));
const IPManagerModule = lazy(() => import('./components/IPManager/IPManagerModule'));
const AppsPage = lazy(() => import('./pages/AppsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Loading-Komponente für Suspense
const LoadingComponent = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingComponent />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Hauptlayout mit allen Unterseiten */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            {/* Dashboard-Route */}
            <Route path="dashboard" element={<DashboardComponent />} />
            
            {/* Finanzen-Routen */}
            <Route path="finanzen">
              <Route index element={<Navigate to="/finanzen/dashboard" />} />
              <Route path="dashboard" element={<FinanzDashboardPage />} />
              <Route path="intern" element={<InterneFinanzbuchhaltungPage />} />
              <Route path="export" element={<FinanzbuchhaltungExportPage />} />
              <Route path="offene-posten" element={<OffenePostenPage />} />
              <Route path="kassen-import" element={<KassenImportPage />} />
            </Route>
            
            {/* Belegfolge-Routen */}
            <Route path="belegfolge">
              <Route index element={<BelegfolgeModule />} />
              
              {/* Verkauf */}
              <Route path="angebote" element={<AngeboteModule />} />
              <Route path="auftraege" element={<AuftraegeModule />} />
              <Route path="lieferscheine" element={<LieferscheineModule />} />
              <Route path="rechnungen" element={<RechnungenModule />} />
              
              {/* Einkauf */}
              <Route path="bestellungen" element={<BestellungenModule />} />
              <Route path="eingangslieferscheine" element={<EingangslieferscheineModule />} />
              <Route path="eingangsrechnungen" element={<EingangsrechnungenModule />} />
            </Route>
            
            {/* Lager-Routen */}
            <Route path="lager">
              <Route index element={<Navigate to="/lager/bestand" />} />
              <Route path="bestand" element={<LagerBestandModule />} />
              <Route path="umlagerung" element={<LagerUmlagerungModule />} />
              <Route path="korrektur" element={<LagerKorrekturModule />} />
              <Route path="warenausgang" element={<WarenausgangModule />} />
              <Route path="artikelkonto" element={<ArtikelkontoPage />} />
            </Route>
            
            {/* Inventur-Routen */}
            <Route path="inventur">
              <Route index element={<InventurModule />} />
            </Route>
            
            {/* Chargen und Qualität */}
            <Route path="chargen">
              <Route index element={<ChargenBerichtModule />} />
            </Route>
            
            <Route path="qualitaet">
              <Route index element={<QualitaetModule />} />
              <Route path="futtermittel" element={<QSFuttermittelDashboard />} />
              <Route path="handbuch" element={<QualitaetsHandbuchModule />} />
            </Route>
            
            {/* Kunden/Lieferanten/Mitarbeiter */}
            <Route path="kunden">
              <Route index element={<CustomerListPage />} />
              <Route path="neu" element={<CustomerForm />} />
              <Route path=":id" element={<CustomerDetail />} />
            </Route>
            
            <Route path="lieferanten">
              <Route index element={<SupplierListPage />} />
              <Route path="neu" element={<SupplierForm />} />
              <Route path=":id" element={<SupplierDetail />} />
            </Route>
            
            <Route path="mitarbeiter">
              <Route index element={<EmployeeListPage />} />
              <Route path="neu" element={<EmployeeForm />} />
              <Route path=":id" element={<EmployeeDetail />} />
            </Route>
            
            {/* CPD-Konten */}
            <Route path="cpd-konten">
              <Route index element={<CPDAccountsListPage />} />
              <Route path="neu" element={<CPDAccountForm />} />
            </Route>
            
            {/* Stammdaten-Routen */}
            <Route path="stammdaten">
              <Route index element={<StammdatenModule />} />
              <Route path="artikel">
                <Route index element={<ArtikelStammdatenModule />} />
                <Route path="neu" element={<ArtikelCreatePage />} />
                <Route path=":id" element={<ArtikelDetailPage />} />
              </Route>
              <Route path="partner" element={<PartnerStammdatenModule />} />
              <Route path="cpd-konten" element={<CPDKontenModule />} />
              <Route path="lager" element={<LagerStammdatenModule />} />
            </Route>
            
            {/* Notfall- und Anomalie-Management */}
            <Route path="notfall">
              <Route index element={<EmergencyDashboard />} />
            </Route>
            
            <Route path="anomalien">
              <Route index element={<AnomalyDashboard />} />
            </Route>
            
            {/* E-Commerce */}
            <Route path="ecommerce">
              <Route index element={<Ecommerce />} />
              <Route path="bestellungen" element={<EcommerceOrders />} />
            </Route>
            
            {/* TSE und Kassensysteme */}
            <Route path="tse">
              <Route index element={<TSEModule />} />
            </Route>
            
            {/* Mobile */}
            <Route path="mobile">
              <Route index element={<MobileModule />} />
            </Route>
            
            {/* IP-Manager */}
            <Route path="ip-manager">
              <Route index element={<IPManagerModule />} />
            </Route>
            
            {/* System-Routen */}
            <Route path="health-connectors" element={<HealthConnectors />} />
            <Route path="ai" element={<AI />} />
            <Route path="ai-assistant" element={<AIAssistantPage />} />
            <Route path="apps" element={<AppsPage />} />
            <Route path="einstellungen" element={<SettingsPage />} />
            <Route path="einstellungen/theme" element={<ThemeSettings />} />
            <Route path="notifications" element={<NotificationCenter />} />
            
            {/* Inventar */}
            <Route path="inventory">
              <Route index element={<Navigate to="/inventory/dashboard" />} />
              <Route path="dashboard" element={<EmergencyDashboard />} />
              <Route path="article-master-data" element={<ArticleMasterData />} />
            </Route>
            
            {/* Demo-Routen */}
            <Route path="theme-demo" element={<ThemeDemo />} />
            <Route path="demo/theme" element={<ThemeDemo />} />
            
            {/* Transaktionsverwaltung */}
            <Route path="transactions">
              <Route index element={<TransactionManagement />} />
              <Route path="reports" element={<TransactionReports />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes; 