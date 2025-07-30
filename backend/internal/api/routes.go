package api

import (
	"github.com/gin-gonic/gin"
)

// SetupRoutes configura as rotas da API
func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Health check
		api.GET("/health", HealthCheck)

		// Busca
		api.GET("/search", SearchParts)
		api.GET("/search/sql", SearchPartsSQL)

		// Estatísticas
		api.GET("/stats", GetStats)

		// Sugestões de autocomplete
		api.GET("/search/suggestions", GetSuggestions)
	}
}
