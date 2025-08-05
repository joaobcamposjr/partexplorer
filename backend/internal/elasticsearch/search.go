package elasticsearch

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"partexplorer/backend/internal/models"

	"github.com/google/uuid"
	"github.com/olivere/elastic/v7"
)

// SearchService serviço de busca no Elasticsearch
type SearchService struct {
	client *elastic.Client
}

// NewSearchService cria uma nova instância do serviço de busca
func NewSearchService() *SearchService {
	return &SearchService{
		client: GetClient(),
	}
}

// SearchParts busca peças no Elasticsearch
func (s *SearchService) SearchParts(query string, page, pageSize int) (*models.SearchResponse, error) {
	ctx := context.Background()

	// Construir query
	searchQuery := s.buildSearchQuery(query)

	// Executar busca
	searchResult, err := s.client.Search().
		Index("partexplorer").
		Query(searchQuery).
		From((page-1)*pageSize).
		Size(pageSize).
		Sort("_score", false). // Ordenar por relevância
		Do(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to search: %w", err)
	}

	// Converter resultados
	results := make([]models.SearchResult, len(searchResult.Hits.Hits))
	for i, hit := range searchResult.Hits.Hits {
		var doc PartDocument
		if err := json.Unmarshal(hit.Source, &doc); err != nil {
			return nil, fmt.Errorf("failed to unmarshal document: %w", err)
		}

		// Converter de volta para PartGroup (simplificado)
		partGroup := s.convertToPartGroup(doc)

		results[i] = models.SearchResult{
			PartGroup:    partGroup,
			Names:        []models.PartName{},    // Será carregado manualmente
			Images:       []models.PartImage{},   // Será carregado manualmente
			Applications: []models.Application{}, // Vazio por enquanto
			Dimension:    partGroup.Dimension,
			Score:        *hit.Score,
		}
	}

	totalPages := int((searchResult.TotalHits() + int64(pageSize) - 1) / int64(pageSize))

	return &models.SearchResponse{
		Results:    results,
		Total:      searchResult.TotalHits(),
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		Query:      query,
	}, nil
}

// GetSuggestions retorna sugestões para autocomplete
func (s *SearchService) GetSuggestions(query string, limit int) ([]string, error) {
	if query == "" {
		return []string{}, nil
	}

	// Query para buscar em múltiplos campos
	searchQuery := elastic.NewBoolQuery().
		Should(
			elastic.NewMatchQuery("names", query),
			elastic.NewMatchQuery("brand", query),
			elastic.NewMatchQuery("product_type", query),
		).
		MinimumShouldMatch("1")

	// Executar busca
	result, err := s.client.Search().
		Index("partexplorer").
		Query(searchQuery).
		Size(limit).
		Sort("_score", false).
		Do(context.Background())

	if err != nil {
		return nil, fmt.Errorf("failed to search suggestions: %w", err)
	}

	// Extrair sugestões únicas
	suggestions := make(map[string]bool)
	var results []string

	for _, hit := range result.Hits.Hits {
		var doc PartDocument
		if err := json.Unmarshal(hit.Source, &doc); err != nil {
			continue
		}

		// Adicionar nomes das peças
		for _, name := range doc.Names {
			if strings.Contains(strings.ToLower(name), strings.ToLower(query)) {
				if !suggestions[name] {
					suggestions[name] = true
					results = append(results, name)
				}
			}
		}

		// Adicionar marca se contiver a query
		if doc.Brand != "" && strings.Contains(strings.ToLower(doc.Brand), strings.ToLower(query)) {
			if !suggestions[doc.Brand] {
				suggestions[doc.Brand] = true
				results = append(results, doc.Brand)
			}
		}

		// Adicionar tipo de produto se contiver a query
		if doc.ProductType != "" && strings.Contains(strings.ToLower(doc.ProductType), strings.ToLower(query)) {
			if !suggestions[doc.ProductType] {
				suggestions[doc.ProductType] = true
				results = append(results, doc.ProductType)
			}
		}

		// Limitar resultados
		if len(results) >= limit {
			break
		}
	}

	return results, nil
}

// buildSearchQuery constrói a query de busca
func (s *SearchService) buildSearchQuery(query string) elastic.Query {
	if query == "" {
		return elastic.NewMatchAllQuery()
	}

	// Query multi-campo com boost
	multiMatch := elastic.NewMultiMatchQuery(query).
		Field("names^3").          // Nomes têm prioridade alta
		Field("brand^2").          // Marca tem prioridade média-alta
		Field("product_type^1.5"). // Tipo de produto tem prioridade média
		Field("family^1").         // Família tem prioridade normal
		Field("subfamily^1").      // Subfamília tem prioridade normal
		Type("best_fields").
		Fuzziness("AUTO"). // Busca fuzzy para erros de digitação
		Operator("OR")

	return multiMatch
}

// convertToPartGroup converte PartDocument para PartGroup (com IDs preservados)
func (s *SearchService) convertToPartGroup(doc PartDocument) models.PartGroup {
	// Converter nomes com IDs
	names := make([]models.PartName, len(doc.Names))
	for i, name := range doc.Names {
		names[i] = models.PartName{
			ID:   parseUUID(doc.NameIDs[i]),
			Name: name,
		}
	}

	// Converter imagens com IDs
	images := make([]models.PartImage, len(doc.Images))
	for i, url := range doc.Images {
		images[i] = models.PartImage{
			ID:  parseUUID(doc.ImageIDs[i]),
			URL: url,
		}
	}

	// Converter dimensões com ID
	var dimension *models.PartGroupDimension
	if doc.Dimensions != nil {
		dimension = &models.PartGroupDimension{
			ID:       parseUUID(doc.DimensionID),
			LengthMM: doc.Dimensions.LengthMM,
			WidthMM:  doc.Dimensions.WidthMM,
			HeightMM: doc.Dimensions.HeightMM,
			WeightKG: doc.Dimensions.WeightKG,
		}
	}

	// Criar PartGroup com ID preservado
	partGroup := models.PartGroup{
		ID:           parseUUID(doc.ID),
		Dimension:    dimension,
		Discontinued: doc.Discontinued,
		// Names e Images serão carregados manualmente
	}

	// Brand removido - agora está em part_names

	// Adicionar ProductType se existir
	if doc.ProductTypeID != "" {
		partGroup.ProductType = &models.ProductType{
			ID:          parseUUID(doc.ProductTypeID),
			Description: doc.ProductType,
		}
	}

	return partGroup
}

// parseUUID converte string para UUID
func parseUUID(id string) uuid.UUID {
	if id == "" {
		return uuid.Nil
	}

	parsed, err := uuid.Parse(id)
	if err != nil {
		return uuid.Nil
	}

	return parsed
}
