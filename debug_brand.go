package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	// Conectar ao banco
	db, err := sql.Open("postgres", "host=95.217.76.135 user=jbcdev password=jbcpass dbname=procatalog port=5432 sslmode=disable TimeZone=America/Sao_Paulo")
	if err != nil {
		log.Fatal("Erro ao conectar ao banco:", err)
	}
	defer db.Close()

	// Verificar se a conexão está funcionando
	err = db.Ping()
	if err != nil {
		log.Fatal("Erro ao fazer ping no banco:", err)
	}

	fmt.Println("✅ Conectado ao banco de dados")

	// Query específica que está sendo usada na API
	query := `
		SELECT 
			id,
			group_id,
			brand_id,
			name,
			type
		FROM partexplorer.part_name
		WHERE group_id = '587fe752-1ea6-4a48-8ea9-c9883996bf20'
	`

	rows, err := db.Query(query)
	if err != nil {
		log.Fatal("Erro na query:", err)
	}
	defer rows.Close()

	fmt.Println("\n📊 Dados da query específica:")
	fmt.Println("ID | GroupID | BrandID | Name | Type")
	fmt.Println("---|---------|---------|------|------")

	for rows.Next() {
		var id, groupID, brandID, name, partType sql.NullString
		err := rows.Scan(&id, &groupID, &brandID, &name, &partType)
		if err != nil {
			log.Printf("Erro ao scan: %v", err)
			continue
		}

		fmt.Printf("%s | %s | %s | %s | %s\n",
			id.String,
			groupID.String,
			brandID.String,
			name.String,
			partType.String)
	}

	if err = rows.Err(); err != nil {
		log.Fatal("Erro ao iterar rows:", err)
	}
}
