import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Import Theme System
import { ThemeSystemProvider } from './themes/ThemeProvider';

// Import Pages
import AppContainer from './pages/AppContainer';
import Login from './pages/Login';
import Home from './pages/Home';
import CustomerListPage from './pages/CustomerListPage';
import CustomerDetail from './pages/CustomerDetail';
import SupplierListPage from './pages/SupplierListPage';
import SupplierDetail from './pages/SupplierDetail';
import ArtikelDetailPage from './pages/ArtikelDetailPage';
import ArtikelCreatePage from './pages/ArtikelCreatePage';
import ThemeSettings from './pages/ThemeSettings';
import EcommerceOrders from './pages/EcommerceOrders';
import OntologyExplorer from './pages/OntologyExplorer';
import AIAssistantPage from './pages/AIAssistantPage';
import TransactionManagement from './pages/TransactionManagement';

// Auth Provider
import { AuthProvider } from './contexts/AuthContext';

// Main App Component
function App() {
  return (
    <ThemeSystemProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppContainer />}>
              <Route index element={<Home />} />
              <Route path="customers" element={<CustomerListPage />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="suppliers" element={<SupplierListPage />} />
              <Route path="suppliers/:id" element={<SupplierDetail />} />
              <Route path="articles/:id" element={<ArtikelDetailPage />} />
              <Route path="articles/create" element={<ArtikelCreatePage />} />
              <Route path="settings/theme" element={<ThemeSettings />} />
              <Route path="ecommerce/orders" element={<EcommerceOrders />} />
              <Route path="ontology" element={<OntologyExplorer />} />
              <Route path="transactions" element={<TransactionManagement />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeSystemProvider>
  );
}

export default App; 