package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"partexplorer/backend/internal/api"
	"partexplorer/backend/internal/cache"
	"partexplorer/backend/internal/database"
	"partexplorer/backend/internal/elasticsearch"
	"partexplorer/backend/internal/handlers"
	"partexplorer/backend/internal/metrics"
	"partexplorer/backend/internal/middleware"
	"partexplorer/backend/internal/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Carregar variáveis de ambiente
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Configurar modo do Gin
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Inicializar banco de dados
	if err := database.InitDatabase(); err != nil {
		log.Printf("Warning: Failed to initialize database: %v", err)
	}

	// Inicializar Elasticsearch (opcional para MVP)
	if err := elasticsearch.InitElasticsearch(); err != nil {
		log.Printf("Warning: Failed to initialize Elasticsearch: %v", err)
	}

	// Inicializar Redis (opcional para MVP)
	if err := cache.InitRedis(); err != nil {
		log.Printf("Warning: Failed to initialize Redis: %v", err)
	}

	// Criar repositórios
	repo := database.NewPartRepository(database.GetDB())
	companyRepo := database.NewCompanyRepository(database.GetDB())
	carRepo := database.NewCarRepository(database.GetDB())

	// Criar handlers
	handler := api.NewHandler(repo)

	// Inicializar router
	r := gin.Default()

	// Iniciar servidor de métricas
	metrics.StartMetricsServer("9091")

	// Middleware de métricas
	r.Use(middleware.MetricsMiddleware())

	// Middleware CORS
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check simples que sempre funciona
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"service":   "partexplorer-backend",
			"message":   "Backend está funcionando",
			"timestamp": time.Now().Format(time.RFC3339),
			"version":   "1.0.0",
		})
	})

	// Health check detalhado
	r.GET("/health/detailed", func(c *gin.Context) {
		// Verificar se o banco está disponível
		db := database.GetDB()
		dbStatus := "ok"
		if db == nil {
			dbStatus = "unavailable"
		} else {
			// Testar conexão com banco
			sqlDB, err := db.DB()
			if err != nil {
				dbStatus = "error"
			} else {
				err = sqlDB.Ping()
				if err != nil {
					dbStatus = "error"
				}
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"service":   "partexplorer-backend",
			"message":   "Backend está funcionando",
			"timestamp": time.Now().Format(time.RFC3339),
			"version":   "1.0.0",
			"database":  dbStatus,
		})
	})

	// API routes
	apiGroup := r.Group("/api/v1")
	{
		// Search endpoints
		apiGroup.GET("/search", handler.SearchParts)
		apiGroup.GET("/search/sql", handler.SearchPartsSQL)
		apiGroup.GET("/search/advanced", handler.AdvancedSearch)
		apiGroup.GET("/suggest", handler.GetSuggestions)

		// Estatísticas
		apiGroup.GET("/stats", handler.GetStats)

		// Sugestões de autocomplete
		apiGroup.GET("/search/suggestions", handler.GetSuggestions)

		// Elasticsearch endpoints
		apiGroup.POST("/index", handler.IndexAllParts)
		apiGroup.GET("/index/stats", handler.GetIndexStats)

		// Cache endpoints
		apiGroup.GET("/cache/stats", handler.GetCacheStats)
		apiGroup.DELETE("/cache", handler.InvalidateCache)

		// Parts endpoints
		apiGroup.GET("/parts", handler.SearchParts)
		apiGroup.GET("/parts/:id", handler.GetPartByID)
		apiGroup.GET("/parts/sku/:sku", handler.GetPartBySKU)
		apiGroup.GET("/debug/parts/:id", handler.DebugPartGroup)
		apiGroup.GET("/debug/sql/parts/:id", handler.DebugPartGroupSQL)
		apiGroup.GET("/debug/names/:id", handler.DebugPartNames)
		apiGroup.GET("/debug/duplicates", handler.GetDuplicateSKUs)
		apiGroup.POST("/debug/clean-duplicates", handler.CleanDuplicateNames)
		apiGroup.GET("/debug/company/:company", handler.DebugCompanySearch)
		apiGroup.GET("/debug/applications/:id", handler.DebugPartApplications)

		// Applications endpoints
		apiGroup.GET("/applications", handler.GetApplications)

		// Brands endpoints
		apiGroup.GET("/brands", handler.GetBrands)

		// Families endpoints
		apiGroup.GET("/families", handler.GetFamilies)

		// Stock endpoints
		// routes.SetupStockRoutes(apiGroup, stockRepo) // This line was removed as per the edit hint

		// Company endpoints
		apiGroup.GET("/companies", handler.GetAllCompanies)
		apiGroup.GET("/cities", handler.GetCities)
		apiGroup.GET("/ceps", handler.GetCEPs)
		routes.SetupCompanyRoutes(apiGroup, companyRepo)
	}

	// Car endpoints - configurar separadamente
	carHandler := handlers.NewCarHandler(carRepo)
	r.GET("/api/v1/cars/health", carHandler.HealthCheck)
	r.GET("/api/v1/cars/test", carHandler.TestEndpoint)
	r.GET("/api/v1/cars/search/:plate", carHandler.SearchCarByPlate)
	r.GET("/api/v1/cars/cache/:plate", carHandler.GetCarByPlate)

	// Plate search endpoint
	plateSearchHandler := handlers.NewPlateSearchHandler(repo, carRepo)
	r.GET("/api/v1/plate-search/:plate", plateSearchHandler.SearchByPlate)

	// GeoIP endpoints
	r.GET("/api/geoip/location", handlers.GetUserLocation)
	r.GET("/api/geoip/simple", handlers.GetUserLocationSimple)

	// Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
