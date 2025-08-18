#!/bin/bash

echo "🚗 TESTANDO SERVIÇO DE CARROS - PARTEXPLORER"
echo "=============================================="

# Verificar se o servidor está rodando
echo "🔍 Verificando se o servidor está rodando..."
if ! curl -s http://localhost:8080/health > /dev/null; then
    echo "❌ Servidor não está rodando em localhost:8080"
    echo "💡 Execute: cd backend && go run cmd/server/main.go"
    exit 1
fi

echo "✅ Servidor está rodando"

# Executar migrações se necessário
echo ""
echo "🗄️ Verificando migrações..."
cd backend

# Verificar se as tabelas de carros existem
if ! psql $DATABASE_URL -c "SELECT 1 FROM partexplorer.car LIMIT 1;" > /dev/null 2>&1; then
    echo "📋 Executando migração para criar tabelas de carros..."
    psql $DATABASE_URL -f migrations/006_create_car_tables.sql
    psql $DATABASE_URL -f migrations/007_create_car_triggers.sql
    echo "✅ Migrações executadas"
else
    echo "✅ Tabelas de carros já existem"
fi

# Compilar e executar o teste
echo ""
echo "🧪 Executando testes do serviço de carros..."
go run cmd/test_car/main.go

echo ""
echo "🎉 Teste concluído!"
echo ""
echo "📋 Endpoints disponíveis:"
echo "   GET /api/v1/cars/health          - Health check"
echo "   GET /api/v1/cars/search/:plate   - Buscar placa (com cache)"
echo "   GET /api/v1/cars/cache/:plate    - Buscar apenas no cache"
echo ""
echo "💡 Exemplo de uso:"
echo "   curl http://localhost:8080/api/v1/cars/search/ABC1234"
echo "   curl http://localhost:8080/api/v1/cars/cache/ABC1234"

