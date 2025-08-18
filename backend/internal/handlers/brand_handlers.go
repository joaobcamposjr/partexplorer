package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"partexplorer/backend/internal/database"
)

type BrandHandler struct {
	repo database.PartRepository
}

func NewBrandHandler(repo database.PartRepository) *BrandHandler {
	return &BrandHandler{
		repo: repo,
	}
}

// GetBrands retorna todas as marcas disponíveis
func (h *BrandHandler) GetBrands(c *gin.Context) {
	brands, err := h.repo.GetBrands()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Erro ao buscar marcas",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"brands":    brands,
		"total":     len(brands),
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

