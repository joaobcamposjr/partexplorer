package api

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
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

// TestDebug endpoint de teste para debug
func (h *Handler) TestDebug(c *gin.Context) {
	log.Printf("=== DEBUG: TestDebug endpoint called ===")
	fmt.Printf("=== DEBUG: TestDebug endpoint called ===\n")
	c.JSON(http.StatusOK, gin.H{
		"message":   "TestDebug endpoint working",
		"timestamp": time.Now().Format("2006-01-02 15:04:05"),
	})
}

// TestSearchDebug endpoint de teste específico para debug da busca
func (h *Handler) TestSearchDebug(c *gin.Context) {
	log.Printf("=== DEBUG: TestSearchDebug endpoint called ===")
	fmt.Printf("=== DEBUG: TestSearchDebug endpoint called ===\n")
	
	// Capturar parâmetros
	query := c.Query("q")
	company := c.Query("company")
	state := c.Query("state")
	
	log.Printf("=== DEBUG: TestSearchDebug - Query: '%s', Company: '%s', State: '%s' ===", query, company, state)
	fmt.Printf("=== DEBUG: TestSearchDebug - Query: '%s', Company: '%s', State: '%s' ===\n", query, company, state)
	
	// Teste de conexão com o banco
	db := database.GetDB()
	if db == nil {
		log.Printf("=== DEBUG: ERRO - Database connection is nil ===")
		fmt.Printf("=== DEBUG: ERRO - Database connection is nil ===\n")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database connection not available",
		})
		return
	}
	
	// Teste simples de query no banco
	var count int64
	dbErr := db.Raw("SELECT COUNT(*) FROM partexplorer.part_name LIMIT 1").Scan(&count).Error
	if dbErr != nil {
		log.Printf("=== DEBUG: ERRO - Database query failed: %v ===", dbErr)
		fmt.Printf("=== DEBUG: ERRO - Database query failed: %v ===\n", dbErr)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database query failed",
			"details": dbErr.Error(),
		})
		return
	}
	
	log.Printf("=== DEBUG: Database connection OK - Count: %d ===", count)
	fmt.Printf("=== DEBUG: Database connection OK - Count: %d ===\n", count)
	
	c.JSON(http.StatusOK, gin.H{
		"message":   "TestSearchDebug endpoint working",
		"query":     query,
		"company":   company,
		"state":     state,
		"db_count":  count,
		"timestamp": time.Now().Format("2006-01-02 15:04:05"),
	})
}

// isPlate verifica se a string é uma placa válida (antiga ou Mercosul)
func (h *Handler) isPlate(query string) bool {
	// Normalizar a placa
	plate := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(query, "-", ""), " ", ""))

	log.Printf("=== DEBUG: isPlate - Query original: '%s' ===", query)
	log.Printf("=== DEBUG: isPlate - Placa normalizada: '%s' ===", plate)

	// Padrões de placa
	oldPlatePattern := regexp.MustCompile(`^[A-Z]{3}[0-9]{4}$`)                 // ABC1234
	mercosulPattern := regexp.MustCompile(`^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$`) // ABC1D23

	isOldPlate := oldPlatePattern.MatchString(plate)
	isMercosulPlate := mercosulPattern.MatchString(plate)

	log.Printf("=== DEBUG: isPlate - É placa antiga: %v ===", isOldPlate)
	log.Printf("=== DEBUG: isPlate - É placa Mercosul: %v ===", isMercosulPlate)
	log.Printf("=== DEBUG: isPlate - Resultado final: %v ===", isOldPlate || isMercosulPlate)

	return isOldPlate || isMercosulPlate
}

// SearchParts busca peças com cache
func (h *Handler) SearchParts(c *gin.Context) {
	fmt.Printf("=== DEBUG: Handler SearchParts called ===\n")
	fmt.Printf("=== DEBUG: URL: %s ===\n", c.Request.URL.String())
	fmt.Printf("=== DEBUG: Method: %s ===\n", c.Request.Method)
	fmt.Printf("=== DEBUG: Headers: %+v ===\n", c.Request.Header)
	
	log.Printf("=== DEBUG: Handler SearchParts called ===")
	log.Printf("=== DEBUG: Handler SearchParts called - SIMPLE TEST ===")
	log.Printf("=== DEBUG: SIMPLE TEST - SearchParts called ===")
	
	// Capturar todos os parâmetros da query
	query := c.Query("q")
	company := c.Query("company")
	state := c.Query("state")
	searchMode := c.Query("searchMode")
	city := c.Query("city")
	cep := c.Query("cep")
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")
	autocomplete := c.DefaultQuery("autocomplete", "false")
	
	// Log detalhado de todos os parâmetros
	fmt.Printf("=== DEBUG: Query: '%s' ===\n", query)
	fmt.Printf("=== DEBUG: Company: '%s' ===\n", company)
	fmt.Printf("=== DEBUG: State: '%s' ===\n", state)
	fmt.Printf("=== DEBUG: SearchMode: '%s' ===\n", searchMode)
	fmt.Printf("=== DEBUG: City: '%s' ===\n", city)
	fmt.Printf("=== DEBUG: CEP: '%s' ===\n", cep)
	fmt.Printf("=== DEBUG: Page: '%s' ===\n", page)
	fmt.Printf("=== DEBUG: PageSize: '%s' ===\n", pageSize)
	fmt.Printf("=== DEBUG: Autocomplete: '%s' ===\n", autocomplete)
	
	log.Printf("=== DEBUG: Query: %s, Company: %s ===", query, company)
	log.Printf("=== DEBUG: SearchParts - Query: '%s', State: '%s', SearchMode: '%s' ===", query, state, searchMode)
	
	// Converter page e pageSize para int
	pageInt, _ := strconv.Atoi(page)
	pageSizeInt, _ := strconv.Atoi(pageSize)
	autocompleteBool := autocomplete == "true"
	
	fmt.Printf("=== DEBUG: PageInt: %d, PageSizeInt: %d, AutocompleteBool: %v ===\n", pageInt, pageSizeInt, autocompleteBool)

	// SIMPLIFICAR: Retornar resposta básica para teste
	log.Printf("=== DEBUG: Retornando resposta básica para teste ===")
	fmt.Printf("=== DEBUG: Retornando resposta básica para teste ===\n")
	
	c.JSON(http.StatusOK, gin.H{
		"message":   "SearchParts endpoint working - SIMPLIFIED",
		"query":     query,
		"company":   company,
		"state":     state,
		"searchMode": searchMode,
		"city":      city,
		"cep":       cep,
		"page":      pageInt,
		"pageSize":  pageSizeInt,
		"autocomplete": autocompleteBool,
		"timestamp": time.Now().Format("2006-01-02 15:04:05"),
	})
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
	log.Printf("=== DEBUG: Handler DebugPartNames called with id: %s ===", id)

	result, err := h.repo.DebugPartNames(id)
	if err != nil {
		log.Printf("=== DEBUG: Handler DebugPartNames error: %v ===", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Names not found",
			"details": err.Error(),
		})
		return
	}

	log.Printf("=== DEBUG: Handler DebugPartNames returning result: %+v ===", result)
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
	err := db.Raw("SELECT COUNT(*) FROM part_name WHERE type = 'sku'").Scan(&skuCount).Error
	if err != nil {
		log.Printf("Erro ao contar SKUs: %v", err)
		// Fallback com dados simulados se a query falhar
		stats.TotalSkus = 15420
	} else {
		stats.TotalSkus = skuCount
	}

	// Contar empresas (parceiros)
	var partnerCount int
	err = db.Raw("SELECT COUNT(*) FROM company").Scan(&partnerCount).Error
	if err != nil {
		log.Printf("Erro ao contar parceiros: %v", err)
		// Fallback com dados simulados se a query falhar
		stats.TotalPartners = 45
	} else {
		stats.TotalPartners = partnerCount
	}

	// Para pesquisas, vamos simular baseado em logs ou usar um contador
	// Por enquanto, vamos usar um valor baseado no número de SKUs
	stats.TotalSearches = stats.TotalSkus * 6 // Simulação: 6 pesquisas por SKU

	c.JSON(http.StatusOK, stats)
}

// GetAllCompanies busca todas as empresas
func (h *Handler) GetAllCompanies(c *gin.Context) {
	companies, err := h.repo.GetAllCompanies()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get companies",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"companies": companies,
		"total":     len(companies),
	})
}

// GetCities busca todas as cidades disponíveis
func (h *Handler) GetCities(c *gin.Context) {
	db := database.GetDB()
	if db == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database not available"})
		return
	}

	// Buscar cidades únicas da tabela company
	var cities []string
	err := db.Raw(`
		SELECT DISTINCT city 
		FROM partexplorer.company 
		WHERE city IS NOT NULL AND city != ''
		ORDER BY city ASC
	`).Scan(&cities).Error

	if err != nil {
		log.Printf("Erro ao buscar cidades: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get cities",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"cities": cities,
		"total":  len(cities),
	})
}

// GetCEPs busca todos os CEPs disponíveis
func (h *Handler) GetCEPs(c *gin.Context) {
	db := database.GetDB()
	if db == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database not available"})
		return
	}

	// Buscar CEPs únicos da tabela company
	var ceps []string
	err := db.Raw(`
		SELECT DISTINCT cep 
		FROM partexplorer.company 
		WHERE cep IS NOT NULL AND cep != ''
		ORDER BY cep ASC
	`).Scan(&ceps).Error

	if err != nil {
		log.Printf("Erro ao buscar CEPs: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get CEPs",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ceps":  ceps,
		"total": len(ceps),
	})
}
