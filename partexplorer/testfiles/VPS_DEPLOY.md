# 🚀 Deploy PartExplorer em VPS

Guia completo para deploy do PartExplorer em VPS usando GitHub Actions.

## 📋 Pré-requisitos

### 🖥️ VPS Recomendado:
- **CPU:** 8 vCPU
- **RAM:** 32GB
- **Storage:** 200GB SSD
- **OS:** Ubuntu 20.04+ ou Debian 11+
- **Custo:** ~$300-400/mês

### 🔑 Acesso SSH:
- Chave SSH configurada
- Usuário com permissões sudo

## 🛠️ Setup Inicial

### 1. Conectar na VPS
```bash
ssh root@SEU_IP_VPS
```

### 2. Executar Script de Setup
```bash
# Baixar e executar script de setup
curl -fsSL https://raw.githubusercontent.com/SEU_USUARIO/partexplorer/main/scripts/setup-vps.sh | bash
```

### 3. Clone do Repositório
```bash
cd /opt
git clone https://github.com/SEU_USUARIO/partexplorer.git
chown -R partexplorer:partexplorer partexplorer
```

## 🔧 Configuração GitHub Actions

### 1. Acessar Repository Settings
- Vá para `Settings` > `Secrets and variables` > `Actions`

### 2. Adicionar Secrets
```
VPS_HOST: IP_DO_SEU_VPS
VPS_USER: partexplorer
VPS_SSH_KEY: -----BEGIN OPENSSH PRIVATE KEY-----
           [sua chave SSH privada completa]
           -----END OPENSSH PRIVATE KEY-----
VPS_PORT: 22 (ou sua porta SSH)
```

### 3. Gerar Chave SSH (se necessário)
```bash
# Na sua máquina local
ssh-keygen -t rsa -b 4096 -C "partexplorer-deploy"
# Copiar a chave pública para VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub partexplorer@SEU_IP_VPS
```

## 🚀 Deploy Automático

### 1. Push para Main Branch
```bash
git add .
git commit -m "Deploy to VPS"
git push origin main
```

### 2. Monitorar Deploy
- Acesse `Actions` no GitHub
- Veja o progresso do workflow `Deploy to VPS (Simple)`

### 3. Verificar Status
```bash
# Na VPS
systemctl status partexplorer
docker-compose -f /opt/partexplorer/docker-compose.prod.yml ps
```

## 🌐 URLs de Acesso

### 🔗 Frontend
```
https://SEU_IP_VPS
```

### 🔗 API
```
https://SEU_IP_VPS/api/v1/search?q=BUCHA
https://SEU_IP_VPS/api/v1/suggest?q=BUCHA
```

### 🔗 Elasticsearch (Debug)
```
http://SEU_IP_VPS:9200
```

## 🔧 Comandos Úteis

### 📊 Status dos Serviços
```bash
# Status geral
systemctl status partexplorer

# Status dos containers
docker-compose -f /opt/partexplorer/docker-compose.prod.yml ps

# Logs em tempo real
docker-compose -f /opt/partexplorer/docker-compose.prod.yml logs -f
```

### 🔄 Reiniciar Serviços
```bash
# Reiniciar tudo
systemctl restart partexplorer

# Reiniciar container específico
docker-compose -f /opt/partexplorer/docker-compose.prod.yml restart backend
```

### 💾 Backup Manual
```bash
# Executar backup
/opt/partexplorer/backup.sh

# Listar backups
ls -la /opt/partexplorer/backups/
```

### 🧹 Limpeza
```bash
# Limpar imagens não utilizadas
docker image prune -f

# Limpar volumes não utilizados
docker volume prune -f

# Limpar tudo (cuidado!)
docker system prune -a -f
```

## 🔒 Segurança

### 🔐 SSL/HTTPS
- Certificado self-signed gerado automaticamente
- Para produção, substitua por Let's Encrypt:
```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx

# Gerar certificado
certbot --nginx -d seu-dominio.com
```

### 🛡️ Firewall
- Portas abertas: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Portas internas: 8080 (API), 3000 (Frontend), 9200 (ES), 6379 (Redis)

### 🔑 Senhas
- Altere as senhas no arquivo `/opt/partexplorer/.env`
- Use senhas fortes para produção

## 📈 Monitoramento

### 📊 Recursos do Sistema
```bash
# CPU e RAM
htop

# Disco
df -h

# Logs do sistema
journalctl -u partexplorer -f
```

### 🔍 Logs da Aplicação
```bash
# Logs do backend
docker logs partexplorer-backend -f

# Logs do frontend
docker logs partexplorer-frontend -f

# Logs do banco
docker logs partexplorer-postgres -f
```

## 🚨 Troubleshooting

### ❌ Container não inicia
```bash
# Verificar logs
docker-compose -f /opt/partexplorer/docker-compose.prod.yml logs [service]

# Verificar configuração
docker-compose -f /opt/partexplorer/docker-compose.prod.yml config
```

### ❌ Porta já em uso
```bash
# Verificar portas em uso
netstat -tulpn | grep :80

# Parar serviço conflitante
systemctl stop nginx
```

### ❌ Sem espaço em disco
```bash
# Limpar Docker
docker system prune -a -f

# Limpar logs antigos
journalctl --vacuum-time=7d
```

## 📞 Suporte

### 🔗 Links Úteis
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [GitHub Actions](https://docs.github.com/en/actions)

### 📧 Contato
- Issues: [GitHub Issues](https://github.com/SEU_USUARIO/partexplorer/issues)
- Email: seu-email@exemplo.com

---

**🎯 Deploy concluído! Seu PartExplorer está rodando em produção!** 