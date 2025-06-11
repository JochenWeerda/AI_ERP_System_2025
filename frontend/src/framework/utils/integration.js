/**
 * integration.js
 * Hilfsfunktionen zur Integration von OWL mit React
 */
import { mount, unmount } from "@odoo/owl";
import { getModule } from "../core/ModuleRegistry";

/**
 * Erzeugt einen DOM-Container für die OWL-Komponente
 * 
 * @param {string} id - ID für den Container
 * @returns {HTMLElement} - Der DOM-Container
 */
function createContainer(id) {
  const container = document.createElement('div');
  container.id = id || `owl-container-${Date.now()}`;
  container.className = 'owl-container';
  return container;
}

/**
 * React-Hook zum Mounting einer OWL-Komponente in einer React-Komponente
 * 
 * @param {Class} OwlComponent - Die OWL-Komponente, die gemountet werden soll
 * @param {Object} props - Props für die OWL-Komponente
 * @param {Object} options - Weitere Optionen
 * @returns {Object} - Objekt mit Referenz auf Container und Komponente
 */
export function useOwl(OwlComponent, props = {}, options = {}) {
  const { useRef, useEffect, useState } = require('react');
  
  // Ref für den Container der OWL-Komponente
  const containerRef = useRef(null);
  
  // State für die gemountete OWL-Komponente
  const [owlComponent, setOwlComponent] = useState(null);
  
  // Mount der OWL-Komponente beim Rendern der React-Komponente
  useEffect(() => {
    if (!containerRef.current || !OwlComponent) {
      return;
    }
    
    // OWL-Komponente mounten
    const component = mount(OwlComponent, containerRef.current, { props });
    setOwlComponent(component);
    
    // Cleanup beim Unmount der React-Komponente
    return () => {
      if (component) {
        unmount(component);
        setOwlComponent(null);
      }
    };
  }, [OwlComponent, containerRef, JSON.stringify(props)]);
  
  return { containerRef, owlComponent };
}

/**
 * React-Komponente, die eine OWL-Komponente rendert
 * 
 * @param {Object} props - Props für die React-Komponente
 * @param {Class} props.component - Die zu rendernde OWL-Komponente
 * @param {Object} props.props - Props für die OWL-Komponente
 * @param {string} props.className - Zusätzliche CSS-Klassen
 * @returns {React.Element} - Die React-Komponente
 */
export function OwlWrapper({ component, props = {}, className = '' }) {
  const { useRef, useEffect } = require('react');
  
  // Ref für den Container
  const containerRef = useRef(null);
  
  // Mount der OWL-Komponente
  useEffect(() => {
    if (!containerRef.current || !component) {
      return;
    }
    
    // OWL-Komponente mounten
    const owlInstance = mount(component, containerRef.current, { props });
    
    // Cleanup beim Unmount
    return () => {
      unmount(owlInstance);
    };
  }, [component, containerRef, JSON.stringify(props)]);
  
  // Container für die OWL-Komponente rendern
  return <div ref={containerRef} className={`owl-wrapper ${className}`.trim()} />;
}

/**
 * React-Komponente, die ein OWL-Modul anhand seiner ID rendert
 * 
 * @param {Object} props - Props für die React-Komponente
 * @param {string} props.moduleId - ID des OWL-Moduls
 * @param {Object} props.config - Konfiguration für das Modul
 * @param {Function} props.onAction - Callback für Modul-Aktionen
 * @param {Function} props.onError - Callback für Fehler
 * @param {string} props.className - Zusätzliche CSS-Klassen
 * @returns {React.Element} - Die React-Komponente
 */
export function ModuleLoader({ 
  moduleId, 
  config = {}, 
  onAction, 
  onError, 
  onUpdate,
  className = '' 
}) {
  const { useState, useEffect } = require('react');
  
  // State für die geladene Modulklasse
  const [ModuleClass, setModuleClass] = useState(null);
  const [error, setError] = useState(null);
  
  // Modul-Klasse aus der Registry laden
  useEffect(() => {
    if (!moduleId) {
      setError(new Error('Keine Modul-ID angegeben'));
      return;
    }
    
    try {
      const loadedModuleClass = getModule(moduleId);
      
      if (!loadedModuleClass) {
        setError(new Error(`Modul "${moduleId}" nicht gefunden`));
        return;
      }
      
      setModuleClass(loadedModuleClass);
      setError(null);
    } catch (err) {
      setError(err);
      if (onError) {
        onError({ moduleId, error: err });
      }
    }
  }, [moduleId]);
  
  // Fehler-Komponente rendern, wenn ein Fehler aufgetreten ist
  if (error) {
    return (
      <div className="owl-module-error">
        <p className="error-message">Fehler beim Laden des Moduls: {error.message}</p>
      </div>
    );
  }
  
  // Lade-Komponente rendern, wenn das Modul noch nicht geladen ist
  if (!ModuleClass) {
    return (
      <div className="owl-module-loading">
        <p>Modul wird geladen...</p>
      </div>
    );
  }
  
  // Modul-Props zusammenstellen
  const moduleProps = {
    moduleId,
    config,
    onAction,
    onError,
    onUpdate
  };
  
  // Modul in einem OWL-Wrapper rendern
  return (
    <OwlWrapper 
      component={ModuleClass} 
      props={moduleProps} 
      className={`owl-module-container ${className}`.trim()} 
    />
  );
}

export default {
  useOwl,
  OwlWrapper,
  ModuleLoader,
  createContainer
}; 