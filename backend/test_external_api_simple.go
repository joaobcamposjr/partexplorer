package main

import (
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
)

type CarInfo struct {
	Placa       string `json:"placa"`
	Marca       string `json:"marca"`
	Modelo      string `json:"modelo"`
	Ano         string `json:"ano"`
	Cor         string `json:"cor"`
	Combustivel string `json:"combustivel"`
}

func extractMarca(htmlContent string) string {
	patterns := []string{
		`(?i)Marca:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)<td[^>]*>Marca:</td>\s*<td[^>]*>([^<]+)</td>`,
	}
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		match := re.FindStringSubmatch(htmlContent)
		if len(match) > 1 {
			marca := strings.TrimSpace(match[1])
			if len(marca) > 2 {
				return strings.ToUpper(marca)
			}
		}
	}
	return ""
}

func extractModelo(htmlContent string) string {
	patterns := []string{
		`(?i)Modelo:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)<td[^>]*>Modelo:</td>\s*<td[^>]*>([^<]+)</td>`,
	}
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		match := re.FindStringSubmatch(htmlContent)
		if len(match) > 1 {
			modelo := strings.TrimSpace(match[1])
			if len(modelo) > 2 {
				return strings.Title(strings.ToLower(modelo))
			}
		}
	}
	return ""
}

func callExternalAPI(plate string) *CarInfo {
	fmt.Printf("=== Testando placa: %s ===\n", plate)

	normalizedPlate := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(plate, "-", ""), " ", ""))
	url := fmt.Sprintf("https://www.keplaca.com/placa?placa-fipe=%s", normalizedPlate)

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Printf("Erro ao criar requisição: %v\n", err)
		return nil
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Erro na requisição: %v\n", err)
		return nil
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Erro ao ler resposta: %v\n", err)
		return nil
	}

	htmlContent := string(body)
	fmt.Printf("Tamanho do HTML: %d bytes\n", len(htmlContent))

	marca := extractMarca(htmlContent)
	modelo := extractModelo(htmlContent)

	fmt.Printf("Marca extraída: %s\n", marca)
	fmt.Printf("Modelo extraído: %s\n", modelo)

	if marca != "" && modelo != "" {
		return &CarInfo{
			Placa:       plate,
			Marca:       marca,
			Modelo:      modelo,
			Ano:         "2015",
			Cor:         "PRATA",
			Combustivel: "FLEX",
		}
	}

	return nil
}

func main() {
	fmt.Println("=== TESTE DA API EXTERNA ===")

	plates := []string{"GEH5A72", "ABC1234"}

	for _, plate := range plates {
		fmt.Printf("\n--- Testando: %s ---\n", plate)
		result := callExternalAPI(plate)

		if result != nil {
			fmt.Printf("✅ Sucesso!\n")
			fmt.Printf("   Placa: %s\n", result.Placa)
			fmt.Printf("   Marca: %s\n", result.Marca)
			fmt.Printf("   Modelo: %s\n", result.Modelo)
		} else {
			fmt.Printf("❌ Falha!\n")
		}
	}
}
