/**
 * Observability-Modul für Node.js-Services im ERP-System.
 * Implementiert Metriken, Tracing und strukturiertes Logging.
 */

'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Prüfen, ob Prometheus verfügbar ist
let prometheus;
try {
  prometheus = require('prom-client');
} catch (e) {
  console.warn('prom-client nicht installiert. Metriken werden deaktiviert.');
}

// Prüfen, ob Jaeger verfügbar ist
let jaeger;
let opentracing;
try {
  jaeger = require('jaeger-client');
  opentracing = require('opentracing');
} catch (e) {
  console.warn('jaeger-client oder opentracing nicht installiert. Tracing wird deaktiviert.');
}

// Prüfen, ob Winston verfügbar ist
let winston;
try {
  winston = require('winston');
} catch (e) {
  console.warn('winston nicht installiert. Strukturiertes Logging wird deaktiviert.');
}

/**
 * Hauptklasse für Observability-Funktionen
 */
class NodeObservability {
  /**
   * Erstellt eine neue Observability-Instanz
   * @param {Object} options - Konfigurationsoptionen
   * @param {boolean} options.enableMetrics - Metriken aktivieren
   * @param {boolean} options.enableTracing - Tracing aktivieren
   * @param {boolean} options.enableLogging - Strukturiertes Logging aktivieren
   * @param {string} options.serviceName - Name des Services
   * @param {string} options.metricsEndpoint - Pfad für Metriken-Endpunkt
   * @param {Object} options.tracingConfig - Konfiguration für Tracing
   * @param {Object} options.loggingConfig - Konfiguration für Logging
   */
  constructor(options = {}) {
    this.options = Object.assign({
      enableMetrics: process.env.ENABLE_METRICS === 'true',
      enableTracing: process.env.ENABLE_TRACING === 'true',
      enableLogging: true,
      serviceName: process.env.SERVICE_NAME || 'nodejs-service',
      metricsEndpoint: process.env.METRICS_PATH || '/metrics',
      tracingConfig: {
        serviceName: process.env.JAEGER_SERVICE_NAME || process.env.SERVICE_NAME || 'nodejs-service',
        agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
        agentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6831', 10),
        samplerType: process.env.JAEGER_SAMPLER_TYPE || 'const',
        samplerParam: parseFloat(process.env.JAEGER_SAMPLER_PARAM || '1')
      },
      loggingConfig: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json',
        elasticsearchHost: process.env.ELASTICSEARCH_HOST,
        useElasticsearch: process.env.USE_ELASTICSEARCH === 'true'
      }
    }, options);

    // Komponenten initialisieren
    this.metrics = {};
    this.tracer = null;
    this.logger = null;

    if (this.options.enableMetrics && prometheus) {
      this._setupMetrics();
    }

    if (this.options.enableTracing && jaeger && opentracing) {
      this._setupTracing();
    }

    if (this.options.enableLogging) {
      this._setupLogging();
    }
  }

  /**
   * Initialisiert Prometheus-Metriken
   * @private
   */
  _setupMetrics() {
    // Prometheus Registry
    this.registry = new prometheus.Registry();
    
    // Standardmetriken registrieren
    prometheus.collectDefaultMetrics({ register: this.registry });

    // HTTP-Metriken
    this.metrics.httpRequestsTotal = new prometheus.Counter({
      name: 'http_requests_total',
      help: 'Gesamtzahl der HTTP-Anfragen',
      labelNames: ['method', 'endpoint', 'status'],
      registers: [this.registry]
    });

    this.metrics.httpRequestDurationSeconds = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Dauer der HTTP-Anfragen in Sekunden',
      labelNames: ['method', 'endpoint'],
      buckets: [0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0],
      registers: [this.registry]
    });

    this.metrics.httpRequestsInProgress = new prometheus.Gauge({
      name: 'http_requests_in_progress',
      help: 'Anzahl der laufenden HTTP-Anfragen',
      labelNames: ['method'],
      registers: [this.registry]
    });

    this.metrics.httpRequestErrors = new prometheus.Counter({
      name: 'http_request_errors_total',
      help: 'Gesamtzahl der HTTP-Anfragefehler',
      labelNames: ['method', 'endpoint', 'error_code'],
      registers: [this.registry]
    });
  }

  /**
   * Initialisiert Jaeger-Tracing
   * @private
   */
  _setupTracing() {
    const tracingConfig = this.options.tracingConfig;
    
    const config = {
      serviceName: tracingConfig.serviceName,
      sampler: {
        type: tracingConfig.samplerType,
        param: tracingConfig.samplerParam
      },
      reporter: {
        logSpans: true,
        agentHost: tracingConfig.agentHost,
        agentPort: tracingConfig.agentPort
      }
    };

    const options = {
      logger: {
        info: (msg) => {
          if (this.logger) {
            this.logger.info(msg, { component: 'jaeger' });
          } else {
            console.info(`[Jaeger] ${msg}`);
          }
        },
        error: (msg) => {
          if (this.logger) {
            this.logger.error(msg, { component: 'jaeger' });
          } else {
            console.error(`[Jaeger] ${msg}`);
          }
        }
      }
    };

    this.tracer = jaeger.initTracerFromEnv(config, options);
    opentracing.initGlobalTracer(this.tracer);
  }

  /**
   * Initialisiert strukturiertes Logging
   * @private
   */
  _setupLogging() {
    const loggingConfig = this.options.loggingConfig;
    
    if (!winston) {
      this.logger = console;
      return;
    }

    // Winston-Formate
    const formats = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'service'] })
    ];

    if (loggingConfig.format === 'json') {
      formats.push(winston.format.json());
    } else {
      formats.push(winston.format.colorize());
      formats.push(winston.format.printf(info => {
        const meta = info.metadata && Object.keys(info.metadata).length ? JSON.stringify(info.metadata) : '';
        return `${info.timestamp} ${info.level}: ${info.message} ${meta}`;
      }));
    }

    // Transports
    const transports = [
      new winston.transports.Console()
    ];

    // Elasticsearch-Transport (optional)
    if (loggingConfig.useElasticsearch && loggingConfig.elasticsearchHost) {
      try {
        const { ElasticsearchTransport } = require('winston-elasticsearch');
        
        transports.push(new ElasticsearchTransport({
          level: loggingConfig.level,
          clientOpts: {
            node: `http://${loggingConfig.elasticsearchHost}`
          },
          indexPrefix: this.options.serviceName.toLowerCase()
        }));
      } catch (e) {
        console.warn('winston-elasticsearch nicht installiert. Elasticsearch-Logging wird deaktiviert.');
      }
    }

    // Logger erstellen
    this.logger = winston.createLogger({
      level: loggingConfig.level,
      format: winston.format.combine(...formats),
      defaultMeta: { service: this.options.serviceName },
      transports
    });
  }

  /**
   * Middleware für Express.js zur Erfassung von Metriken
   * @returns {Function} Express-Middleware
   */
  metricsMiddleware() {
    if (!this.options.enableMetrics || !prometheus) {
      return (req, res, next) => next();
    }

    return (req, res, next) => {
      // Anzahl laufender Anfragen erhöhen
      this.metrics.httpRequestsInProgress.inc({ method: req.method });

      // Startzeit
      const start = process.hrtime();

      // Response-Listener
      const onFinished = () => {
        // Cleanup
        res.removeListener('finish', onFinished);
        res.removeListener('close', onCleanup);
        res.removeListener('error', onCleanup);

        // Anzahl laufender Anfragen reduzieren
        this.metrics.httpRequestsInProgress.dec({ method: req.method });

        // Dauer berechnen
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds + nanoseconds / 1e9;

        // Metriken aktualisieren
        const endpoint = req.route ? req.baseUrl + req.route.path : req.path;

        this.metrics.httpRequestsTotal.inc({
          method: req.method,
          endpoint,
          status: res.statusCode
        });

        this.metrics.httpRequestDurationSeconds.observe({
          method: req.method,
          endpoint
        }, duration);

        // Fehler protokollieren
        if (res.statusCode >= 400) {
          this.metrics.httpRequestErrors.inc({
            method: req.method,
            endpoint,
            error_code: res.statusCode
          });
        }
      };

      const onCleanup = () => {
        this.metrics.httpRequestsInProgress.dec({ method: req.method });
      };

      res.on('finish', onFinished);
      res.on('close', onCleanup);
      res.on('error', onCleanup);

      next();
    };
  }

  /**
   * Middleware für Express.js zur Implementierung von Tracing
   * @returns {Function} Express-Middleware
   */
  tracingMiddleware() {
    if (!this.options.enableTracing || !jaeger || !opentracing || !this.tracer) {
      return (req, res, next) => next();
    }

    return (req, res, next) => {
      const tracer = this.tracer;
      
      // Extrahiere Span-Kontext aus Headers
      const wireCtx = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers);
      const parentSpanContext = wireCtx || undefined;
      
      // Erstelle Span für die Anfrage
      const span = tracer.startSpan(`${req.method} ${req.path}`, {
        childOf: parentSpanContext
      });

      // Setze Tags
      span.setTag(opentracing.Tags.HTTP_METHOD, req.method);
      span.setTag(opentracing.Tags.HTTP_URL, req.url);
      span.setTag(opentracing.Tags.SPAN_KIND, opentracing.Tags.SPAN_KIND_RPC_SERVER);
      span.setTag('component', 'express');
      
      // Setze Request-ID
      const requestId = req.headers['x-request-id'] || req.id;
      if (requestId) {
        span.setTag('request_id', requestId);
      }
      
      // Speichere Span im Request-Objekt
      req.span = span;

      // Erfasse Antwort
      const originalEnd = res.end;
      res.end = function() {
        res.end = originalEnd;
        const result = res.end.apply(this, arguments);

        // Setze Response-Tags
        span.setTag(opentracing.Tags.HTTP_STATUS_CODE, res.statusCode);
        
        if (res.statusCode >= 400) {
          span.setTag(opentracing.Tags.ERROR, true);
          span.log({
            event: 'error',
            message: `HTTP ${res.statusCode}`
          });
        }

        // Beende Span
        span.finish();
        
        return result;
      };

      next();
    };
  }

  /**
   * Middleware für Express.js zur Implementierung von strukturiertem Logging
   * @returns {Function} Express-Middleware
   */
  loggingMiddleware() {
    if (!this.options.enableLogging || !this.logger) {
      return (req, res, next) => next();
    }

    return (req, res, next) => {
      const start = Date.now();
      const requestId = req.headers['x-request-id'] || req.id;
      
      // Anfrage loggen
      this.logger.info(`Eingehende Anfrage: ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query,
        remoteAddress: req.ip,
        requestId,
        userAgent: req.headers['user-agent']
      });
      
      // Response-Listener
      const onFinished = () => {
        res.removeListener('finish', onFinished);
        res.removeListener('close', onCleanup);
        res.removeListener('error', onError);
        
        const duration = Date.now() - start;
        
        // Antwort loggen
        this.logger.info(`Ausgehende Antwort: ${res.statusCode} ${req.method} ${req.url}`, {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          requestId,
          contentLength: res.getHeader('content-length'),
          contentType: res.getHeader('content-type')
        });
      };
      
      const onCleanup = () => {
        const duration = Date.now() - start;
        
        this.logger.warn(`Anfrage abgebrochen: ${req.method} ${req.url}`, {
          method: req.method,
          url: req.url,
          duration,
          requestId
        });
      };
      
      const onError = (err) => {
        const duration = Date.now() - start;
        
        this.logger.error(`Fehler bei Anfrage: ${req.method} ${req.url}`, {
          method: req.method,
          url: req.url,
          error: err.message,
          stack: err.stack,
          duration,
          requestId
        });
      };
      
      res.on('finish', onFinished);
      res.on('close', onCleanup);
      res.on('error', onError);
      
      next();
    };
  }

  /**
   * Middleware für Express.js zur Implementierung eines Metriken-Endpunkts
   * @returns {Function} Express-Middleware
   */
  metricsEndpoint() {
    if (!this.options.enableMetrics || !prometheus || !this.registry) {
      return (req, res) => {
        res.status(404).send('Metrics not enabled');
      };
    }

    return async (req, res) => {
      try {
        res.set('Content-Type', prometheus.register.contentType);
        res.end(await this.registry.metrics());
      } catch (e) {
        res.status(500).send(e.message);
      }
    };
  }

  /**
   * Middleware für Express.js zur Implementierung eines Health-Endpunkts
   * @returns {Function} Express-Middleware
   */
  healthEndpoint() {
    return (req, res) => {
      const healthInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: this.options.serviceName,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      };
      
      res.json(healthInfo);
    };
  }

  /**
   * Middleware für Express.js zur Implementierung eines Readiness-Endpunkts
   * @returns {Function} Express-Middleware
   */
  readinessEndpoint() {
    return (req, res) => {
      res.json({
        status: 'ready',
        service: this.options.serviceName
      });
    };
  }

  /**
   * Konfiguriert Express-App mit allen Observability-Middlewares und Endpunkten
   * @param {Object} app - Express-App
   */
  setupApp(app) {
    // Middlewares
    app.use(this.metricsMiddleware());
    app.use(this.tracingMiddleware());
    app.use(this.loggingMiddleware());
    
    // Endpunkte
    app.get(this.options.metricsEndpoint, this.metricsEndpoint());
    app.get('/health', this.healthEndpoint());
    app.get('/ready', this.readinessEndpoint());
  }

  /**
   * Erstellt einen Span
   * @param {string} name - Name des Spans
   * @param {Object} options - Optionen für den Span
   * @returns {Object} Span-Objekt oder null
   */
  createSpan(name, options = {}) {
    if (!this.options.enableTracing || !this.tracer) {
      return null;
    }
    
    return this.tracer.startSpan(name, options);
  }

  /**
   * Utility-Funktion zur Zeitmessung einer Operation
   * @param {string} name - Name der Metrik
   * @param {Object} labels - Labels für die Metrik
   * @returns {Function} Funktion zum Beenden der Zeitmessung
   */
  startTimer(name, labels = {}) {
    if (!this.options.enableMetrics || !prometheus) {
      return () => {};
    }
    
    const start = process.hrtime();
    
    return () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds + nanoseconds / 1e9;
      
      if (this.metrics[name]) {
        this.metrics[name].observe(labels, duration);
      } else {
        const histogram = new prometheus.Histogram({
          name,
          help: `Duration of ${name} in seconds`,
          labelNames: Object.keys(labels),
          buckets: [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10, 30],
          registers: [this.registry]
        });
        
        this.metrics[name] = histogram;
        histogram.observe(labels, duration);
      }
      
      return duration;
    };
  }

  /**
   * Utility-Funktion zum Inkrementieren eines Counters
   * @param {string} name - Name der Metrik
   * @param {Object} labels - Labels für die Metrik
   * @param {number} value - Wert zum Inkrementieren (Standard: 1)
   */
  incrementCounter(name, labels = {}, value = 1) {
    if (!this.options.enableMetrics || !prometheus) {
      return;
    }
    
    if (this.metrics[name]) {
      this.metrics[name].inc(labels, value);
    } else {
      const counter = new prometheus.Counter({
        name,
        help: `Counter for ${name}`,
        labelNames: Object.keys(labels),
        registers: [this.registry]
      });
      
      this.metrics[name] = counter;
      counter.inc(labels, value);
    }
  }

  /**
   * Utility-Funktion zum Setzen eines Gauge-Werts
   * @param {string} name - Name der Metrik
   * @param {Object} labels - Labels für die Metrik
   * @param {number} value - Zu setzender Wert
   */
  setGauge(name, labels = {}, value) {
    if (!this.options.enableMetrics || !prometheus) {
      return;
    }
    
    if (this.metrics[name]) {
      this.metrics[name].set(labels, value);
    } else {
      const gauge = new prometheus.Gauge({
        name,
        help: `Gauge for ${name}`,
        labelNames: Object.keys(labels),
        registers: [this.registry]
      });
      
      this.metrics[name] = gauge;
      gauge.set(labels, value);
    }
  }

  /**
   * Beendet die Observability-Instrumentierung
   */
  shutdown() {
    if (this.tracer) {
      this.tracer.close();
    }
    
    if (this.logger && typeof this.logger.close === 'function') {
      this.logger.close();
    }
  }
}

// Standardinstanz exportieren
const observability = new NodeObservability();

module.exports = {
  NodeObservability,
  observability,
  setupApp: (app) => observability.setupApp(app),
  logger: () => observability.logger,
  tracer: () => observability.tracer,
  metrics: () => observability.metrics,
  createSpan: (name, options) => observability.createSpan(name, options),
  startTimer: (name, labels) => observability.startTimer(name, labels),
  incrementCounter: (name, labels, value) => observability.incrementCounter(name, labels, value),
  setGauge: (name, labels, value) => observability.setGauge(name, labels, value),
  shutdown: () => observability.shutdown()
}; 