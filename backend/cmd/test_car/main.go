package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// TestCarService testa o serviço de carros
func TestCarService() {
	baseURL := "http://localhost:8080/api/v1"

	// Teste 1: Health check
	fmt.Println("=== TESTE 1: Health Check ===")
	resp, err := http.Get(baseURL + "/cars/health")
	if err != nil {
		log.Printf("❌ Erro no health check: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		fmt.Println("✅ Health check OK")
	} else {
		fmt.Printf("❌ Health check falhou: %d\n", resp.StatusCode)
	}

	// Teste 2: Buscar placa (primeira vez - deve buscar na API externa)
	fmt.Println("\n=== TESTE 2: Buscar placa ABC1234 (primeira vez) ===")
	start := time.Now()
	resp, err = http.Get(baseURL + "/cars/search/ABC1234")
	if err != nil {
		log.Printf("❌ Erro ao buscar placa: %v", err)
		return
	}
	defer resp.Body.Close()

	duration := time.Since(start)
	fmt.Printf("⏱️ Tempo de resposta: %v\n", duration)

	if resp.StatusCode == http.StatusOK {
		var result map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			log.Printf("❌ Erro ao decodificar resposta: %v", err)
			return
		}

		if data, ok := result["data"].(map[string]interface{}); ok {
			fmt.Printf("✅ Placa encontrada: %s\n", data["placa"])
			fmt.Printf("   Marca: %s\n", data["marca"])
			fmt.Printf("   Modelo: %s\n", data["modelo"])
			fmt.Printf("   Ano: %s\n", data["ano"])
			fmt.Printf("   Confiabilidade: %v\n", data["confiabilidade"])
		}
	} else {
		fmt.Printf("❌ Busca falhou: %d\n", resp.StatusCode)
	}

	// Teste 3: Buscar mesma placa novamente (deve vir do cache)
	fmt.Println("\n=== TESTE 3: Buscar placa ABC1234 (segunda vez - cache) ===")
	start = time.Now()
	resp, err = http.Get(baseURL + "/cars/search/ABC1234")
	if err != nil {
		log.Printf("❌ Erro ao buscar placa no cache: %v", err)
		return
	}
	defer resp.Body.Close()

	duration = time.Since(start)
	fmt.Printf("⏱️ Tempo de resposta (cache): %v\n", duration)

	if resp.StatusCode == http.StatusOK {
		var result map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			log.Printf("❌ Erro ao decodificar resposta: %v", err)
			return
		}

		if data, ok := result["data"].(map[string]interface{}); ok {
			fmt.Printf("✅ Placa encontrada no cache: %s\n", data["placa"])
			fmt.Printf("   Marca: %s\n", data["marca"])
			fmt.Printf("   Modelo: %s\n", data["modelo"])
			fmt.Printf("   Ano: %s\n", data["ano"])
			fmt.Printf("   Confiabilidade: %v\n", data["confiabilidade"])
		}
	} else {
		fmt.Printf("❌ Busca no cache falhou: %d\n", resp.StatusCode)
	}

	// Teste 4: Buscar no cache apenas
	fmt.Println("\n=== TESTE 4: Buscar no cache apenas ===")
	resp, err = http.Get(baseURL + "/cars/cache/ABC1234")
	if err != nil {
		log.Printf("❌ Erro ao buscar no cache: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		var result map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			log.Printf("❌ Erro ao decodificar resposta: %v", err)
			return
		}

		if data, ok := result["data"].(map[string]interface{}); ok {
			fmt.Printf("✅ Placa encontrada no cache: %s\n", data["license_plate"])
			fmt.Printf("   ID: %s\n", data["id"])
			fmt.Printf("   Marca: %s\n", data["brand"])
			fmt.Printf("   Modelo: %s\n", data["model"])
		}
	} else {
		fmt.Printf("❌ Busca no cache falhou: %d\n", resp.StatusCode)
	}

	// Teste 5: Buscar placa inexistente no cache
	fmt.Println("\n=== TESTE 5: Buscar placa inexistente no cache ===")
	resp, err = http.Get(baseURL + "/cars/cache/XYZ9999")
	if err != nil {
		log.Printf("❌ Erro ao buscar placa inexistente: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		fmt.Println("✅ Placa inexistente retornou 404 como esperado")
	} else {
		fmt.Printf("❌ Esperava 404, recebeu: %d\n", resp.StatusCode)
	}

	fmt.Println("\n=== TESTES CONCLUÍDOS ===")
}

func main() {
	fmt.Println("🚗 TESTANDO SERVIÇO DE CARROS")
	fmt.Println("Certifique-se de que o servidor está rodando em localhost:8080")
	fmt.Println("")

	TestCarService()
}

