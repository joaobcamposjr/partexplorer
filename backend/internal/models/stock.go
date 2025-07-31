package models

import (
	"time"

	"github.com/google/uuid"
)

// Stock representa um registro de estoque
type Stock struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	PartNameID uuid.UUID `json:"part_name_id" gorm:"type:uuid;not null"`
	CompanyID  uuid.UUID `json:"company_id" gorm:"type:uuid;not null"`
	Quantity   *int      `json:"quantity" gorm:"type:int"`
	Price      *float64  `json:"price" gorm:"type:float"`
	Obsolete   bool      `json:"obsolete" gorm:"default:false"`
	CreatedAt  time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`

	// Relacionamentos
	PartName *PartName `gorm:"foreignKey:PartNameID" json:"part_name,omitempty"`
	Company  *Company  `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
}

// TableName especifica o nome da tabela
func (Stock) TableName() string {
	return "partexplorer.stock"
}

// StockResponse representa a resposta da API para estoque
type StockResponse struct {
	ID         string   `json:"id"`
	PartNameID string   `json:"part_name_id"`
	CompanyID  string   `json:"company_id"`
	Quantity   *int     `json:"quantity,omitempty"`
	Price      *float64 `json:"price,omitempty"`
	CreatedAt  string   `json:"created_at"`
	UpdatedAt  string   `json:"updated_at"`

	// Informações do SKU/EAN
	SKUName  string `json:"sku_name,omitempty"`
	SKUBrand string `json:"sku_brand,omitempty"`
	SKUType  string `json:"sku_type,omitempty"`

	// Informações da empresa
	CompanyName     string  `json:"company_name,omitempty"`
	CompanyImageURL *string `json:"company_image_url,omitempty"`
	CompanyPhone    *string `json:"company_phone,omitempty"`
	CompanyMobile   *string `json:"company_mobile,omitempty"`
	CompanyEmail    *string `json:"company_email,omitempty"`
	CompanyWebsite  *string `json:"company_website,omitempty"`
	CompanyAddress  *string `json:"company_address,omitempty"`
}

// CreateStockRequest representa a requisição para criar estoque
type CreateStockRequest struct {
	PartNameID string   `json:"part_name_id" binding:"required"`
	CompanyID  string   `json:"company_id" binding:"required"`
	Quantity   *int     `json:"quantity,omitempty"`
	Price      *float64 `json:"price,omitempty"`
}

// UpdateStockRequest representa a requisição para atualizar estoque
type UpdateStockRequest struct {
	CompanyID *string  `json:"company_id,omitempty"`
	Quantity  *int     `json:"quantity,omitempty"`
	Price     *float64 `json:"price,omitempty"`
}

// StockListResponse representa a resposta da API para lista de estoque
type StockListResponse struct {
	Stocks     []StockResponse `json:"stocks"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}

// CompanyResponse representa a resposta da API para empresa
type CompanyResponse struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
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
	CreatedAt    string  `json:"created_at"`
	UpdatedAt    string  `json:"updated_at"`
}

// CompanyListResponse representa a resposta da API para lista de empresas
type CompanyListResponse struct {
	Companies  []CompanyResponse `json:"companies"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}
