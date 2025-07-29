package routes

import (
	"github.com/gin-gonic/gin"

	"partexplorer/backend/internal/database"
	"partexplorer/backend/internal/handlers"
)

// SetupStockRoutes configura as rotas de estoque
func SetupStockRoutes(router *gin.RouterGroup, stockRepo database.StockRepository) {
	stockHandler := handlers.NewStockHandler(stockRepo)

	// Grupo de rotas para estoque
	stockGroup := router.Group("/stocks")
	{
		// CRUD básico
		stockGroup.POST("/", stockHandler.CreateStock)      // POST /api/v1/stocks/
		stockGroup.GET("/:id", stockHandler.GetStockByID)   // GET /api/v1/stocks/:id
		stockGroup.PUT("/:id", stockHandler.UpdateStock)    // PUT /api/v1/stocks/:id
		stockGroup.DELETE("/:id", stockHandler.DeleteStock) // DELETE /api/v1/stocks/:id

		// Listagem e busca
		stockGroup.GET("/", stockHandler.ListStocks)         // GET /api/v1/stocks/
		stockGroup.GET("/search", stockHandler.SearchStocks) // GET /api/v1/stocks/search?q=company

		// Estoque por SKU/EAN específico
		stockGroup.GET("/part/:part_name_id", stockHandler.GetStocksByPartNameID) // GET /api/v1/stocks/part/:part_name_id

		// Estoque por grupo de peças
		stockGroup.GET("/group/:group_id", stockHandler.GetStocksByGroupID) // GET /api/v1/stocks/group/:group_id
	}
}
