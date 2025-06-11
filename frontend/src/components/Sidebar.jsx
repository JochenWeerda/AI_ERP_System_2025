import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

/**
 * Sidebar-Komponente mit Navigationsmenü für verschiedene App-Bereiche
 */
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('dashboard');

  // Kategorie umschalten
  const toggleCategory = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  // Sidebar umschalten
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Navigation-Links mit Icon und Text
  const navLinks = [
    { 
      id: 'home', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ), 
      text: 'Startseite', 
      path: '/' 
    },
    { 
      id: 'stammdaten', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ), 
      text: 'Stammdaten', 
      submenu: [
        { text: 'Kunden', path: '/kunden' },
        { text: 'Lieferanten', path: '/lieferanten' },
        { text: 'Artikel', path: '/stammdaten/artikel' },
        { text: 'Mitarbeiter', path: '/mitarbeiter' }
      ]
    },
    { 
      id: 'finanzen', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ), 
      text: 'Finanzen', 
      submenu: [
        { text: 'Buchhaltung', path: '/finanzen/buchhaltung' },
        { text: 'Rechnungen', path: '/finanzen/rechnungen' },
        { text: 'Export', path: '/finanzen/export' }
      ]
    },
    { 
      id: 'belege', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ), 
      text: 'Belege', 
      path: '/belege' 
    },
    { 
      id: 'landwirtschaft', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8z" />
          <path d="M20 10h-4l-2-6-2 6H8" />
          <path d="M4 10l4 6 4-6 4 6 4-6" />
        </svg>
      ), 
      text: 'Landwirtschaft', 
      submenu: [
        { text: 'Pflanzenschutz', path: '/landwirtschaft/pflanzenschutz' },
        { text: 'Getreideannahme', path: '/landwirtschaft/getreideannahme' },
        { text: 'THG-Quote', path: '/landwirtschaft/thg-quote' }
      ]
    },
    { 
      id: 'lager', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <path d="M3 3h18v18H3z" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      ), 
      text: 'Lager', 
      submenu: [
        { text: 'Bestand', path: '/lager/bestand' },
        { text: 'Chargen', path: '/lager/chargen' },
        { text: 'Lagerorte', path: '/lager/orte' },
        { text: 'Chargen-Integration', path: '/inventory/chargen-integration' }
      ]
    },
    { 
      id: 'verkauf', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ), 
      text: 'Verkauf', 
      submenu: [
        { text: 'Aufträge', path: '/verkauf/auftraege' },
        { text: 'Angebote', path: '/verkauf/angebote' },
        { text: 'Online-Shop', path: '/verkauf/online-shop' }
      ]
    },
    { 
      id: 'einkauf', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
          <polyline points="2 8 12 16 22 8" />
          <polyline points="2 4 12 12 22 4" />
        </svg>
      ), 
      text: 'Einkauf', 
      submenu: [
        { text: 'Bestellungen', path: '/einkauf/bestellungen' },
        { text: 'Lieferanten', path: '/einkauf/lieferanten' },
        { text: 'Wareneingang', path: '/einkauf/wareneingang' }
      ]
    },
    { 
      id: 'berichte', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ), 
      text: 'Berichte', 
      path: '/berichte' 
    },
    { 
      id: 'einstellungen', 
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ), 
      text: 'Einstellungen', 
      path: '/einstellungen' 
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
          {collapsed ? (
            <polyline points="9 18 15 12 9 6" />
          ) : (
            <polyline points="15 18 9 12 15 6" />
          )}
        </svg>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navLinks.map((link) => (
            <li key={link.id} className={`nav-item ${activeCategory === link.id ? 'active' : ''}`}>
              {link.submenu ? (
                <>
                  <div 
                    className="nav-link has-submenu" 
                    onClick={() => toggleCategory(link.id)}
                  >
                    <span className="nav-icon">{link.icon}</span>
                    <span className="nav-text">{link.text}</span>
                    <span className="submenu-toggle">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                        <polyline points={activeCategory === link.id ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                      </svg>
                    </span>
                  </div>
                  {activeCategory === link.id && (
                    <ul className="submenu">
                      {link.submenu.map((subItem, index) => (
                        <li key={index} className="submenu-item">
                          <NavLink 
                            to={subItem.path} 
                            className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}
                          >
                            {subItem.text}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink 
                  to={link.path} 
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-text">{link.text}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-status">
          <div className="status-indicator online"></div>
          <span className="status-text">Verbunden</span>
        </div>
        <div className="support-link">
          <NavLink to="/support" className="support-button">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Support</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 