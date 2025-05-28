import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Theme-Kontext-Typ
interface ThemeContextType {
  theme: Theme;
  toggleColorMode: () => void;
}

// Erstellen des Kontexts
const ThemeContext = createContext<ThemeContextType>({
  theme: createTheme(),
  toggleColorMode: () => {},
});

// Benutzerdefinierter Hook für den Zugriff auf den Kontext
export const useThemeSystem = () => useContext(ThemeContext);

// Theme-Provider-Props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme-Provider-Komponente
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Gespeicherten Modus aus dem localStorage abrufen
  const storedMode = localStorage.getItem('themeMode') as PaletteMode | null;
  const [mode, setMode] = useState<PaletteMode>(storedMode || 'light');

  // Theme-Umschaltfunktion
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Theme erstellen
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#fff' : '#1e1e1e',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1), 0px 4px 5px 0px rgba(0,0,0,0.07), 0px 1px 10px 0px rgba(0,0,0,0.06)',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1), 0px 4px 5px 0px rgba(0,0,0,0.07), 0px 1px 10px 0px rgba(0,0,0,0.06)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '4px',
                textTransform: 'none',
              },
            },
          },
        },
      }),
    [mode],
  );

  // Kontextwerte
  const themeContextValue = {
    theme,
    toggleColorMode,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 