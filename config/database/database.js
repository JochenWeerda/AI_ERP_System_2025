/**
 * Datenbank-Konfiguration für AI-driven-ERP (NeuroERP)
 */

module.exports = {
  // PostgreSQL-Konfiguration für strukturierte Daten
  postgres: {
    host: 'localhost',
    port: 5432,
    database: 'neuroerp',
    user: 'neuroerp_user',
    password: 'postgres_password', // wird aus .env geladen
    ssl: false,
    schemas: ['accounting', 'inventory', 'invoicing', 'hr', 'reporting'],
    poolSize: 10,
    idleTimeoutMillis: 30000
  },
  
  // MongoDB-Konfiguration für unstrukturierte Daten (Memory-Bank, KI-Modelle)
  mongodb: {
    url: 'mongodb://localhost:27017/neuroerp',
    auth: { username: 'neuroerp_admin', password: 'Passwortist2Bad4Dad' },
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 50,
      minPoolSize: 5
    },
    collections: {
      users: 'users',
      auditLogs: 'auditLogs',
      memoryBank: 'memoryBank',
      aiModels: 'aiModels',
      embeddings: 'embeddings',
      documents: 'documents',
      workflows: 'workflows',
      insights: 'insights'
    }
  },
  
  // Redis-Konfiguration für Caching, Queue-System und PubSub
  redis: {
    host: 'localhost',
    port: 6379,
    password: '',
    db: 0
  }
};
