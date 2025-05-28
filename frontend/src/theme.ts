import { createTheme } from '@mui/material/styles';

// Odoo-inspiriertes Theme
const theme = createTheme({
  palette: {
    primary: {
      // Odoo Hauptfarbe - violett/lila
      main: '#7C7BAD',
      light: '#9D9BC5',
      dark: '#5D5A8D',
    },
    secondary: {
      // Odoo-Akzentfarbe - orange
      main: '#F0AD4E',
      light: '#F8C885',
      dark: '#D08E29',
    },
    success: {
      main: '#28a745', // Grün für Erfolg
      light: '#48c765',
      dark: '#1e7e34',
    },
    info: {
      main: '#5bc0de', // Blau für Informationen
      light: '#7dcde8',
      dark: '#31b0d5',
    },
    warning: {
      main: '#f0ad4e', // Orange für Warnungen
      light: '#f4c37d',
      dark: '#ec971f',
    },
    error: {
      main: '#dc3545', // Rot für Fehler
      light: '#e35d6a',
      dark: '#bd2130',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
    divider: '#e9ecef',
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Lato',
      'Open Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 400,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 400,
      marginBottom: '0.75rem',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
      marginBottom: '0.5rem',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      marginBottom: '0.5rem',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#6c757d',
    },
    body1: {
      fontSize: '0.9rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 3,
          padding: '8px 16px',
          boxShadow: 'none',
          fontWeight: 500,
          '&:hover': {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          },
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f8f9fa',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
        },
      },
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
});

export default theme; 