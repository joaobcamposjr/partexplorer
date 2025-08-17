package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

// AnalyticsEvent representa um evento de analytics
type AnalyticsEvent struct {
	EventType    string            `json:"event_type"`
	Page         string            `json:"page"`
	UserAgent    string            `json:"user_agent"`
	IP           string            `json:"ip"`
	Country      string            `json:"country"`
	City         string            `json:"city"`
	SessionID    string            `json:"session_id"`
	Timestamp    time.Time         `json:"timestamp"`
	Metadata     map[string]string `json:"metadata"`
	SearchTerm   string            `json:"search_term,omitempty"`
	PartID       string            `json:"part_id,omitempty"`
	ClickTarget  string            `json:"click_target,omitempty"`
	ErrorMessage string            `json:"error_message,omitempty"`
}

// Métricas Prometheus
var (
	pageViewsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_pageviews_total",
			Help: "Total number of page views",
		},
		[]string{"page", "country", "city"},
	)

	searchTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_searches_total",
			Help: "Total number of searches",
		},
		[]string{"search_term", "country"},
	)

	partViewsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_part_views_total",
			Help: "Total number of part views",
		},
		[]string{"part_id", "country"},
	)

	clickTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_clicks_total",
			Help: "Total number of clicks",
		},
		[]string{"click_target", "page", "country"},
	)

	errorTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_errors_total",
			Help: "Total number of errors",
		},
		[]string{"error_type", "page"},
	)

	activeUsers = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "analytics_active_users_total",
			Help: "Number of active users",
		},
		[]string{"country"},
	)

	sessionDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "analytics_session_duration_seconds",
			Help:    "Session duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"country"},
	)

	// Mapa para rastrear usuários ativos
	activeUsersMap = make(map[string]time.Time)
)

// TrackEvent handler para rastrear eventos de analytics
func TrackEvent(c *gin.Context) {
	var event AnalyticsEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Extrair IP real
	event.IP = c.ClientIP()
	
	// Extrair informações de GeoIP dos headers (se disponível)
	event.Country = c.GetHeader("X-Forwarded-Country")
	if event.Country == "" {
		event.Country = "Unknown"
	}
	event.City = c.GetHeader("X-Forwarded-City")
	if event.City == "" {
		event.City = "Unknown"
	}

	// Extrair User-Agent
	event.UserAgent = c.GetHeader("User-Agent")

	// Definir timestamp se não fornecido
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Processar evento baseado no tipo
	switch event.EventType {
	case "pageview":
		pageViewsTotal.WithLabelValues(event.Page, event.Country, event.City).Inc()
		log.Printf("Page view: %s from %s, %s", event.Page, event.City, event.Country)

	case "search":
		searchTotal.WithLabelValues(event.SearchTerm, event.Country).Inc()
		log.Printf("Search: %s from %s", event.SearchTerm, event.Country)

	case "part_view":
		partViewsTotal.WithLabelValues(event.PartID, event.Country).Inc()
		log.Printf("Part view: %s from %s", event.PartID, event.Country)

	case "click":
		clickTotal.WithLabelValues(event.ClickTarget, event.Page, event.Country).Inc()
		log.Printf("Click: %s on %s from %s", event.ClickTarget, event.Page, event.Country)

	case "error":
		errorTotal.WithLabelValues(event.ErrorMessage, event.Page).Inc()
		log.Printf("Error: %s on %s", event.ErrorMessage, event.Page)

	case "session_start":
		// Marcar usuário como ativo
		userKey := event.SessionID + "_" + event.Country
		activeUsersMap[userKey] = time.Now()
		activeUsers.WithLabelValues(event.Country).Inc()
		log.Printf("Session start: %s from %s", event.SessionID, event.Country)

	case "session_end":
		// Remover usuário ativo e registrar duração
		userKey := event.SessionID + "_" + event.Country
		if startTime, exists := activeUsersMap[userKey]; exists {
			duration := time.Since(startTime).Seconds()
			sessionDuration.WithLabelValues(event.Country).Observe(duration)
			delete(activeUsersMap, userKey)
			activeUsers.WithLabelValues(event.Country).Dec()
			log.Printf("Session end: %s from %s, duration: %.2fs", event.SessionID, event.Country, duration)
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "tracked"})
}

// GetAnalyticsMetrics retorna métricas de analytics
func GetAnalyticsMetrics(c *gin.Context) {
	metrics := gin.H{
		"active_users": len(activeUsersMap),
		"timestamp":    time.Now(),
	}

	c.JSON(http.StatusOK, metrics)
}

// CleanupInactiveUsers remove usuários inativos (executar periodicamente)
func CleanupInactiveUsers() {
	ticker := time.NewTicker(5 * time.Minute)
	go func() {
		for range ticker.C {
			now := time.Now()
			for userKey, lastSeen := range activeUsersMap {
				if now.Sub(lastSeen) > 30*time.Minute {
					// Extrair país do userKey
					country := "Unknown"
					if len(userKey) > 0 {
						// Assumindo formato: sessionID_country
						for i := len(userKey) - 1; i >= 0; i-- {
							if userKey[i] == '_' {
								country = userKey[i+1:]
								break
							}
						}
					}
					
					delete(activeUsersMap, userKey)
					activeUsers.WithLabelValues(country).Dec()
					log.Printf("Cleaned up inactive user: %s", userKey)
				}
			}
		}
	}()
}
