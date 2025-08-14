-- Migration: Create car and car_error tables
-- Date: 2025-01-XX

-- Tabela para armazenar informações dos veículos
CREATE TABLE IF NOT EXISTS partexplorer.car (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_plate VARCHAR(10) UNIQUE NOT NULL,
    brand VARCHAR(80),
    model VARCHAR(255),
    year INT,
    model_year INT,
    color VARCHAR(80),
    fuel_type VARCHAR(80),
    chassis_number VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(2),
    imported VARCHAR(3),
    fipe_code VARCHAR(80),
    fipe_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar erros de consulta de veículos
CREATE TABLE IF NOT EXISTS partexplorer.car_error (
    license_plate VARCHAR(10) PRIMARY KEY,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_car_license_plate ON partexplorer.car(license_plate);
CREATE INDEX IF NOT EXISTS idx_car_brand ON partexplorer.car(brand);
CREATE INDEX IF NOT EXISTS idx_car_model ON partexplorer.car(model);
CREATE INDEX IF NOT EXISTS idx_car_year ON partexplorer.car(year);
CREATE INDEX IF NOT EXISTS idx_car_state ON partexplorer.car(state);
CREATE INDEX IF NOT EXISTS idx_car_created_at ON partexplorer.car(created_at);

-- Índice para car_error
CREATE INDEX IF NOT EXISTS idx_car_error_license_plate ON partexplorer.car_error(license_plate);
CREATE INDEX IF NOT EXISTS idx_car_error_created_at ON partexplorer.car_error(created_at);
