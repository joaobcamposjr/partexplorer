# Changelog - Backend PartExplorer

## [2024-01-XX] - Atualização para nova estrutura de Company

### 🆕 Novos Recursos

#### **Tabela Company**
- ✅ Nova tabela `partexplorer.company` com campos estruturados
- ✅ Endereço completo: `street`, `number`, `neighborhood`, `city`, `state`, `country`, `zip_code`
- ✅ Contatos: `phone`, `mobile`, `email`, `website`
- ✅ Logo da empresa: `image_url`

#### **Modelos Atualizados**
- ✅ `models.Company` - Modelo completo para empresas
- ✅ `models.Stock` - Atualizado para usar `company_id` ao invés de campos diretos
- ✅ `models.PartName` - Adicionado campo `type` para categorização

#### **Handlers Novos**
- ✅ `handlers.CompanyHandler` - CRUD completo para empresas
- ✅ `handlers.StockHandler` - Atualizado para nova estrutura

#### **Repositórios**
- ✅ `database.CompanyRepository` - Operações CRUD para empresas
- ✅ `database.StockRepository` - Atualizado para usar Company

#### **Rotas**
- ✅ `/api/v1/companies/` - CRUD completo para empresas
- ✅ `/api/v1/companies/search` - Busca por nome de empresa
- ✅ Rotas de stock atualizadas para nova estrutura

### 🔄 Alterações na Estrutura

#### **Tabela Stock**
- ❌ Removido: `company_name` (VARCHAR)
- ❌ Removido: `image_url` (TEXT)
- ✅ Adicionado: `company_id` (UUID, FK para company.id)
- ✅ **Novo**: `quantity` (INT) - Quantidade em estoque
- ✅ **Novo**: `price` (FLOAT) - Preço do item

#### **Tabela PartName**
- ✅ Adicionado: `type` (VARCHAR(255)) para categorização

#### **Tabela PartGroup**
- ❌ Removido: `modified_at` (TIMESTAMP)
- ❌ Removido: `brand_id` (UUID) - Marca agora fica apenas no SKU/EAN

#### **Tabela PartName**
- ✅ Adicionado: `type` (VARCHAR(255)) para categorização
- ✅ **Obrigatório**: `brand_id` (UUID) - Referência à marca específica do SKU/EAN
- ✅ **Obrigatório**: `type` (VARCHAR(255)) - Tipo do SKU/EAN (sku, ean, desc, etc.)
- ✅ **Relacionamento**: `Brand` - Carregamento automático da marca

### 📊 Respostas da API

#### **Stock Response**
```json
{
  "id": "uuid",
  "part_name_id": "uuid",
  "company_id": "uuid",
  "quantity": 10,
  "price": 25.50,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "sku_name": "string",
  "sku_brand": "string",
  "sku_type": "string",
  "company_name": "string",
  "company_image_url": "string",
  "company_phone": "string",
  "company_mobile": "string",
  "company_email": "string",
  "company_website": "string",
  "company_address": "string"
}
```

#### **Company Response**
```json
{
  "id": "uuid",
  "name": "string",
  "image_url": "string",
  "street": "string",
  "number": "string",
  "neighborhood": "string",
  "city": "string",
  "country": "string",
  "state": "string",
  "zip_code": "string",
  "phone": "string",
  "mobile": "string",
  "email": "string",
  "website": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### 🎯 Endpoints Disponíveis

#### **Companies**
- `POST /api/v1/companies/` - Criar empresa
- `GET /api/v1/companies/:id` - Buscar empresa por ID
- `PUT /api/v1/companies/:id` - Atualizar empresa
- `DELETE /api/v1/companies/:id` - Deletar empresa
- `GET /api/v1/companies/` - Listar empresas (com paginação)
- `GET /api/v1/companies/search?q=name` - Buscar empresas por nome

#### **Stocks (Atualizados)**
- `POST /api/v1/stocks/` - Criar estoque (agora com `company_id`)
- `GET /api/v1/stocks/:id` - Buscar estoque por ID
- `PUT /api/v1/stocks/:id` - Atualizar estoque
- `DELETE /api/v1/stocks/:id` - Deletar estoque
- `GET /api/v1/stocks/` - Listar estoques
- `GET /api/v1/stocks/search?q=company` - Buscar por empresa
- `GET /api/v1/stocks/part/:part_name_id` - Estoque por SKU
- `GET /api/v1/stocks/group/:group_id` - Estoque por grupo

### 🔧 Migração

Para aplicar as alterações:

1. **Execute o DDL completo:**
```bash
docker compose exec postgres psql -U postgres -d partexplorer -f /tmp/ddl_completo_final.sql
```

2. **Reinicie o backend:**
```bash
docker compose restart backend
```

### 📝 Notas Importantes

- ✅ **Backward Compatibility**: As respostas da API mantêm compatibilidade
- ✅ **Performance**: Índices otimizados para todas as consultas
- ✅ **Validação**: Todos os campos obrigatórios validados
- ✅ **Relacionamentos**: Triggers automáticos para `updated_at`
- ✅ **Dados de Exemplo**: Empresas de exemplo incluídas no DDL
- ✅ **Estrutura Corrigida**: Marca agora fica no SKU/EAN onde faz sentido
- ✅ **Tipos Obrigatórios**: `brand` e `type` são obrigatórios em `part_name`

### 🚀 Próximos Passos

1. Testar todos os endpoints
2. Atualizar frontend para nova estrutura
3. Migrar dados existentes se necessário
4. Documentar APIs atualizadas 