import { createMicroservice } from '../../framework/core/microservice';

/**
 * Transaktionsverwaltungs-Microservice
 * 
 * Dieses Microservice stellt Funktionen zur Verwaltung von Transaktionen bereit,
 * einschließlich Bestellungen, Zahlungen und Lieferungen.
 */
const transactionsMicroservice = createMicroservice({
  id: 'transactions',
  name: 'Transaktionsverwaltung',
  description: 'Verwaltung von Bestellungen, Zahlungen und Lieferungen',
  version: '1.0.0',
  endpoints: {
    // Bestellungen
    getOrders: {
      path: '/api/transactions/orders',
      method: 'GET',
      auth: true,
      params: {
        page: { type: 'number', optional: true },
        limit: { type: 'number', optional: true },
        status: { type: 'string', optional: true },
        type: { type: 'string', optional: true },
        search: { type: 'string', optional: true },
        from_date: { type: 'string', optional: true },
        to_date: { type: 'string', optional: true }
      }
    },
    getOrder: {
      path: '/api/transactions/orders/:id',
      method: 'GET',
      auth: true,
      params: {
        id: { type: 'number', required: true }
      }
    },
    createOrder: {
      path: '/api/transactions/orders',
      method: 'POST',
      auth: true,
      params: {
        orderData: { type: 'object', required: true }
      }
    },
    updateOrder: {
      path: '/api/transactions/orders/:id',
      method: 'PUT',
      auth: true,
      params: {
        id: { type: 'number', required: true },
        orderData: { type: 'object', required: true }
      }
    },
    deleteOrder: {
      path: '/api/transactions/orders/:id',
      method: 'DELETE',
      auth: true,
      params: {
        id: { type: 'number', required: true }
      }
    },

    // Zahlungen
    getPayments: {
      path: '/api/transactions/payments',
      method: 'GET',
      auth: true,
      params: {
        page: { type: 'number', optional: true },
        limit: { type: 'number', optional: true },
        status: { type: 'string', optional: true },
        method: { type: 'string', optional: true },
        search: { type: 'string', optional: true },
        from_date: { type: 'string', optional: true },
        to_date: { type: 'string', optional: true }
      }
    },
    getPayment: {
      path: '/api/transactions/payments/:id',
      method: 'GET',
      auth: true,
      params: {
        id: { type: 'number', required: true }
      }
    },
    createPayment: {
      path: '/api/transactions/payments',
      method: 'POST',
      auth: true,
      params: {
        paymentData: { type: 'object', required: true }
      }
    },
    updatePayment: {
      path: '/api/transactions/payments/:id',
      method: 'PUT',
      auth: true,
      params: {
        id: { type: 'number', required: true },
        paymentData: { type: 'object', required: true }
      }
    },
    deletePayment: {
      path: '/api/transactions/payments/:id',
      method: 'DELETE',
      auth: true,
      params: {
        id: { type: 'number', required: true }
      }
    },

    // Lieferungen
    getShipments: {
      path: '/api/transactions/shipments',
      method: 'GET',
      auth: true,
      params: {
        page: { type: 'number', optional: true },
        limit: { type: 'number', optional: true },
        search: { type: 'string', optional: true },
        from_date: { type: 'string', optional: true },
        to_date: { type: 'string', optional: true }
      }
    },
    getShipment: {
      path: '/api/transactions/shipments/:id',
      method: 'GET',
      auth: true,
      params: {
        id: { type: 'number', required: true }
      }
    },
    createShipment: {
      path: '/api/transactions/shipments',
      method: 'POST',
      auth: true,
      params: {
        shipmentData: { type: 'object', required: true }
      }
    },
    updateShipment: {
      path: '/api/transactions/shipments/:id',
      method: 'PUT',
      auth: true,
      params: {
        id: { type: 'number', required: true },
        shipmentData: { type: 'object', required: true }
      }
    },
    deleteShipment: {
      path: '/api/transactions/shipments/:id',
      method: 'DELETE',
      auth: true,
      params: {
        id: { type: 'number', required: true }
      }
    },

    // Berichte und Analysen
    getTransactionReport: {
      path: '/api/transactions/reports/summary',
      method: 'GET',
      auth: true,
      params: {
        type: { type: 'string', optional: true },
        period: { type: 'string', optional: true },
        from_date: { type: 'string', optional: true },
        to_date: { type: 'string', optional: true }
      }
    },
    getTransactionAnalytics: {
      path: '/api/transactions/analytics',
      method: 'GET',
      auth: true,
      params: {
        metric: { type: 'string', required: true },
        period: { type: 'string', optional: true },
        from_date: { type: 'string', optional: true },
        to_date: { type: 'string', optional: true }
      }
    }
  }
});

export default transactionsMicroservice; 