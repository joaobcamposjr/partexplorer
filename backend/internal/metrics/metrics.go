package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"net/http"
	"runtime"
	"time"
)

var (
	// Métricas de negócio
	APIRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "partexplorer_api_requests_total",
			Help: "Total de requisições para a API",
		},
		[]string{"endpoint", "method", "status_code"},
	)

	SearchQueriesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "partexplorer_search_queries_total",
			Help: "Total de consultas de busca",
		},
		[]string{"search_type", "result_count"},
	)

	GeoIPRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "partexplorer_geoip_requests_total",
			Help: "Total de consultas GeoIP",
		},
		[]string{"endpoint", "country"},
	)

	// Métricas de sistema
	UptimeSeconds = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "partexplorer_uptime_seconds",
			Help: "Tempo de atividade do serviço",
		},
	)

	MemoryUsageBytes = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "partexplorer_memory_usage_bytes",
			Help: "Uso de memória do processo",
		},
	)

	Goroutines = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "partexplorer_goroutines",
			Help: "Número de goroutines ativas",
		},
	)

	ResponseTimeSeconds = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "partexplorer_response_time_seconds",
			Help:    "Tempo de resposta das APIs",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"endpoint"},
	)
)

// StartMetricsServer inicia o servidor de métricas
func StartMetricsServer(port string) {
	go func() {
		http.Handle("/metrics", promhttp.Handler())
		http.ListenAndServe(":"+port, nil)
	}()

	// Atualizar métricas de sistema periodicamente
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				updateSystemMetrics()
			}
		}
	}()
}

// updateSystemMetrics atualiza métricas do sistema
func updateSystemMetrics() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	MemoryUsageBytes.Set(float64(m.Alloc))
	Goroutines.Set(float64(runtime.NumGoroutine()))
	UptimeSeconds.Add(30) // Incrementa a cada 30 segundos
}

// RecordAPIRequest registra uma requisição da API
func RecordAPIRequest(endpoint, method, statusCode string) {
	APIRequestsTotal.WithLabelValues(endpoint, method, statusCode).Inc()
}

// RecordSearchQuery registra uma consulta de busca
func RecordSearchQuery(searchType, resultCount string) {
	SearchQueriesTotal.WithLabelValues(searchType, resultCount).Inc()
}

// RecordGeoIPRequest registra uma consulta GeoIP
func RecordGeoIPRequest(endpoint, country string) {
	GeoIPRequestsTotal.WithLabelValues(endpoint, country).Inc()
}

// RecordResponseTime registra o tempo de resposta
func RecordResponseTime(endpoint string, duration time.Duration) {
	ResponseTimeSeconds.WithLabelValues(endpoint).Observe(duration.Seconds())
}
