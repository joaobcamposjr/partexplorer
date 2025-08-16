import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../utils/analytics';
import './AnalyticsWidget.css';

const AnalyticsWidget = () => {
  const [metrics, setMetrics] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    visitors: 0,
    pageViews: 0,
    avgSessionTime: 0,
    bounceRate: 0
  });
  
  const analytics = useAnalytics();

  useEffect(() => {
    // Atualizar métricas locais a cada segundo
    const interval = setInterval(() => {
      setMetrics(analytics.getMetrics());
    }, 1000);

    // Buscar dados em tempo real do backend
    const fetchRealTimeData = async () => {
      try {
        const response = await fetch('/api/analytics/realtime');
        if (response.ok) {
          const data = await response.json();
          setRealTimeData(data);
        }
      } catch (error) {
        console.warn('Error fetching real-time data:', error);
      }
    };

    const realTimeInterval = setInterval(fetchRealTimeData, 5000); // A cada 5 segundos

    return () => {
      clearInterval(interval);
      clearInterval(realTimeInterval);
    };
  }, [analytics]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (!isVisible) {
    return (
      <button 
        className="analytics-toggle"
        onClick={() => setIsVisible(true)}
        title="Mostrar métricas"
      >
        📊
      </button>
    );
  }

  return (
    <div className="analytics-widget">
      <div className="analytics-header">
        <h3>📊 Métricas em Tempo Real</h3>
        <button 
          className="analytics-close"
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>
      </div>

      <div className="analytics-content">
        {/* Métricas do usuário atual */}
        <div className="metrics-section">
          <h4>Sua Sessão</h4>
          <div className="metric-item">
            <span className="metric-label">Tempo na página:</span>
            <span className="metric-value">{formatTime(metrics.timeOnPage || 0)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Eventos capturados:</span>
            <span className="metric-value">{metrics.eventsCount || 0}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Sessão ID:</span>
            <span className="metric-value small">{metrics.sessionId?.substring(0, 20)}...</span>
          </div>
        </div>

        {/* Métricas globais */}
        <div className="metrics-section">
          <h4>Site (Tempo Real)</h4>
          <div className="metric-item">
            <span className="metric-label">Visitantes ativos:</span>
            <span className="metric-value highlight">{formatNumber(realTimeData.visitors)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Visualizações hoje:</span>
            <span className="metric-value">{formatNumber(realTimeData.pageViews)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Tempo médio sessão:</span>
            <span className="metric-value">{formatTime(realTimeData.avgSessionTime * 1000)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Taxa de rejeição:</span>
            <span className="metric-value">{(realTimeData.bounceRate * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="metrics-section">
          <h4>Ações</h4>
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={() => analytics.trackAction('widget_interaction', { action: 'refresh_metrics' })}
            >
              🔄 Atualizar
            </button>
            <button 
              className="action-btn"
              onClick={() => analytics.trackAction('widget_interaction', { action: 'view_detailed_analytics' })}
            >
              📈 Detalhado
            </button>
          </div>
        </div>

        {/* Status de conectividade */}
        <div className="metrics-section">
          <div className="connection-status">
            <span className="status-indicator online"></span>
            <span className="status-text">Conectado ao sistema de métricas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
