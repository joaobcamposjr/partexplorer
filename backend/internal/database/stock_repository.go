package database

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"partexplorer/backend/internal/models"
)

// StockRepository interface para operações de estoque
type StockRepository interface {
	CreateStock(stock *models.Stock) error
	GetStockByID(id string) (*models.Stock, error)
	GetStocksByPartNameID(partNameID string) ([]models.Stock, error)
	GetStocksByGroupID(groupID string) ([]models.Stock, error)
	UpdateStock(id string, updates map[string]interface{}) error
	DeleteStock(id string) error
	ListStocks(page, pageSize int) (*models.StockListResponse, error)
	SearchStocks(query string, page, pageSize int) (*models.StockListResponse, error)
}

// stockRepository implementação do repository
type stockRepository struct {
	db *gorm.DB
}

// NewStockRepository cria uma nova instância do repository
func NewStockRepository(db *gorm.DB) StockRepository {
	return &stockRepository{db: db}
}

// CreateStock cria um novo registro de estoque
func (r *stockRepository) CreateStock(stock *models.Stock) error {
	if stock.ID == uuid.Nil {
		stock.ID = uuid.New()
	}

	stock.CreatedAt = time.Now()
	stock.UpdatedAt = time.Now()

	return r.db.Create(stock).Error
}

// GetStockByID busca um estoque pelo ID
func (r *stockRepository) GetStockByID(id string) (*models.Stock, error) {
	stockID, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid stock ID: %w", err)
	}

	var stock models.Stock
	if err := r.db.Preload("PartName").Preload("Company").Where("id = ?", stockID).First(&stock).Error; err != nil {
		return nil, fmt.Errorf("failed to get stock: %w", err)
	}

	return &stock, nil
}

// GetStocksByPartNameID busca todos os estoques de um SKU/EAN específico
func (r *stockRepository) GetStocksByPartNameID(partNameID string) ([]models.Stock, error) {
	partNameUUID, err := uuid.Parse(partNameID)
	if err != nil {
		return nil, fmt.Errorf("invalid part name ID: %w", err)
	}

	var stocks []models.Stock
	if err := r.db.Preload("PartName").Preload("Company").Where("part_name_id = ?", partNameUUID).Find(&stocks).Error; err != nil {
		return nil, fmt.Errorf("failed to get stocks by part name: %w", err)
	}

	return stocks, nil
}

// GetStocksByGroupID busca todos os estoques de um grupo (via part_names)
func (r *stockRepository) GetStocksByGroupID(groupID string) ([]models.Stock, error) {
	groupUUID, err := uuid.Parse(groupID)
	if err != nil {
		return nil, fmt.Errorf("invalid group ID: %w", err)
	}

	var stocks []models.Stock
	if err := r.db.Preload("PartName").Preload("Company").
		Joins("JOIN partexplorer.part_name pn ON pn.id = stock.part_name_id").
		Where("pn.group_id = ?", groupUUID).
		Find(&stocks).Error; err != nil {
		return nil, fmt.Errorf("failed to get stocks by group: %w", err)
	}

	return stocks, nil
}

// UpdateStock atualiza um registro de estoque
func (r *stockRepository) UpdateStock(id string, updates map[string]interface{}) error {
	stockID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid stock ID: %w", err)
	}

	updates["updated_at"] = time.Now()

	if err := r.db.Model(&models.Stock{}).Where("id = ?", stockID).Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to update stock: %w", err)
	}

	return nil
}

// DeleteStock remove um registro de estoque
func (r *stockRepository) DeleteStock(id string) error {
	stockID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid stock ID: %w", err)
	}

	if err := r.db.Where("id = ?", stockID).Delete(&models.Stock{}).Error; err != nil {
		return fmt.Errorf("failed to delete stock: %w", err)
	}

	return nil
}

// ListStocks lista todos os estoques com paginação
func (r *stockRepository) ListStocks(page, pageSize int) (*models.StockListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var stocks []models.Stock
	var total int64

	// Contar total
	if err := r.db.Model(&models.Stock{}).Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count stocks: %w", err)
	}

	// Buscar resultados com informações do SKU e empresa
	if err := r.db.Preload("PartName").Preload("Company").Offset(offset).Limit(pageSize).Find(&stocks).Error; err != nil {
		return nil, fmt.Errorf("failed to list stocks: %w", err)
	}

	// Converter para response
	stockResponses := make([]models.StockResponse, len(stocks))
	for i, stock := range stocks {
		response := models.StockResponse{
			ID:         stock.ID.String(),
			PartNameID: stock.PartNameID.String(),
			CompanyID:  stock.CompanyID.String(),
			Quantity:   stock.Quantity,
			Price:      stock.Price,
			CreatedAt:  stock.CreatedAt.Format(time.RFC3339),
			UpdatedAt:  stock.UpdatedAt.Format(time.RFC3339),
		}

		// Adicionar informações do SKU se disponível
		if stock.PartName != nil {
			response.SKUName = stock.PartName.Name
			response.SKUType = stock.PartName.Type
			// Brand agora vem do BrandID em PartName
			if stock.PartName.BrandID != uuid.Nil {
				response.SKUBrand = stock.PartName.BrandID.String()
			}
		}

		// Adicionar informações da empresa se disponível
		if stock.Company != nil {
			response.CompanyName = stock.Company.Name
			response.CompanyImageURL = stock.Company.ImageURL
			response.CompanyPhone = stock.Company.Phone
			response.CompanyMobile = stock.Company.Mobile
			response.CompanyEmail = stock.Company.Email
			response.CompanyWebsite = stock.Company.Website
		}

		stockResponses[i] = response
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &models.StockListResponse{
		Stocks:     stockResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// SearchStocks busca estoques por empresa
func (r *stockRepository) SearchStocks(query string, page, pageSize int) (*models.StockListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var stocks []models.Stock
	var total int64

	baseQuery := r.db.Model(&models.Stock{}).Preload("PartName").Preload("Company")

	// Aplicar filtro de busca
	if query != "" {
		baseQuery = baseQuery.Joins("JOIN partexplorer.company c ON c.id = stock.company_id").
			Where("c.name ILIKE ?", "%"+query+"%")
	}

	// Contar total
	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count stocks: %w", err)
	}

	// Buscar resultados
	if err := baseQuery.Offset(offset).Limit(pageSize).Find(&stocks).Error; err != nil {
		return nil, fmt.Errorf("failed to search stocks: %w", err)
	}

	// Converter para response
	stockResponses := make([]models.StockResponse, len(stocks))
	for i, stock := range stocks {
		response := models.StockResponse{
			ID:         stock.ID.String(),
			PartNameID: stock.PartNameID.String(),
			CompanyID:  stock.CompanyID.String(),
			Quantity:   stock.Quantity,
			Price:      stock.Price,
			CreatedAt:  stock.CreatedAt.Format(time.RFC3339),
			UpdatedAt:  stock.UpdatedAt.Format(time.RFC3339),
		}

		// Adicionar informações do SKU se disponível
		if stock.PartName != nil {
			response.SKUName = stock.PartName.Name
			response.SKUType = stock.PartName.Type
			// Brand agora vem do BrandID em PartName
			if stock.PartName.BrandID != uuid.Nil {
				response.SKUBrand = stock.PartName.BrandID.String()
			}
		}

		// Adicionar informações da empresa se disponível
		if stock.Company != nil {
			response.CompanyName = stock.Company.Name
			response.CompanyImageURL = stock.Company.ImageURL
			response.CompanyPhone = stock.Company.Phone
			response.CompanyMobile = stock.Company.Mobile
			response.CompanyEmail = stock.Company.Email
			response.CompanyWebsite = stock.Company.Website
		}

		stockResponses[i] = response
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &models.StockListResponse{
		Stocks:     stockResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}
