package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"partexplorer/backend/internal/database"
	"partexplorer/backend/internal/models"
)

// StockHandler gerencia as requisições relacionadas ao estoque
type StockHandler struct {
	stockRepo database.StockRepository
}

// NewStockHandler cria uma nova instância do handler
func NewStockHandler(stockRepo database.StockRepository) *StockHandler {
	return &StockHandler{
		stockRepo: stockRepo,
	}
}

// parseUUIDFromString converte string para UUID
func parseUUIDFromString(s string) (uuid.UUID, error) {
	if s == "" {
		return uuid.Nil, nil
	}
	return uuid.Parse(s)
}

// CreateStock cria um novo registro de estoque
func (h *StockHandler) CreateStock(c *gin.Context) {
	var req models.CreateStockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Converter string para UUID
	partNameID, err := parseUUIDFromString(req.PartNameID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid part name ID"})
		return
	}

	companyID, err := parseUUIDFromString(req.CompanyID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	stock := &models.Stock{
		PartNameID: partNameID,
		CompanyID:  companyID,
		Quantity:   req.Quantity,
		Price:      req.Price,
	}

	if err := h.stockRepo.CreateStock(stock); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stock", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Stock created successfully",
		"stock": gin.H{
			"id":           stock.ID.String(),
			"part_name_id": stock.PartNameID.String(),
			"company_id":   stock.CompanyID.String(),
			"quantity":     stock.Quantity,
			"price":        stock.Price,
		},
	})
}

// GetStockByID busca um estoque pelo ID
func (h *StockHandler) GetStockByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Stock ID is required"})
		return
	}

	stock, err := h.stockRepo.GetStockByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found", "details": err.Error()})
		return
	}

	response := gin.H{
		"id":           stock.ID.String(),
		"part_name_id": stock.PartNameID.String(),
		"company_id":   stock.CompanyID.String(),
		"quantity":     stock.Quantity,
		"price":        stock.Price,
		"created_at":   stock.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		"updated_at":   stock.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Adicionar informações do SKU se disponível
	if stock.PartName != nil {
		response["sku_name"] = stock.PartName.Name
		response["sku_type"] = stock.PartName.Type
		// Brand agora vem do BrandID em PartName
		if stock.PartName.BrandID != uuid.Nil {
			response["sku_brand_id"] = stock.PartName.BrandID.String()
		}
	}

	// Adicionar informações da empresa se disponível
	if stock.Company != nil {
		response["company_name"] = stock.Company.Name
		response["company_image_url"] = stock.Company.ImageURL
		response["company_phone"] = stock.Company.Phone
		response["company_mobile"] = stock.Company.Mobile
		response["company_email"] = stock.Company.Email
		response["company_website"] = stock.Company.Website

		// Montar endereço completo
		if stock.Company.Street != nil || stock.Company.City != nil {
			address := ""
			if stock.Company.Street != nil {
				address += *stock.Company.Street
			}
			if stock.Company.Number != nil {
				address += ", " + *stock.Company.Number
			}
			if stock.Company.Neighborhood != nil {
				address += " - " + *stock.Company.Neighborhood
			}
			if stock.Company.City != nil {
				address += ", " + *stock.Company.City
			}
			if stock.Company.State != nil {
				address += "/" + *stock.Company.State
			}
			if stock.Company.ZipCode != nil {
				address += " - " + *stock.Company.ZipCode
			}
			response["company_address"] = address
		}
	}

	c.JSON(http.StatusOK, gin.H{"stock": response})
}

// GetStocksByPartNameID busca todos os estoques de um SKU/EAN específico
func (h *StockHandler) GetStocksByPartNameID(c *gin.Context) {
	partNameID := c.Param("part_name_id")
	if partNameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Part name ID is required"})
		return
	}

	stocks, err := h.stockRepo.GetStocksByPartNameID(partNameID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get stocks", "details": err.Error()})
		return
	}

	stockResponses := make([]gin.H, len(stocks))
	for i, stock := range stocks {
		response := gin.H{
			"id":           stock.ID.String(),
			"part_name_id": stock.PartNameID.String(),
			"company_id":   stock.CompanyID.String(),
			"quantity":     stock.Quantity,
			"price":        stock.Price,
			"created_at":   stock.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			"updated_at":   stock.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}

		// Adicionar informações do SKU se disponível
		if stock.PartName != nil {
			response["sku_name"] = stock.PartName.Name
			response["sku_type"] = stock.PartName.Type
			// Brand agora vem do BrandID em PartName
			if stock.PartName.BrandID != uuid.Nil {
				response["sku_brand_id"] = stock.PartName.BrandID.String()
			}
		}

		// Adicionar informações da empresa se disponível
		if stock.Company != nil {
			response["company_name"] = stock.Company.Name
			response["company_image_url"] = stock.Company.ImageURL
			response["company_phone"] = stock.Company.Phone
			response["company_mobile"] = stock.Company.Mobile
			response["company_email"] = stock.Company.Email
			response["company_website"] = stock.Company.Website
		}

		stockResponses[i] = response
	}

	c.JSON(http.StatusOK, gin.H{
		"stocks": stockResponses,
		"total":  len(stocks),
	})
}

// GetStocksByGroupID busca todos os estoques de um grupo
func (h *StockHandler) GetStocksByGroupID(c *gin.Context) {
	groupID := c.Param("group_id")
	if groupID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group ID is required"})
		return
	}

	stocks, err := h.stockRepo.GetStocksByGroupID(groupID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get stocks", "details": err.Error()})
		return
	}

	stockResponses := make([]gin.H, len(stocks))
	for i, stock := range stocks {
		response := gin.H{
			"id":           stock.ID.String(),
			"part_name_id": stock.PartNameID.String(),
			"company_id":   stock.CompanyID.String(),
			"quantity":     stock.Quantity,
			"price":        stock.Price,
			"created_at":   stock.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			"updated_at":   stock.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}

		// Adicionar informações do SKU se disponível
		if stock.PartName != nil {
			response["sku_name"] = stock.PartName.Name
			response["sku_type"] = stock.PartName.Type
			// Brand agora vem do BrandID em PartName
			if stock.PartName.BrandID != uuid.Nil {
				response["sku_brand_id"] = stock.PartName.BrandID.String()
			}
		}

		// Adicionar informações da empresa se disponível
		if stock.Company != nil {
			response["company_name"] = stock.Company.Name
			response["company_image_url"] = stock.Company.ImageURL
			response["company_phone"] = stock.Company.Phone
			response["company_mobile"] = stock.Company.Mobile
			response["company_email"] = stock.Company.Email
			response["company_website"] = stock.Company.Website
		}

		stockResponses[i] = response
	}

	c.JSON(http.StatusOK, gin.H{
		"stocks": stockResponses,
		"total":  len(stocks),
	})
}

// UpdateStock atualiza um registro de estoque
func (h *StockHandler) UpdateStock(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Stock ID is required"})
		return
	}

	var req models.UpdateStockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	updates := make(map[string]interface{})
	if req.CompanyID != nil {
		companyID, err := parseUUIDFromString(*req.CompanyID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
			return
		}
		updates["company_id"] = companyID
	}
	if req.Quantity != nil {
		updates["quantity"] = *req.Quantity
	}
	if req.Price != nil {
		updates["price"] = *req.Price
	}

	if err := h.stockRepo.UpdateStock(id, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Stock updated successfully"})
}

// DeleteStock remove um registro de estoque
func (h *StockHandler) DeleteStock(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Stock ID is required"})
		return
	}

	if err := h.stockRepo.DeleteStock(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stock", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Stock deleted successfully"})
}

// ListStocks lista todos os estoques com paginação
func (h *StockHandler) ListStocks(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	response, err := h.stockRepo.ListStocks(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list stocks", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// SearchStocks busca estoques por empresa
func (h *StockHandler) SearchStocks(c *gin.Context) {
	query := c.Query("q")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	response, err := h.stockRepo.SearchStocks(query, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search stocks", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
