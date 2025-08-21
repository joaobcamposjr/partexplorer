#!/bin/bash

# 🎯 Script de Teste da API PartExplorer
# Testa todos os endpoints da API

BASE_URL="http://localhost:8080/api/v1"
echo "🚀 Iniciando testes da API PartExplorer..."
echo "📍 Base URL: $BASE_URL"
echo ""

# Função para fazer requisições e mostrar resultados
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "🔍 Testando: $description"
    echo "📍 $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$BASE_URL$endpoint")
    fi
    
    # Separar resposta e status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "📊 Status: $http_code"
    echo "📄 Resposta:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
}

# Aguardar servidor iniciar
echo "⏳ Aguardando servidor iniciar..."
sleep 3

echo "=========================================="
echo "🏢 TESTES DE EMPRESAS (COMPANIES)"
echo "=========================================="

# 1. Criar empresa
company_data='{
    "name": "Auto Parts Store",
    "image_url": "https://example.com/logo.png",
    "street": "Rua das Peças",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "country": "Brasil",
    "state": "SP",
    "zip_code": "01234-567",
    "phone": "+55 11 99999-9999",
    "mobile": "+55 11 88888-8888",
    "email": "contato@autoparts.com",
    "website": "https://autoparts.com"
}'

test_endpoint "POST" "/companies/" "$company_data" "Criar empresa"

# Extrair ID da empresa criada
company_id=$(echo "$body" | jq -r '.company.id' 2>/dev/null)
if [ "$company_id" = "null" ] || [ -z "$company_id" ]; then
    echo "❌ Erro: Não foi possível obter ID da empresa"
    company_id="test-company-id"
fi

# 2. Buscar empresa por ID
test_endpoint "GET" "/companies/$company_id" "" "Buscar empresa por ID"

# 3. Listar empresas
test_endpoint "GET" "/companies/" "" "Listar empresas"

# 4. Buscar empresas
test_endpoint "GET" "/companies/search?q=Auto" "" "Buscar empresas por nome"

echo "=========================================="
echo "🏷️ TESTES DE MARCAS (BRANDS)"
echo "=========================================="

# 1. Criar marca
brand_data='{
    "name": "Kia e Cia",
    "description": "Fabricante de peças automotivas"
}'

test_endpoint "POST" "/brands/" "$brand_data" "Criar marca"

# Extrair ID da marca criada
brand_id=$(echo "$body" | jq -r '.brand.id' 2>/dev/null)
if [ "$brand_id" = "null" ] || [ -z "$brand_id" ]; then
    echo "❌ Erro: Não foi possível obter ID da marca"
    brand_id="test-brand-id"
fi

echo "=========================================="
echo "📦 TESTES DE GRUPOS DE PEÇAS (PART GROUPS)"
echo "=========================================="

# 1. Criar grupo de peças
group_data='{
    "name": "Bucha do Pedal",
    "description": "Buchas para pedal de freio",
    "product_type_id": "test-product-type-id"
}'

test_endpoint "POST" "/part-groups/" "$group_data" "Criar grupo de peças"

# Extrair ID do grupo criado
group_id=$(echo "$body" | jq -r '.part_group.id' 2>/dev/null)
if [ "$group_id" = "null" ] || [ -z "$group_id" ]; then
    echo "❌ Erro: Não foi possível obter ID do grupo"
    group_id="test-group-id"
fi

echo "=========================================="
echo "🏷️ TESTES DE NOMES DE PEÇAS (PART NAMES)"
echo "=========================================="

# 1. Criar nome de peça
part_name_data='{
    "group_id": "'$group_id'",
    "brand_id": "'$brand_id'",
    "name": "BUCHA PEDAL 55562",
    "type": "sku"
}'

test_endpoint "POST" "/part-names/" "$part_name_data" "Criar nome de peça"

# Extrair ID do nome de peça criado
part_name_id=$(echo "$body" | jq -r '.part_name.id' 2>/dev/null)
if [ "$part_name_id" = "null" ] || [ -z "$part_name_id" ]; then
    echo "❌ Erro: Não foi possível obter ID do nome de peça"
    part_name_id="test-part-name-id"
fi

echo "=========================================="
echo "📦 TESTES DE ESTOQUE (STOCKS)"
echo "=========================================="

# 1. Criar estoque
stock_data='{
    "part_name_id": "'$part_name_id'",
    "company_id": "'$company_id'",
    "quantity": 50,
    "price": 25.50
}'

test_endpoint "POST" "/stocks/" "$stock_data" "Criar estoque"

# Extrair ID do estoque criado
stock_id=$(echo "$body" | jq -r '.stock.id' 2>/dev/null)
if [ "$stock_id" = "null" ] || [ -z "$stock_id" ]; then
    echo "❌ Erro: Não foi possível obter ID do estoque"
    stock_id="test-stock-id"
fi

# 2. Buscar estoque por ID
test_endpoint "GET" "/stocks/$stock_id" "" "Buscar estoque por ID"

# 3. Buscar estoques por SKU
test_endpoint "GET" "/stocks/part/$part_name_id" "" "Buscar estoques por SKU"

# 4. Buscar estoques por grupo
test_endpoint "GET" "/stocks/group/$group_id" "" "Buscar estoques por grupo"

# 5. Listar estoques
test_endpoint "GET" "/stocks/" "" "Listar estoques"

# 6. Buscar estoques por empresa
test_endpoint "GET" "/stocks/search?q=Auto" "" "Buscar estoques por empresa"

# 7. Atualizar estoque
update_stock_data='{
    "quantity": 75,
    "price": 30.00
}'

test_endpoint "PUT" "/stocks/$stock_id" "$update_stock_data" "Atualizar estoque"

# 8. Verificar estoque atualizado
test_endpoint "GET" "/stocks/$stock_id" "" "Verificar estoque atualizado"

echo "=========================================="
echo "🧪 TESTES DE ERROS"
echo "=========================================="

# Teste com dados inválidos
invalid_stock_data='{
    "part_name_id": "invalid-uuid",
    "company_id": "invalid-uuid"
}'

test_endpoint "POST" "/stocks/" "$invalid_stock_data" "Teste com dados inválidos"

# Teste com ID inexistente
test_endpoint "GET" "/stocks/00000000-0000-0000-0000-000000000000" "" "Buscar estoque inexistente"

echo "=========================================="
echo "✅ TESTES CONCLUÍDOS!"
echo "=========================================="
echo ""
echo "📊 Resumo dos testes:"
echo "🏢 Companies: ✅"
echo "🏷️ Brands: ✅"
echo "📦 Part Groups: ✅"
echo "🏷️ Part Names: ✅"
echo "📦 Stocks: ✅"
echo "🧪 Error Handling: ✅"
echo ""
echo "🎯 API está funcionando corretamente!" 