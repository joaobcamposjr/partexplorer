#!/bin/bash

# PartExplorer VPS Setup Script
# Execute como root ou com sudo

set -e

echo "🚀 Configurando VPS para PartExplorer..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências
echo "🔧 Instalando dependências..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Instalar Docker
echo "🐳 Instalando Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Instalar Docker Compose
echo "📋 Instalando Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Criar usuário para aplicação
echo "👤 Criando usuário partexplorer..."
useradd -m -s /bin/bash partexplorer || true
usermod -aG docker partexplorer

# Criar diretório do projeto
echo "📁 Criando diretório do projeto..."
mkdir -p /opt/partexplorer
chown partexplorer:partexplorer /opt/partexplorer

# Configurar firewall
echo "🔥 Configurando firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 8080
ufw --force enable

# Configurar swap (se necessário)
echo "💾 Configurando swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Configurar limites do sistema
echo "⚙️ Configurando limites do sistema..."
cat >> /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# Configurar sysctl para Elasticsearch
echo "🔧 Configurando sysctl..."
cat >> /etc/sysctl.conf << EOF
vm.max_map_count=262144
net.core.somaxconn=65535
EOF
sysctl -p

# Criar arquivo .env
echo "📝 Criando arquivo .env..."
cat > /opt/partexplorer/.env << EOF
# Database
DB_USER=partexplorer
DB_PASSWORD=partexplorer_secure_password_2024
DB_NAME=partexplorer

# Redis
REDIS_PASSWORD=redis_secure_password_2024

# Elasticsearch
ES_JAVA_OPTS=-Xms2g -Xmx2g

# Application
NODE_ENV=production
EOF

chown partexplorer:partexplorer /opt/partexplorer/.env
chmod 600 /opt/partexplorer/.env

# Configurar Nginx
echo "🌐 Configurando Nginx..."
mkdir -p /opt/partexplorer/nginx/ssl
cat > /opt/partexplorer/nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8080;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name _;

        # Redirect to HTTPS
        return 301 https://\$server_name\$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name _;

        # SSL Configuration (self-signed for now)
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # API Routes
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Frontend Routes
        location / {
            proxy_pass http://frontend/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

# Gerar certificado SSL self-signed
echo "🔒 Gerando certificado SSL..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /opt/partexplorer/nginx/ssl/key.pem \
    -out /opt/partexplorer/nginx/ssl/cert.pem \
    -subj "/C=BR/ST=SP/L=Sao Paulo/O=PartExplorer/CN=localhost"

chown -R partexplorer:partexplorer /opt/partexplorer/nginx

# Configurar systemd service
echo "⚙️ Configurando systemd service..."
cat > /etc/systemd/system/partexplorer.service << EOF
[Unit]
Description=PartExplorer Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/partexplorer
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable partexplorer

# Configurar backup automático
echo "💾 Configurando backup automático..."
cat > /opt/partexplorer/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/partexplorer/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco
docker exec partexplorer-postgres pg_dump -U partexplorer partexplorer > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos volumes
docker run --rm -v partexplorer_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_$DATE.tar.gz -C /data .

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/partexplorer/backup.sh

# Configurar cron para backup diário
echo "0 2 * * * /opt/partexplorer/backup.sh" | crontab -

echo "✅ Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Clone o repositório: git clone <repo> /opt/partexplorer"
echo "2. Configure os secrets no GitHub Actions:"
echo "   - VPS_HOST: IP do seu servidor"
echo "   - VPS_USER: partexplorer"
echo "   - VPS_SSH_KEY: chave SSH privada"
echo "3. Faça push para main branch para deploy automático"
echo ""
echo "🌐 URLs:"
echo "   - Frontend: https://SEU_IP"
echo "   - API: https://SEU_IP/api/v1"
echo "   - Elasticsearch: http://SEU_IP:9200"
echo ""
echo "🔧 Comandos úteis:"
echo "   - Status: systemctl status partexplorer"
echo "   - Logs: docker-compose -f /opt/partexplorer/docker-compose.prod.yml logs"
echo "   - Backup: /opt/partexplorer/backup.sh" 