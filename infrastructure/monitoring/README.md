# Sistema de Monitoramento PartExplorer

Sistema completo de monitoramento para o projeto PartExplorer, incluindo métricas do nginx, logs centralizados, alertas e analytics em tempo real.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Nginx         │
│   (React)       │    │   (Go)          │    │   (Proxy)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Sistema de Monitoramento           │
         └─────────────────────────────────────────────────┘
                                 │
    ┌──────────────┬─────────────┼─────────────┬──────────────┐
    │              │             │             │              │
┌───▼───┐    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
│Prometheus│  │ Grafana │   │  Loki   │   │Alertmanager│  │Exporters│
└────────┘    └─────────┘   └─────────┘   └──────────┘   └─────────┘
```

## 📊 Componentes

### 1. **Prometheus** - Coleta de Métricas
- **Porta**: 9090
- **Função**: Coleta e armazena métricas de todos os serviços
- **Métricas coletadas**:
  - Nginx (requests, response time, errors)
  - Sistema (CPU, memória, disco)
  - Containers (uso de recursos)
  - Aplicação (endpoints, performance)

### 2. **Grafana** - Visualização
- **Porta**: 3001
- **Credenciais**: admin/admin123
- **Função**: Dashboards e visualizações
- **Dashboards incluídos**:
  - Nginx Overview
  - Sistema Performance
  - Aplicação Metrics
  - Logs Analysis

### 3. **Loki** - Agregação de Logs
- **Porta**: 3100
- **Função**: Centralização e busca de logs
- **Logs coletados**:
  - Nginx access/error logs
  - Backend logs
  - Frontend logs
  - Sistema logs

### 4. **Alertmanager** - Gerenciamento de Alertas
- **Porta**: 9093
- **Função**: Notificações e alertas
- **Alertas configurados**:
  - Alta CPU/Memória
  - Nginx down
  - Alta taxa de erro
  - Disco cheio

### 5. **Exporters** - Coleta de Dados
- **Nginx Exporter** (9113): Métricas do nginx
- **Node Exporter** (9100): Métricas do sistema
- **cAdvisor** (8088): Métricas de containers

## 🚀 Deploy

### Deploy Automático
```bash
# No diretório raiz do projeto
./scripts/deploy-monitoring.sh
```

### Deploy Manual
```bash
# 1. Criar diretórios
mkdir -p infrastructure/monitoring/{prometheus,rules,grafana/{provisioning/{datasources,dashboards},dashboards},loki,promtail,alertmanager}
mkdir -p logs/{nginx,backend,frontend}

# 2. Iniciar sistema principal
docker-compose -f docker-compose.prod.yml up -d

# 3. Iniciar monitoramento
cd infrastructure/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

## 📈 Métricas Coletadas

### Nginx
- **Requests por segundo**
- **Response time** (95th percentile)
- **Error rate** (4xx, 5xx)
- **Active connections**
- **Bytes sent/received**
- **GeoIP data** (se configurado)

### Sistema
- **CPU usage** (por core)
- **Memory usage** (total, available, cached)
- **Disk usage** (por filesystem)
- **Network I/O** (bytes in/out)
- **Load average**

### Aplicação
- **Page views**
- **User sessions**
- **Click events**
- **Search queries**
- **Part views**
- **Error tracking**

### Containers
- **CPU usage**
- **Memory usage**
- **Network I/O**
- **Disk I/O**
- **Container status**

## 🎯 Dashboards Disponíveis

### 1. Nginx Overview
- Taxa de requisições
- Tempo de resposta
- Taxa de erro
- Conexões ativas
- Top URLs acessadas

### 2. Sistema Performance
- CPU e memória
- Uso de disco
- Network I/O
- Load average
- Temperatura (se disponível)

### 3. Aplicação Analytics
- Usuários ativos
- Páginas mais visitadas
- Tempo de sessão
- Taxa de rejeição
- Eventos de usuário

### 4. Logs Analysis
- Logs por serviço
- Erros por tipo
- Logs por nível
- Busca em tempo real

## 🔔 Alertas Configurados

### Críticos
- **Nginx Down**: Serviço nginx não responde
- **Backend Down**: API backend não responde
- **Container Down**: Container parou

### Warnings
- **High CPU**: CPU > 80% por 5 minutos
- **High Memory**: Memória > 85% por 5 minutos
- **High Disk**: Disco > 85% por 5 minutos
- **High Error Rate**: Taxa de erro > 5% por 2 minutos
- **High Latency**: Latência > 1s (95th percentile)

## 🎨 Frontend Analytics

### Widget de Métricas
- **Localização**: Canto inferior direito
- **Funcionalidades**:
  - Métricas em tempo real
  - Tempo de sessão do usuário
  - Eventos capturados
  - Status de conectividade

### Eventos Rastreados
- **Page views**: Navegação entre páginas
- **Clicks**: Interações do usuário
- **Searches**: Buscas realizadas
- **Part views**: Visualização de peças
- **Errors**: Erros JavaScript
- **Performance**: Métricas de carregamento

### Integração
```javascript
import { useAnalytics } from '../utils/analytics';

const MyComponent = () => {
  const analytics = useAnalytics();
  
  const handleSearch = (query) => {
    analytics.trackSearch(query, results.length);
  };
  
  const handlePartView = (part) => {
    analytics.trackPartView(part.id, part.name, part.category);
  };
};
```

## 🔧 Configuração Avançada

### GeoIP
Para habilitar GeoIP no nginx:
```nginx
# Instalar módulo GeoIP
apt-get install nginx-module-geoip

# Configurar no nginx.conf
geoip_country /usr/share/GeoIP/GeoIP.dat;
geoip_city /usr/share/GeoIP/GeoLiteCity.dat;
```

### SSL/TLS
Para monitoramento com HTTPS:
```yaml
# No docker-compose.monitoring.yml
grafana:
  environment:
    - GF_SERVER_PROTOCOL=https
    - GF_SERVER_CERT_FILE=/etc/ssl/certs/grafana.crt
    - GF_SERVER_KEY_FILE=/etc/ssl/private/grafana.key
```

### Backup
```bash
# Backup do Prometheus
docker exec partexplorer-prometheus tar czf /prometheus/backup-$(date +%Y%m%d).tar.gz /prometheus

# Backup do Grafana
docker exec partexplorer-grafana tar czf /var/lib/grafana/backup-$(date +%Y%m%d).tar.gz /var/lib/grafana
```

## 📊 PowerBI Integration

### Métricas para PowerBI
1. **Exportar dados do Prometheus**:
   ```bash
   curl "http://localhost:9090/api/v1/query_range?query=rate(nginx_http_requests_total[1h])&start=2024-01-01T00:00:00Z&end=2024-01-02T00:00:00Z&step=1m"
   ```

2. **Conectar via API**:
   - Prometheus API: `http://localhost:9090/api/v1/`
   - Grafana API: `http://localhost:3001/api/`

3. **Métricas recomendadas**:
   - Visitas diárias/mensais
   - Tempo médio de sessão
   - Taxa de conversão
   - Top páginas/peças
   - Performance por região

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Prometheus não coleta métricas**:
   ```bash
   # Verificar targets
   curl http://localhost:9090/api/v1/targets
   
   # Verificar configuração
   docker exec partexplorer-prometheus cat /etc/prometheus/prometheus.yml
   ```

2. **Grafana não carrega dashboards**:
   ```bash
   # Verificar datasources
   curl http://localhost:3001/api/datasources
   
   # Verificar permissões
   docker exec partexplorer-grafana ls -la /var/lib/grafana
   ```

3. **Logs não aparecem no Loki**:
   ```bash
   # Verificar Promtail
   docker logs partexplorer-promtail
   
   # Verificar configuração
   docker exec partexplorer-promtail cat /etc/promtail/config.yml
   ```

### Logs Úteis
```bash
# Ver todos os logs
docker-compose -f infrastructure/monitoring/docker-compose.monitoring.yml logs -f

# Logs específicos
docker logs -f partexplorer-prometheus
docker logs -f partexplorer-grafana
docker logs -f partexplorer-loki
```

## 📈 Próximos Passos

1. **Configurar notificações** (email, Slack, Telegram)
2. **Implementar métricas customizadas** no backend
3. **Criar dashboards específicos** para negócio
4. **Configurar backup automático** dos dados
5. **Implementar autenticação** no Grafana
6. **Adicionar métricas de negócio** (vendas, conversões)

## 🔗 URLs de Acesso

- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **Loki**: http://localhost:3100
- **Nginx Exporter**: http://localhost:9113/metrics
- **cAdvisor**: http://localhost:8088

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs dos containers
2. Consultar documentação oficial
3. Verificar configurações
4. Testar conectividade entre serviços
