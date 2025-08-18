#!/bin/bash

echo "🧪 Testando inicialização da aplicação..."

# Verificar se o binário existe
if [ ! -f "./main" ]; then
    echo "❌ Binário 'main' não encontrado"
    exit 1
fi

# Testar se a aplicação inicia
echo "🚀 Iniciando aplicação em background..."
./main &
APP_PID=$!

# Aguardar 10 segundos
echo "⏳ Aguardando 10 segundos..."
sleep 10

# Verificar se o processo ainda está rodando
if kill -0 $APP_PID 2>/dev/null; then
    echo "✅ Aplicação está rodando (PID: $APP_PID)"
    
    # Testar health check
    echo "🔍 Testando health check..."
    if curl -s http://localhost:8080/health > /dev/null; then
        echo "✅ Health check OK"
    else
        echo "❌ Health check falhou"
    fi
    
    # Parar aplicação
    echo "🛑 Parando aplicação..."
    kill $APP_PID
    exit 0
else
    echo "❌ Aplicação parou de funcionar"
    exit 1
fi

