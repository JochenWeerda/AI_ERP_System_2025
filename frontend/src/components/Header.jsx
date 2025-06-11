import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

/**
 * Header-Komponente im VALEO-Design
 * Diese Komponente wird im Dashboard und allen Unterseiten angezeigt
 */
const Header = () => {
  return (
    <header className="valeo-header">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo-placeholder"></div>
          <h1 className="site-title">VALEO ERP</h1>
        </div>
      </div>
      
      <div className="header-right">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Suchen..." 
            className="search-input" 
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
        
        <div className="user-actions">
          <button className="notification-button" title="Benachrichtigungen">
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
          
          <div className="user-profile">
            <div className="user-avatar-placeholder"></div>
            <span className="user-name">Max Mustermann</span>
          </div>
          
          <button className="menu-button">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;