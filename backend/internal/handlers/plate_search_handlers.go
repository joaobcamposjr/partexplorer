package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"partexplorer/backend/internal/database"
)

type PlateSearchHandler struct {
	partRepo database.PartRepository
	carRepo  database.CarRepository
}

func NewPlateSearchHandler(partRepo database.PartRepository, carRepo database.CarRepository) *PlateSearchHandler {
	return &PlateSearchHandler{
		partRepo: partRepo,
		carRepo:  carRepo,
	}
}

// SearchByPlate busca peças baseado na placa do veículo
func (h *PlateSearchHandler) SearchByPlate(c *gin.Context) {
	start := time.Now()

	// Obter parâmetros
	plate := strings.ToUpper(strings.ReplaceAll(c.Param("plate"), "-", ""))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "16"))

	// Validar placa
	if len(plate) != 7 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Placa deve ter 7 caracteres",
		})
		return
	}

	// Buscar informações do carro
	carInfo, err := h.carRepo.SearchCarByPlate(plate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Erro ao buscar informações do veículo",
			"details": err.Error(),
		})
		return
	}

	if carInfo == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Veículo não encontrado",
		})
		return
	}

	// Extrair palavra do modelo para busca (ignorar "CHEV" se for a primeira)
	modelWords := strings.Fields(carInfo.Modelo)
	searchModelWord := ""
	if len(modelWords) > 0 {
		if strings.ToUpper(modelWords[0]) == "CHEV" && len(modelWords) > 1 {
			// Se a primeira palavra é "CHEV", usar a segunda
			searchModelWord = modelWords[1]
		} else {
			// Caso contrário, usar a primeira
			searchModelWord = modelWords[0]
		}
	}

	// Buscar peças por aplicação (marca, modelo, ano)
	searchResponse, err := h.partRepo.SearchPartsByApplication(carInfo.Marca, searchModelWord, carInfo.AnoModelo, page, pageSize)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Erro ao buscar peças",
			"details": err.Error(),
		})
		return
	}

	duration := time.Since(start)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Busca por placa realizada com sucesso",
		"data": gin.H{
			"car_info": carInfo,
			"parts":    searchResponse,
		},
		"debug": gin.H{
			"plate":        plate,
			"duration_ms":  duration.Milliseconds(),
			"timestamp":    time.Now().Format(time.RFC3339),
			"search_query": fmt.Sprintf("%s %s %s", carInfo.Marca, searchModelWord, carInfo.AnoModelo),
		},
	})
}
