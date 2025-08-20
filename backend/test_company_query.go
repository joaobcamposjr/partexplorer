package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Conectar ao banco
	dsn := "host=95.217.76.135 user=postgres password=postgres dbname=partexplorer port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Testar a query da empresa
	fmt.Println("=== TESTANDO QUERY DA EMPRESA ===")

	// 1. Verificar se existem empresas com group_name "Grupo Lorenzoni"
	var companies []map[string]interface{}
	err = db.Raw(`
		SELECT id, name, group_name, state, city
		FROM partexplorer.company 
		WHERE LOWER(group_name) = LOWER('Grupo Lorenzoni')
		ORDER BY name
	`).Scan(&companies).Error

	if err != nil {
		fmt.Printf("Erro ao buscar empresas: %v\n", err)
		return
	}

	fmt.Printf("Empresas encontradas: %d\n", len(companies))
	for _, company := range companies {
		fmt.Printf("- %s (group_name: %s)\n", company["name"], company["group_name"])
	}

	// 2. Testar a query principal
	var partGroups []map[string]interface{}
	err = db.Raw(`
		SELECT DISTINCT 
			pg.id as part_group_id,
			pg.product_type_id,
			pg.discontinued,
			pg.created_at,
			pg.updated_at
		FROM partexplorer.part_group pg
		JOIN partexplorer.part_name pn ON pn.group_id = pg.id
		JOIN partexplorer.stock s ON s.part_name_id = pn.id
		JOIN partexplorer.company c ON c.id = s.company_id
		WHERE LOWER(c.group_name) = LOWER('Grupo Lorenzoni')
		ORDER BY pg.created_at DESC
		LIMIT 10
	`).Scan(&partGroups).Error

	if err != nil {
		fmt.Printf("Erro na query principal: %v\n", err)
		return
	}

	fmt.Printf("Part groups encontrados: %d\n", len(partGroups))
	for _, pg := range partGroups {
		fmt.Printf("- Part Group ID: %s\n", pg["part_group_id"])
	}

	// 3. Contar total
	var total int64
	err = db.Raw(`
		SELECT COUNT(DISTINCT pg.id) as total_part_groups
		FROM partexplorer.part_group pg
		JOIN partexplorer.part_name pn ON pn.group_id = pg.id
		JOIN partexplorer.stock s ON s.part_name_id = pn.id
		JOIN partexplorer.company c ON c.id = s.company_id
		WHERE LOWER(c.group_name) = LOWER('Grupo Lorenzoni')
	`).Scan(&total).Error

	if err != nil {
		fmt.Printf("Erro ao contar: %v\n", err)
		return
	}

	fmt.Printf("Total de part groups: %d\n", total)
}

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Conectar ao banco
	dsn := "host=95.217.76.135 user=postgres password=postgres dbname=partexplorer port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Testar a query da empresa
	fmt.Println("=== TESTANDO QUERY DA EMPRESA ===")

	// 1. Verificar se existem empresas com group_name "Grupo Lorenzoni"
	var companies []map[string]interface{}
	err = db.Raw(`
		SELECT id, name, group_name, state, city
		FROM partexplorer.company 
		WHERE LOWER(group_name) = LOWER('Grupo Lorenzoni')
		ORDER BY name
	`).Scan(&companies).Error

	if err != nil {
		fmt.Printf("Erro ao buscar empresas: %v\n", err)
		return
	}

	fmt.Printf("Empresas encontradas: %d\n", len(companies))
	for _, company := range companies {
		fmt.Printf("- %s (group_name: %s)\n", company["name"], company["group_name"])
	}

	// 2. Testar a query principal
	var partGroups []map[string]interface{}
	err = db.Raw(`
		SELECT DISTINCT 
			pg.id as part_group_id,
			pg.product_type_id,
			pg.discontinued,
			pg.created_at,
			pg.updated_at
		FROM partexplorer.part_group pg
		JOIN partexplorer.part_name pn ON pn.group_id = pg.id
		JOIN partexplorer.stock s ON s.part_name_id = pn.id
		JOIN partexplorer.company c ON c.id = s.company_id
		WHERE LOWER(c.group_name) = LOWER('Grupo Lorenzoni')
		ORDER BY pg.created_at DESC
		LIMIT 10
	`).Scan(&partGroups).Error

	if err != nil {
		fmt.Printf("Erro na query principal: %v\n", err)
		return
	}

	fmt.Printf("Part groups encontrados: %d\n", len(partGroups))
	for _, pg := range partGroups {
		fmt.Printf("- Part Group ID: %s\n", pg["part_group_id"])
	}

	// 3. Contar total
	var total int64
	err = db.Raw(`
		SELECT COUNT(DISTINCT pg.id) as total_part_groups
		FROM partexplorer.part_group pg
		JOIN partexplorer.part_name pn ON pn.group_id = pg.id
		JOIN partexplorer.stock s ON s.part_name_id = pn.id
		JOIN partexplorer.company c ON c.id = s.company_id
		WHERE LOWER(c.group_name) = LOWER('Grupo Lorenzoni')
	`).Scan(&total).Error

	if err != nil {
		fmt.Printf("Erro ao contar: %v\n", err)
		return
	}

	fmt.Printf("Total de part groups: %d\n", total)
}
