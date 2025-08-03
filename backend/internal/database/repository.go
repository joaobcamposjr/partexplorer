package database

import (
	"database/sql"
	"fmt"
	"strconv"
	"time"

	"partexplorer/backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PartRepository interface para operações de busca
type PartRepository interface {
	SearchParts(query string, page, pageSize int) (*models.SearchResponse, error)
	SearchPartsSQL(query string, page, pageSize int) (*models.SearchResponse, error)
	SearchPartsByCompany(companyName string, state string, page, pageSize int) (*models.SearchResponse, error)
	GetPartByID(id string) (*models.SearchResult, error)
	GetApplications() ([]models.Application, error)
	GetBrands() ([]models.Brand, error)
	GetFamilies() ([]models.Family, error)
	GetAllCompanies() ([]models.Company, error)
	DebugPartGroup(id string) (*models.PartGroup, error)
	DebugPartGroupSQL(id string) (map[string]interface{}, error)
	DebugPartNames(groupID string) ([]map[string]interface{}, error)
	DebugPartApplications(groupID string) ([]map[string]interface{}, error)
}

// SearchPartsByCompany busca peças que uma empresa específica tem em estoque
func (r *partRepository) SearchPartsByCompany(companyName string, state string, page, pageSize int) (*models.SearchResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	// Query SQL direta para buscar part_groups que têm estoque na empresa específica
	query := `
		SELECT DISTINCT pg.* 
		FROM partexplorer.part_group pg
		JOIN partexplorer.part_name pn ON pn.group_id = pg.id
		JOIN partexplorer.stock s ON s.part_name_id = pn.id
		JOIN partexplorer.company c ON c.id = s.company_id
		WHERE LOWER(c.name) ILIKE LOWER($1)
	`

	// Adicionar filtro de estado se especificado
	if state != "" {
		query += " AND LOWER(c.state) ILIKE LOWER($2)"
		query += " ORDER BY pg.created_at DESC LIMIT $3 OFFSET $4"
	} else {
		query += " ORDER BY pg.created_at DESC LIMIT $2 OFFSET $3"
	}

	// Usar database/sql puro para evitar problemas do GORM
	sqlDB, err := r.db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// Executar query usando database/sql puro
	var rows *sql.Rows
	if state != "" {
		rows, err = sqlDB.Query(query, "%"+companyName+"%", "%"+state+"%", pageSize, offset)
	} else {
		rows, err = sqlDB.Query(query, "%"+companyName+"%", pageSize, offset)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	// Ler resultados
	var partGroups []models.PartGroup
	for rows.Next() {
		var pg models.PartGroup
		err := rows.Scan(&pg.ID, &pg.ProductTypeID, &pg.Discontinued, &pg.CreatedAt, &pg.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		partGroups = append(partGroups, pg)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	// Contar total de forma simples
	total := int64(len(partGroups))

	// Converter para SearchResult e carregar dados relacionados
	results := make([]models.SearchResult, len(partGroups))
	for i, pg := range partGroups {
		// Carregar names, images, applications e stocks manualmente
		names := loadPartNames(r.db, pg.ID)
		images := loadPartImages(r.db, pg.ID)
		applications := loadPartApplications(r.db, pg.ID)
		
		// Carregar product_type com relacionamentos
		if pg.ProductTypeID != nil {
			var productType models.ProductType
			r.db.Preload("Subfamily.Family").First(&productType, *pg.ProductTypeID)
			pg.ProductType = &productType
		}
		
		// Carregar brand para cada name
		for i := range names {
			fmt.Printf("DEBUG: Name %d - BrandID: %s\n", i, names[i].BrandID)
			if names[i].BrandID != uuid.Nil {
				var brand models.Brand
				err := r.db.First(&brand, names[i].BrandID).Error
				if err != nil {
					fmt.Printf("DEBUG: Erro ao carregar brand: %v\n", err)
				} else {
					fmt.Printf("DEBUG: Brand carregada: %s\n", brand.Name)
					names[i].Brand = &brand
				}
			}
		}

		// Dados carregados com sucesso

		// Carregar estoques específicos da empresa
		var allStocks []models.Stock
		for _, pn := range names {
			var stocks []models.Stock
			err := r.db.Model(&models.Stock{}).
				Joins("JOIN partexplorer.company c ON c.id = stock.company_id").
				Where("stock.part_name_id = ? AND LOWER(c.name) ILIKE LOWER(?)", pn.ID, "%"+companyName+"%").
				Preload("Company").
				Find(&stocks).Error

			if err == nil {
				allStocks = append(allStocks, stocks...)
			}
		}

		results[i] = models.SearchResult{
			PartGroup:    pg,
			Names:        names,
			Images:       images,
			Applications: applications,
			Stocks:       allStocks,
			Dimension:    pg.Dimension,
			Score:        1.0,
		}
	}

	return &models.SearchResponse{
		Results:  results,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// partRepository implementação do repositório
type partRepository struct {
	db *gorm.DB
}

// NewPartRepository cria uma nova instância do repositório
func NewPartRepository(db *gorm.DB) PartRepository {
	return &partRepository{db: db}
}

// SearchParts busca peças com base na query
func (r *partRepository) SearchParts(query string, page, pageSize int) (*models.SearchResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	// Query base com preloads específicos
	baseQuery := r.db.Model(&models.PartGroup{}).
		Preload("ProductType").
		Preload("ProductType.Subfamily").
		Preload("ProductType.Subfamily.Family").
		Preload("Dimension").
		Preload("Names").
		Preload("Images").
		Preload("Stocks")
		// Preload("Applications") // Temporariamente removido

	// Aplicar filtros de busca
	if query != "" {
		// Busca em part_name (incluindo EANs que foram movidos)
		baseQuery = baseQuery.Joins("JOIN partexplorer.part_name pn ON pn.group_id = partexplorer.part_group.id").
			Where("pn.name ILIKE ?", "%"+query+"%")
	}

	// Contar total
	var total int64
	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count results: %w", err)
	}

	// Buscar resultados
	var partGroups []models.PartGroup
	if err := baseQuery.Offset(offset).Limit(pageSize).Find(&partGroups).Error; err != nil {
		return nil, fmt.Errorf("failed to search parts: %w", err)
	}

	// Converter para SearchResult
	results := make([]models.SearchResult, len(partGroups))
	for i, pg := range partGroups {
		results[i] = models.SearchResult{
			PartGroup:    pg,
			Names:        pg.Names,
			Images:       pg.Images,
			Stocks:       []models.Stock{},       // Vazio por enquanto - estoque agora é por SKU
			Applications: []models.Application{}, // Vazio por enquanto
			Dimension:    pg.Dimension,
			Score:        1.0, // Score básico, será melhorado com Elasticsearch
		}
	}

	// Após carregar os partGroups, para cada partGroup, buscar os part_names e para cada part_name buscar os estoques relacionados.
	// Atualizar o campo Stocks de cada SearchResult para incluir os estoques de cada SKU/EAN.
	for i, pg := range partGroups {
		partGroupID := pg.ID
		partNames := loadPartNames(r.db, partGroupID)
		for _, pn := range partNames {
			stocks := loadStocks(r.db, pn.ID)
			results[i].Stocks = append(results[i].Stocks, stocks...)
		}
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &models.SearchResponse{
		Results:    results,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		Query:      query,
	}, nil
}

// SearchPartsSQL busca peças usando SQL direto
func (r *partRepository) SearchPartsSQL(query string, page, pageSize int) (*models.SearchResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	// Query principal para buscar part_groups
	mainQuery := `
		SELECT DISTINCT
			pg.id,
			pg.discontinued,
			pg.created_at,
			pt.id as product_type_id,
			pt.description as product_type_description,
			sf.id as subfamily_id,
			sf.description as subfamily_description,
			f.id as family_id,
			f.description as family_description,
			pgd.length_mm,
			pgd.width_mm,
			pgd.height_mm,
			pgd.weight_kg
		FROM partexplorer.part_group pg
		LEFT JOIN partexplorer.product_type pt ON pg.product_type_id = pt.id
		LEFT JOIN partexplorer.subfamily sf ON pt.subfamily_id = sf.id
		LEFT JOIN partexplorer.family f ON sf.family_id = f.id
		LEFT JOIN partexplorer.part_group_dimension pgd ON pg.id = pgd.id
		WHERE EXISTS (
			SELECT 1 FROM partexplorer.part_name pn 
			WHERE pn.group_id = pg.id 
			AND (
				pn.name ILIKE $1 
				OR pn.name ILIKE $2
			)
		)
		ORDER BY pg.created_at DESC
		LIMIT $3 OFFSET $4
	`

	// Query para contar total
	countQuery := `
		SELECT COUNT(DISTINCT pg.id)
		FROM partexplorer.part_group pg
		WHERE EXISTS (
			SELECT 1 FROM partexplorer.part_name pn 
			WHERE pn.group_id = pg.id 
			AND (
				pn.name ILIKE $1 
				OR pn.name ILIKE $2
			)
		)
	`

	// Preparar parâmetros de busca
	searchPattern := "%" + query + "%"
	exactPattern := query

	// Executar query de contagem
	var total int64
	if err := r.db.Raw(countQuery, searchPattern, exactPattern).Scan(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count results: %w", err)
	}

	// Executar query principal
	rows, err := r.db.Raw(mainQuery, searchPattern, exactPattern, pageSize, offset).Rows()
	if err != nil {
		return nil, fmt.Errorf("failed to search parts: %w", err)
	}
	defer rows.Close()

	var results []models.SearchResult

	for rows.Next() {
		var (
			partGroupID, productTypeID, subfamilyID, familyID sql.NullString
			discontinued                                      bool
			createdAt                                         sql.NullTime
			productTypeDesc, subfamilyDesc, familyDesc        sql.NullString
			lengthMM, widthMM, heightMM, weightKG             sql.NullFloat64
		)

		if err := rows.Scan(
			&partGroupID, &discontinued, &createdAt,
			&productTypeID, &productTypeDesc,
			&subfamilyID, &subfamilyDesc,
			&familyID, &familyDesc,
			&lengthMM, &widthMM, &heightMM, &weightKG,
		); err != nil {
			continue
		}

		// Extrair UUIDs
		groupID := parseUUIDFromString(partGroupID.String)
		productTypeUUID := parseUUIDFromString(productTypeID.String)
		subfamilyUUID := parseUUIDFromString(subfamilyID.String)
		familyUUID := parseUUIDFromString(familyID.String)

		// Construir objetos
		partGroup := models.PartGroup{
			ID:           groupID,
			Discontinued: discontinued,
		}

		// Adicionar ProductType se existir
		if productTypeUUID != uuid.Nil {
			productType := models.ProductType{
				ID:          productTypeUUID,
				Description: productTypeDesc.String,
			}

			// Adicionar Subfamily se existir
			if subfamilyUUID != uuid.Nil {
				subfamily := models.Subfamily{
					ID:          subfamilyUUID,
					Description: subfamilyDesc.String,
				}

				// Adicionar Family se existir
				if familyUUID != uuid.Nil {
					subfamily.Family = models.Family{
						ID:          familyUUID,
						Description: familyDesc.String,
					}
				}

				productType.Subfamily = subfamily
			}

			partGroup.ProductType = &productType
		}

		// Adicionar Dimension se existir
		if lengthMM.Valid || widthMM.Valid || heightMM.Valid || weightKG.Valid {
			partGroup.Dimension = &models.PartGroupDimension{
				ID:       groupID,
				LengthMM: parseFloat64(lengthMM.Float64),
				WidthMM:  parseFloat64(widthMM.Float64),
				HeightMM: parseFloat64(heightMM.Float64),
				WeightKG: parseFloat64(weightKG.Float64),
			}
		}

		// Carregar dados relacionados
		searchResult := models.SearchResult{
			PartGroup:    partGroup,
			Names:        loadPartNames(r.db, partGroup.ID),
			Images:       loadPartImages(r.db, partGroup.ID),
			Applications: loadPartApplications(r.db, partGroup.ID),
			Dimension:    partGroup.Dimension,
			Score:        1.0,
		}

		// Após carregar os partGroups, para cada partGroup, buscar os part_names e para cada part_name buscar os estoques relacionados.
		// Atualizar o campo Stocks de cada SearchResult para incluir os estoques de cada SKU/EAN.
		for _, pn := range searchResult.Names {
			stocks := loadStocks(r.db, pn.ID)
			searchResult.Stocks = append(searchResult.Stocks, stocks...)
		}

		results = append(results, searchResult)
	}

	// Calcular total de páginas
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &models.SearchResponse{
		Results:    results,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		Query:      query,
	}, nil
}

// GetPartByID busca uma peça específica por ID
func (r *partRepository) GetPartByID(id string) (*models.SearchResult, error) {
	var partGroup models.PartGroup

	if err := r.db.Preload("ProductType.Subfamily.Family").
		Preload("Dimension").
		Preload("Names").
		Preload("Images").
		Preload("Applications").
		Where("id = ?", id).
		First(&partGroup).Error; err != nil {
		return nil, fmt.Errorf("failed to get part: %w", err)
	}

	return &models.SearchResult{
		PartGroup:    partGroup,
		Names:        partGroup.Names,
		Images:       partGroup.Images,
		Applications: partGroup.Applications,
		Dimension:    partGroup.Dimension,
		Score:        1.0,
	}, nil
}

// GetApplications retorna todas as aplicações
func (r *partRepository) GetApplications() ([]models.Application, error) {
	var applications []models.Application

	if err := r.db.Find(&applications).Error; err != nil {
		return nil, fmt.Errorf("failed to get applications: %w", err)
	}

	return applications, nil
}

// GetBrands retorna todas as marcas
func (r *partRepository) GetBrands() ([]models.Brand, error) {
	var brands []models.Brand

	if err := r.db.Find(&brands).Error; err != nil {
		return nil, fmt.Errorf("failed to get brands: %w", err)
	}

	return brands, nil
}

// GetFamilies retorna todas as famílias
func (r *partRepository) GetFamilies() ([]models.Family, error) {
	var families []models.Family

	if err := r.db.Find(&families).Error; err != nil {
		return nil, fmt.Errorf("failed to get families: %w", err)
	}

	return families, nil
}

// GetAllCompanies retorna todas as empresas
func (r *partRepository) GetAllCompanies() ([]models.Company, error) {
	var companies []models.Company

	if err := r.db.Find(&companies).Error; err != nil {
		return nil, fmt.Errorf("failed to get companies: %w", err)
	}

	return companies, nil
}

// DebugPartGroup busca uma peça com todos os relacionamentos para debug
func (r *partRepository) DebugPartGroup(id string) (*models.PartGroup, error) {
	var partGroup models.PartGroup

	// Query com todos os preloads
	if err := r.db.Preload("ProductType.Subfamily.Family").
		Preload("Dimension").
		Preload("Names").
		Preload("Images").
		Where("partexplorer.part_group.id = ?", id).
		First(&partGroup).Error; err != nil {
		return nil, fmt.Errorf("failed to get part group: %w", err)
	}

	return &partGroup, nil
}

// DebugPartGroupSQL busca uma peça com query SQL direta
func (r *partRepository) DebugPartGroupSQL(id string) (map[string]interface{}, error) {
	var result map[string]interface{}

	query := `
		SELECT 
			pg.id as part_group_id,
			pg.product_type_id,
			pt.id as product_type_id_check,
			pt.description as product_type_desc,
			pt.subfamily_id,
			sf.id as subfamily_id_check,
			sf.description as subfamily_desc,
			sf.family_id,
			f.id as family_id_check,
			f.description as family_desc
		FROM partexplorer.part_group pg
		LEFT JOIN partexplorer.product_type pt ON pg.product_type_id = pt.id
		LEFT JOIN partexplorer.subfamily sf ON pt.subfamily_id = sf.id
		LEFT JOIN partexplorer.family f ON sf.family_id = f.id
		WHERE pg.id = ?
	`
	if err := r.db.Raw(query, id).Scan(&result).Error; err != nil {
		return nil, fmt.Errorf("failed to execute SQL query: %w", err)
	}

	return result, nil
}

// DebugPartNames busca nomes de uma peça específica
func (r *partRepository) DebugPartNames(groupID string) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	query := `
		SELECT 
			id,
			group_id,
			name
		FROM partexplorer.part_name
		WHERE group_id = ?
	`

	if err := r.db.Raw(query, groupID).Scan(&results).Error; err != nil {
		return nil, fmt.Errorf("failed to execute names query: %w", err)
	}

	return results, nil
}

// DebugPartApplications busca aplicações de uma peça específica
func (r *partRepository) DebugPartApplications(groupID string) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	query := `
		SELECT 
			pga.group_id,
			pga.application_id,
			a.id as app_id,
			a.line,
			a.manufacturer,
			a.model,
			a.version,
			a.generation,
			a.engine,
			a.body,
			a.fuel,
			a.year_start,
			a.year_end,
			a.reliable,
			a.adaptation,
			a.additional_info,
			a.cylinders,
			a.hp,
			a.image
		FROM partexplorer.part_group_application pga
		LEFT JOIN partexplorer.application a ON pga.application_id = a.id
		WHERE pga.group_id = ?
	`

	if err := r.db.Raw(query, groupID).Scan(&results).Error; err != nil {
		return nil, fmt.Errorf("failed to execute applications query: %w", err)
	}

	return results, nil
}

// Funções auxiliares para parsing
func parseUUIDFromString(s string) uuid.UUID {
	if s == "" {
		return uuid.Nil
	}
	parsed, err := uuid.Parse(s)
	if err != nil {
		return uuid.Nil
	}
	return parsed
}

func parseTimeFromString(s string) *time.Time {
	if s == "" {
		return nil
	}
	t, err := time.Parse("2006-01-02T15:04:05Z", s)
	if err != nil {
		return nil
	}
	return &t
}

func parseFloat64(v interface{}) *float64 {
	if v == nil {
		return nil
	}
	switch val := v.(type) {
	case float64:
		return &val
	case string:
		if f, err := strconv.ParseFloat(val, 64); err == nil {
			return &f
		}
	}
	return nil
}

func parseTimeFromInterface(v interface{}) *time.Time {
	if v == nil {
		return nil
	}
	switch val := v.(type) {
	case time.Time:
		return &val
	case string:
		return parseTimeFromString(val)
	}
	return nil
}

func parseUUIDFromInterface(v interface{}) uuid.UUID {
	if v == nil {
		return uuid.Nil
	}
	return parseUUIDFromString(v.(string))
}

// Funções auxiliares para carregar dados relacionados
func loadPartNames(db *gorm.DB, groupID uuid.UUID) []models.PartName {
	var names []models.PartName
	db.Where("group_id = ?", groupID).Find(&names)
	return names
}

func loadPartImages(db *gorm.DB, groupID uuid.UUID) []models.PartImage {
	var images []models.PartImage
	db.Where("group_id = ?", groupID).Find(&images)
	return images
}

func loadPartApplications(db *gorm.DB, groupID uuid.UUID) []models.Application {
	var applications []models.Application
	db.Joins("JOIN partexplorer.part_group_application pga ON partexplorer.application.id = pga.application_id").
		Where("pga.group_id = ?", groupID).
		Find(&applications)
	return applications
}

func loadStocks(db *gorm.DB, partNameID uuid.UUID) []models.Stock {
	var stocks []models.Stock
	db.Preload("Company").Where("part_name_id = ?", partNameID).Find(&stocks)
	return stocks
}
