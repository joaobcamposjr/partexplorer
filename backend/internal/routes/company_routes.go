package routes

import (
	"github.com/gin-gonic/gin"

	"partexplorer/backend/internal/database"
	"partexplorer/backend/internal/handlers"
)

// SetupCompanyRoutes configura as rotas de empresa
func SetupCompanyRoutes(router *gin.RouterGroup, companyRepo database.CompanyRepository) {
	companyHandler := handlers.NewCompanyHandler(companyRepo)

	// Grupo de rotas para empresa
	companyGroup := router.Group("/companies")
	{
		// CRUD básico
		companyGroup.POST("/", companyHandler.CreateCompany)      // POST /api/v1/companies/
		companyGroup.GET("/:id", companyHandler.GetCompanyByID)   // GET /api/v1/companies/:id
		companyGroup.PUT("/:id", companyHandler.UpdateCompany)    // PUT /api/v1/companies/:id
		companyGroup.DELETE("/:id", companyHandler.DeleteCompany) // DELETE /api/v1/companies/:id

		// Listagem e busca
		companyGroup.GET("/", companyHandler.ListCompanies)         // GET /api/v1/companies/
		companyGroup.GET("/search", companyHandler.SearchCompanies) // GET /api/v1/companies/search?q=name
	}
}
