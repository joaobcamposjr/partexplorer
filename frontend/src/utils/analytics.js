// Analytics e métricas para o frontend
class Analytics {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.init();
  }

  init() {
    // Capturar eventos de navegação
    this.trackPageView();
    this.trackUserEngagement();
    this.trackPerformance();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Rastrear visualização de página
  trackPageView() {
    const pageData = {
      type: 'pageview',
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };

    this.sendEvent(pageData);
  }

  // Rastrear cliques em elementos
  trackClick(element, category = 'general') {
    const clickData = {
      type: 'click',
      element: element.tagName.toLowerCase(),
      elementId: element.id || null,
      elementClass: element.className || null,
      text: element.textContent?.substring(0, 100) || null,
      category: category,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href
    };

    this.sendEvent(clickData);
  }

  // Rastrear tempo de permanência
  trackEngagement() {
    const engagementData = {
      type: 'engagement',
      timeOnPage: Date.now() - this.startTime,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href
    };

    this.sendEvent(engagementData);
  }

  // Rastrear performance
  trackPerformance() {
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        const performanceData = {
          type: 'performance',
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          url: window.location.href
        };

        this.sendEvent(performanceData);
      }
    }
  }

  // Rastrear erros
  trackError(error, context = {}) {
    const errorData = {
      type: 'error',
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href
    };

    this.sendEvent(errorData);
  }

  // Rastrear ações do usuário
  trackAction(action, data = {}) {
    const actionData = {
      type: 'action',
      action: action,
      data: data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href
    };

    this.sendEvent(actionData);
  }

  // Rastrear busca
  trackSearch(query, results = 0) {
    const searchData = {
      type: 'search',
      query: query,
      results: results,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href
    };

    this.sendEvent(searchData);
  }

  // Rastrear download/visualização de peças
  trackPartView(partId, partName, category) {
    const partData = {
      type: 'part_view',
      partId: partId,
      partName: partName,
      category: category,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href
    };

    this.sendEvent(partData);
  }

  // Enviar evento para o backend
  async sendEvent(eventData) {
    try {
      // Adicionar ao buffer local
      this.events.push(eventData);

      // Enviar para o backend
      const response = await fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        console.warn('Failed to send analytics event:', response.status);
      }
    } catch (error) {
      console.warn('Error sending analytics event:', error);
    }
  }

  // Enviar eventos em lote
  async sendBatchEvents() {
    if (this.events.length === 0) return;

    try {
      const response = await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: this.events,
          sessionId: this.sessionId
        })
      });

      if (response.ok) {
        this.events = []; // Limpar buffer após envio bem-sucedido
      }
    } catch (error) {
      console.warn('Error sending batch analytics events:', error);
    }
  }

  // Configurar listeners de eventos
  trackUserEngagement() {
    // Listener para cliques
    document.addEventListener('click', (e) => {
      this.trackClick(e.target);
    });

    // Listener para mudanças de página (SPA)
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        this.trackPageView();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Listener para erros
    window.addEventListener('error', (e) => {
      this.trackError(e.error, { filename: e.filename, lineno: e.lineno });
    });

    // Listener para rejeições de promises
    window.addEventListener('unhandledrejection', (e) => {
      this.trackError(new Error(e.reason), { type: 'unhandledrejection' });
    });

    // Enviar eventos em lote periodicamente
    setInterval(() => {
      this.sendBatchEvents();
    }, 30000); // A cada 30 segundos

    // Enviar engagement antes de sair da página
    window.addEventListener('beforeunload', () => {
      this.trackEngagement();
      this.sendBatchEvents();
    });
  }

  // Métricas em tempo real para exibir no frontend
  getMetrics() {
    return {
      sessionId: this.sessionId,
      timeOnPage: Date.now() - this.startTime,
      eventsCount: this.events.length,
      currentUrl: window.location.href
    };
  }
}

// Instância global
const analytics = new Analytics();

// Hook para React
export const useAnalytics = () => {
  return {
    trackClick: (element, category) => analytics.trackClick(element, category),
    trackAction: (action, data) => analytics.trackAction(action, data),
    trackSearch: (query, results) => analytics.trackSearch(query, results),
    trackPartView: (partId, partName, category) => analytics.trackPartView(partId, partName, category),
    trackError: (error, context) => analytics.trackError(error, context),
    getMetrics: () => analytics.getMetrics()
  };
};

export default analytics;
