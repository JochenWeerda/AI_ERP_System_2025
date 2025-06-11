import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Paper,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Warehouse as WarehouseIcon,
  ListAlt as InventurIcon,
  LocalShipping as WarenausgangsIcon,
  Scale as WaageIcon,
  AccountBalance as FinanzbuchhaltungIcon,
  ContactPhone as CRMIcon,
  Chat as ChatIcon,
  Biotech as ChargenberichtIcon,
  VerifiedUser as QualitaetIcon,
  MenuBook as QualitaetsHandbuchIcon,
  Security as TSEIcon,
  PhoneAndroid as MobileIcon,
  Palette as ThemeIcon,
  Warning as AnomalyIcon,
  CloudUpload as ImportIcon
} from '@mui/icons-material';
import HorizontalLayout from '../components/layout/HorizontalLayout';

// Dynamischer Import der Container-Klassen
const ModuleContainer = React.lazy(() => import('../framework/examples/ModulContainer'));
const ContainerLoader = React.lazy(() => import('../framework/examples/ContainerLoader'));

// Definiere die Module als Apps
const moduleApps = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    containerId: 'dashboard-container',
    moduleId: 'dashboard-module',
    url: '/api/modules/dashboard/index.js',
    title: 'Dashboard',
    description: 'Hauptübersicht'
  },
  {
    id: 'stammdaten',
    label: 'Stammdaten',
    icon: <InventoryIcon />,
    containerId: 'stammdaten-container',
    moduleId: 'artikel-container',
    url: '/api/modules/stammdaten/index.js',
    title: 'Stammdatenverwaltung',
    description: 'Verwaltung von Artikeln, Lagern und Partnern'
  },
  {
    id: 'belege',
    label: 'Belege',
    icon: <AssignmentIcon />,
    containerId: 'belege-container',
    moduleId: 'beleg-container',
    url: '/api/modules/belege/index.js',
    title: 'Belegverwaltung',
    description: 'Verwaltung von Ein- und Verkaufsbelegen'
  },
  {
    id: 'auswertung',
    label: 'Auswertungen',
    icon: <AssessmentIcon />,
    containerId: 'auswertung-container',
    moduleId: 'auswertung-container',
    url: '/api/modules/auswertung/index.js',
    title: 'Auswertungen',
    description: 'Finanz- und Lagerauswertungen'
  },
  {
    id: 'partner',
    label: 'Partner',
    icon: <PeopleIcon />,
    containerId: 'partner-container',
    moduleId: 'partner-container',
    url: '/api/modules/partner/index.js',
    title: 'Partnerverwaltung',
    description: 'Verwaltung von Kunden und Lieferanten'
  },
  {
    id: 'lager',
    label: 'Lager',
    icon: <WarehouseIcon />,
    containerId: 'lager-container',
    moduleId: 'lager-module',
    url: '/api/modules/lager/index.js',
    title: 'Lagerverwaltung',
    description: 'Bestand und Lagerkorrektur'
  },
  {
    id: 'inventur',
    label: 'Inventur',
    icon: <InventurIcon />,
    containerId: 'inventur-container',
    moduleId: 'inventur-module',
    url: '/api/modules/inventur/index.js',
    title: 'Inventur',
    description: 'Inventurerfassung und -auswertung'
  },
  {
    id: 'warenausgang',
    label: 'Warenausgang',
    icon: <WarenausgangsIcon />,
    containerId: 'warenausgang-container',
    moduleId: 'warenausgang-module',
    url: '/api/modules/warenausgang/index.js',
    title: 'Warenausgang',
    description: 'Verwaltung des Warenausgangs'
  },
  {
    id: 'waage',
    label: 'Waage',
    icon: <WaageIcon />,
    containerId: 'waage-container',
    moduleId: 'waage-module',
    url: '/api/modules/waage/index.js',
    title: 'Waagenmodul',
    description: 'Anbindung an Wiegegeräte'
  },
  {
    id: 'finanzbuchhaltung',
    label: 'Finanzbuchhaltung',
    icon: <FinanzbuchhaltungIcon />,
    containerId: 'finanzbuchhaltung-container',
    moduleId: 'finanzbuchhaltung-module',
    url: '/api/modules/finanzbuchhaltung/index.js',
    title: 'Finanzbuchhaltung',
    description: 'Buchungen und Kontenübersicht'
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: <CRMIcon />,
    containerId: 'crm-container',
    moduleId: 'crm-module',
    url: '/api/modules/crm/index.js',
    title: 'CRM',
    description: 'Kundenbeziehungsmanagement'
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: <ChatIcon />,
    containerId: 'chat-container',
    moduleId: 'chat-module',
    url: '/api/modules/chat/index.js',
    title: 'Chat',
    description: 'Intern, Kunden, VALERO KI'
  },
  {
    id: 'chargenbericht',
    label: 'Chargenbericht',
    icon: <ChargenberichtIcon />,
    containerId: 'chargenbericht-container',
    moduleId: 'chargenbericht-module',
    url: '/api/modules/chargenbericht/index.js',
    title: 'Chargenbericht',
    description: 'Verwaltung von Chargenberichten'
  },
  {
    id: 'qualitaet',
    label: 'Qualität',
    icon: <QualitaetIcon />,
    containerId: 'qualitaet-container',
    moduleId: 'qualitaet-module',
    url: '/api/modules/qualitaet/index.js',
    title: 'Qualitätsmanagement',
    description: 'Qualitätssicherung und -kontrolle'
  },
  {
    id: 'qualitaetshandbuch',
    label: 'Qualitätshandbuch',
    icon: <QualitaetsHandbuchIcon />,
    containerId: 'qualitaetshandbuch-container',
    moduleId: 'qualitaetshandbuch-module',
    url: '/api/modules/qualitaetshandbuch/index.js',
    title: 'Qualitätshandbuch',
    description: 'Dokumentation des Qualitätsmanagements'
  },
  {
    id: 'tse',
    label: 'TSE',
    icon: <TSEIcon />,
    containerId: 'tse-container',
    moduleId: 'tse-module',
    url: '/api/modules/tse/index.js',
    title: 'TSE',
    description: 'Technische Sicherheitseinrichtung'
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: <MobileIcon />,
    containerId: 'mobile-container',
    moduleId: 'mobile-module',
    url: '/api/modules/mobile/index.js',
    title: 'Mobile',
    description: 'Mobile Anwendungen'
  },
  {
    id: 'theme',
    label: 'Themes',
    icon: <ThemeIcon />,
    containerId: 'theme-container',
    moduleId: 'theme-module',
    url: '/api/modules/theme/index.js',
    title: 'Themes',
    description: 'Anpassung des Erscheinungsbilds'
  },
  {
    id: 'anomaly',
    label: 'Anomalien',
    icon: <AnomalyIcon />,
    containerId: 'anomaly-container',
    moduleId: 'anomaly-module',
    url: '/api/modules/anomaly/index.js',
    title: 'Anomalien',
    description: 'Anomalieerkennung und -meldung'
  },
  {
    id: 'import',
    label: 'Import',
    icon: <ImportIcon />,
    containerId: 'import-container',
    moduleId: 'import-module',
    url: '/api/modules/import/index.js',
    title: 'CSV-Import',
    description: 'Datenimport aus L3'
  }
];

// Konfiguriere die Module für den ContainerLoader
const getLoaderConfig = () => ({
  containerId: 'module-container',
  availableModules: moduleApps.map(app => ({
    id: app.moduleId,
    title: app.title,
    description: app.description,
    url: app.url
  })),
  onModuleEvent: (event: any) => {
    console.log('Module-Event:', event);
  }
});

const AppContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [containerLoader, setContainerLoader] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Container-Loader initialisieren
  useEffect(() => {
    const initializeLoader = async () => {
      try {
        setLoading(true);
        
        // ContainerLoader dynamisch importieren
        const { createContainerLoader } = await import('../framework/examples/ContainerLoader');
        
        // ContainerLoader erstellen
        const loader = createContainerLoader(getLoaderConfig());
        
        // Module registrieren
        await loader.loadAllModules().catch(err => {
          console.warn('Einige Module konnten nicht geladen werden:', err);
          // Wir setzen hier keinen Fehler, damit die App trotzdem funktioniert
        });
        
        setContainerLoader(loader);
        setLoading(false);
      } catch (err: any) {
        console.error('Fehler beim Initialisieren des Container-Loaders:', err);
        setError(err.message || 'Fehler beim Laden der Module');
        setLoading(false);
      }
    };

    initializeLoader();
  }, []);

  // Tab wechseln und entsprechendes Modul laden
  const handleTabChange = async (tabId: string) => {
    setActiveTab(tabId);
    
    if (!containerLoader) return;
    
    try {
      // Aktuelle App finden
      const app = moduleApps.find(app => app.id === tabId);
      
      if (!app) {
        console.error(`Keine App für Tab ${tabId} gefunden`);
        return;
      }
      
      // Vorheriges Modul entladen
      if (containerLoader.activeModules) {
        Object.keys(containerLoader.activeModules).forEach(async (moduleId) => {
          await containerLoader.unloadModule(moduleId);
        });
      }
      
      // Neues Modul laden
      await containerLoader.loadModule(app.moduleId, {
        title: app.title
      });
    } catch (err: any) {
      console.error(`Fehler beim Laden des Moduls für Tab ${tabId}:`, err);
      setError(`Fehler beim Laden des Moduls: ${err.message}`);
    }
  };

  return (
    <HorizontalLayout
      title="Valero ERP-System"
      tabs={moduleApps.map(app => ({
        id: app.id,
        label: app.label,
        icon: app.icon
      }))}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <React.Suspense fallback={<CircularProgress />}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Paper 
            elevation={0} 
            sx={{ 
              minHeight: '60vh', 
              p: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box id="module-container" sx={{ height: '100%' }}>
              {/* Module werden hier dynamisch geladen */}
              {!containerLoader && (
                <Typography variant="h6" color="text.secondary" align="center" sx={{ pt: 10 }}>
                  Module werden geladen...
                </Typography>
              )}
            </Box>
          </Paper>
        )}
      </React.Suspense>
    </HorizontalLayout>
  );
};

export default AppContainer; 