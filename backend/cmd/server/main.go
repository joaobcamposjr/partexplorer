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
	"partexplorer/backend/internal/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	log.Println("🚀 [MAIN] Iniciando aplicação...")
	
	// Carregar variáveis de ambiente
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ [MAIN] No .env file found, using environment variables")
	} else {
		log.Println("✅ [MAIN] .env file loaded successfully")
	}

	// Configurar modo do Gin
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
		log.Println("🔧 [MAIN] Gin mode set to release")
	} else {
		log.Println("🔧 [MAIN] Gin mode set to debug")
	}

	// Inicializar banco de dados
	log.Println("🔄 [MAIN] Initializing database connection...")
	if err := database.InitDatabase(); err != nil {
		log.Printf("⚠️ [MAIN] Warning: Failed to initialize database: %v", err)
		log.Println("⚠️ [MAIN] Backend will start without database connection")
	} else {
		log.Println("✅ [MAIN] Database initialized successfully")
	}

	// Inicializar Elasticsearch (opcional para MVP)
	log.Println("🔄 [MAIN] Initializing Elasticsearch connection...")
	if err := elasticsearch.InitElasticsearch(); err != nil {
		log.Printf("⚠️ [MAIN] Warning: Failed to initialize Elasticsearch: %v", err)
		log.Println("⚠️ [MAIN] Backend will start without Elasticsearch")
	} else {
		log.Println("✅ [MAIN] Elasticsearch initialized successfully")
	}

	// Inicializar Redis (opcional para MVP)
	log.Println("🔄 [MAIN] Initializing Redis connection...")
	if err := cache.InitRedis(); err != nil {
		log.Printf("⚠️ [MAIN] Warning: Failed to initialize Redis: %v", err)
		log.Println("⚠️ [MAIN] Backend will start without Redis cache")
	} else {
		log.Println("✅ [MAIN] Redis initialized successfully")
	}

	// Criar repositórios
	log.Println("🔄 [MAIN] Creating repositories...")
	repo := database.NewPartRepository(database.GetDB())
	companyRepo := database.NewCompanyRepository(database.GetDB())
	carRepo := database.NewCarRepository(database.GetDB())
	log.Println("✅ [MAIN] Repositories created successfully")

	// Criar handlers
	log.Println("🔄 [MAIN] Creating handlers...")
	handler := api.NewHandler(repo)
	log.Println("✅ [MAIN] Handlers created successfully")

	// Inicializar router
	log.Println("🔄 [MAIN] Initializing router...")
	r := gin.Default()
	log.Println("✅ [MAIN] Router initialized successfully")

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

	// Health check principal
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"service":   "partexplorer-backend",
			"message":   "Backend está funcionando",
			"timestamp": time.Now().Format(time.RFC3339),
			"version":   "1.0.0",
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
		apiGroup.GET("/debug/parts/:id", handler.DebugPartGroup)
		apiGroup.GET("/debug/sql/parts/:id", handler.DebugPartGroupSQL)
		apiGroup.GET("/debug/names/:id", handler.DebugPartNames)
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

	// Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 [MAIN] Starting server on port %s", port)
	log.Printf("📊 [MAIN] Database: %s:%s/%s", os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_NAME"))
	log.Printf("🔍 [MAIN] Elasticsearch: %s:%s", os.Getenv("ES_HOST"), os.Getenv("ES_PORT"))
	log.Printf("💾 [MAIN] Redis: %s:%s", os.Getenv("REDIS_HOST"), os.Getenv("REDIS_PORT"))

	log.Println("🎉 [MAIN] Server is ready to start!")
	
	if err := r.Run(":" + port); err != nil {
		log.Printf("💥 [MAIN] Failed to start server: %v", err)
		log.Fatal("💥 [MAIN] Server startup failed")
	}
}
