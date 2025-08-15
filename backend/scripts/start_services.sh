#!/bin/bash

echo "🚀 Iniciando serviços..."

# Verificar se o binário existe
if [ ! -f "./main" ]; then
    echo "❌ Binário main não encontrado!"
    exit 1
fi

echo "✅ Binário main encontrado"

# Verificar se Chrome está instalado
if ! command -v google-chrome &> /dev/null; then
    echo "❌ Chrome não está instalado!"
    exit 1
fi

echo "✅ Chrome encontrado: $(google-chrome --version)"

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

# Iniciar Selenium Standalone Server em background
echo "🔧 Iniciando Selenium Standalone Server..."
java -jar /opt/selenium-server.jar standalone --port 4444 --log-level WARN &
SELENIUM_PID=$!

# Aguardar um pouco para o Selenium iniciar
sleep 10

# Verificar se Selenium está rodando
echo "🔍 Verificando se Selenium está rodando..."
if ps -p $SELENIUM_PID > /dev/null; then
    echo "✅ Selenium está rodando (PID: $SELENIUM_PID)"
    SELENIUM_READY=true
else
    echo "⚠️ Selenium não está rodando, mas continuando..."
    SELENIUM_READY=false
fi

# Iniciar aplicação Go
echo "🚀 Iniciando aplicação Go..."
export SELENIUM_READY=$SELENIUM_READY
export SELENIUM_URL="http://localhost:4444/wd/hub"

# Verificar variáveis de ambiente
echo "🔧 Variáveis de ambiente:"
echo "   SELENIUM_READY: $SELENIUM_READY"
echo "   SELENIUM_URL: $SELENIUM_URL"

# Executar aplicação Go
echo "🎯 Executando aplicação Go..."
./main

# Se a aplicação terminar, parar Selenium
if [ ! -z "$SELENIUM_PID" ]; then
    echo "🛑 Parando Selenium..."
    kill $SELENIUM_PID 2>/dev/null || true
fi
