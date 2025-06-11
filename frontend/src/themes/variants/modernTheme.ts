import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeMode, ThemeParameters } from '../themeTypes';

/**
 * Modern Theme Variante
 * Ein flaches, luftiges Design mit viel Weißraum und klaren visuellen Hierarchien
 */
const modernTheme = (mode: ThemeMode, parameters: ThemeParameters) => {
  // Basis-Farbschema entsprechend des ausgewählten Modus
  const isDark = mode === 'dark';
  const isHighContrast = mode === 'highContrast';
  
  // Visuelle Dichte für Abstände
  const density = parameters.visualDensity || 'medium';
  const spacing = parameters.spacing || 'normal';
  
  // Erweiterte Basis-Abstände für mehr Weißraum
  const spacingUnit = spacing === 'compact' ? 6 : (spacing === 'comfortable' ? 14 : 10);
  
  // Radius für Ecken - etwas größere Radien für weichere Erscheinung
  const borderRadiusValue = parameters.borderRadius === 'none' ? 0 : 
                           parameters.borderRadius === 'small' ? 6 : 
                           parameters.borderRadius === 'medium' ? 10 : 
                           parameters.borderRadius === 'large' ? 18 : 8;
  
  // Moderne Farbpalette mit harmonischen, leichteren Farben
  const modernPalette = {
    // Hellmodus
    light: {
      primary: {
        main: '#3F72AF', // Sanftes Blau
        light: '#7AB4EF',
        dark: '#1A4A8C',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#FF7E67', // Koralle
        light: '#FFAC9D',
        dark: '#D84936',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#F44336',
        light: '#E57373',
        dark: '#D32F2F',
      },
      warning: {
        main: '#FFA726',
        light: '#FFB74D',
        dark: '#F57C00',
      },
      info: {
        main: '#29B6F6',
        light: '#4FC3F7',
        dark: '#0288D1',
      },
      success: {
        main: '#66BB6A',
        light: '#81C784',
        dark: '#388E3C',
      },
      background: {
        default: '#F8F9FA', // Sehr helles Grau für den Hintergrund
        paper: '#FFFFFF',
      },
      text: {
        primary: '#2C3E50', // Dunkleres Blau für besseren Kontrast
        secondary: '#7F8C8D',
      },
      divider: 'rgba(0, 0, 0, 0.08)', // Leichtere Trennlinien
    },
    // Dunkelmodus
    dark: {
      primary: {
        main: '#7AB4EF', // Helleres Blau für dunklen Modus
        light: '#A3D0FF',
        dark: '#5389C2',
        contrastText: '#121212',
      },
      secondary: {
        main: '#FF9D8A', // Hellere Koralle für dunklen Modus
        light: '#FFBCB1',
        dark: '#E57C6D',
        contrastText: '#121212',
      },
      error: {
        main: '#F87171',
        light: '#FDA4AF',
        dark: '#DC2626',
      },
      warning: {
        main: '#FBBF24',
        light: '#FCD34D',
        dark: '#D97706',
      },
      info: {
        main: '#60A5FA',
        light: '#93C5FD',
        dark: '#2563EB',
      },
      success: {
        main: '#34D399',
        light: '#6EE7B7',
        dark: '#059669',
      },
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
      text: {
        primary: '#ECEFF1', // Leicht off-white für bessere Lesbarkeit
        secondary: '#B0BEC5',
      },
      divider: 'rgba(255, 255, 255, 0.08)', // Leichtere Trennlinien im Dark Mode
    },
    // Hoher Kontrast
    highContrast: {
      primary: {
        main: '#FFFFFF',
        light: '#FFFFFF',
        dark: '#CCCCCC',
        contrastText: '#000000',
      },
      secondary: {
        main: '#FFFF00',
        light: '#FFFF99',
        dark: '#CCCC00',
        contrastText: '#000000',
      },
      background: {
        default: '#000000',
        paper: '#111111',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#FFFF00',
      },
    },
  };

  // Ausgewählte Farbpalette je nach Modus
  const selectedPalette = isHighContrast ? modernPalette.highContrast : 
                          isDark ? modernPalette.dark : 
                          modernPalette.light;

  // Subtilere Schatten für ein eleganteres Design
  const shadows = isDark ? [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.12)',
    '0px 1px 3px rgba(0, 0, 0, 0.15)',
    '0px 1px 4px rgba(0, 0, 0, 0.18)',
    '0px 2px 4px rgba(0, 0, 0, 0.18)',
    '0px 3px 5px rgba(0, 0, 0, 0.18)',
    '0px 3px 6px rgba(0, 0, 0, 0.18)',
    '0px 4px 6px rgba(0, 0, 0, 0.18)',
    '0px 5px 7px rgba(0, 0, 0, 0.18)',
    '0px 5px 8px rgba(0, 0, 0, 0.18)',
    '0px 6px 9px rgba(0, 0, 0, 0.18)',
    '0px 7px 10px rgba(0, 0, 0, 0.18)',
    '0px 8px 12px rgba(0, 0, 0, 0.18)',
    '0px 9px 14px rgba(0, 0, 0, 0.18)',
    '0px 10px 16px rgba(0, 0, 0, 0.18)',
    '0px 11px 18px rgba(0, 0, 0, 0.18)',
    '0px 12px 20px rgba(0, 0, 0, 0.18)',
    '0px 13px 22px rgba(0, 0, 0, 0.18)',
    '0px 14px 24px rgba(0, 0, 0, 0.18)',
    '0px 15px 26px rgba(0, 0, 0, 0.18)',
    '0px 16px 28px rgba(0, 0, 0, 0.18)',
    '0px 17px 30px rgba(0, 0, 0, 0.18)',
    '0px 18px 32px rgba(0, 0, 0, 0.18)',
    '0px 19px 34px rgba(0, 0, 0, 0.18)',
  ] : [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.03)',
    '0px 1px 3px rgba(0, 0, 0, 0.05)',
    '0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 2px 6px rgba(0, 0, 0, 0.07)',
    '0px 3px 8px rgba(0, 0, 0, 0.08)',
    '0px 3px 9px rgba(0, 0, 0, 0.08)',
    '0px 4px 10px rgba(0, 0, 0, 0.08)',
    '0px 4px 11px rgba(0, 0, 0, 0.08)',
    '0px 4px 12px rgba(0, 0, 0, 0.08)',
    '0px 5px 13px rgba(0, 0, 0, 0.08)',
    '0px 5px 14px rgba(0, 0, 0, 0.08)',
    '0px 6px 15px rgba(0, 0, 0, 0.08)',
    '0px 6px 16px rgba(0, 0, 0, 0.08)',
    '0px 7px 17px rgba(0, 0, 0, 0.08)',
    '0px 7px 18px rgba(0, 0, 0, 0.08)',
    '0px 8px 19px rgba(0, 0, 0, 0.08)',
    '0px 8px 20px rgba(0, 0, 0, 0.08)',
    '0px 9px 21px rgba(0, 0, 0, 0.08)',
    '0px 9px 22px rgba(0, 0, 0, 0.08)',
    '0px 10px 23px rgba(0, 0, 0, 0.08)',
    '0px 10px 24px rgba(0, 0, 0, 0.08)',
    '0px 11px 25px rgba(0, 0, 0, 0.08)',
    '0px 11px 26px rgba(0, 0, 0, 0.08)',
  ];

  // Moderne Schriftarten: System-UI-Schriftart für ein natives Erscheinungsbild
  const fontFamily = parameters.fontFamily || 
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

  // Theme-Optionen
  const themeOptions: ThemeOptions = {
    palette: {
      mode: isDark || isHighContrast ? 'dark' : 'light',
      ...selectedPalette,
    },
    typography: {
      fontFamily: fontFamily,
      fontSize: parameters.fontSize === 'small' ? 14 : 
               parameters.fontSize === 'large' ? 16 : 15,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600, // Etwas leichter für moderneres Aussehen
      h1: {
        fontSize: parameters.fontSize === 'small' ? '2.2rem' : 
                 parameters.fontSize === 'large' ? '3rem' : '2.5rem',
        fontWeight: 600,
        letterSpacing: '-0.025em',
        marginBottom: '0.5em',
      },
      h2: {
        fontSize: parameters.fontSize === 'small' ? '1.8rem' : 
                 parameters.fontSize === 'large' ? '2.5rem' : '2.1rem',
        fontWeight: 500,
        letterSpacing: '-0.0125em',
        marginBottom: '0.5em',
      },
      h3: {
        fontSize: parameters.fontSize === 'small' ? '1.5rem' : 
                 parameters.fontSize === 'large' ? '2.1rem' : '1.8rem',
        fontWeight: 500,
        letterSpacing: '0em',
        marginBottom: '0.5em',
      },
      h4: {
        fontWeight: 500,
        letterSpacing: '0.0025em',
        marginBottom: '0.5em',
      },
      h5: {
        fontWeight: 500,
        letterSpacing: '0em',
        marginBottom: '0.5em',
      },
      h6: {
        fontWeight: 500,
        letterSpacing: '0.0025em',
        marginBottom: '0.5em',
      },
      subtitle1: {
        fontSize: '1.1rem',
        fontWeight: 400,
        letterSpacing: '0.005em',
      },
      subtitle2: {
        fontWeight: 500,
        letterSpacing: '0.0025em',
      },
      body1: {
        fontSize: parameters.fontSize === 'small' ? '0.95rem' : 
                 parameters.fontSize === 'large' ? '1.1rem' : '1rem',
        letterSpacing: '0.0025em',
        lineHeight: 1.6,
      },
      body2: {
        letterSpacing: '0.0025em',
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none', // Modern: keine Großbuchstaben für Buttons
        fontWeight: 500,
        letterSpacing: '0.01em',
      },
      caption: {
        letterSpacing: '0.0025em',
      },
      overline: {
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      },
    },
    spacing: spacingUnit,
    shape: {
      borderRadius: borderRadiusValue,
    },
    shadows: isHighContrast ? Array(25).fill('none') : shadows,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? '#2D3748' : '#F1F5F9',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? '#4A5568' : '#CBD5E1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: isDark ? '#718096' : '#94A3B8',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadiusValue,
            padding: `${spacingUnit/1.5}px ${spacingUnit*1.5}px`,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: isHighContrast ? 'none' : undefined,
            ':hover': {
              boxShadow: isHighContrast ? 'none' : undefined,
              transform: 'translateY(-1px)',
              transition: 'transform 0.2s ease-in-out',
            },
          },
          contained: {
            boxShadow: isHighContrast ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
          },
          outlined: {
            borderWidth: '1px',
            '&:hover': {
              borderWidth: '1px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            },
          },
          // Größere Abstände für Buttons mit Icons
          startIcon: {
            marginRight: '8px',
          },
          endIcon: {
            marginLeft: '8px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isHighContrast ? 'none' : undefined,
            transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
            overflow: 'hidden', // Verhindert, dass Inhalte über abgerundete Ecken hinausragen
          },
          elevation1: {
            boxShadow: isHighContrast ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
          },
          elevation2: {
            boxShadow: isHighContrast ? 'none' : '0 1px 5px rgba(0,0,0,0.07)',
          },
          elevation3: {
            boxShadow: isHighContrast ? 'none' : '0 2px 6px rgba(0,0,0,0.08)',
          },
          elevation4: {
            boxShadow: isHighContrast ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
          },
          rounded: {
            borderRadius: borderRadiusValue,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isHighContrast ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderRadiusValue * 1.5,
            padding: `${spacingUnit/2}px`,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isHighContrast ? 'none' : (isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'),
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: spacingUnit,
            '&:last-child': {
              paddingBottom: spacingUnit,
            },
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: spacingUnit,
          },
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            padding: `0 ${spacingUnit}px ${spacingUnit/2}px`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: borderRadiusValue,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            margin: `${spacingUnit}px 0`,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: borderRadiusValue,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: borderRadiusValue,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1px',
            },
          },
          notchedOutline: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            transition: 'border-color 0.2s ease-in-out',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: `${spacingUnit/1.5}px ${spacingUnit}px`,
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          },
          head: {
            fontWeight: 600,
            color: isDark ? '#ECEFF1' : '#2C3E50',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: borderRadiusValue/2,
            margin: '2px 0',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            padding: `${spacingUnit/1.5}px ${spacingUnit}px`,
            minWidth: 'auto',
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none',
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

export default modernTheme; 