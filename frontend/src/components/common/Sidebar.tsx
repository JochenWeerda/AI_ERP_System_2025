// Füge einen Menüpunkt für den KI-Assistenten in der Sidebar hinzu

// Importiere das SmartToy-Icon für den KI-Assistenten
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Füge den KI-Assistenten zur Liste der Menüpunkte hinzu
const menuItems = [
  // ... existing menu items ...
  {
    title: 'KI-Assistent',
    icon: <SmartToyIcon />,
    path: '/ai-assistant',
    badge: { value: 'NEU', color: 'success' }
  },
  // ... existing code ...
]; 