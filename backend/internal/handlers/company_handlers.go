package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"partexplorer/backend/internal/database"
	"partexplorer/backend/internal/models"
)

// CompanyHandler gerencia as requisições relacionadas às empresas
type CompanyHandler struct {
	companyRepo database.CompanyRepository
}

// NewCompanyHandler cria uma nova instância do handler
func NewCompanyHandler(companyRepo database.CompanyRepository) *CompanyHandler {
	return &CompanyHandler{
		companyRepo: companyRepo,
	}
}

// CreateCompanyRequest representa a requisição para criar empresa
type CreateCompanyRequest struct {
	Name         string  `json:"name" binding:"required"`
	ImageURL     *string `json:"image_url,omitempty"`
	Street       *string `json:"street,omitempty"`
	Number       *string `json:"number,omitempty"`
	Neighborhood *string `json:"neighborhood,omitempty"`
	City         *string `json:"city,omitempty"`
	Country      *string `json:"country,omitempty"`
	State        *string `json:"state,omitempty"`
	ZipCode      *string `json:"zip_code,omitempty"`
	Phone        *string `json:"phone,omitempty"`
	Mobile       *string `json:"mobile,omitempty"`
	Email        *string `json:"email,omitempty"`
	Website      *string `json:"website,omitempty"`
}

// UpdateCompanyRequest representa a requisição para atualizar empresa
type UpdateCompanyRequest struct {
	Name         *string `json:"name,omitempty"`
	ImageURL     *string `json:"image_url,omitempty"`
	Street       *string `json:"street,omitempty"`
	Number       *string `json:"number,omitempty"`
	Neighborhood *string `json:"neighborhood,omitempty"`
	City         *string `json:"city,omitempty"`
	Country      *string `json:"country,omitempty"`
	State        *string `json:"state,omitempty"`
	ZipCode      *string `json:"zip_code,omitempty"`
	Phone        *string `json:"phone,omitempty"`
	Mobile       *string `json:"mobile,omitempty"`
	Email        *string `json:"email,omitempty"`
	Website      *string `json:"website,omitempty"`
}

// CreateCompany cria uma nova empresa
func (h *CompanyHandler) CreateCompany(c *gin.Context) {
	var req CreateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	company := &models.Company{
		Name:         req.Name,
		ImageURL:     req.ImageURL,
		Street:       req.Street,
		Number:       req.Number,
		Neighborhood: req.Neighborhood,
		City:         req.City,
		Country:      req.Country,
		State:        req.State,
		ZipCode:      req.ZipCode,
		Phone:        req.Phone,
		Mobile:       req.Mobile,
		Email:        req.Email,
		Website:      req.Website,
	}

	if err := h.companyRepo.CreateCompany(company); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create company", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Company created successfully",
		"company": gin.H{
			"id":         company.ID.String(),
			"name":       company.Name,
			"created_at": company.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
	})
}

// GetCompanyByID busca uma empresa pelo ID
func (h *CompanyHandler) GetCompanyByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Company ID is required"})
		return
	}

	company, err := h.companyRepo.GetCompanyByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found", "details": err.Error()})
		return
	}

	response := gin.H{
		"id":           company.ID.String(),
		"name":         company.Name,
		"image_url":    company.ImageURL,
		"street":       company.Street,
		"number":       company.Number,
		"neighborhood": company.Neighborhood,
		"city":         company.City,
		"country":      company.Country,
		"state":        company.State,
		"zip_code":     company.ZipCode,
		"phone":        company.Phone,
		"mobile":       company.Mobile,
		"email":        company.Email,
		"website":      company.Website,
		"created_at":   company.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		"updated_at":   company.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, gin.H{"company": response})
}

// UpdateCompany atualiza uma empresa
func (h *CompanyHandler) UpdateCompany(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Company ID is required"})
		return
	}

	var req UpdateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.ImageURL != nil {
		updates["image_url"] = *req.ImageURL
	}
	if req.Street != nil {
		updates["street"] = *req.Street
	}
	if req.Number != nil {
		updates["number"] = *req.Number
	}
	if req.Neighborhood != nil {
		updates["neighborhood"] = *req.Neighborhood
	}
	if req.City != nil {
		updates["city"] = *req.City
	}
	if req.Country != nil {
		updates["country"] = *req.Country
	}
	if req.State != nil {
		updates["state"] = *req.State
	}
	if req.ZipCode != nil {
		updates["zip_code"] = *req.ZipCode
	}
	if req.Phone != nil {
		updates["phone"] = *req.Phone
	}
	if req.Mobile != nil {
		updates["mobile"] = *req.Mobile
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.Website != nil {
		updates["website"] = *req.Website
	}

	if err := h.companyRepo.UpdateCompany(id, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update company", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Company updated successfully"})
}

// DeleteCompany remove uma empresa
func (h *CompanyHandler) DeleteCompany(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Company ID is required"})
		return
	}

	if err := h.companyRepo.DeleteCompany(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete company", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Company deleted successfully"})
}

// ListCompanies lista todas as empresas com paginação
func (h *CompanyHandler) ListCompanies(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	response, err := h.companyRepo.ListCompanies(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list companies", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// SearchCompanies busca empresas por nome
func (h *CompanyHandler) SearchCompanies(c *gin.Context) {
	query := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	response, err := h.companyRepo.SearchCompanies(query, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search companies", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
