/**
 * Redis-Cache-Konfiguration für AI-driven-ERP (NeuroERP)
 */

module.exports = {
  // Redis-Verbindungseinstellungen
  connection: {
    host: 'localhost',
    port: 6379,
    db: 0,
    connectTimeout: 10000,
    retryStrategy: (times) => {
      if (times > 10) {
        return null;
      }
      return Math.min(times * 100, 3000);
    }
  },
  
  // Cache-Einstellungen für verschiedene Datentypen
  ttl: {
    // Kurzzeitige Caches (wenige Sekunden)
    ephemeral: 30,
    
    // Standard-Cache (einige Minuten)
    default: 300,
    
    // Langzeit-Cache (1 Stunde)
    longTerm: 3600,
    
    // Spezifische Einstellungen für verschiedene Datentypen
    user: 1800,
    product: 1800,
    catalog: 3600,
    report: 600,
    dashboard: 300,
    
    // Einstellungen für Memory Bank
    memoryRecent: 1800,
    memoryFrequent: 86400,
    memoryPermanent: 0 // 0 = kein Ablauf
  },
  
  // Cache-Schlüsselpräfixe
  keyPrefix: {
    pg: 'pg:',      // PostgreSQL-Daten
    mongo: 'mdb:',  // MongoDB-Daten
    user: 'usr:',   // Benutzerdaten
    memory: 'mem:', // Memory Bank
    llm: 'llm:',    // LLM-bezogene Daten
    queue: 'q:',    // Nachrichtenwarteschlangen
    lock: 'lock:'   // Distributed Locks
  },
  
  // Queue-Konfiguration
  queues: [
    'tasks',
    'notifications',
    'emails',
    'analytics',
    'llm-requests'
  ],
  
  // PubSub-Kanäle
  channels: [
    'system-events',
    'user-notifications',
    'dashboard-updates',
    'memory-updates',
    'model-updates'
  ]
};
