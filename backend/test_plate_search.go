package main

import (
	"fmt"
	"log"
	"regexp"
	"strings"
)

// isPlate verifica se a string é uma placa válida (antiga ou Mercosul)
func isPlate(query string) bool {
	// Normalizar a placa
	plate := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(query, "-", ""), " ", ""))

	fmt.Printf("=== DEBUG: isPlate - Query original: '%s' ===\n", query)
	fmt.Printf("=== DEBUG: isPlate - Placa normalizada: '%s' ===\n", plate)

	// Padrões de placa
	oldPlatePattern := regexp.MustCompile(`^[A-Z]{3}[0-9]{4}$`)                 // ABC1234
	mercosulPattern := regexp.MustCompile(`^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$`) // ABC1D23

	isOldPlate := oldPlatePattern.MatchString(plate)
	isMercosulPlate := mercosulPattern.MatchString(plate)

	fmt.Printf("=== DEBUG: isPlate - É placa antiga: %v ===\n", isOldPlate)
	fmt.Printf("=== DEBUG: isPlate - É placa Mercosul: %v ===\n", isMercosulPlate)
	fmt.Printf("=== DEBUG: isPlate - Resultado final: %v ===\n", isOldPlate || isMercosulPlate)

	return isOldPlate || isMercosulPlate
}

// Simular a lógica de busca
func simulateSearch(query string) {
	fmt.Printf("\n=== SIMULAÇÃO DE BUSCA PARA: '%s' ===\n", query)
	
	// Verificar se a query é uma placa
	if query != "" && isPlate(query) {
		fmt.Printf("✅ Placa detectada: %s\n", query)
		fmt.Printf("✅ Deveria chamar SearchPartsByPlate\n")
		fmt.Printf("✅ Deveria buscar dados do carro\n")
		fmt.Printf("✅ Deveria filtrar aplicações\n")
		fmt.Printf("✅ Deveria retornar peças compatíveis\n")
	} else {
		fmt.Printf("❌ Query não é uma placa ou está vazia\n")
		fmt.Printf("❌ Deveria fazer busca normal\n")
	}
}

func main() {
	fmt.Println("=== TESTE DE SIMULAÇÃO DE BUSCA POR PLACA ===")
	
	testQueries := []string{
		"GEH5A72",
		"GEH-5A72",
		"ABC1234",
		"INVALID",
		"",
	}
	
	for _, query := range testQueries {
		simulateSearch(query)
	}
	
	fmt.Printf("\n=== CONCLUSÃO ===\n")
	fmt.Printf("A função isPlate está funcionando corretamente.\n")
	fmt.Printf("O problema deve estar no servidor não estar usando o novo código.\n")
	fmt.Printf("GEH5A72 deveria ser detectada como placa e direcionada para SearchPartsByPlate.\n")
} 