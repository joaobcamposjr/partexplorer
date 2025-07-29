package main

import (
	"log"
	"os"

	"partexplorer/backend/internal/api"
	"partexplorer/backend/internal/cache"
	"partexplorer/backend/internal/database"
	"partexplorer/backend/internal/elasticsearch"
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
	log.Println("🔄 Initializing database connection...")
	if err := database.InitDatabase(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Inicializar Elasticsearch
	log.Println("🔄 Initializing Elasticsearch connection...")
	if err := elasticsearch.InitElasticsearch(); err != nil {
		log.Fatal("Failed to initialize Elasticsearch:", err)
	}

	// Inicializar Redis
	log.Println("🔄 Initializing Redis connection...")
	if err := cache.InitRedis(); err != nil {
		log.Fatal("Failed to initialize Redis:", err)
	}

	// Criar repositórios
	repo := database.NewPartRepository(database.GetDB())
	stockRepo := database.NewStockRepository(database.GetDB())
	companyRepo := database.NewCompanyRepository(database.GetDB())

	// Criar handlers
	handler := api.NewHandler(repo)

	// Inicializar router
	r := gin.Default()

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

	// Health check
	r.GET("/health", handler.HealthCheck)

	// API routes
	apiGroup := r.Group("/api/v1")
	{
		// Search endpoints
		apiGroup.GET("/search", handler.SearchParts)
		apiGroup.GET("/search/sql", handler.SearchPartsSQL)
		apiGroup.GET("/search/advanced", handler.AdvancedSearch)
		apiGroup.GET("/suggest", handler.GetSuggestions)

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
		routes.SetupStockRoutes(apiGroup, stockRepo)

		// Company endpoints
		routes.SetupCompanyRoutes(apiGroup, companyRepo)
	}

	// Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Starting server on port %s", port)
	log.Printf("📊 Database: %s:%s/%s", os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_NAME"))
	log.Printf("🔍 Elasticsearch: %s:%s", os.Getenv("ES_HOST"), os.Getenv("ES_PORT"))
	log.Printf("💾 Redis: %s:%s", os.Getenv("REDIS_HOST"), os.Getenv("REDIS_PORT"))

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
