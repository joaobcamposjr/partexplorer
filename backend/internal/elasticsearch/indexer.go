package elasticsearch

import (
	"context"
	"fmt"
	"log"

	"partexplorer/backend/internal/models"

	"github.com/olivere/elastic/v7"
)

// PartDocument representa o documento no Elasticsearch
type PartDocument struct {
	ID           string                `json:"id"`
	Names        []string              `json:"names"`
	Brand        string                `json:"brand"`
	ProductType  string                `json:"product_type"`
	Family       string                `json:"family"`
	Subfamily    string                `json:"subfamily"`
	Applications []ApplicationDocument `json:"applications"`
	Dimensions   *DimensionDocument    `json:"dimensions"`
	Images       []string              `json:"images"`
	Discontinued bool                  `json:"discontinued"`
	Score        float64               `json:"score,omitempty"`

	// IDs para preservar relacionamentos
	BrandID       string   `json:"brand_id"`
	ProductTypeID string   `json:"product_type_id"`
	DimensionID   string   `json:"dimension_id"`
	NameIDs       []string `json:"name_ids"`
	ImageIDs      []string `json:"image_ids"`
}

// ApplicationDocument representa aplicação no Elasticsearch
type ApplicationDocument struct {
	Manufacturer string `json:"manufacturer"`
	Model        string `json:"model"`
	Version      string `json:"version"`
	YearStart    *int   `json:"year_start"`
	YearEnd      *int   `json:"year_end"`
}

// DimensionDocument representa dimensões no Elasticsearch
type DimensionDocument struct {
	LengthMM *float64 `json:"length_mm"`
	WidthMM  *float64 `json:"width_mm"`
	HeightMM *float64 `json:"height_mm"`
	WeightKG *float64 `json:"weight_kg"`
}

// IndexerService serviço para indexação
type IndexerService struct {
	client *elastic.Client
}

// NewIndexerService cria uma nova instância do indexador
func NewIndexerService() *IndexerService {
	return &IndexerService{
		client: GetClient(),
	}
}

// IndexPartGroup indexa um grupo de peças
func (i *IndexerService) IndexPartGroup(partGroup models.PartGroup) error {
	ctx := context.Background()

	// Converter para documento do Elasticsearch
	doc := i.convertToDocument(partGroup)

	// Indexar documento
	_, err := i.client.Index().
		Index("partexplorer").
		Id(partGroup.ID.String()).
		BodyJson(doc).
		Do(ctx)

	if err != nil {
		return fmt.Errorf("failed to index part group %s: %w", partGroup.ID, err)
	}

	return nil
}

// IndexAllPartGroups indexa todos os grupos de peças
func (i *IndexerService) IndexAllPartGroups(partGroups []models.PartGroup) error {
	ctx := context.Background()

	// Bulk indexer
	bulk := i.client.Bulk()

	for _, partGroup := range partGroups {
		doc := i.convertToDocument(partGroup)

		req := elastic.NewBulkIndexRequest().
			Index("partexplorer").
			Id(partGroup.ID.String()).
			Doc(doc)

		bulk.Add(req)
	}

	// Executar bulk
	if bulk.NumberOfActions() > 0 {
		_, err := bulk.Do(ctx)
		if err != nil {
			return fmt.Errorf("failed to bulk index: %w", err)
		}
	}

	log.Printf("✅ Indexed %d part groups", len(partGroups))
	return nil
}

// DeletePartGroup remove um grupo de peças do índice
func (i *IndexerService) DeletePartGroup(id string) error {
	ctx := context.Background()

	_, err := i.client.Delete().
		Index("partexplorer").
		Id(id).
		Do(ctx)

	if err != nil {
		return fmt.Errorf("failed to delete part group %s: %w", id, err)
	}

	return nil
}

// RefreshIndex força refresh do índice
func (i *IndexerService) RefreshIndex() error {
	ctx := context.Background()

	_, err := i.client.Refresh("partexplorer").Do(ctx)
	if err != nil {
		return fmt.Errorf("failed to refresh index: %w", err)
	}

	return nil
}

// convertToDocument converte PartGroup para PartDocument
func (i *IndexerService) convertToDocument(pg models.PartGroup) PartDocument {
	// Extrair nomes (será carregado manualmente se necessário)
	var names []string
	var nameIDs []string
	// Names será carregado manualmente se necessário

	// Extrair marca (agora vem dos part_names)
	var brand string
	var brandID string
	// Brand será extraído dos part_names se necessário

	// Extrair tipo de produto
	var productType string
	var productTypeID string
	if pg.ProductType != nil {
		productType = pg.ProductType.Description
		productTypeID = pg.ProductType.ID.String()
	}

	// Extrair família e subfamília
	var family, subfamily string
	if pg.ProductType != nil && pg.ProductType.Subfamily.Description != "" {
		subfamily = pg.ProductType.Subfamily.Description
		if pg.ProductType.Subfamily.Family.Description != "" {
			family = pg.ProductType.Subfamily.Family.Description
		}
	}

	// Extrair aplicações (será carregado manualmente se necessário)
	var applications []ApplicationDocument
	// Applications será carregado manualmente se necessário

	// Extrair dimensões
	var dimensions *DimensionDocument
	if pg.Dimension != nil {
		dimensions = &DimensionDocument{
			LengthMM: pg.Dimension.LengthMM,
			WidthMM:  pg.Dimension.WidthMM,
			HeightMM: pg.Dimension.HeightMM,
			WeightKG: pg.Dimension.WeightKG,
		}
	}

	// Extrair imagens (será carregado manualmente se necessário)
	var images []string
	var imageIDs []string
	// Images será carregado manualmente se necessário

	// Extrair ID da dimensão
	var dimensionID string
	if pg.Dimension != nil {
		dimensionID = pg.Dimension.ID.String()
	}

	return PartDocument{
		ID:           pg.ID.String(),
		Names:        names,
		Brand:        brand,
		ProductType:  productType,
		Family:       family,
		Subfamily:    subfamily,
		Applications: applications,
		Dimensions:   dimensions,
		Images:       images,
		Discontinued: pg.Discontinued,
		Score:        0,

		// IDs para preservar relacionamentos
		BrandID:       brandID,
		ProductTypeID: productTypeID,
		DimensionID:   dimensionID,
		NameIDs:       nameIDs,
		ImageIDs:      imageIDs,
	}
}

// GetIndexStats retorna estatísticas do índice
func (i *IndexerService) GetIndexStats() (map[string]interface{}, error) {
	ctx := context.Background()

	stats, err := i.client.IndexStats("partexplorer").Do(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get index stats: %w", err)
	}

	return map[string]interface{}{
		"total_docs": stats.All.Total.Docs.Count,
		"index_size": stats.All.Total.Store.SizeInBytes,
		"index_name": "partexplorer",
	}, nil
}
