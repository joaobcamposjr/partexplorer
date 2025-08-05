package main

import (
	"fmt"
	"log"

	"partexplorer/backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Conectar ao banco
	dsn := "host=95.217.76.135 user=jbcdev password=jbcpass dbname=procatalog port=5432 sslmode=disable TimeZone=America/Sao_Paulo"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Erro ao conectar ao banco:", err)
	}

	fmt.Println("✅ Conectado ao banco de dados")

	// Testar a função loadPartNames
	groupID := "587fe752-1ea6-4a48-8ea9-c9883996bf20"

	var names []models.PartName
	err = db.Preload("Brand").Where("group_id = ?", groupID).Find(&names).Error
	if err != nil {
		log.Fatal("Erro ao carregar PartNames:", err)
	}

	fmt.Printf("📊 Total names loaded: %d\n", len(names))
	for i, pn := range names {
		fmt.Printf("DEBUG: PartName[%d]: %s, BrandID: %s, Brand: %v\n", i, pn.Name, pn.BrandID, pn.Brand)

		// Verificar se o brand_id está sendo carregado corretamente
		if pn.BrandID.String() == "00000000-0000-0000-0000-000000000000" {
			fmt.Printf("DEBUG: ⚠️ PartName %s tem BrandID nil!\n", pn.Name)
		} else {
			fmt.Printf("DEBUG: ✅ PartName %s tem BrandID: %s\n", pn.Name, pn.BrandID)
		}
	}
}
