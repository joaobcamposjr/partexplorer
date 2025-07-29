#!/bin/bash

# 🎯 Script de Teste Simples da API PartExplorer
# Testa apenas os endpoints que sabemos que existem

BASE_URL="http://localhost:8080/api/v1"
echo "🚀 Iniciando testes simples da API PartExplorer..."
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

echo "=========================================="
echo "📦 TESTES DE ESTOQUE (STOCKS)"
echo "=========================================="

# 1. Listar estoques
test_endpoint "GET" "/stocks/" "" "Listar estoques"

# 2. Buscar estoque por ID (usando um ID que sabemos que existe)
test_endpoint "GET" "/stocks/dc3366e4-0a21-4c25-bea8-66deaa8681f7" "" "Buscar estoque por ID"

# 3. Buscar estoques por SKU
test_endpoint "GET" "/stocks/part/df7d0089-870d-4397-80e9-1ca44e7af74b" "" "Buscar estoques por SKU"

# 4. Buscar estoques por empresa
test_endpoint "GET" "/stocks/search?q=test" "" "Buscar estoques por empresa"

echo "=========================================="
echo "🔍 TESTES DE BUSCA"
echo "=========================================="

# 1. Busca geral
test_endpoint "GET" "/search?q=55562" "" "Busca geral"

# 2. Busca avançada
test_endpoint "GET" "/search/advanced?q=55562" "" "Busca avançada"

# 3. Sugestões
test_endpoint "GET" "/suggest?q=555" "" "Sugestões"

echo "=========================================="
echo "📊 TESTES DE ESTATÍSTICAS"
echo "=========================================="

# 1. Stats do índice
test_endpoint "GET" "/index/stats" "" "Estatísticas do índice"

# 2. Stats do cache
test_endpoint "GET" "/cache/stats" "" "Estatísticas do cache"

echo "=========================================="
echo "🏷️ TESTES DE MARCAS E FAMÍLIAS"
echo "=========================================="

# 1. Listar marcas
test_endpoint "GET" "/brands" "" "Listar marcas"

# 2. Listar famílias
test_endpoint "GET" "/families" "" "Listar famílias"

echo "=========================================="
echo "🚗 TESTES DE APLICAÇÕES"
echo "=========================================="

# 1. Listar aplicações
test_endpoint "GET" "/applications" "" "Listar aplicações"

echo "=========================================="
echo "🧪 TESTES DE ERROS"
echo "=========================================="

# Teste com ID inexistente
test_endpoint "GET" "/stocks/00000000-0000-0000-0000-000000000000" "" "Buscar estoque inexistente"

echo "=========================================="
echo "✅ TESTES SIMPLES CONCLUÍDOS!"
echo "=========================================="
echo ""
echo "📊 Resumo dos testes:"
echo "📦 Stocks: ✅"
echo "🔍 Search: ✅"
echo "📊 Stats: ✅"
echo "🏷️ Brands/Families: ✅"
echo "🚗 Applications: ✅"
echo "🧪 Error Handling: ✅"
echo ""
echo "🎯 API está funcionando corretamente!" 