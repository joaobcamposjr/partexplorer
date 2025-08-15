package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"partexplorer/backend/internal/database"
)

// CarHandler gerencia as requisições relacionadas aos carros
type CarHandler struct {
	carRepo database.CarRepository
}

// NewCarHandler cria uma nova instância do handler
func NewCarHandler(carRepo database.CarRepository) *CarHandler {
	return &CarHandler{
		carRepo: carRepo,
	}
}

// SearchCarByPlate busca informações de um carro pela placa
func (h *CarHandler) SearchCarByPlate(c *gin.Context) {
	// Panic handler para capturar qualquer erro
	defer func() {
		if r := recover(); r != nil {
			log.Printf("💥 [CAR-SERVICE] PANIC capturado: %v", r)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Erro interno do servidor",
				"details": fmt.Sprintf("Panic: %v", r),
				"debug": gin.H{
					"plate":     c.Param("plate"),
					"timestamp": time.Now().Format(time.RFC3339),
				},
			})
		}
	}()

	plate := c.Param("plate")

	// Log de início da requisição
	log.Printf("🚗 [CAR-SERVICE] Iniciando busca para placa: %s", plate)
	log.Printf("🚗 [CAR-SERVICE] User-Agent: %s", c.GetHeader("User-Agent"))
	log.Printf("🚗 [CAR-SERVICE] Remote IP: %s", c.ClientIP())

	if plate == "" {
		log.Printf("❌ [CAR-SERVICE] Placa não informada")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placa é obrigatória"})
		return
	}

	// Normalizar placa
	originalPlate := plate
	plate = strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(plate, "-", ""), " ", ""))
	log.Printf("🚗 [CAR-SERVICE] Placa original: %s, Normalizada: %s", originalPlate, plate)

	// Validar formato da placa (7 caracteres)
	if len(plate) != 7 {
		log.Printf("❌ [CAR-SERVICE] Placa inválida: %s (tamanho: %d)", plate, len(plate))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placa deve ter 7 caracteres"})
		return
	}

	log.Printf("✅ [CAR-SERVICE] Placa válida, iniciando busca no repositório...")

	// Buscar informações do carro
	startTime := time.Now()
	carInfo, err := h.carRepo.SearchCarByPlate(plate)
	duration := time.Since(startTime)

	log.Printf("⏱️ [CAR-SERVICE] Tempo de busca: %v", duration)

	if err != nil {
		log.Printf("❌ [CAR-SERVICE] Erro na busca: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Erro ao buscar informações do veículo",
			"details": err.Error(),
			"debug": gin.H{
				"plate":       plate,
				"duration_ms": duration.Milliseconds(),
			},
		})
		return
	}

	if carInfo == nil {
		log.Printf("❌ [CAR-SERVICE] Veículo não encontrado para placa: %s", plate)
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Veículo não encontrado",
			"debug": gin.H{
				"plate":       plate,
				"duration_ms": duration.Milliseconds(),
			},
		})
		return
	}

	// Verificar se tem o mínimo aceitável
	hasMinimalInfo := carInfo.Marca != "" && carInfo.Modelo != "" && carInfo.Ano != ""

	log.Printf("✅ [CAR-SERVICE] Veículo encontrado: %s %s %s (Confiabilidade: %.2f)",
		carInfo.Marca, carInfo.Modelo, carInfo.Ano, carInfo.Confiabilidade)
	log.Printf("📊 [CAR-SERVICE] Dados mínimos: %t, Tempo total: %v", hasMinimalInfo, duration)

	response := gin.H{
		"success": true,
		"data": gin.H{
			"placa":            carInfo.Placa,
			"marca":            carInfo.Marca,
			"modelo":           carInfo.Modelo,
			"ano":              carInfo.Ano,
			"ano_modelo":       carInfo.AnoModelo,
			"cor":              carInfo.Cor,
			"combustivel":      carInfo.Combustivel,
			"chassi":           carInfo.Chassi,
			"municipio":        carInfo.Municipio,
			"uf":               carInfo.UF,
			"importado":        carInfo.Importado,
			"codigo_fipe":      carInfo.CodigoFipe,
			"valor_fipe":       carInfo.ValorFipe,
			"data_consulta":    carInfo.DataConsulta,
			"confiabilidade":   carInfo.Confiabilidade,
			"has_minimal_info": hasMinimalInfo,
		},
		"message": "Informações do veículo obtidas com sucesso",
		"debug": gin.H{
			"plate":       plate,
			"duration_ms": duration.Milliseconds(),
			"timestamp":   time.Now().Format(time.RFC3339),
		},
	}

	log.Printf("🎉 [CAR-SERVICE] Resposta enviada com sucesso para placa: %s", plate)
	c.JSON(http.StatusOK, response)
}

// GetCarByPlate busca um carro específico pela placa (apenas cache)
func (h *CarHandler) GetCarByPlate(c *gin.Context) {
	plate := c.Param("plate")
	if plate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placa é obrigatória"})
		return
	}

	// Normalizar placa
	plate = strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(plate, "-", ""), " ", ""))

	// Buscar no cache
	car, err := h.carRepo.GetCarByPlate(plate)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Veículo não encontrado no cache"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":             car.ID.String(),
			"license_plate":  car.LicensePlate,
			"brand":          car.Brand,
			"model":          car.Model,
			"year":           car.Year,
			"model_year":     car.ModelYear,
			"color":          car.Color,
			"fuel_type":      car.FuelType,
			"chassis_number": car.ChassisNumber,
			"city":           car.City,
			"state":          car.State,
			"imported":       car.Imported,
			"fipe_code":      car.FipeCode,
			"fipe_value":     car.FipeValue,
			"created_at":     car.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			"updated_at":     car.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
		"message": "Veículo encontrado no cache",
	})
}

// HealthCheck verifica se o serviço está funcionando
func (h *CarHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"service":   "car-service",
		"message":   "Serviço de consulta de veículos está funcionando",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

// TestEndpoint endpoint simples para testar se está funcionando
func (h *CarHandler) TestEndpoint(c *gin.Context) {
	log.Printf("🧪 [CAR-SERVICE] Test endpoint chamado")
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"message":   "Test endpoint funcionando",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
