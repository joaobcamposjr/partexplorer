package api

import (
	"net/http"
	"strconv"
	"time"

	"partexplorer/backend/internal/cache"
	"partexplorer/backend/internal/database"
	"partexplorer/backend/internal/elasticsearch"
	"partexplorer/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// Handler estrutura para handlers da API
type Handler struct {
	repo          database.PartRepository
	indexer       *elasticsearch.IndexerService
	searchService *elasticsearch.SearchService
	cacheService  *cache.SearchCacheService
}

// NewHandler cria uma nova instância do handler
func NewHandler(repo database.PartRepository) *Handler {
	return &Handler{
		repo:          repo,
		indexer:       elasticsearch.NewIndexerService(),
		searchService: elasticsearch.NewSearchService(),
		cacheService:  cache.NewSearchCacheService(),
	}
}

// HealthCheck endpoint de health check
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service": "partexplorer-backend",
		"status":  "ok",
	})
}

// SearchParts busca peças com cache
func (h *Handler) SearchParts(c *gin.Context) {
	query := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	autocomplete := c.DefaultQuery("autocomplete", "false") == "true"

	// Tentar obter do cache primeiro
	cachedResult, err := h.cacheService.GetCachedSearch(query, page, pageSize)
	if err == nil {
		// Cache hit - converter para modelo limpo e retornar
		cleanCachedResult := models.ToCleanSearchResponse(cachedResult)
		c.Header("X-Cache", "HIT")
		c.JSON(http.StatusOK, cleanCachedResult)
		return
	}

	// Cache miss - buscar dados
	var results *models.SearchResponse

	if autocomplete {
		// Usar busca SQL direta (mais confiável)
		results, err = h.repo.SearchPartsSQL(query, page, pageSize)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to search parts",
				"details": err.Error(),
			})
			return
		}
	} else {
		// Usar busca SQL direta (mais confiável)
		results, err = h.repo.SearchPartsSQL(query, page, pageSize)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to search parts",
				"details": err.Error(),
			})
			return
		}
	}

	// Converter para modelo limpo (sem IDs, timestamps, score)
	cleanResults := models.ToCleanSearchResponse(results)

	// Armazenar no cache (15 minutos)
	h.cacheService.SetCachedSearch(query, page, pageSize, results, 15*time.Minute)

	c.Header("X-Cache", "MISS")
	c.JSON(http.StatusOK, cleanResults)
}

// SearchPartsSQL busca peças usando SQL direto
func (h *Handler) SearchPartsSQL(c *gin.Context) {
	query := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	results, err := h.repo.SearchPartsSQL(query, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to search parts",
			"details": err.Error(),
		})
		return
	}

	// Converter para modelo limpo (sem IDs, timestamps, score)
	cleanResults := models.ToCleanSearchResponse(results)

	c.JSON(http.StatusOK, cleanResults)
}

// GetSuggestions retorna sugestões de autocomplete baseadas no banco
func (h *Handler) GetSuggestions(c *gin.Context) {
	query := c.Query("q")
	if len(query) < 2 {
		c.JSON(http.StatusOK, gin.H{"suggestions": []string{}})
		return
	}

	db := database.GetDB()
	if db == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database not available"})
		return
	}

	// Buscar sugestões baseadas em part_name
	var suggestions []string
	err := db.Raw(`
		SELECT DISTINCT name 
		FROM partexplorer.part_name 
		WHERE LOWER(name) LIKE LOWER(?) 
		ORDER BY name 
		LIMIT 10
	`, "%"+query+"%").Scan(&suggestions).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching suggestions"})
		return
	}

	// Se não encontrou nada em part_name, buscar em outras tabelas
	if len(suggestions) == 0 {
		// Buscar em brand
		var brandSuggestions []string
		err = db.Raw(`
			SELECT DISTINCT name 
			FROM partexplorer.brand 
			WHERE LOWER(name) LIKE LOWER(?) 
			ORDER BY name 
			LIMIT 5
		`, "%"+query+"%").Scan(&brandSuggestions).Error

		if err == nil {
			suggestions = append(suggestions, brandSuggestions...)
		}

		// Buscar em family
		var familySuggestions []string
		err = db.Raw(`
			SELECT DISTINCT name 
			FROM partexplorer.family 
			WHERE LOWER(name) LIKE LOWER(?) 
			ORDER BY name 
			LIMIT 5
		`, "%"+query+"%").Scan(&familySuggestions).Error

		if err == nil {
			suggestions = append(suggestions, familySuggestions...)
		}
	}

	c.JSON(http.StatusOK, gin.H{"suggestions": suggestions})
}

// IndexAllParts indexa todos os dados no Elasticsearch
func (h *Handler) IndexAllParts(c *gin.Context) {
	// Buscar todos os grupos de peças do PostgreSQL
	// Por enquanto, vamos buscar apenas alguns para teste
	results, err := h.repo.SearchParts("", 1, 1000) // Buscar todos
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch parts from database",
			"details": err.Error(),
		})
		return
	}

	// Converter para PartGroup
	partGroups := make([]models.PartGroup, len(results.Results))
	for i, result := range results.Results {
		partGroups[i] = result.PartGroup
	}

	// Indexar no Elasticsearch
	err = h.indexer.IndexAllPartGroups(partGroups)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to index parts",
			"details": err.Error(),
		})
		return
	}

	// Refresh do índice
	err = h.indexer.RefreshIndex()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to refresh index",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully indexed parts",
		"total":   len(partGroups),
	})
}

// GetIndexStats retorna estatísticas do índice
func (h *Handler) GetIndexStats(c *gin.Context) {
	stats, err := h.indexer.GetIndexStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get index stats",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetPartByID busca uma peça específica por ID
func (h *Handler) GetPartByID(c *gin.Context) {
	id := c.Param("id")

	result, err := h.repo.GetPartByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Part not found",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetApplications retorna todas as aplicações
func (h *Handler) GetApplications(c *gin.Context) {
	applications, err := h.repo.GetApplications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get applications",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"applications": applications,
		"total":        len(applications),
	})
}

// GetBrands retorna todas as marcas
func (h *Handler) GetBrands(c *gin.Context) {
	brands, err := h.repo.GetBrands()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get brands",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"brands": brands,
		"total":  len(brands),
	})
}

// GetFamilies retorna todas as famílias
func (h *Handler) GetFamilies(c *gin.Context) {
	families, err := h.repo.GetFamilies()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get families",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"families": families,
		"total":    len(families),
	})
}

// AdvancedSearch busca avançada (placeholder)
func (h *Handler) AdvancedSearch(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Advanced search endpoint - to be implemented",
	})
}

// GetCacheStats retorna estatísticas do cache
func (h *Handler) GetCacheStats(c *gin.Context) {
	stats, err := h.cacheService.GetCacheStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get cache stats",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// InvalidateCache invalida todo o cache de busca
func (h *Handler) InvalidateCache(c *gin.Context) {
	err := h.cacheService.InvalidateSearchCache()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to invalidate cache",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Cache invalidated successfully",
	})
}

// DebugPartGroup endpoint para debug de uma peça específica
func (h *Handler) DebugPartGroup(c *gin.Context) {
	id := c.Param("id")

	result, err := h.repo.DebugPartGroup(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Part not found",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// DebugPartGroupSQL endpoint para debug SQL direto
func (h *Handler) DebugPartGroupSQL(c *gin.Context) {
	id := c.Param("id")

	result, err := h.repo.DebugPartGroupSQL(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Part not found",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// DebugPartNames endpoint para debug de nomes
func (h *Handler) DebugPartNames(c *gin.Context) {
	id := c.Param("id")

	result, err := h.repo.DebugPartNames(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Names not found",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// DebugPartApplications endpoint para debug de aplicações
func (h *Handler) DebugPartApplications(c *gin.Context) {
	id := c.Param("id")

	result, err := h.repo.DebugPartApplications(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Applications not found",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetStats retorna estatísticas reais do sistema
func (h *Handler) GetStats(c *gin.Context) {
	db := database.GetDB()
	if db == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database not available"})
		return
	}

	var stats struct {
		TotalSkus     int `json:"totalSkus"`
		TotalSearches int `json:"totalSearches"`
		TotalPartners int `json:"totalPartners"`
	}

	// Contar SKUs (part_number onde type = 'sku')
	var skuCount int
	err := db.Raw("SELECT COUNT(DISTINCT part_number) FROM part_name WHERE type = 'sku'").Scan(&skuCount).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error counting SKUs"})
		return
	}
	stats.TotalSkus = skuCount

	// Contar empresas (parceiros)
	var partnerCount int
	err = db.Raw("SELECT COUNT(*) FROM company").Scan(&partnerCount).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error counting partners"})
		return
	}
	stats.TotalPartners = partnerCount

	// Para pesquisas, vamos simular baseado em logs ou usar um contador
	// Por enquanto, vamos usar um valor baseado no número de SKUs
	stats.TotalSearches = skuCount * 6 // Simulação: 6 pesquisas por SKU

	c.JSON(http.StatusOK, stats)
}
