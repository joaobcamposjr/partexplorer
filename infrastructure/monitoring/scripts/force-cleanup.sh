#!/bin/bash

# Script para forçar limpeza de dashboards
echo "🧹 Forçando limpeza de dashboards..."

# Parar Grafana
echo "🛑 Parando Grafana..."
docker stop partexplorer-grafana

# Aguardar
sleep 5

# Remover volume de dados do Grafana (isso vai resetar tudo)
echo "🗑️  Removendo dados do Grafana..."
docker volume rm partexplorer_grafana_data 2>/dev/null || true

# Iniciar Grafana novamente
echo "🔄 Iniciando Grafana..."
docker start partexplorer-grafana

# Aguardar inicialização
echo "⏳ Aguardando Grafana inicializar..."
sleep 30

# Verificar se está funcionando
echo "🔍 Verificando status..."
curl -s http://localhost:3001/api/health

echo "✅ Limpeza forçada concluída!"
echo "📝 Grafana foi resetado e vai recarregar os dashboards da pasta provisioning"
