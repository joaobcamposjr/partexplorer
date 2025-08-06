package models

import (
	"time"

	"github.com/google/uuid"
)

// Car representa a tabela car no banco de dados
type Car struct {
	ID            uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	LicensePlate  string    `json:"license_plate" gorm:"column:license_plate;type:varchar(10);uniqueIndex"`
	Brand         string    `json:"brand" gorm:"column:brand;type:varchar(80)"`
	Model         string    `json:"model" gorm:"column:model;type:varchar(255)"`
	Year          int       `json:"year" gorm:"column:year;type:int"`
	ModelYear     int       `json:"model_year" gorm:"column:model_year;type:int"`
	Color         string    `json:"color" gorm:"column:color;type:varchar(80)"`
	FuelType      string    `json:"fuel_type" gorm:"column:fuel_type;type:varchar(80)"`
	ChassisNumber string    `json:"chassis_number" gorm:"column:chassis_number;type:varchar(20)"`
	City          string    `json:"city" gorm:"column:city;type:varchar(100)"`
	State         string    `json:"state" gorm:"column:state;type:varchar(2)"`
	Imported      string    `json:"imported" gorm:"column:imported;type:varchar(3)"`
	FipeCode      string    `json:"fipe_code" gorm:"column:fipe_code;type:varchar(80)"`
	FipeValue     float64   `json:"fipe_value" gorm:"column:fipe_value;type:numeric"`
	CreatedAt     time.Time `json:"created_at" gorm:"column:created_at;type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"column:updated_at;type:timestamp with time zone;default:current_timestamp"`
}

// TableName especifica o nome da tabela
func (Car) TableName() string {
	return "partexplorer.car"
}

// CarError representa a tabela car_error no banco de dados
type CarError struct {
	LicensePlate string                 `json:"license_plate" gorm:"column:license_plate;type:varchar(10);primary_key"`
	Data         map[string]interface{} `json:"data" gorm:"column:data;type:jsonb"`
	CreatedAt    time.Time              `json:"created_at" gorm:"column:created_at;type:timestamp with time zone;default:current_timestamp"`
	UpdatedAt    time.Time              `json:"updated_at" gorm:"column:updated_at;type:timestamp with time zone;default:current_timestamp"`
}

// TableName especifica o nome da tabela
func (CarError) TableName() string {
	return "partexplorer.car_error"
}

// CarInfo representa as informações do veículo retornadas pela API externa
type CarInfo struct {
	Placa          string  `json:"placa"`
	Marca          string  `json:"marca"`
	Modelo         string  `json:"modelo"`
	Ano            string  `json:"ano"`
	AnoModelo      string  `json:"ano_modelo"`
	Cor            string  `json:"cor"`
	Combustivel    string  `json:"combustivel"`
	Chassi         string  `json:"chassi"`
	Municipio      string  `json:"municipio"`
	UF             string  `json:"uf"`
	Importado      string  `json:"importado"`
	CodigoFipe     string  `json:"codigo_fipe"`
	ValorFipe      string  `json:"valor_fipe"`
	DataConsulta   string  `json:"data_consulta"`
	Confiabilidade float64 `json:"confiabilidade"`
}

// ToCar converte CarInfo para Car
func (ci *CarInfo) ToCar() *Car {
	year := 0
	if ci.Ano != "" {
		// Converter string para int (implementar conversão segura)
		// year = strconv.Atoi(ci.Ano)
	}

	modelYear := 0
	if ci.AnoModelo != "" {
		// Converter string para int (implementar conversão segura)
		// modelYear = strconv.Atoi(ci.AnoModelo)
	}

	fipeValue := 0.0
	if ci.ValorFipe != "" {
		// Converter string para float (implementar conversão segura)
		// fipeValue = strconv.ParseFloat(ci.ValorFipe)
	}

	return &Car{
		LicensePlate:  ci.Placa,
		Brand:         ci.Marca,
		Model:         ci.Modelo,
		Year:          year,
		ModelYear:     modelYear,
		Color:         ci.Cor,
		FuelType:      ci.Combustivel,
		ChassisNumber: ci.Chassi,
		City:          ci.Municipio,
		State:         ci.UF,
		Imported:      ci.Importado,
		FipeCode:      ci.CodigoFipe,
		FipeValue:     fipeValue,
	}
}
