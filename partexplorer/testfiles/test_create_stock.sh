#!/bin/bash

# 🎯 Teste de Criação de Estoque com Novas Funcionalidades

BASE_URL="http://localhost:8080/api/v1"
echo "🚀 Testando criação de estoque com novas funcionalidades..."
echo "📍 Base URL: $BASE_URL"
echo ""

# Primeiro, vamos verificar se temos dados para trabalhar
echo "🔍 Verificando dados existentes..."

# Listar estoques existentes
echo "📦 Estoque existente:"
curl -s "$BASE_URL/stocks/" | jq '.stocks[0]' 2>/dev/null || echo "Erro ao buscar estoques"

echo ""
echo "🔍 Verificando se temos part_names..."
curl -s "$BASE_URL/stocks/part/df7d0089-870d-4397-80e9-1ca44e7af74b" | jq '.' 2>/dev/null || echo "Erro ao buscar part_names"

echo ""
echo "🔍 Verificando se temos companies..."
curl -s "$BASE_URL/companies/" | jq '.' 2>/dev/null || echo "Erro ao buscar companies"

echo ""
echo "=========================================="
echo "🧪 TESTE DE CRIAÇÃO DE ESTOQUE"
echo "=========================================="

# Tentar criar um novo estoque
stock_data='{
    "part_name_id": "df7d0089-870d-4397-80e9-1ca44e7af74b",
    "company_id": "00000000-0000-0000-0000-000000000000",
    "quantity": 100,
    "price": 45.99
}'

echo "📝 Criando estoque com dados:"
echo "$stock_data" | jq '.'

echo ""
echo "📤 Enviando requisição..."

response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$stock_data" \
    "$BASE_URL/stocks/")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "📊 Status: $http_code"
echo "📄 Resposta:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"

echo ""
echo "=========================================="
echo "✅ TESTE CONCLUÍDO!"
echo "==========================================" 