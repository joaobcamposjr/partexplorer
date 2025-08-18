#!/bin/bash

echo "📁 Organizando dashboards na pasta PartExplorer..."

# Aguardar Grafana inicializar
sleep 10

# Credenciais
CREDENTIALS="admin:C@ampos122505"
BASE_URL="http://localhost:3001"

# Criar pasta PartExplorer se não existir
echo "📂 Criando pasta PartExplorer..."
FOLDER_RESPONSE=$(curl -s -X POST -u "$CREDENTIALS" -H "Content-Type: application/json" -d '{"title":"PartExplorer"}' "$BASE_URL/api/folders")

if [[ $FOLDER_RESPONSE == *"id"* ]]; then
    FOLDER_ID=$(echo "$FOLDER_RESPONSE" | jq -r '.id')
    echo "✅ Pasta criada com ID: $FOLDER_ID"
else
    echo "❌ Erro ao criar pasta: $FOLDER_RESPONSE"
    exit 1
fi

# Lista de dashboards para mover
DASHBOARDS=(
    "partexplorer-business-analytics"
    "partexplorer-geoip"
    "partexplorer-logs"
    "partexplorer-overview"
)

# Mover cada dashboard para a pasta
for dashboard_uid in "${DASHBOARDS[@]}"; do
    echo "📋 Movendo dashboard: $dashboard_uid"
    
    # Obter dados do dashboard
    DASHBOARD_DATA=$(curl -s -u "$CREDENTIALS" "$BASE_URL/api/dashboards/uid/$dashboard_uid")
    
    if [[ $DASHBOARD_DATA == *"dashboard"* ]]; then
        # Atualizar folderId no dashboard
        UPDATED_DATA=$(echo "$DASHBOARD_DATA" | jq --arg folderId "$FOLDER_ID" '.dashboard.folderId = ($folderId | tonumber)')
        
        # Salvar dashboard atualizado
        RESPONSE=$(curl -s -X POST -u "$CREDENTIALS" -H "Content-Type: application/json" -d "$UPDATED_DATA" "$BASE_URL/api/dashboards/db")
        
        if [[ $RESPONSE == *"id"* ]]; then
            echo "✅ Dashboard $dashboard_uid movido com sucesso"
        else
            echo "❌ Erro ao mover $dashboard_uid: $RESPONSE"
        fi
    else
        echo "❌ Dashboard $dashboard_uid não encontrado"
    fi
    
    sleep 1
done

echo "✅ Organização concluída!"
echo "📊 Verifique em: $BASE_URL"
