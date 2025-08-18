#!/bin/bash

# Script para remover dashboards duplicados da raiz do Grafana
# Mantém apenas os dashboards dentro da pasta PartExplorer

echo "🔍 Verificando dashboards no Grafana..."

# Aguardar Grafana inicializar
sleep 10

# Listar todos os dashboards
DASHBOARDS=$(curl -s -u admin:admin http://localhost:3001/api/search | jq -r '.[] | select(.folderTitle == null) | .uid')

if [ -z "$DASHBOARDS" ]; then
    echo "✅ Nenhum dashboard na raiz encontrado"
    exit 0
fi

echo "📋 Dashboards encontrados na raiz:"
echo "$DASHBOARDS"

# Remover dashboards da raiz
for uid in $DASHBOARDS; do
    if [ "$uid" != "null" ] && [ -n "$uid" ]; then
        echo "🗑️  Removendo dashboard: $uid"
        curl -s -X DELETE -u admin:admin http://localhost:3001/api/dashboards/uid/$uid
        sleep 1
    fi
done

echo "✅ Limpeza concluída!"
echo "📁 Dashboards na pasta PartExplorer foram mantidos"
