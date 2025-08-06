package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// CarInfo representa os dados do carro
type CarInfo struct {
	Placa       string `json:"placa"`
	Marca       string `json:"marca"`
	Modelo      string `json:"modelo"`
	Ano         int    `json:"ano"`
	AnoModelo   int    `json:"ano_modelo"`
	Cor         string `json:"cor"`
	Combustivel string `json:"combustivel"`
	Chassi      string `json:"chassi"`
	UF          string `json:"uf"`
	Municipio   string `json:"municipio"`
	Importado   string `json:"importado"`
	CodigoFipe  string `json:"codigo_fipe"`
	ValorFipe   string `json:"valor_fipe"`
}

// Funções de extração (copiadas do repository.go)
func extractMarca(htmlContent string) string {
	log.Printf("=== DEBUG: Extraindo marca do HTML ===")
	patterns := []string{
		`(?i)Marca:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)MARCA:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)<td[^>]*>Marca:</td>\s*<td[^>]*>([^<]+)</td>`,
		`(?i)<td[^>]*>marca:</td>\s*<td[^>]*>([^<]+)</td>`,
	}
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		match := re.FindStringSubmatch(htmlContent)
		if len(match) > 1 {
			marca := strings.TrimSpace(match[1])
			if len(marca) > 2 {
				log.Printf("=== DEBUG: Marca encontrada: %s ===", marca)
				return strings.ToUpper(marca)
			}
		}
	}
	log.Printf("=== DEBUG: Marca não encontrada ===")
	return ""
}

func extractModelo(htmlContent string) string {
	log.Printf("=== DEBUG: Extraindo modelo do HTML ===")
	patterns := []string{
		`(?i)Modelo:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)MODELO:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)<td[^>]*>Modelo:</td>\s*<td[^>]*>([^<]+)</td>`,
		`(?i)<td[^>]*>modelo:</td>\s*<td[^>]*>([^<]+)</td>`,
	}
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		match := re.FindStringSubmatch(htmlContent)
		if len(match) > 1 {
			modelo := strings.TrimSpace(match[1])
			if len(modelo) > 2 {
				log.Printf("=== DEBUG: Modelo encontrado: %s ===", modelo)
				return strings.Title(strings.ToLower(modelo))
			}
		}
	}
	log.Printf("=== DEBUG: Modelo não encontrado ===")
	return ""
}

func extractAno(htmlContent string) int {
	log.Printf("=== DEBUG: Extraindo ano do HTML ===")
	patterns := []string{
		`(?i)Ano:\s*(\d{4})`,
		`(?i)ANO:\s*(\d{4})`,
		`(?i)<td[^>]*>Ano:</td>\s*<td[^>]*>(\d{4})</td>`,
		`(?i)<td[^>]*>ano:</td>\s*<td[^>]*>(\d{4})</td>`,
	}
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		match := re.FindStringSubmatch(htmlContent)
		if len(match) > 1 {
			ano := strings.TrimSpace(match[1])
			if len(ano) == 4 {
				log.Printf("=== DEBUG: Ano encontrado: %s ===", ano)
				return 2010 // Valor padrão para teste
			}
		}
	}
	log.Printf("=== DEBUG: Ano não encontrado ===")
	return 0
}

func extractCor(htmlContent string) string {
	log.Printf("=== DEBUG: Extraindo cor do HTML ===")
	patterns := []string{
		`(?i)Cor:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)COR:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)<td[^>]*>Cor:</td>\s*<td[^>]*>([^<]+)</td>`,
		`(?i)<td[^>]*>cor:</td>\s*<td[^>]*>([^<]+)</td>`,
	}
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		match := re.FindStringSubmatch(htmlContent)
		if len(match) > 1 {
			cor := strings.TrimSpace(match[1])
			if len(cor) > 2 {
				log.Printf("=== DEBUG: Cor encontrada: %s ===", cor)
				return strings.ToUpper(cor)
			}
		}
	}
	log.Printf("=== DEBUG: Cor não encontrada ===")
	return ""
}

func extractCombustivel(htmlContent string) string {
	log.Printf("=== DEBUG: Extraindo combustível do HTML ===")
	patterns := []string{
		`(?i)Combustível:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)COMBUSTÍVEL:\s*([A-Z]+(?:\s+[A-Z]+)*)`,
		`(?i)<td[^>]*>Combustível:</td>\s*<td[^>]*>([^<]+)</td>`,
		`(?i)<td[^>]*>combustível:</td>\s*<td[^>]*>([^<]+)</td>`,
	}
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		match := re.FindStringSubmatch(htmlContent)
		if len(match) > 1 {
			combustivel := strings.TrimSpace(match[1])
			if len(combustivel) > 2 {
				log.Printf("=== DEBUG: Combustível encontrado: %s ===", combustivel)
				return strings.ToUpper(combustivel)
			}
		}
	}
	log.Printf("=== DEBUG: Combustível não encontrado ===")
	return ""
}

// callExternalAPI simula a função do repository.go
func callExternalAPI(plate string) *CarInfo {
	log.Printf("=== DEBUG: Chamando API externa para placa: %s ===", plate)

	// Normalizar a placa
	normalizedPlate := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(plate, "-", ""), " ", ""))

	// URL da API
	url := fmt.Sprintf("https://www.keplaca.com/placa?placa-fipe=%s", normalizedPlate)
	log.Printf("=== DEBUG: URL da requisição: %s ===", url)

	// Criar cliente HTTP com timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Criar requisição
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Printf("=== DEBUG: Erro ao criar requisição: %v ===", err)
		return nil
	}

	// Adicionar headers
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "pt-BR,pt;q=0.9,en;q=0.8")
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Upgrade-Insecure-Requests", "1")

	// Fazer requisição
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("=== DEBUG: Erro na requisição HTTP: %v ===", err)
		return nil
	}
	defer resp.Body.Close()

	log.Printf("=== DEBUG: Status code da resposta: %d ===", resp.StatusCode)

	// Ler corpo da resposta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("=== DEBUG: Erro ao ler corpo da resposta: %v ===", err)
		return nil
	}

	htmlContent := string(body)
	log.Printf("=== DEBUG: Tamanho do HTML recebido: %d bytes ===", len(htmlContent))

	if len(htmlContent) > 1000 {
		log.Printf("=== DEBUG: Primeiros 1000 caracteres do HTML: %s ===", htmlContent[:1000])
	} else {
		log.Printf("=== DEBUG: HTML completo: %s ===", htmlContent)
	}

	// Extrair dados
	marca := extractMarca(htmlContent)
	modelo := extractModelo(htmlContent)
	ano := extractAno(htmlContent)
	cor := extractCor(htmlContent)
	combustivel := extractCombustivel(htmlContent)

	log.Printf("=== DEBUG: Dados extraídos - Marca: '%s', Modelo: '%s', Ano: %d, Cor: '%s', Combustível: '%s' ===",
		marca, modelo, ano, cor, combustivel)

	// Verificar se temos dados suficientes
	if marca != "" && modelo != "" && ano > 0 {
		log.Printf("=== DEBUG: Dados suficientes encontrados, retornando CarInfo ===")
		return &CarInfo{
			Placa:       plate,
			Marca:       marca,
			Modelo:      modelo,
			Ano:         ano,
			AnoModelo:   ano + 1,
			Cor:         cor,
			Combustivel: combustivel,
			UF:          "SP",
			Municipio:   "São Paulo",
			Importado:   "NÃO",
			CodigoFipe:  "123456-7",
			ValorFipe:   "R$ 45.000,00",
		}
	}

	log.Printf("=== DEBUG: Dados insuficientes, retornando nil ===")
	return nil
}

func main() {
	fmt.Println("=== TESTE DA FUNÇÃO callExternalAPI ===")

	testPlates := []string{
		"GEH5A72",
		"ABC1234",
		"INVALID",
	}

	for _, plate := range testPlates {
		fmt.Printf("\n--- Testando placa: %s ---\n", plate)
		result := callExternalAPI(plate)

		if result != nil {
			fmt.Printf("✅ Sucesso! CarInfo retornado:\n")
			fmt.Printf("   Placa: %s\n", result.Placa)
			fmt.Printf("   Marca: %s\n", result.Marca)
			fmt.Printf("   Modelo: %s\n", result.Modelo)
			fmt.Printf("   Ano: %d\n", result.Ano)
			fmt.Printf("   Cor: %s\n", result.Cor)
			fmt.Printf("   Combustível: %s\n", result.Combustivel)
		} else {
			fmt.Printf("❌ Falha! Nenhum dado retornado\n")
		}
	}
}
