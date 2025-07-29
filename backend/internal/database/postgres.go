package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"partexplorer/backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDatabase inicializa a conexão com o banco de dados PostgreSQL
func InitDatabase() error {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=America/Sao_Paulo",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger:                                   logger.Default.LogMode(logger.Info), // Log SQL queries
		DisableForeignKeyConstraintWhenMigrating: true,
		PrepareStmt:                              true,
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configurar schema padrão
	if err := db.Exec("SET search_path TO partexplorer, public").Error; err != nil {
		return fmt.Errorf("failed to set search_path: %w", err)
	}

	// Configurar pool de conexões
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database connection pool: %w", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db

	// Desabilitar migrações automáticas em produção
	// if err := autoMigrate(db); err != nil {
	// 	return fmt.Errorf("failed to auto-migrate: %w", err)
	// }

	log.Println("✅ Database connected successfully")
	return nil
}

// autoMigrate executa as migrações automáticas
func autoMigrate(db *gorm.DB) error {
	log.Println("🔄 Running database migrations...")

	// Lista de modelos para migrar
	models := []interface{}{
		&models.Brand{},
		&models.Family{},
		&models.Subfamily{},
		&models.ProductType{},
		&models.PartGroup{},
		&models.PartGroupDimension{},
		&models.PartName{},
		&models.PartImage{},
		&models.PartVideo{},
		&models.Application{},
		&models.PartGroupApplication{},
	}

	// Executar migrações
	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			return fmt.Errorf("failed to migrate %T: %w", model, err)
		}
	}

	log.Println("✅ Database migrations completed")
	return nil
}

// GetDB retorna a instância do banco
func GetDB() *gorm.DB {
	return DB
}

// CloseDatabase fecha a conexão com o banco
func CloseDatabase() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}
