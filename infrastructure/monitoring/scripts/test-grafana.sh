#!/bin/bash

echo "🔍 Testando Grafana..."

# Aguardar Grafana inicializar
sleep 10

# Testar diferentes credenciais
CREDENTIALS=(
    "admin:admin"
    "admin:admin123"
    "admin:C@ampos122505"
    "root:C@ampos122505"
)

for cred in "${CREDENTIALS[@]}"; do
    echo "🔐 Testando: $cred"
    
    # Testar API de health
    HEALTH=$(curl -s -u "$cred" http://localhost:3001/api/health)
    if [[ $HEALTH == *"database"* ]]; then
        echo "✅ Health OK com: $cred"
        
        # Testar API de search
        SEARCH=$(curl -s -u "$cred" http://localhost:3001/api/search)
        if [[ $SEARCH != *"Invalid username"* ]]; then
            echo "✅ Search OK com: $cred"
            echo "📊 Dashboards encontrados:"
            echo "$SEARCH" | jq -r '.[] | "\(.title) - \(.folderTitle // "RAIZ") - \(.uid)"' 2>/dev/null || echo "$SEARCH"
            break
        else
            echo "❌ Search falhou com: $cred"
        fi
    else
        echo "❌ Health falhou com: $cred"
    fi
done

echo "�� Teste concluído!"

