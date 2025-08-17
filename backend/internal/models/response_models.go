package models

import (
	"github.com/google/uuid"
)

// CleanBrand - Marca sem campos técnicos
type CleanBrand struct {
	Name    string `json:"name"`
	LogoURL string `json:"logo_url,omitempty"`
}

// CleanFamily - Família sem campos técnicos
type CleanFamily struct {
	Description string `json:"description"`
}

// CleanSubfamily - Subfamília sem campos técnicos
type CleanSubfamily struct {
	Description string      `json:"description"`
	Family      CleanFamily `json:"family"`
}

// CleanProductType - Tipo de Produto sem campos técnicos
type CleanProductType struct {
	Description string         `json:"description"`
	Subfamily   CleanSubfamily `json:"subfamily"`
}

// CleanPartGroupDimension - Dimensões sem campos técnicos
type CleanPartGroupDimension struct {
	LengthMM *float64 `json:"length_mm,omitempty"`
	WidthMM  *float64 `json:"width_mm,omitempty"`
	HeightMM *float64 `json:"height_mm,omitempty"`
	WeightKG *float64 `json:"weight_kg,omitempty"`
}

// CleanPartName - Nome da peça sem campos técnicos
type CleanPartName struct {
	Name    string      `json:"name"`
	Type    string      `json:"type"`
	BrandID uuid.UUID   `json:"brand_id"`
	Brand   *CleanBrand `json:"brand,omitempty"`
}

// CleanPartImage - Imagem sem campos técnicos
type CleanPartImage struct {
	URL string `json:"url"`
}

// CleanApplication - Aplicação sem campos técnicos
type CleanApplication struct {
	Line           string `json:"line"`
	Manufacturer   string `json:"manufacturer"`
	Model          string `json:"model"`
	Version        string `json:"version"`
	Generation     string `json:"generation"`
	Engine         string `json:"engine"`
	Body           string `json:"body"`
	Fuel           string `json:"fuel"`
	YearStart      *int   `json:"year_start,omitempty"`
	YearEnd        *int   `json:"year_end,omitempty"`
	Reliable       bool   `json:"reliable"`
	Adaptation     bool   `json:"adaptation"`
	AdditionalInfo string `json:"additional_info,omitempty"`
	Cylinders      string `json:"cylinders"`
	HP             string `json:"hp"`
	Image          string `json:"image"`
}

// CleanCompany - Empresa sem campos técnicos
type CleanCompany struct {
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
}

// CleanStock - Estoque sem campos técnicos
type CleanStock struct {
	Quantity *int         `json:"quantity,omitempty"`
	Price    *float64     `json:"price,omitempty"`
	Obsolete bool         `json:"obsolete"`
	Company  CleanCompany `json:"company"`
}

// CleanPartGroup - Grupo de peças sem campos técnicos
type CleanPartGroup struct {
	Discontinued bool                     `json:"discontinued"`
	ProductType  *CleanProductType        `json:"product_type,omitempty"`
	Dimension    *CleanPartGroupDimension `json:"dimension,omitempty"`
}

// CleanSearchResult - Resultado de busca limpo
type CleanSearchResult struct {
	ID           string             `json:"id"`
	PartGroup    CleanPartGroup     `json:"part_group"`
	Names        []CleanPartName    `json:"names"`
	Images       []CleanPartImage   `json:"images"`
	Applications []CleanApplication `json:"applications"`
	Stocks       []CleanStock       `json:"stocks"`
	Score        float64            `json:"score"`
}

// CleanSearchResponse - Resposta de busca limpa
type CleanSearchResponse struct {
	Results    []CleanSearchResult `json:"results"`
	Total      int64               `json:"total"`
	Page       int                 `json:"page"`
	PageSize   int                 `json:"page_size"`
	TotalPages int                 `json:"total_pages"`
	Query      string              `json:"query"`
}
