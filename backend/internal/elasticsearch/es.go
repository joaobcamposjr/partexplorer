package elasticsearch

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/olivere/elastic/v7"
)

var ESClient *elastic.Client

// InitElasticsearch inicializa a conexão com o Elasticsearch
func InitElasticsearch() error {
	// URL do Elasticsearch
	url := os.Getenv("ELASTICSEARCH_URL")
	if url == "" {
		url = "http://elasticsearch:9200"
	}

	// Criar cliente
	client, err := elastic.NewClient(
		elastic.SetURL(url),
		elastic.SetSniff(false),       // Desabilitar sniffing para Docker
		elastic.SetHealthcheck(false), // Desabilitar healthcheck para Docker
	)
	if err != nil {
		return fmt.Errorf("failed to create elasticsearch client: %w", err)
	}

	ESClient = client

	// Verificar se o Elasticsearch está rodando
	info, err := client.ElasticsearchVersion(url)
	if err != nil {
		return fmt.Errorf("failed to connect to elasticsearch: %w", err)
	}

	log.Printf("✅ Elasticsearch connected successfully (version: %s)", info)

	// Criar índices se não existirem
	if err := createIndices(); err != nil {
		return fmt.Errorf("failed to create indices: %w", err)
	}

	return nil
}

// createIndices cria os índices necessários
func createIndices() error {
	indices := []string{"partexplorer"}

	for _, index := range indices {
		exists, err := ESClient.IndexExists(index).Do(context.Background())
		if err != nil {
			return fmt.Errorf("failed to check if index %s exists: %w", index, err)
		}

		if !exists {
			// Criar índice com mapping
			createIndex, err := ESClient.CreateIndex(index).BodyString(getIndexMapping()).Do(context.Background())
			if err != nil {
				return fmt.Errorf("failed to create index %s: %w", index, err)
			}

			if !createIndex.Acknowledged {
				return fmt.Errorf("failed to acknowledge index creation for %s", index)
			}

			log.Printf("✅ Created index: %s", index)
		} else {
			log.Printf("✅ Index already exists: %s", index)
		}
	}

	return nil
}

// getIndexMapping retorna o mapping do índice
func getIndexMapping() string {
	return `{
		"settings": {
			"number_of_shards": 1,
			"number_of_replicas": 0,
			"analysis": {
				"analyzer": {
					"portuguese_analyzer": {
						"type": "portuguese"
					}
				}
			}
		},
		"mappings": {
			"properties": {
				"id": {
					"type": "keyword"
				},
				"names": {
					"type": "text",
					"analyzer": "portuguese_analyzer",
					"fields": {
						"keyword": {
							"type": "keyword"
						}
					}
				},
				"brand": {
					"type": "text",
					"analyzer": "portuguese_analyzer"
				},
				"product_type": {
					"type": "text",
					"analyzer": "portuguese_analyzer"
				},
				"family": {
					"type": "text",
					"analyzer": "portuguese_analyzer"
				},
				"subfamily": {
					"type": "text",
					"analyzer": "portuguese_analyzer"
				},
				"applications": {
					"type": "nested",
					"properties": {
						"manufacturer": {
							"type": "text",
							"analyzer": "portuguese_analyzer"
						},
						"model": {
							"type": "text",
							"analyzer": "portuguese_analyzer"
						},
						"version": {
							"type": "text",
							"analyzer": "portuguese_analyzer"
						},
						"year_start": {
							"type": "integer"
						},
						"year_end": {
							"type": "integer"
						}
					}
				},
				"dimensions": {
					"type": "object",
					"properties": {
						"length_mm": {
							"type": "float"
						},
						"width_mm": {
							"type": "float"
						},
						"height_mm": {
							"type": "float"
						},
						"weight_kg": {
							"type": "float"
						}
					}
				},
				"images": {
					"type": "keyword"
				},
				"discontinued": {
					"type": "boolean"
				},
				"modified_at": {
					"type": "date"
				}
			}
		}
	}`
}

// GetClient retorna o cliente do Elasticsearch
func GetClient() *elastic.Client {
	return ESClient
}

// CloseElasticsearch fecha a conexão com o Elasticsearch
func CloseElasticsearch() error {
	if ESClient != nil {
		ESClient.Stop()
	}
	return nil
}
