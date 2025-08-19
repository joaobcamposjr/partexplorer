package database

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"partexplorer/backend/internal/models"
)

// CompanyRepository interface para operações de empresa
type CompanyRepository interface {
	CreateCompany(company *models.Company) error
	GetCompanyByID(id string) (*models.Company, error)
	UpdateCompany(id string, updates map[string]interface{}) error
	DeleteCompany(id string) error
	ListCompanies(page, pageSize int) (*models.CompanyListResponse, error)
	SearchCompanies(query string, page, pageSize int) (*models.CompanyListResponse, error)
}

// companyRepository implementação do repository
type companyRepository struct {
	db *gorm.DB
}

// NewCompanyRepository cria uma nova instância do repository
func NewCompanyRepository(db *gorm.DB) CompanyRepository {
	return &companyRepository{db: db}
}

// CreateCompany cria uma nova empresa
func (r *companyRepository) CreateCompany(company *models.Company) error {
	if company.ID == uuid.Nil {
		company.ID = uuid.New()
	}

	company.CreatedAt = time.Now()
	company.UpdatedAt = time.Now()

	return r.db.Create(company).Error
}

// GetCompanyByID busca uma empresa pelo ID
func (r *companyRepository) GetCompanyByID(id string) (*models.Company, error) {
	companyID, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid company ID: %w", err)
	}

	var company models.Company
	if err := r.db.Where("id = ?", companyID).First(&company).Error; err != nil {
		return nil, fmt.Errorf("failed to get company: %w", err)
	}

	return &company, nil
}

// UpdateCompany atualiza uma empresa
func (r *companyRepository) UpdateCompany(id string, updates map[string]interface{}) error {
	companyID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid company ID: %w", err)
	}

	updates["updated_at"] = time.Now()

	if err := r.db.Model(&models.Company{}).Where("id = ?", companyID).Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to update company: %w", err)
	}

	return nil
}

// DeleteCompany remove uma empresa
func (r *companyRepository) DeleteCompany(id string) error {
	companyID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid company ID: %w", err)
	}

	if err := r.db.Where("id = ?", companyID).Delete(&models.Company{}).Error; err != nil {
		return fmt.Errorf("failed to delete company: %w", err)
	}

	return nil
}

// ListCompanies lista todas as empresas com paginação
func (r *companyRepository) ListCompanies(page, pageSize int) (*models.CompanyListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var companies []models.Company
	var total int64

	// Contar total com distinct por group_name
	if err := r.db.Model(&models.Company{}).Select("COUNT(DISTINCT group_name)").Scan(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count companies: %w", err)
	}

	// Buscar resultados com distinct por group_name usando SQL direto
	query := `
		SELECT DISTINCT ON (name) 
			id, name, image_url, street, number, neighborhood, city, country, state, zip_code, phone, mobile, email, website, created_at, updated_at, group_name
		FROM partexplorer.company 
		WHERE name IS NOT NULL AND name != ''
		ORDER BY name
		LIMIT ? OFFSET ?
	`

	if err := r.db.Raw(query, pageSize, offset).Scan(&companies).Error; err != nil {
		return nil, fmt.Errorf("failed to list companies: %w", err)
	}

	// Converter para response
	companyResponses := make([]models.CompanyResponse, len(companies))
	for i, company := range companies {
		response := models.CompanyResponse{
			ID:           company.ID.String(),
			Name:         company.Name,
			ImageURL:     company.ImageURL,
			Street:       company.Street,
			Number:       company.Number,
			Neighborhood: company.Neighborhood,
			City:         company.City,
			Country:      company.Country,
			State:        company.State,
			ZipCode:      company.ZipCode,
			Phone:        company.Phone,
			Mobile:       company.Mobile,
			Email:        company.Email,
			Website:      company.Website,
			CreatedAt:    company.CreatedAt.Format(time.RFC3339),
			UpdatedAt:    company.UpdatedAt.Format(time.RFC3339),
		}

		companyResponses[i] = response
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &models.CompanyListResponse{
		Companies:  companyResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// SearchCompanies busca empresas por nome
func (r *companyRepository) SearchCompanies(query string, page, pageSize int) (*models.CompanyListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var companies []models.Company
	var total int64

	baseQuery := r.db.Model(&models.Company{})

	// Aplicar filtro de busca
	if query != "" {
		baseQuery = baseQuery.Where("name ILIKE ?", "%"+query+"%")
	}

	// Contar total
	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count companies: %w", err)
	}

	// Buscar resultados
	if err := baseQuery.Offset(offset).Limit(pageSize).Find(&companies).Error; err != nil {
		return nil, fmt.Errorf("failed to search companies: %w", err)
	}

	// Converter para response
	companyResponses := make([]models.CompanyResponse, len(companies))
	for i, company := range companies {
		response := models.CompanyResponse{
			ID:           company.ID.String(),
			Name:         company.Name,
			ImageURL:     company.ImageURL,
			Street:       company.Street,
			Number:       company.Number,
			Neighborhood: company.Neighborhood,
			City:         company.City,
			Country:      company.Country,
			State:        company.State,
			ZipCode:      company.ZipCode,
			Phone:        company.Phone,
			Mobile:       company.Mobile,
			Email:        company.Email,
			Website:      company.Website,
			CreatedAt:    company.CreatedAt.Format(time.RFC3339),
			UpdatedAt:    company.UpdatedAt.Format(time.RFC3339),
		}

		companyResponses[i] = response
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &models.CompanyListResponse{
		Companies:  companyResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}
