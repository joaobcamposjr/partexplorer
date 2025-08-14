# 🚗 Serviço de Consulta de Veículos por Placa

Este serviço foi convertido do Python para Go e integrado ao projeto PartExplorer para fornecer consultas de veículos por placa com sistema de cache.

## 📋 Funcionalidades

- **Consulta de placas**: Busca informações de veículos por placa
- **Sistema de cache**: Armazena consultas no banco de dados para evitar requisições repetidas
- **API externa simulada**: Simula consulta em keplaca.com (preparado para integração real)
- **Dados completos**: Marca, modelo, ano, cor, combustível, chassi, FIPE, etc.

## 🗄️ Estrutura do Banco

### Tabela `partexplorer.car`
```sql
CREATE TABLE partexplorer.car (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_plate VARCHAR(10) UNIQUE NOT NULL,
    brand VARCHAR(80),
    model VARCHAR(255),
    year INT,
    model_year INT,
    color VARCHAR(80),
    fuel_type VARCHAR(80),
    chassis_number VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(2),
    imported VARCHAR(3),
    fipe_code VARCHAR(80),
    fipe_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `partexplorer.car_error`
```sql
CREATE TABLE partexplorer.car_error (
    license_plate VARCHAR(10) PRIMARY KEY,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Arquitetura

### Componentes

1. **Models** (`internal/models/car.go`)
   - `Car`: Modelo para tabela car
   - `CarError`: Modelo para tabela car_error
   - `CarInfo`: Dados retornados pela API externa

2. **Repository** (`internal/database/car_repository.go`)
   - `CarRepository`: Interface para operações de carros
   - `carRepository`: Implementação com cache e API externa

3. **Handler** (`internal/handlers/car_handlers.go`)
   - `CarHandler`: Endpoints da API REST

4. **Routes** (`internal/api/routes.go`)
   - Rotas integradas ao sistema principal

## 🚀 Endpoints

### Health Check
```
GET /api/v1/cars/health
```
Verifica se o serviço está funcionando.

### Buscar Placa (com cache)
```
GET /api/v1/cars/search/:plate
```
Busca informações de veículo por placa. Se não estiver no cache, consulta API externa.

**Exemplo:**
```bash
curl http://localhost:8080/api/v1/cars/search/ABC1234
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "placa": "ABC1234",
    "marca": "VOLKSWAGEN",
    "modelo": "GOL",
    "ano": "2015",
    "ano_modelo": "2016",
    "cor": "PRATA",
    "combustivel": "FLEX",
    "chassi": "*****123456",
    "municipio": "São Paulo",
    "uf": "SP",
    "importado": "NÃO",
    "codigo_fipe": "123456-1",
    "valor_fipe": "R$ 25.000,00",
    "data_consulta": "2025-01-XX",
    "confiabilidade": 0.7,
    "has_minimal_info": true
  },
  "message": "Informações do veículo obtidas com sucesso"
}
```

### Buscar no Cache Apenas
```
GET /api/v1/cars/cache/:plate
```
Busca apenas no cache local, sem consultar API externa.

**Exemplo:**
```bash
curl http://localhost:8080/api/v1/cars/cache/ABC1234
```

## 🔄 Fluxo de Funcionamento

1. **Primeira consulta**:
   - Verifica se placa existe no cache
   - Se não existe, simula consulta na API externa
   - Salva resultado no cache
   - Retorna dados

2. **Consultas subsequentes**:
   - Busca diretamente no cache
   - Retorna dados rapidamente
   - Não consulta API externa

3. **Tratamento de erros**:
   - Se API externa falhar, cria dados de fallback
   - Salva erro na tabela `car_error`
   - Retorna dados simulados

## 🧪 Testes

### Executar Testes
```bash
cd backend
./scripts/test_car_service.sh
```

### Teste Manual
```bash
# Health check
curl http://localhost:8080/api/v1/cars/health

# Buscar placa (primeira vez)
curl http://localhost:8080/api/v1/cars/search/ABC1234

# Buscar mesma placa (cache)
curl http://localhost:8080/api/v1/cars/search/ABC1234

# Buscar no cache apenas
curl http://localhost:8080/api/v1/cars/cache/ABC1234
```

## 📊 Migrações

### Executar Migrações
```bash
cd backend
psql $DATABASE_URL -f migrations/006_create_car_tables.sql
psql $DATABASE_URL -f migrations/007_create_car_triggers.sql
```

## 🔮 Próximos Passos

1. **Integração real com keplaca.com**:
   - Implementar web scraping real
   - Usar Selenium ou similar
   - Tratar rate limiting

2. **Melhorias no cache**:
   - TTL (Time To Live) para dados
   - Limpeza automática de dados antigos
   - Cache em Redis

3. **Validação de placas**:
   - Validar formato Mercosul
   - Validar formato antigo
   - Verificar dígito verificador

4. **Monitoramento**:
   - Métricas de performance
   - Logs estruturados
   - Alertas para falhas

## 🐛 Debug

### Logs
O serviço gera logs detalhados com prefixo `=== DEBUG:`:
```
=== DEBUG: Placa ABC1234 não encontrada no cache, buscando na API externa ===
=== DEBUG: Simulando chamada para API externa para placa ABC1234 ===
=== DEBUG: Carro salvo no cache com sucesso ===
```

### Verificar Cache
```sql
-- Verificar dados no cache
SELECT * FROM partexplorer.car WHERE license_plate = 'ABC1234';

-- Verificar erros
SELECT * FROM partexplorer.car_error WHERE license_plate = 'ABC1234';
```

## 📝 Notas

- O serviço está preparado para integração real com keplaca.com
- Dados simulados são consistentes baseados no hash da placa
- Sistema de cache evita consultas repetidas
- Tratamento de erros robusto com fallback
- Integrado ao sistema principal do PartExplorer
