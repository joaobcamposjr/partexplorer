package models

import (
	"time"

	"github.com/google/uuid"
)

// Brand - Marca
type Brand struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	Name      string    `gorm:"size:80;not null" json:"name"`
	LogoURL   string    `gorm:"size:300" json:"logo_url"`
	CreatedAt time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
}

func (Brand) TableName() string {
	return "partexplorer.brand"
}

// Family - Família
type Family struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	Description string    `gorm:"size:80;not null" json:"description"`
	CreatedAt   time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
}

func (Family) TableName() string {
	return "partexplorer.family"
}

// Subfamily - Subfamília
type Subfamily struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	FamilyID    uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	Description string    `gorm:"size:80;not null" json:"description"`
	Family      Family    `gorm:"foreignKey:FamilyID" json:"family"`
	CreatedAt   time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
}

func (Subfamily) TableName() string {
	return "partexplorer.subfamily"
}

// ProductType - Tipo de Produto
type ProductType struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	SubfamilyID uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	Description string    `gorm:"size:80;not null" json:"description"`
	Subfamily   Subfamily `gorm:"foreignKey:SubfamilyID" json:"subfamily"`
	CreatedAt   time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
}

func (ProductType) TableName() string {
	return "partexplorer.product_type"
}

// Company - Empresa/Fornecedor
type Company struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	Name         string    `gorm:"size:255;not null" json:"name"`
	ImageURL     *string   `gorm:"size:255" json:"image_url,omitempty"`
	Street       *string   `gorm:"size:255" json:"street,omitempty"`
	Number       *string   `gorm:"size:10" json:"number,omitempty"`
	Neighborhood *string   `gorm:"size:255" json:"neighborhood,omitempty"`
	City         *string   `gorm:"size:255" json:"city,omitempty"`
	Country      *string   `gorm:"size:255" json:"country,omitempty"`
	State        *string   `gorm:"size:2" json:"state,omitempty"`
	ZipCode      *string   `gorm:"size:25" json:"zip_code,omitempty"`
	Phone        *string   `gorm:"size:20" json:"phone,omitempty"`
	Mobile       *string   `gorm:"size:20" json:"mobile,omitempty"`
	Email        *string   `gorm:"size:255" json:"email,omitempty"`
	Website      *string   `gorm:"size:255" json:"website,omitempty"`
	CreatedAt    time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`

	// Relacionamentos
	Stocks []Stock `gorm:"foreignKey:CompanyID" json:"stocks,omitempty"`
}

func (Company) TableName() string {
	return "partexplorer.company"
}

// PartGroup - Grupo de Peças (similaridade)
type PartGroup struct {
	ID            uuid.UUID           `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	ProductTypeID *uuid.UUID          `gorm:"type:uuid" json:"-"`
	Discontinued  bool                `json:"discontinued"`
	ProductType   *ProductType        `gorm:"foreignKey:ProductTypeID" json:"product_type"`
	Dimension     *PartGroupDimension `gorm:"foreignKey:ID" json:"dimension"`
	Names         []PartName          `gorm:"foreignKey:GroupID" json:"names"`
	Images        []PartImage         `gorm:"foreignKey:GroupID" json:"images"`
	Applications  []Application       `gorm:"many2many:partexplorer.part_group_application;foreignKey:GroupID;joinForeignKey:group_id;References:ID;joinReferences:application_id;" json:"applications"`
	CreatedAt     time.Time           `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt     time.Time           `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
}

func (PartGroup) TableName() string {
	return "partexplorer.part_group"
}

// PartGroupDimension - Dimensões da peça
type PartGroupDimension struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"-"`
	LengthMM  *float64  `gorm:"type:numeric(10,2)" json:"length_mm"`
	WidthMM   *float64  `gorm:"type:numeric(10,2)" json:"width_mm"`
	HeightMM  *float64  `gorm:"type:numeric(10,2)" json:"height_mm"`
	WeightKG  *float64  `gorm:"type:numeric(10,3)" json:"weight_kg"`
	CreatedAt time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
}

func (PartGroupDimension) TableName() string {
	return "partexplorer.part_group_dimension"
}

// PartName - Nomes/SKUs/Aliases
type PartName struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	GroupID   uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	BrandID   uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	Type      string    `gorm:"size:255;not null" json:"type"`
	CreatedAt time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`

	// Relacionamentos
	Brand  *Brand  `gorm:"foreignKey:BrandID" json:"brand,omitempty"`
	Stocks []Stock `gorm:"foreignKey:PartNameID" json:"stocks,omitempty"`
}

func (PartName) TableName() string {
	return "partexplorer.part_name"
}

// PartImage - Imagens da peça
type PartImage struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	GroupID   uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	URL       string    `gorm:"size:300;not null" json:"url"`
	CreatedAt time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
}

func (PartImage) TableName() string {
	return "partexplorer.part_image"
}

// PartVideo - Vídeos da peça
type PartVideo struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	GroupID   uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	URL       string    `gorm:"size:300" json:"url"`
	CreatedAt time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
}

func (PartVideo) TableName() string {
	return "partexplorer.part_video"
}

// Application - Aplicações (veículos)
type Application struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"-"`
	Line           string    `gorm:"size:40" json:"line"`
	Manufacturer   string    `gorm:"size:40" json:"manufacturer"`
	Model          string    `gorm:"size:60" json:"model"`
	Version        string    `gorm:"size:40" json:"version"`
	Generation     string    `gorm:"size:20" json:"generation"`
	Engine         string    `gorm:"size:40" json:"engine"`
	Body           string    `gorm:"size:40" json:"body"`
	Fuel           string    `gorm:"size:20" json:"fuel"`
	YearStart      *int      `json:"year_start"`
	YearEnd        *int      `json:"year_end"`
	Reliable       bool      `json:"reliable"`
	Adaptation     bool      `json:"adaptation"`
	AdditionalInfo string    `gorm:"type:text" json:"additional_info"`
	Cylinders      string    `gorm:"size:10" json:"cylinders"`
	HP             string    `gorm:"size:10" json:"hp"`
	Image          string    `gorm:"size:300" json:"image"`
	CreatedAt      time.Time `json:"created_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"type:timestamp with time zone;default:current_timestamp"`
}

func (Application) TableName() string {
	return "partexplorer.application"
}

// PartGroupApplication - Relação N:N entre PartGroup e Application
type PartGroupApplication struct {
	GroupID       uuid.UUID `gorm:"type:uuid;primaryKey;column:group_id" json:"-"`
	ApplicationID uuid.UUID `gorm:"type:uuid;primaryKey;column:application_id" json:"-"`
}

func (PartGroupApplication) TableName() string {
	return "partexplorer.part_group_application"
}

// SearchResult - Resultado de busca
type SearchResult struct {
	PartGroup    PartGroup           `json:"part_group"`
	Names        []PartName          `json:"names"`
	Images       []PartImage         `json:"images"`
	Applications []Application       `json:"applications"`
	Stocks       []Stock             `json:"stocks"`
	Dimension    *PartGroupDimension `json:"dimension"`
	Score        float64             `json:"score"`
}

// SearchRequest - Requisição de busca
type SearchRequest struct {
	Query     string `json:"query" form:"q"`
	Page      int    `json:"page" form:"page"`
	PageSize  int    `json:"page_size" form:"page_size"`
	Brand     string `json:"brand" form:"brand"`
	Family    string `json:"family" form:"family"`
	Model     string `json:"model" form:"model"`
	YearStart int    `json:"year_start" form:"year_start"`
	YearEnd   int    `json:"year_end" form:"year_end"`
}

// SearchResponse - Resposta de busca
type SearchResponse struct {
	Results    []SearchResult `json:"results"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"page_size"`
	TotalPages int            `json:"total_pages"`
	Query      string         `json:"query"`
}
