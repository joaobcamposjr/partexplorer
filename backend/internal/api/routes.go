package api

import (
	"fmt"
	"net/http"
	"strconv"

	"partexplorer/backend/internal/database"
	"partexplorer/backend/internal/handlers"
	"partexplorer/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SetupRoutes configura as rotas da API
func SetupRoutes(r *gin.Engine, repo database.PartRepository, carRepo database.CarRepository) {
	api := r.Group("/api/v1")

	// Rota de busca principal
	api.GET("/search", func(c *gin.Context) {
		query := c.Query("q")
		company := c.Query("company")
		state := c.Query("state")
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

		var response *models.SearchResponse
		var err error

		if company != "" {
			response, err = repo.SearchPartsByCompany(company, state, page, pageSize)
		} else {
			response, err = repo.SearchParts(query, page, pageSize)
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, response)
	})

	// Rota de debug para verificar dados específicos
	api.GET("/debug/part/:id", func(c *gin.Context) {
		id := c.Param("id")

		// Converter string para UUID
		partID, err := uuid.Parse(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
			return
		}

		// Buscar dados específicos
		result, err := repo.GetPartByID(partID.String())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Retornar dados detalhados
		c.JSON(http.StatusOK, gin.H{
			"part_group": result.PartGroup,
			"names":      result.Names,
			"debug_info": gin.H{
				"total_names": len(result.Names),
				"names_with_brand": func() int {
					count := 0
					for _, name := range result.Names {
						if name.BrandID != uuid.Nil {
							count++
						}
					}
					return count
				}(),
			},
		})
	})

	// Rota de debug para verificar brands
	api.GET("/debug/brands", func(c *gin.Context) {
		brands, err := repo.GetBrands()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"total_brands": len(brands),
			"brands":       brands,
		})
	})

	// Rota de debug para verificar part_names específicos
	api.GET("/debug/names/:groupID", func(c *gin.Context) {
		groupID := c.Param("groupID")
		fmt.Printf("DEBUG: Route /debug/names/:groupID called with groupID: %s\n", groupID)

		// Converter string para UUID
		groupUUID, err := uuid.Parse(groupID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID"})
			return
		}

		// Buscar part_names específicos
		names, err := repo.DebugPartNames(groupUUID.String())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		fmt.Printf("DEBUG: Route returning names: %+v\n", names)

		c.JSON(http.StatusOK, gin.H{
			"group_id": groupID,
			"names":    names,
		})
	})

	// Rota de busca por ID específico
	api.GET("/part/:id", func(c *gin.Context) {
		id := c.Param("id")
		result, err := repo.GetPartByID(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
	})

	// Rota para obter aplicações
	api.GET("/applications", func(c *gin.Context) {
		applications, err := repo.GetApplications()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, applications)
	})

	// Rota para obter marcas
	api.GET("/brands", func(c *gin.Context) {
		brands, err := repo.GetBrands()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, brands)
	})

	// Rota para obter famílias
	api.GET("/families", func(c *gin.Context) {
		families, err := repo.GetFamilies()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, families)
	})

	// Rota para obter empresas
	api.GET("/companies", func(c *gin.Context) {
		companies, err := repo.GetAllCompanies()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, companies)
	})

	// ========================================
	// ROTAS DE CARROS
	// ========================================

	// Criar handler de carros
	carHandler := handlers.NewCarHandler(carRepo)

	// Rota para buscar informações de veículo por placa (com cache)
	api.GET("/cars/search/:plate", carHandler.SearchCarByPlate)

	// Rota para buscar veículo no cache apenas
	api.GET("/cars/cache/:plate", carHandler.GetCarByPlate)

	// Rota de health check do serviço de carros
	api.GET("/cars/health", carHandler.HealthCheck)

	// ========================================
	// ROTAS DE BUSCA POR PLACA
	// ========================================

	// Criar handler de busca por placa
	plateSearchHandler := handlers.NewPlateSearchHandler(repo, carRepo)

	// Rota para buscar peças por placa
	api.GET("/plate-search/:plate", plateSearchHandler.SearchByPlate)

	// ========================================
	// ROTAS DE MARCAS
	// ========================================

	// Criar handler de marcas
	brandHandler := handlers.NewBrandHandler(repo)

	// Rota para buscar todas as marcas
	api.GET("/brands/list", brandHandler.GetBrands)
}
