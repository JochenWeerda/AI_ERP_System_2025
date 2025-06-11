import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Grid, 
  Typography, 
  Box, 
  Container, 
  Divider, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import AppTile from '../AppTile';
import './AppTiles.css';

/**
 * AppTiles-Komponente - Zeigt App-Kacheln in gruppierten Kategorien an
 */
const AppTiles = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Bestimme die Anzahl der Spalten basierend auf der Bildschirmgröße
  const getGridColumns = () => {
    if (isMobile) return 2; // 2 Spalten auf Mobilgeräten
    if (isTablet) return 3; // 3 Spalten auf Tablets
    return 4; // 4 Spalten auf größeren Bildschirmen
  };
  
  // App-Kategorien mit ihren zugehörigen Apps
  const appCategories = [
    {
      id: 'erp',
      title: 'ERP-Kernmodule',
      apps: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
          ),
          path: '/',
          badge: null
        },
        {
          id: 'finanzen',
          title: 'Finanzen',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          ),
          path: '/finanzen/dashboard',
          badge: null
        },
        {
          id: 'belege',
          title: 'Belege & Dokumente',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          ),
          path: '/belegfolge',
          badge: null
        },
        {
          id: 'transactions',
          title: 'Transaktionen',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          ),
          path: '/transactions',
          badge: 'Neu'
        }
      ]
    },
    {
      id: 'stammdaten',
      title: 'Stammdaten',
      apps: [
        {
          id: 'kunden',
          title: 'Kunden',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
          path: '/kunden',
          badge: 3,
          isStammdaten: true
        },
        {
          id: 'lieferanten',
          title: 'Lieferanten',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          ),
          path: '/lieferanten',
          badge: null,
          isStammdaten: true
        },
        {
          id: 'artikel',
          title: 'Artikel',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M21 10H3" />
              <path d="M21 6H3" />
              <path d="M21 14H3" />
              <path d="M21 18H3" />
            </svg>
          ),
          path: '/artikel',
          badge: null,
          isStammdaten: true
        },
        {
          id: 'mitarbeiter',
          title: 'Mitarbeiter',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
          path: '/mitarbeiter',
          badge: null,
          isStammdaten: true
        }
      ]
    },
    {
      id: 'landwirtschaft',
      title: 'Landwirtschaft',
      apps: [
        {
          id: 'pflanzenschutz',
          title: 'Pflanzenschutz',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          ),
          path: '/landwirtschaft/pflanzenschutz',
          badge: null
        },
        {
          id: 'getreideannahme',
          title: 'Getreideannahme',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M3 3h18v18H3z" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          ),
          path: '/landwirtschaft/getreideannahme',
          badge: 5
        },
        {
          id: 'thg-quote',
          title: 'THG-Quote',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8z" />
              <path d="M20 10h-4l-2-6-2 6H8" />
              <path d="M4 10l4 6 4-6 4 6 4-6" />
            </svg>
          ),
          path: '/landwirtschaft/thg-quote',
          badge: null
        }
      ]
    },
    {
      id: 'warenmanagement',
      title: 'Warenmanagement',
      apps: [
        {
          id: 'lager',
          title: 'Lager',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M9 3v18" />
              <path d="M15 3v18" />
            </svg>
          ),
          path: '/lager/bestand',
          badge: null
        },
        {
          id: 'verkauf',
          title: 'Verkauf',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          ),
          path: '/belegfolge/rechnungen',
          badge: null
        },
        {
          id: 'einkauf',
          title: 'Einkauf',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
              <polyline points="2 8 12 16 22 8" />
              <polyline points="2 4 12 12 22 4" />
            </svg>
          ),
          path: '/belegfolge/bestellungen',
          badge: null
        }
      ]
    },
    {
      id: 'ki',
      title: 'KI-Assistenten & Intelligenz',
      apps: [
        {
          id: 'ai-assistant',
          title: 'KI-Assistent',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          ),
          path: '/ai-assistant',
          badge: 'NEU'
        },
        {
          id: 'analytics',
          title: 'Datenanalyse',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
          ),
          path: '/analytics',
          badge: null
        },
        {
          id: 'anomalien',
          title: 'Anomalie-Erkennung',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
          path: '/anomalien',
          badge: null
        },
        {
          id: 'ontology',
          title: 'Ontologie-Explorer',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
          path: '/ontology',
          badge: 'NEU'
        }
      ]
    },
    {
      id: 'system',
      title: 'System',
      apps: [
        {
          id: 'systemstatus',
          title: 'System-Status',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          ),
          path: '/health-connectors',
          badge: null
        },
        {
          id: 'einstellungen',
          title: 'Einstellungen',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          ),
          path: '/einstellungen',
          badge: null
        },
        {
          id: 'theme-settings',
          title: 'Design & Theme',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
            </svg>
          ),
          path: '/einstellungen/theme',
          badge: null
        }
      ]
    },
    {
      id: 'kommunikation',
      title: 'Kommunikation',
      apps: [
        {
          id: 'team-chat',
          title: 'Team-Chat',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          ),
          path: '/chat/team',
          badge: 3
        },
        {
          id: 'kunden-chat',
          title: 'Kunden-Chat',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          ),
          path: '/chat/kunden',
          badge: 1
        },
        {
          id: 'notifications',
          title: 'Benachrichtigungen',
          icon: (
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          ),
          path: '/notifications',
          badge: 5
        }
      ]
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {appCategories.map((category, index) => (
        <Box
          key={category.id}
          sx={{
            mb: 6,
            pb: 4,
            position: 'relative',
            '&:not(:last-child)': {
              borderBottom: 1,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            },
          }}
        >
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{
              mb: 3,
              fontWeight: 600,
              position: 'relative',
              display: 'inline-block',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -4,
                left: 0,
                width: '2em',
                height: 3,
                borderRadius: '3px',
                bgcolor: theme.palette.primary.main,
              }
            }}
          >
            {category.title}
          </Typography>
          
          <Grid container spacing={3}>
            {category.apps.map((app) => (
              <Grid item xs={6} sm={4} md={3} key={app.id}>
                <AppTile
                  title={app.title}
                  icon={app.icon}
                  path={app.path}
                  badge={app.badge}
                  isStammdaten={app.isStammdaten}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

export default AppTiles; 