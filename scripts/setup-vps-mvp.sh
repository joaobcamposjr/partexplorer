#!/bin/bash

# PartExplorer VPS MVP Setup Script
# Otimizado para VPS menor (3 vCPU, 8GB RAM)
# Execute como root ou com sudo

set -e

echo "🚀 Configurando VPS MVP para PartExplorer..."

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
ufw --force enable

# Configurar swap (ESSENCIAL para VPS menor)
echo "💾 Configurando swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile  # 4GB swap para VPS menor
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Configurar limites do sistema (otimizado para VPS menor)
echo "⚙️ Configurando limites do sistema..."
cat >> /etc/security/limits.conf << EOF
* soft nofile 32768
* hard nofile 32768
* soft nproc 16384
* hard nproc 16384
EOF

# Configurar sysctl (otimizado para VPS menor)
echo "🔧 Configurando sysctl..."
cat >> /etc/sysctl.conf << EOF
# Elasticsearch
vm.max_map_count=262144

# Network
net.core.somaxconn=32768
net.core.netdev_max_backlog=5000
net.ipv4.tcp_max_syn_backlog=4096

# Memory
vm.swappiness=10
vm.dirty_ratio=15
vm.dirty_background_ratio=5

# File system
fs.file-max=32768
EOF
sysctl -p

# Criar arquivo .env (otimizado para MVP)
echo "📝 Criando arquivo .env..."
cat > /opt/partexplorer/.env << EOF
# Database (otimizado para VPS menor)
DB_USER=partexplorer
DB_PASSWORD=partexplorer_secure_password_2024
DB_NAME=partexplorer

# Redis (otimizado)
REDIS_PASSWORD=redis_secure_password_2024

# Elasticsearch (otimizado para MVP)
ES_JAVA_OPTS=-Xms1g -Xmx1g

# Application
NODE_ENV=production

# Otimizações para VPS menor
POSTGRES_SHARED_BUFFERS=256MB
POSTGRES_EFFECTIVE_CACHE_SIZE=1GB
POSTGRES_MAINTENANCE_WORK_MEM=64MB
EOF

chown partexplorer:partexplorer /opt/partexplorer/.env
chmod 600 /opt/partexplorer/.env

# Configurar Nginx (otimizado)
echo "🌐 Configurando Nginx..."
mkdir -p /opt/partexplorer/nginx/ssl
cat > /opt/partexplorer/nginx/nginx.conf << EOF
events {
    worker_connections 512;  # Reduzido para VPS menor
    use epoll;
    multi_accept on;
}

http {
    # Otimizações para VPS menor
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 16M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    upstream backend {
        server backend:8080;
        keepalive 32;
    }

    upstream frontend {
        server frontend:3000;
        keepalive 32;
    }

    server {
        listen 80;
        server_name _;
        return 301 https://\$server_name\$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name _;

        # SSL Configuration
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
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Frontend Routes
        location / {
            proxy_pass http://frontend/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
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
Description=PartExplorer MVP Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/partexplorer
ExecStart=/usr/local/bin/docker-compose -f docker-compose.mvp.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.mvp.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable partexplorer

# Configurar backup automático (otimizado)
echo "💾 Configurando backup automático..."
cat > /opt/partexplorer/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/partexplorer/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco (otimizado para VPS menor)
docker exec partexplorer-postgres pg_dump -U partexplorer partexplorer > $BACKUP_DIR/db_backup_$DATE.sql

# Comprimir backup para economizar espaço
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Manter apenas os últimos 3 backups (economia de espaço)
find $BACKUP_DIR -name "*.sql.gz" -mtime +3 -delete
EOF

chmod +x /opt/partexplorer/backup.sh

# Configurar cron para backup diário
echo "0 3 * * * /opt/partexplorer/backup.sh" | crontab -

# Configurar monitoramento básico
echo "📊 Configurando monitoramento..."
cat > /opt/partexplorer/monitor.sh << 'EOF'
#!/bin/bash
# Script básico de monitoramento para VPS menor

echo "=== PartExplorer MVP Status ==="
echo "Data: $(date)"
echo ""

# Status dos containers
echo "📦 Containers:"
docker-compose -f /opt/partexplorer/docker-compose.mvp.yml ps

echo ""

# Uso de recursos
echo "💾 Recursos:"
echo "RAM: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo "Disco: $(df -h / | tail -1 | awk '{print $3"/"$2}')"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"

echo ""

# Status dos serviços
echo "🔍 Serviços:"
curl -s http://localhost:8080/api/v1/health || echo "Backend: ❌"
curl -s http://localhost:3000 > /dev/null && echo "Frontend: ✅" || echo "Frontend: ❌"
curl -s http://localhost:9200 > /dev/null && echo "Elasticsearch: ✅" || echo "Elasticsearch: ❌"
redis-cli ping > /dev/null && echo "Redis: ✅" || echo "Redis: ❌"
EOF

chmod +x /opt/partexplorer/monitor.sh

echo "✅ Setup MVP concluído!"
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
echo ""
echo "🔧 Comandos úteis:"
echo "   - Status: systemctl status partexplorer"
echo "   - Monitor: /opt/partexplorer/monitor.sh"
echo "   - Logs: docker-compose -f /opt/partexplorer/docker-compose.mvp.yml logs"
echo "   - Backup: /opt/partexplorer/backup.sh"
echo ""
echo "💡 Otimizações aplicadas para VPS menor:"
echo "   - Elasticsearch: 1GB RAM (vs 2GB)"
echo "   - PostgreSQL: configurações otimizadas"
echo "   - Redis: 256MB limite"
echo "   - Swap: 4GB configurado"
echo "   - Backup: apenas 3 dias mantidos" 