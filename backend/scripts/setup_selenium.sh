#!/bin/bash

echo "🔧 Configurando Selenium e ChromeDriver..."

# Atualizar sistema
sudo apt-get update

# Instalar Chrome
echo "📦 Instalando Google Chrome..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Verificar versão do Chrome
CHROME_VERSION=$(google-chrome --version | awk '{print $3}' | awk -F'.' '{print $1}')
echo "✅ Chrome instalado: versão $CHROME_VERSION"

# Baixar ChromeDriver compatível
echo "📦 Baixando ChromeDriver..."
CHROMEDRIVER_VERSION=$(curl -s "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROME_VERSION")
echo "🔧 ChromeDriver versão: $CHROMEDRIVER_VERSION"

wget -O /tmp/chromedriver.zip "https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip"
unzip /tmp/chromedriver.zip -d /tmp/

# Instalar ChromeDriver
sudo mv /tmp/chromedriver /usr/local/bin/
sudo chmod +x /usr/local/bin/chromedriver

# Verificar instalação
echo "✅ ChromeDriver instalado:"
chromedriver --version

# Instalar Selenium standalone server
echo "📦 Instalando Selenium Standalone Server..."
wget -O /tmp/selenium-server.jar "https://github.com/SeleniumHQ/selenium/releases/download/selenium-4.15.0/selenium-server-4.15.0.jar"

# Criar diretório para Selenium
sudo mkdir -p /opt/selenium
sudo mv /tmp/selenium-server.jar /opt/selenium/

# Criar serviço systemd para Selenium
echo "🔧 Criando serviço Selenium..."
sudo tee /etc/systemd/system/selenium.service > /dev/null <<EOF
[Unit]
Description=Selenium Standalone Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/selenium
ExecStart=/usr/bin/java -jar selenium-server-4.15.0.jar standalone --port 4444
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Habilitar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable selenium
sudo systemctl start selenium

# Verificar status
echo "🔍 Verificando status do Selenium..."
sleep 5
sudo systemctl status selenium --no-pager

echo "✅ Selenium configurado com sucesso!"
echo "🌐 Selenium rodando em: http://localhost:4444"
echo "🔧 Para verificar logs: sudo journalctl -u selenium -f"
