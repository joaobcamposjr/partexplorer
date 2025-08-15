#!/bin/bash

echo "🚀 Iniciando serviços..."

# Função para aguardar serviço estar pronto
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    
    echo "⏳ Aguardando $service_name em $host:$port..."
    while ! nc -z $host $port; do
        sleep 1
    done
    echo "✅ $service_name está pronto!"
}

# Iniciar Selenium Standalone Server em background
echo "🔧 Iniciando Selenium Standalone Server..."
java -jar /opt/selenium-server.jar standalone --port 4444 &
SELENIUM_PID=$!

# Aguardar Selenium estar pronto
wait_for_service localhost 4444 "Selenium"

# Verificar se Selenium está funcionando
echo "🔍 Testando conexão com Selenium..."
if curl -s http://localhost:4444/status | grep -q "ready"; then
    echo "✅ Selenium está funcionando corretamente!"
else
    echo "❌ Selenium não está respondendo corretamente"
    exit 1
fi

# Iniciar aplicação Go
echo "🚀 Iniciando aplicação Go..."
./main

# Se a aplicação terminar, parar Selenium
echo "🛑 Parando Selenium..."
kill $SELENIUM_PID
