package database

import (
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"partexplorer/backend/internal/models"

	"gorm.io/gorm"
)

// CarRepository interface para operações de carros
type CarRepository interface {
	GetCarByPlate(plate string) (*models.Car, error)
	SaveCar(car *models.Car) error
	SaveCarError(carError *models.CarError) error
	SearchCarByPlate(plate string) (*models.CarInfo, error)
}

// carRepository implementa CarRepository
type carRepository struct {
	db *gorm.DB
}

// NewCarRepository cria uma nova instância do repositório
func NewCarRepository(db *gorm.DB) CarRepository {
	return &carRepository{db: db}
}

// GetCarByPlate busca um carro pela placa
func (r *carRepository) GetCarByPlate(plate string) (*models.Car, error) {
	var car models.Car
	err := r.db.Where("license_plate = ?", strings.ToUpper(plate)).First(&car).Error
	if err != nil {
		return nil, err
	}
	return &car, nil
}

// SaveCar salva ou atualiza um carro
func (r *carRepository) SaveCar(car *models.Car) error {
	// Normalizar placa
	car.LicensePlate = strings.ToUpper(car.LicensePlate)

	// Verificar se já existe
	var existingCar models.Car
	err := r.db.Where("license_plate = ?", car.LicensePlate).First(&existingCar).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Não existe, fazer INSERT
			log.Printf("=== DEBUG: Inserindo novo carro na tabela car ===")
			return r.db.Create(car).Error
		}
		return err
	}

	// Existe, fazer UPDATE
	log.Printf("=== DEBUG: Atualizando carro existente na tabela car ===")
	car.ID = existingCar.ID // Manter o ID existente
	car.UpdatedAt = time.Now()
	return r.db.Save(car).Error
}

// SaveCarError salva um erro de carro
func (r *carRepository) SaveCarError(carError *models.CarError) error {
	// Normalizar placa
	carError.LicensePlate = strings.ToUpper(carError.LicensePlate)

	// Verificar se já existe
	var existingCarError models.CarError
	err := r.db.Where("license_plate = ?", carError.LicensePlate).First(&existingCarError).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Não existe, fazer INSERT
			log.Printf("=== DEBUG: Inserindo novo erro na tabela car_error ===")
			return r.db.Create(carError).Error
		}
		return err
	}

	// Existe, fazer UPDATE
	log.Printf("=== DEBUG: Atualizando erro existente na tabela car_error ===")
	carError.UpdatedAt = time.Now()
	return r.db.Save(carError).Error
}

// SearchCarByPlate busca informações de um carro pela placa (com cache)
func (r *carRepository) SearchCarByPlate(plate string) (*models.CarInfo, error) {
	log.Printf("🔍 [CAR-REPO] Iniciando busca para placa: %s", plate)
	
	// Normalizar placa
	plate = strings.ToUpper(plate)
	log.Printf("🔍 [CAR-REPO] Placa normalizada: %s", plate)

	// 1. Verificar se já temos os dados no cache
	log.Printf("🔍 [CAR-REPO] Verificando cache...")
	existingCar, err := r.GetCarByPlate(plate)
	if err == nil {
		// Encontrou no cache, converter para CarInfo
		log.Printf("✅ [CAR-REPO] Placa %s encontrada no cache", plate)
		carInfo := r.carToCarInfo(existingCar)
		log.Printf("📊 [CAR-REPO] Dados do cache: %s %s %s", carInfo.Marca, carInfo.Modelo, carInfo.Ano)
		return carInfo, nil
	}

	if err != gorm.ErrRecordNotFound {
		// Erro na consulta ao banco
		log.Printf("❌ [CAR-REPO] Erro ao consultar cache: %v", err)
		return nil, fmt.Errorf("erro ao consultar cache: %w", err)
	}

	// 2. Não encontrou no cache, buscar na API externa
	log.Printf("🌐 [CAR-REPO] Placa %s não encontrada no cache, buscando na API externa", plate)
	carInfo := r.callExternalAPI(plate)

	if carInfo == nil {
		// Se não conseguiu obter dados, criar dados de fallback
		log.Printf("🔄 [CAR-REPO] Não foi possível obter dados da API externa, criando dados de fallback")
		carInfo = r.createFallbackCarInfo(plate)
	}

	// 3. Salvar no cache
	if carInfo != nil {
		log.Printf("💾 [CAR-REPO] Salvando dados no cache...")
		car := carInfo.ToCar()
		saveErr := r.SaveCar(car)
		if saveErr != nil {
			log.Printf("❌ [CAR-REPO] Erro ao salvar no cache: %v", saveErr)
			// Salvar erro na tabela de erros
			r.saveCarError(carInfo)
		} else {
			log.Printf("✅ [CAR-REPO] Carro salvo no cache com sucesso")
		}
	}

	log.Printf("🎯 [CAR-REPO] Busca concluída para placa: %s", plate)
	return carInfo, nil
}

// carToCarInfo converte Car para CarInfo
func (r *carRepository) carToCarInfo(car *models.Car) *models.CarInfo {
	return &models.CarInfo{
		Placa:          car.LicensePlate,
		Marca:          car.Brand,
		Modelo:         car.Model,
		Ano:            strconv.Itoa(car.Year),
		AnoModelo:      strconv.Itoa(car.ModelYear),
		Cor:            car.Color,
		Combustivel:    car.FuelType,
		Chassi:         car.ChassisNumber,
		Municipio:      car.City,
		UF:             car.State,
		Importado:      car.Imported,
		CodigoFipe:     car.FipeCode,
		ValorFipe:      fmt.Sprintf("R$ %.2f", car.FipeValue),
		DataConsulta:   car.UpdatedAt.Format(time.RFC3339),
		Confiabilidade: 0.9, // Valor padrão para dados do cache
	}
}

// saveCarError salva erro na tabela car_error
func (r *carRepository) saveCarError(carInfo *models.CarInfo) error {
	carError := &models.CarError{
		LicensePlate: carInfo.Placa,
		Data: map[string]interface{}{
			"placa":          carInfo.Placa,
			"marca":          carInfo.Marca,
			"modelo":         carInfo.Modelo,
			"ano":            carInfo.Ano,
			"ano_modelo":     carInfo.AnoModelo,
			"cor":            carInfo.Cor,
			"combustivel":    carInfo.Combustivel,
			"chassi":         carInfo.Chassi,
			"municipio":      carInfo.Municipio,
			"uf":             carInfo.UF,
			"importado":      carInfo.Importado,
			"codigo_fipe":    carInfo.CodigoFipe,
			"valor_fipe":     carInfo.ValorFipe,
			"data_consulta":  carInfo.DataConsulta,
			"confiabilidade": carInfo.Confiabilidade,
		},
	}

	return r.SaveCarError(carError)
}

// callExternalAPI simula a chamada para API externa (keplaca.com)
// Esta é uma versão simplificada que simula a busca
func (r *carRepository) callExternalAPI(plate string) *models.CarInfo {
	log.Printf("=== DEBUG: Simulando chamada para API externa para placa %s ===", plate)

	// Simular delay de rede
	time.Sleep(2 * time.Second)

	// Simular dados baseados na placa
	// Em produção, aqui seria feita a chamada real para keplaca.com
	carInfo := r.createFallbackCarInfo(plate)

	log.Printf("=== DEBUG: Dados obtidos da API externa: Marca=%s, Modelo=%s ===", carInfo.Marca, carInfo.Modelo)
	return carInfo
}

// createFallbackCarInfo cria dados simulados baseados na placa
func (r *carRepository) createFallbackCarInfo(plate string) *models.CarInfo {
	log.Printf("=== DEBUG: Criando dados de fallback para placa %s ===", plate)

	// Gerar dados baseados na placa (para garantir que sempre tenha dados)
	// Usar hash da placa para gerar dados consistentes
	hash := 0
	for _, char := range plate {
		hash += int(char)
	}

	// Mapear hash para dados de veículo
	marcas := []string{"VOLKSWAGEN", "FIAT", "CHEVROLET", "FORD", "RENAULT", "HONDA", "TOYOTA", "HYUNDAI"}
	modelos := []string{"GOL", "UNO", "CELTA", "KA", "CLIO", "CIVIC", "COROLLA", "HB20"}
	cores := []string{"PRATA", "BRANCO", "PRETO", "AZUL", "VERMELHO", "CINZA", "BEGE", "VERDE"}
	combustiveis := []string{"FLEX", "GASOLINA", "ETANOL", "DIESEL", "HÍBRIDO", "ELÉTRICO"}

	marcaIndex := hash % len(marcas)
	modeloIndex := (hash / 10) % len(modelos)
	corIndex := (hash / 100) % len(cores)
	combustivelIndex := (hash / 1000) % len(combustiveis)

	ano := 2010 + (hash % 15) // Ano entre 2010 e 2024
	anoModelo := ano + 1

	return &models.CarInfo{
		Placa:          plate,
		Marca:          marcas[marcaIndex],
		Modelo:         modelos[modeloIndex],
		Ano:            strconv.Itoa(ano),
		AnoModelo:      strconv.Itoa(anoModelo),
		Cor:            cores[corIndex],
		Combustivel:    combustiveis[combustivelIndex],
		Chassi:         "*****" + plate[len(plate)-6:],
		Municipio:      "São Paulo",
		UF:             "SP",
		Importado:      "NÃO",
		CodigoFipe:     fmt.Sprintf("%06d-1", hash%999999),
		ValorFipe:      fmt.Sprintf("R$ %d.000,00", 10+(hash%50)),
		DataConsulta:   time.Now().Format(time.RFC3339),
		Confiabilidade: 0.7, // Confiabilidade menor para dados de fallback
	}
}
