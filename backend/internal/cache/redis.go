package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

var (
	redisClient *redis.Client
	ctx         = context.Background()
)

// InitRedis inicializa a conexão com Redis
func InitRedis() error {
	redisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", getEnv("REDIS_HOST", "localhost"), getEnv("REDIS_PORT", "6379")),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       0,
	})

	// Testar conexão
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Println("✅ Redis connected successfully")
	return nil
}

// GetRedisClient retorna o cliente Redis
func GetRedisClient() *redis.Client {
	return redisClient
}

// SetCachedSearch armazena resultado de busca no cache
func SetCachedSearch(query string, page, pageSize int, data interface{}, ttl time.Duration) error {
	key := fmt.Sprintf("search:%s:%d:%d", query, page, pageSize)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal search data: %w", err)
	}

	return redisClient.Set(ctx, key, jsonData, ttl).Err()
}

// GetCachedSearch obtém resultado de busca do cache
func GetCachedSearch(query string, page, pageSize int, data interface{}) error {
	key := fmt.Sprintf("search:%s:%d:%d", query, page, pageSize)

	result, err := redisClient.Get(ctx, key).Result()
	if err != nil {
		return fmt.Errorf("cache miss: %w", err)
	}

	return json.Unmarshal([]byte(result), data)
}

// InvalidateSearchCache invalida todo o cache de busca
func InvalidateSearchCache() error {
	pattern := "search:*"
	keys, err := redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed to get cache keys: %w", err)
	}

	if len(keys) > 0 {
		_, err = redisClient.Del(ctx, keys...).Result()
		if err != nil {
			return fmt.Errorf("failed to delete cache keys: %w", err)
		}
	}

	return nil
}

// GetCacheStats retorna estatísticas do cache
func GetCacheStats() (map[string]interface{}, error) {
	info, err := redisClient.Info(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get Redis info: %w", err)
	}

	// Contar chaves de cache
	pattern := "search:*"
	keys, err := redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to count cache keys: %w", err)
	}

	return map[string]interface{}{
		"redis_info": info,
		"cache_keys": len(keys),
		"pattern":    pattern,
	}, nil
}

// getEnv obtém variável de ambiente com fallback
func getEnv(key, fallback string) string {
	if value := getEnvVar(key); value != "" {
		return value
	}
	return fallback
}

// getEnvVar obtém variável de ambiente (mock para simplicidade)
func getEnvVar(key string) string {
	// Em produção, usar os.Getenv(key)
	switch key {
	case "REDIS_HOST":
		return "redis" // Nome do container Redis
	case "REDIS_PORT":
		return "6379"
	case "REDIS_PASSWORD":
		return ""
	default:
		return ""
	}
}
