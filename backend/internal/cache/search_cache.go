package cache

import (
	"time"

	"partexplorer/backend/internal/models"
)

// SearchCacheService gerencia cache de busca
type SearchCacheService struct{}

// NewSearchCacheService cria uma nova instância do serviço de cache
func NewSearchCacheService() *SearchCacheService {
	return &SearchCacheService{}
}

// GetCachedSearch obtém resultado de busca do cache
func (s *SearchCacheService) GetCachedSearch(query string, page, pageSize int) (*models.SearchResponse, error) {
	var result models.SearchResponse
	err := GetCachedSearch(query, page, pageSize, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// SetCachedSearch armazena resultado de busca no cache
func (s *SearchCacheService) SetCachedSearch(query string, page, pageSize int, data *models.SearchResponse, ttl time.Duration) error {
	return SetCachedSearch(query, page, pageSize, data, ttl)
}

// InvalidateSearchCache invalida todo o cache de busca
func (s *SearchCacheService) InvalidateSearchCache() error {
	return InvalidateSearchCache()
}

// GetCacheStats retorna estatísticas do cache
func (s *SearchCacheService) GetCacheStats() (map[string]interface{}, error) {
	return GetCacheStats()
}
