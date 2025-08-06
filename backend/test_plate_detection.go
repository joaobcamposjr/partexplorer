package main

import (
	"fmt"
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

func main() {
	fmt.Println("=== TESTE DE DETECÇÃO DE PLACA ===")

	testPlates := []string{
		"GEH5A72",
		"GEH-5A72",
		"GEH 5A72",
		"ABC1234", // Placa antiga
		"ABC1D23", // Placa Mercosul
		"INVALID", // Inválida
	}

	for _, plate := range testPlates {
		fmt.Printf("\n--- Testando placa: %s ---\n", plate)
		result := isPlate(plate)
		fmt.Printf("Resultado: %v\n", result)
	}
}
