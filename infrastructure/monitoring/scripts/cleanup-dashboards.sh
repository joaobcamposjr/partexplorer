#!/bin/bash

# Script para remover dashboards duplicados e da raiz do Grafana
# Mantém apenas os dashboards dentro da pasta PartExplorer

echo "🔍 Verificando dashboards no Grafana..."

# Aguardar Grafana inicializar
sleep 10

# Tentar diferentes credenciais
CREDENTIALS=("admin:admin" "admin:admin123" "admin:password")

for cred in "${CREDENTIALS[@]}"; do
    echo "🔐 Tentando credenciais: $cred"
    
    # Testar se as credenciais funcionam
    RESPONSE=$(curl -s -u "$cred" http://localhost:3001/api/health)
    
    if [[ $RESPONSE == *"database"* ]]; then
        echo "✅ Credenciais válidas encontradas: $cred"
        WORKING_CRED="$cred"
        break
    fi
done

if [ -z "$WORKING_CRED" ]; then
    echo "❌ Não foi possível encontrar credenciais válidas"
    echo "🔧 Por favor, configure as credenciais do Grafana manualmente"
    exit 1
fi

# Listar todos os dashboards
echo "📋 Listando todos os dashboards..."
DASHBOARDS_JSON=$(curl -s -u "$WORKING_CRED" http://localhost:3001/api/search)

if [ $? -ne 0 ]; then
    echo "❌ Erro ao listar dashboards"
    exit 1
fi

echo "📊 Dashboards encontrados:"
echo "$DASHBOARDS_JSON" | jq -r '.[] | "\(.title) - \(.folderTitle // "RAIZ") - \(.uid)"'

# Remover dashboards da raiz (folderTitle = null)
echo "🗑️  Removendo dashboards da raiz..."
ROOT_DASHBOARDS=$(echo "$DASHBOARDS_JSON" | jq -r '.[] | select(.folderTitle == null) | .uid')

if [ -n "$ROOT_DASHBOARDS" ]; then
    for uid in $ROOT_DASHBOARDS; do
        if [ "$uid" != "null" ] && [ -n "$uid" ]; then
            echo "🗑️  Removendo dashboard da raiz: $uid"
            curl -s -X DELETE -u "$WORKING_CRED" "http://localhost:3001/api/dashboards/uid/$uid"
            sleep 1
        fi
    done
else
    echo "✅ Nenhum dashboard na raiz encontrado"
fi

# Remover dashboards duplicados na pasta PartExplorer
echo "🔄 Verificando duplicatas na pasta PartExplorer..."
FOLDER_DASHBOARDS=$(echo "$DASHBOARDS_JSON" | jq -r '.[] | select(.folderTitle == "PartExplorer") | "\(.title)|\(.uid)"')

if [ -n "$FOLDER_DASHBOARDS" ]; then
    # Criar array para armazenar títulos já vistos
    declare -A seen_titles
    
    for dashboard in $FOLDER_DASHBOARDS; do
        if [ -n "$dashboard" ] && [ "$dashboard" != "null|null" ]; then
            title=$(echo "$dashboard" | cut -d'|' -f1)
            uid=$(echo "$dashboard" | cut -d'|' -f2)
            
            if [ -n "$title" ] && [ -n "$uid" ]; then
                if [[ ${seen_titles[$title]} ]]; then
                    echo "🗑️  Removendo duplicata: $title ($uid)"
                    curl -s -X DELETE -u "$WORKING_CRED" "http://localhost:3001/api/dashboards/uid/$uid"
                    sleep 1
                else
                    seen_titles[$title]=$uid
                    echo "✅ Mantendo: $title ($uid)"
                fi
            fi
        fi
    done
else
    echo "✅ Nenhum dashboard na pasta PartExplorer encontrado"
fi

echo "✅ Limpeza concluída!"
echo "📁 Apenas dashboards únicos na pasta PartExplorer foram mantidos"
