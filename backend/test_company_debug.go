package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Database connection
	dsn := "host=localhost user=postgres password=postgres dbname=partexplorer port=5432 sslmode=disable TimeZone=America/Sao_Paulo"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Test 1: Check if company table has data
	var companyCount int64
	db.Table("partexplorer.company").Count(&companyCount)
	fmt.Printf("Total companies in database: %d\n", companyCount)

	// Test 2: Check for companies with group_name
	var groupNameCount int64
	db.Table("partexplorer.company").Where("group_name IS NOT NULL AND group_name != ''").Count(&groupNameCount)
	fmt.Printf("Companies with group_name: %d\n", groupNameCount)

	// Test 3: List all group_names
	type CompanyGroup struct {
		GroupName string
		Count     int64
	}
	var groups []CompanyGroup
	db.Table("partexplorer.company").
		Select("group_name, COUNT(*) as count").
		Where("group_name IS NOT NULL AND group_name != ''").
		Group("group_name").
		Find(&groups)

	fmt.Println("Available group_names:")
	for _, group := range groups {
		fmt.Printf("  - %s (%d companies)\n", group.GroupName, group.Count)
	}

	// Test 4: Check if there's any stock data
	var stockCount int64
	db.Table("partexplorer.stock").Count(&stockCount)
	fmt.Printf("Total stock records: %d\n", stockCount)

	// Test 5: Test the main query for "Grupo Lorenzoni"
	var partGroupCount int64
	err = db.Table("partexplorer.part_group").
		Joins("JOIN partexplorer.part_name pn ON pn.group_id = part_group.id").
		Joins("JOIN partexplorer.stock s ON s.part_name_id = pn.id").
		Joins("JOIN partexplorer.company c ON c.id = s.company_id").
		Where("LOWER(c.group_name) = LOWER(?)", "Grupo Lorenzoni").
		Count(&partGroupCount).Error

	if err != nil {
		fmt.Printf("Error in main query: %v\n", err)
	} else {
		fmt.Printf("Part groups found for 'Grupo Lorenzoni': %d\n", partGroupCount)
	}

	// Test 6: Test the main query for "Lorenzoni"
	err = db.Table("partexplorer.part_group").
		Joins("JOIN partexplorer.part_name pn ON pn.group_id = part_group.id").
		Joins("JOIN partexplorer.stock s ON s.part_name_id = pn.id").
		Joins("JOIN partexplorer.company c ON c.id = s.company_id").
		Where("LOWER(c.group_name) = LOWER(?)", "Lorenzoni").
		Count(&partGroupCount).Error

	if err != nil {
		fmt.Printf("Error in main query for 'Lorenzoni': %v\n", err)
	} else {
		fmt.Printf("Part groups found for 'Lorenzoni': %d\n", partGroupCount)
	}

	// Test 7: Check if there are any companies with "Lorenzoni" in the name
	var lorenzoniCompanies []map[string]interface{}
	db.Table("partexplorer.company").
		Where("LOWER(name) LIKE LOWER(?) OR LOWER(group_name) LIKE LOWER(?)", "%lorenzoni%", "%lorenzoni%").
		Find(&lorenzoniCompanies)

	fmt.Printf("Companies with 'Lorenzoni' in name or group_name: %d\n", len(lorenzoniCompanies))
	for _, company := range lorenzoniCompanies {
		fmt.Printf("  - ID: %v, Name: %v, GroupName: %v\n", company["id"], company["name"], company["group_name"])
	}
}
