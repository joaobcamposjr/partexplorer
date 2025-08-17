package middleware

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"partexplorer/internal/metrics"
)

// MetricsMiddleware captura métricas de todas as requisições
func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Processar a requisição
		c.Next()

		// Calcular duração
		duration := time.Since(start)

		// Extrair informações da requisição
		endpoint := c.FullPath()
		if endpoint == "" {
			endpoint = c.Request.URL.Path
		}
		method := c.Request.Method
		statusCode := strconv.Itoa(c.Writer.Status())

		// Registrar métricas
		metrics.RecordAPIRequest(endpoint, method, statusCode)
		metrics.RecordResponseTime(endpoint, duration)

		// Registrar métricas específicas para GeoIP
		if endpoint == "/api/geoip/location" || endpoint == "/api/geoip/simple" {
			country := c.GetHeader("X-Forwarded-Country")
			if country == "" {
				country = "unknown"
			}
			metrics.RecordGeoIPRequest(endpoint, country)
		}
	}
}
