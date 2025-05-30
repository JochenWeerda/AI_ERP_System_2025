import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './themes';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ThemeDemo from './ThemeDemo';
import WarenausgangListe from './components/Warenausgang/WarenausgangListe';
import WarenausgangFormular from './components/Warenausgang/WarenausgangFormular';
import WareneingangFormular from './components/BelegeFormular/WareneingangFormular';
import MobileMainPage from './components/Mobile/MobileMainPage';
import MobileScannerPage from './pages/mobile/MobileScannerPage';
import ChargenBerichtPage from './components/ChargenBericht/ChargenBerichtPage';
import ChargenQualitaetPage from './pages/chargen/ChargenQualitaetPage';
import ChargenPage from './pages/inventory/ChargenPage';
import ArtikelkontoPage from './pages/ArtikelkontoPage';
import OffenePostenPage from './pages/OffenePostenPage';
import KassenImportPage from './pages/KassenImportPage';
import FinanzbuchhaltungExportPage from './pages/FinanzbuchhaltungExportPage';
import InterneFinanzbuchhaltungPage from './pages/InterneFinanzbuchhaltungPage';
import LagerbestandPage from './pages/inventory/LagerbestandPage';
import InventurPage from './pages/inventory/InventurPage';
import UmlagerungForm from './components/Lager/UmlagerungForm';
import LagerkorrekturForm from './components/Lager/LagerkorrekturForm';
import InventurZaehlliste from './components/Inventur/InventurZaehlliste';
import InventurErfassungDialog from './components/Inventur/InventurErfassungDialog';
import BelegfolgeRoutes from './routes/BelegfolgeRoutes';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="theme-demo" element={<ThemeDemo />} />
            <Route path="chargen" element={<ChargenPage />} />
            <Route path="chargen/qualitaet" element={<ChargenQualitaetPage />} />
            <Route path="chargen/qualitaet/:tab" element={<ChargenQualitaetPage />} />
            <Route path="chargen/qualitaet/:tab/:lieferantId" element={<ChargenQualitaetPage />} />
            <Route path="chargenberichte" element={<ChargenBerichtPage />} />
            <Route path="artikelkonto" element={<ArtikelkontoPage />} />
            <Route path="artikelkonto/:artikelNr" element={<ArtikelkontoPage />} />
            <Route path="offeneposten" element={<OffenePostenPage />} />
            <Route path="kassenimport" element={<KassenImportPage />} />
            <Route path="finanzbuchhaltung" element={<FinanzbuchhaltungExportPage />} />
            <Route path="finanzbuchhaltung/intern" element={<InterneFinanzbuchhaltungPage />} />
            
            {/* Lager-Routen */}
            <Route path="lager/bestand" element={<LagerbestandPage />} />
            <Route path="lager/umlagerung" element={<UmlagerungForm />} />
            <Route path="lager/umlagerung/:artikelId" element={<UmlagerungForm />} />
            <Route path="lager/korrektur" element={<LagerkorrekturForm />} />
            <Route path="lager/korrektur/:artikelId" element={<LagerkorrekturForm />} />
            
            {/* Inventur-Routen */}
            <Route path="inventur" element={<InventurPage />} />
            <Route path="inventur/:inventurId/zaehliste" element={<InventurZaehlliste />} />
            <Route path="inventur/:inventurId/erfassung" element={<InventurErfassungDialog />} />
            <Route path="inventur/:inventurId/kontrolle" element={<InventurPage />} />
            <Route path="inventur/:inventurId/bewertung" element={<InventurPage />} />
            <Route path="inventur/:inventurId/warenauswertung" element={<InventurPage />} />
            <Route path="inventur/bestands-vortraege" element={<InventurPage />} />
            <Route path="inventur/export-import" element={<InventurPage />} />
            
            {/* Belegfolge-Routen */}
            <Route path="belegfolge/*" element={<BelegfolgeRoutes />} />
          </Route>
          <Route path="/warenausgang" element={<WarenausgangListe />} />
          <Route path="/warenausgang/neu" element={<WarenausgangFormular />} />
          <Route path="/warenausgang/:id" element={<WarenausgangFormular />} />
          <Route path="/warenausgang/:id/ansicht" element={<WarenausgangFormular readOnly={true} />} />
          <Route path="/wareneingang/neu" element={<WareneingangFormular />} />
          <Route path="/wareneingang/:id" element={<WareneingangFormular />} />
          <Route path="/mobile" element={<MobileMainPage />} />
          <Route path="/mobile/scanner/:modus" element={<MobileScannerPage />} />
          <Route path="/mobile/scanner" element={<MobileScannerPage />} />
          <Route path="/mobile/inventar" element={<MobileScannerPage />} />
          <Route path="/mobile/profil" element={<MobileScannerPage />} />
          <Route path="/mobile/aufgaben" element={<MobileScannerPage />} />
          <Route path="/mobile/aufgaben/:typ/:id" element={<MobileScannerPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 