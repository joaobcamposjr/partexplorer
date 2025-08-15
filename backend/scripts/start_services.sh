#!/bin/bash

echo "🚀 Iniciando serviços..."

# Verificar se Chromium está instalado
if ! command -v chromium-browser &> /dev/null; then
    echo "❌ Chromium não está instalado!"
    exit 1
fi

if ! command -v chromedriver &> /dev/null; then
    echo "❌ ChromeDriver não está instalado!"
    exit 1
fi

echo "✅ Chromium e ChromeDriver encontrados:"
echo "   Chromium: $(chromium-browser --version)"
echo "   ChromeDriver: $(chromedriver --version)"

# Verificar se Java está instalado
if ! command -v java &> /dev/null; then
    echo "❌ Java não está instalado!"
    exit 1
fi

echo "✅ Java encontrado: $(java -version 2>&1 | head -n 1)"

# Verificar se Selenium Server existe
if [ ! -f "/opt/selenium-server.jar" ]; then
    echo "❌ Selenium Server não encontrado em /opt/selenium-server.jar!"
    exit 1
fi

echo "✅ Selenium Server encontrado"

# Função para aguardar serviço estar pronto
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=0
    
    echo "⏳ Aguardando $service_name em $host:$port..."
    while [ $attempt -lt $max_attempts ]; do
        if timeout 1 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
            echo "✅ $service_name está pronto!"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
        echo "⏳ Tentativa $attempt/$max_attempts..."
    done
    echo "⚠️ Timeout aguardando $service_name"
    return 1
}

# Iniciar Selenium Standalone Server em background
echo "🔧 Iniciando Selenium Standalone Server..."
java -jar /opt/selenium-server.jar standalone --port 4444 --log-level WARN &
SELENIUM_PID=$!

# Aguardar um pouco para o Selenium iniciar
sleep 5

# Aguardar Selenium estar pronto (mas não falhar se não conseguir)
echo "⏳ Aguardando Selenium inicializar..."
if wait_for_service localhost 4444 "Selenium"; then
    echo "✅ Selenium está funcionando corretamente!"
    SELENIUM_READY=true
else
    echo "⚠️ Selenium não iniciou, mas continuando com a aplicação..."
    SELENIUM_READY=false
fi

# Iniciar aplicação Go
echo "🚀 Iniciando aplicação Go..."
export SELENIUM_READY=$SELENIUM_READY
./main

# Se a aplicação terminar, parar Selenium
if [ ! -z "$SELENIUM_PID" ]; then
    echo "🛑 Parando Selenium..."
    kill $SELENIUM_PID 2>/dev/null || true
fi
