# 🎯 Guia Completo - Sistema de Monitoramento PartExplorer

## 🚀 **Para Iniciantes - Como Usar Tudo Isso!**

### 📋 **Índice Rápido:**
1. [Primeiro Deploy](#primeiro-deploy)
2. [Como Acessar Cada Ferramenta](#como-acessar)
3. [Grafana - Dashboards](#grafana)
4. [Prometheus - Métricas](#prometheus)
5. [Loki - Logs](#loki)
6. [Alertmanager - Alertas](#alertmanager)
7. [Widget Frontend](#widget-frontend)
8. [Comandos Úteis](#comandos-uteis)

---

## 🎯 **1. Primeiro Deploy**

### **Passo 1: Configurar GitHub Secrets**
No seu repositório GitHub → Settings → Secrets and variables → Actions:

```
VPS_HOST=seu-ip-da-vps
VPS_USER=root
VPS_SSH_KEY=sua-chave-ssh-privada
```

### **Passo 2: Deploy na VPS**
```bash
# Conectar na VPS
ssh root@seu-ip-da-vps

# Clonar o projeto
cd /opt
git clone https://github.com/seu-usuario/partexplorer.git
cd partexplorer

# Deploy do sistema principal
docker-compose -f docker-compose.prod.yml up -d

# Deploy do monitoramento
chmod +x scripts/deploy-monitoring-optimized.sh
./scripts/deploy-monitoring-optimized.sh
```

---

## 🌐 **2. Como Acessar Cada Ferramenta**

### **URLs de Acesso:**
- **Grafana**: `http://seu-ip:3001` (admin/admin123)
- **Prometheus**: `http://seu-ip:9090`
- **Alertmanager**: `http://seu-ip:9093`
- **Loki**: `http://seu-ip:3100`
- **Nginx Exporter**: `http://seu-ip:9113/metrics`

### **Se estiver usando domínio:**
- **Grafana**: `http://monitor.seudominio.com:3001`
- **Prometheus**: `http://monitor.seudominio.com:9090`

---

## 📊 **3. Grafana - Dashboards (A Ferramenta Principal)**

### **Primeiro Acesso:**
1. Acesse: `http://seu-ip:3001`
2. Login: `admin`
3. Senha: `admin123`

### **Dashboards Disponíveis:**

#### **🎯 Nginx Overview**
- **O que mostra**: Performance do seu site
- **Métricas importantes**:
  - Requests por segundo
  - Tempo de resposta
  - Taxa de erro
  - Conexões ativas

#### **📈 Business Metrics**
- **O que mostra**: Métricas de negócio
- **Métricas importantes**:
  - Visitantes ativos
  - Tempo de sessão
  - Páginas mais visitadas
  - Taxa de rejeição

#### **⚡ System Performance**
- **O que mostra**: Recursos da VPS
- **Métricas importantes**:
  - CPU e memória
  - Uso de disco
  - Network I/O

### **Como Usar o Grafana:**

#### **🔍 Navegar nos Dashboards:**
1. Clique no ícone de menu (☰) no canto superior esquerdo
2. Vá em "Dashboards"
3. Escolha o dashboard que quer ver

#### **⏰ Mudar Período de Tempo:**
1. No canto superior direito, clique no seletor de tempo
2. Escolha: "Last 1 hour", "Last 6 hours", "Last 24 hours", etc.

#### **📱 Visualizar em Mobile:**
- Os dashboards são responsivos
- Funcionam bem no celular

---

## 📈 **4. Prometheus - Métricas (O Banco de Dados)**

### **Acessar:**
- URL: `http://seu-ip:9090`
- **Não precisa login** (só visualização)

### **O que é:**
- **Banco de dados** de todas as métricas
- **Coleta dados** de todos os serviços
- **Armazena** histórico de performance

### **Como Usar:**

#### **🔍 Ver Métricas Disponíveis:**
1. Clique em "Status" → "Targets"
2. Veja todos os serviços sendo monitorados
3. Status "UP" = funcionando, "DOWN" = problema

#### **📊 Fazer Queries:**
1. Clique em "Graph"
2. Digite uma query, exemplo:
   ```
   rate(nginx_http_requests_total[5m])
   ```
3. Clique em "Execute"

#### **📋 Queries Úteis para Iniciantes:**
```
# Requests por segundo
rate(nginx_http_requests_total[5m])

# CPU usage
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Disk usage
(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100
```

---

## 📝 **5. Loki - Logs (Central de Logs)**

### **Acessar:**
- URL: `http://seu-ip:3100`
- **Não precisa login** (só visualização)

### **O que é:**
- **Central de logs** de todos os serviços
- **Busca rápida** em logs
- **Histórico** de erros e eventos

### **Como Usar:**

#### **🔍 Buscar Logs:**
1. Acesse o Grafana
2. Vá em "Explore" (ícone de bússola)
3. Selecione "Loki" como fonte de dados
4. Digite queries como:
   ```
   {job="nginx"}
   {job="backend"}
   {job="frontend"}
   ```

#### **📋 Queries Úteis:**
```
# Logs do nginx
{job="nginx"}

# Erros do nginx
{job="nginx"} |= "error"

# Logs do backend
{job="backend"}

# Logs de hoje
{job="nginx"} |= "2024-01-15"
```

---

## 🔔 **6. Alertmanager - Alertas (Sistema de Alerta)**

### **Acessar:**
- URL: `http://seu-ip:9093`
- **Não precisa login** (só visualização)

### **O que é:**
- **Sistema de alertas** automático
- **Notifica** quando algo está errado
- **Histórico** de alertas

### **Como Usar:**

#### **👀 Ver Alertas Ativos:**
1. Acesse a URL
2. Veja alertas em vermelho (críticos) ou amarelo (warnings)
3. Clique em um alerta para ver detalhes

#### **📧 Configurar Notificações (Opcional):**
```yaml
# Em alertmanager/alertmanager.yml
receivers:
  - name: 'email'
    email_configs:
      - to: 'seu-email@gmail.com'
        from: 'alertmanager@seudominio.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'seu-email@gmail.com'
        auth_password: 'sua-senha-app'
```

---

## 🎨 **7. Widget Frontend (Métricas no Site)**

### **O que é:**
- **Widget flutuante** no canto inferior direito do seu site
- **Métricas em tempo real** para visitantes
- **Mostra** estatísticas do site

### **Como Funciona:**
1. **Automático**: Aparece em todas as páginas
2. **Interativo**: Clique para expandir
3. **Tempo real**: Atualiza a cada 5 segundos

### **O que Mostra:**
- **Sua sessão**: Tempo na página, eventos capturados
- **Site**: Visitantes ativos, visualizações hoje
- **Performance**: Tempo médio de sessão, taxa de rejeição

### **Personalizar:**
```css
/* Em AnalyticsWidget.css */
.analytics-widget {
  --primary-color: #667eea;  /* Cor principal */
  --background-color: white; /* Fundo */
}
```

---

## 🛠️ **8. Comandos Úteis**

### **Verificar Status:**
```bash
# Status dos containers
docker ps

# Logs do sistema
docker-compose -f infrastructure/monitoring/docker-compose.monitoring-optimized.yml logs -f

# Uso de recursos
docker stats
```

### **Reiniciar Serviços:**
```bash
# Reiniciar monitoramento
docker-compose -f infrastructure/monitoring/docker-compose.monitoring-optimized.yml restart

# Reiniciar sistema principal
docker-compose -f docker-compose.prod.yml restart
```

### **Limpeza:**
```bash
# Limpeza automática
./cleanup-monitoring.sh

# Limpeza manual
docker system prune -f
```

### **Backup:**
```bash
# Backup dos dados
docker exec partexplorer-prometheus tar czf /prometheus/backup-$(date +%Y%m%d).tar.gz /prometheus
```

---

## 🎯 **9. Fluxo de Trabalho Diário**

### **Manhã - Verificar Status:**
1. Acesse Grafana: `http://seu-ip:3001`
2. Veja o dashboard "Nginx Overview"
3. Verifique se não há erros
4. Olhe o "System Performance"

### **Durante o Dia - Monitorar:**
1. Widget no site mostra métricas em tempo real
2. Alertmanager notifica se algo der errado
3. Grafana mostra tendências

### **Noite - Análise:**
1. Veja "Business Metrics" no Grafana
2. Analise logs no Loki se necessário
3. Verifique alertas no Alertmanager

---

## 🚨 **10. Problemas Comuns e Soluções**

### **Grafana não carrega:**
```bash
# Verificar se está rodando
docker ps | grep grafana

# Reiniciar
docker restart partexplorer-grafana
```

### **Prometheus sem dados:**
```bash
# Verificar targets
curl http://localhost:9090/api/v1/targets

# Verificar configuração
docker exec partexplorer-prometheus cat /etc/prometheus/prometheus.yml
```

### **Widget não aparece:**
1. Verificar se o arquivo está importado no React
2. Verificar console do navegador
3. Verificar se a API está respondendo

### **VPS lenta:**
```bash
# Verificar uso de recursos
docker stats

# Limpeza automática
./cleanup-monitoring.sh

# Reiniciar serviços
docker-compose -f infrastructure/monitoring/docker-compose.monitoring-optimized.yml restart
```

---

## 🎉 **11. Próximos Passos**

### **Curto Prazo (1-2 semanas):**
1. ✅ Familiarizar com Grafana
2. ✅ Configurar alertas por email
3. ✅ Personalizar dashboards
4. ✅ Testar widget no frontend

### **Médio Prazo (1-2 meses):**
1. 🔄 Criar dashboards específicos para seu negócio
2. 🔄 Configurar notificações no Slack/Telegram
3. 🔄 Implementar métricas customizadas
4. 🔄 Integrar com PowerBI

### **Longo Prazo (3-6 meses):**
1. 🔄 Machine Learning para predições
2. 🔄 A/B testing integrado
3. 🔄 Métricas de conversão avançadas
4. 🔄 Automação de otimizações

---

## 📞 **12. Suporte**

### **Se algo não funcionar:**
1. **Verificar logs**: `docker logs partexplorer-grafana`
2. **Verificar status**: `docker ps`
3. **Verificar recursos**: `docker stats`
4. **Reiniciar**: `docker restart partexplorer-grafana`

### **Documentação Oficial:**
- **Grafana**: https://grafana.com/docs/
- **Prometheus**: https://prometheus.io/docs/
- **Loki**: https://grafana.com/docs/loki/

### **Comunidade:**
- **Stack Overflow**: Tag "grafana", "prometheus"
- **GitHub Issues**: Dos projetos oficiais

---

## 🎯 **Resumo - O que você tem agora:**

1. **📊 Grafana**: Dashboards bonitos e fáceis de usar
2. **📈 Prometheus**: Banco de dados de métricas
3. **📝 Loki**: Central de logs
4. **🔔 Alertmanager**: Sistema de alertas
5. **🎨 Widget**: Métricas no seu site
6. **🤖 Actions**: Deploy automático
7. **🧹 Limpeza**: Automática e manual

**Resultado**: Sistema completo de monitoramento, fácil de usar, sem impacto no seu sistema principal! 🚀
