#!/bin/bash

echo "🔍 Verificando e corrigindo banco de dados..."

# Variáveis de ambiente do banco
DB_HOST=${DB_HOST:-"95.217.76.135"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"jbcdev"}
DB_PASSWORD=${DB_PASSWORD:-"jbcpass"}
DB_NAME=${DB_NAME:-"procatalog"}

echo "📊 Conectando ao banco: $DB_HOST:$DB_PORT/$DB_NAME"

# Verificar se as tabelas de carros existem
echo "🔍 Verificando se as tabelas de carros existem..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'partexplorer' 
AND tablename IN ('car', 'car_error');
"

# Se as tabelas não existem, criar
echo "🔧 Criando tabelas se não existirem..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
-- Tabela para armazenar informações dos veículos
CREATE TABLE IF NOT EXISTS partexplorer.car (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
"

# Criar índices
echo "🔧 Criando índices..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
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
"

# Verificar novamente
echo "✅ Verificação final das tabelas..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    schemaname,
    tablename,
    'EXISTS' as status
FROM pg_tables 
WHERE schemaname = 'partexplorer' 
AND tablename IN ('car', 'car_error');
"

echo "🎉 Verificação e correção concluídas!"

