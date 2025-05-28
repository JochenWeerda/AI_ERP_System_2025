import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ThemeProvider from './themes/ThemeProvider';
import Layout from './components/Layout';
import AppsPage from './pages/AppsPage';
import HealthConnectors from './pages/HealthConnectors';
import SettingsPage from './pages/SettingsPage';
import CustomerListPage from './pages/CustomerListPage';
import CustomerForm from './pages/CustomerForm';
import CustomerDetail from './pages/CustomerDetail';
import CPDAccountsListPage from './pages/CPDAccountsListPage';
import CPDAccountForm from './pages/CPDAccountForm';
import ChargenPage from './pages/inventory/ChargenPage';
import QSFuttermittelDashboard from './pages/QSFuttermittelDashboard';
import SupplierListPage from './pages/SupplierListPage';
import SupplierForm from './pages/SupplierForm';
import SupplierDetail from './pages/SupplierDetail';
// Mitarbeiter-Importe
import EmployeeListPage from './pages/EmployeeListPage';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeDetail from './pages/EmployeeDetail';
import './App.css';

/**
 * Die Hauptanwendungskomponente für das AI-gesteuerte ERP-System
 * 
 * Enthält das Routing und die Theme-Konfiguration nach Odoo-Standards
 */
function App() {
  console.log("Vollständige App mit Layout wird gerendert");
  
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/apps" replace />} />
          <Route path="/dashboard" element={<Navigate to="/health-connectors" replace />} />
          <Route path="/apps" element={
            <AppsPage />
          } />
          <Route path="/landhandel" element={
            <Navigate to="/apps" replace />
          } />
          <Route path="/erp-dashboard" element={
            <Navigate to="/apps" replace />
          } />
          <Route path="/health-connectors" element={
            <Layout>
              <HealthConnectors />
            </Layout>
          } />
          <Route path="/settings" element={
            <SettingsPage />
          } />
          {/* Kundenstammdaten-Routen - ohne Layout */}
          <Route path="/kunden" element={
            <CustomerListPage />
          } />
          <Route path="/kunden/neu" element={
            <CustomerForm mode="create" />
          } />
          <Route path="/kunden/:id" element={
            <CustomerDetail />
          } />
          <Route path="/kunden/:id/bearbeiten" element={
            <CustomerForm mode="edit" />
          } />
          {/* CPD-Konten-Stammdaten-Routen */}
          <Route path="/cpd-konten" element={
            <Layout>
              <CPDAccountsListPage />
            </Layout>
          } />
          <Route path="/cpd-konten/neu" element={
            <Layout>
              <CPDAccountForm mode="create" />
            </Layout>
          } />
          <Route path="/cpd-konten/:id/bearbeiten" element={
            <Layout>
              <CPDAccountForm mode="edit" />
            </Layout>
          } />
          {/* Lieferantenstammdaten-Routen */}
          <Route path="/lieferanten" element={
            <SupplierListPage />
          } />
          <Route path="/lieferanten/neu" element={
            <SupplierForm mode="create" />
          } />
          <Route path="/lieferanten/:id" element={
            <SupplierDetail />
          } />
          <Route path="/lieferanten/:id/bearbeiten" element={
            <SupplierForm mode="edit" />
          } />
          {/* Mitarbeiterstammdaten-Routen */}
          <Route path="/mitarbeiter" element={
            <EmployeeListPage />
          } />
          <Route path="/mitarbeiter/neu" element={
            <EmployeeForm mode="create" />
          } />
          <Route path="/mitarbeiter/:id" element={
            <EmployeeDetail />
          } />
          <Route path="/mitarbeiter/:id/bearbeiten" element={
            <EmployeeForm mode="edit" />
          } />
          {/* Chargenverwaltung-Routen */}
          <Route path="/chargen" element={
            <Layout>
              <ChargenPage />
            </Layout>
          } />
          {/* QS-Futtermittel-Routen */}
          <Route path="/qs-futtermittel" element={
            <Layout>
              <QSFuttermittelDashboard />
            </Layout>
          } />
          {/* Weitere Routen hier einfügen */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
