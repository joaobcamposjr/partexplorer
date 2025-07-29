--- DDL COMPLETO - PartExplorer
-- Execute este arquivo para criar toda a estrutura do banco

DROP SCHEMA IF EXISTS partexplorer CASCADE;

-- Criar schema e extensões
CREATE SCHEMA IF NOT EXISTS partexplorer;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABELAS PRINCIPAIS
-- ========================================

-- Brand
CREATE TABLE partexplorer.brand (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL,
    logo_url VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Family
CREATE TABLE partexplorer.family (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description VARCHAR(80) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subfamily
CREATE TABLE partexplorer.subfamily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES partexplorer.family(id),
    description VARCHAR(80) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Type
CREATE TABLE partexplorer.product_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subfamily_id UUID REFERENCES partexplorer.subfamily(id),
    description VARCHAR(80) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Part Group (grupo de peças)
CREATE TABLE partexplorer.part_group (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type_id UUID REFERENCES partexplorer.product_type(id),
    discontinued BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Part Group Dimension
CREATE TABLE partexplorer.part_group_dimension (
    id UUID PRIMARY KEY,
    length_mm NUMERIC(10,2),
    width_mm NUMERIC(10,2),
    height_mm NUMERIC(10,2),
    weight_kg NUMERIC(10,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES partexplorer.part_group(id)
);

-- Part Name (SKUs/EANs)
CREATE TABLE partexplorer.part_name (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES partexplorer.part_group(id),
    brand_id UUID REFERENCES partexplorer.brand(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Part Image
CREATE TABLE partexplorer.part_image (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES partexplorer.part_group(id),
    url VARCHAR(300) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Part Video
CREATE TABLE partexplorer.part_video (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES partexplorer.part_group(id),
    url VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Application (aplicações/veículos)
CREATE TABLE partexplorer.application (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line VARCHAR(40),
    manufacturer VARCHAR(40),
    model VARCHAR(60),
    version VARCHAR(40),
    generation VARCHAR(20),
    engine VARCHAR(40),
    body VARCHAR(40),
    fuel VARCHAR(20),
    year_start INT,
    year_end INT,
    reliable BOOLEAN,
    adaptation BOOLEAN,
    additional_info VARCHAR,
    cylinders VARCHAR(10),
    hp VARCHAR(10),
    image VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Part Group Application (N:N)
CREATE TABLE partexplorer.part_group_application (
    group_id UUID REFERENCES partexplorer.part_group(id),
    application_id UUID REFERENCES partexplorer.application(id),
    PRIMARY KEY (group_id, application_id)
);


-- Company (empresas/fornecedores)
CREATE TABLE partexplorer.company (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    street VARCHAR(255),
    number VARCHAR(10),
    neighborhood VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),
    state VARCHAR(2),
    zip_code VARCHAR(25),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock (estoque por SKU)
CREATE TABLE partexplorer.stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_name_id UUID REFERENCES partexplorer.part_name(id) ON DELETE CASCADE,
    company_id UUID REFERENCES partexplorer.company(id),
    quantity int,
    price float,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para part_group
CREATE INDEX idx_part_group_product_type_id ON partexplorer.part_group(product_type_id);
CREATE INDEX idx_part_group_created_at ON partexplorer.part_group(created_at);
CREATE INDEX idx_part_group_updated_at ON partexplorer.part_group(updated_at);

-- Índices para part_name
CREATE INDEX idx_part_name_name ON partexplorer.part_name(name);
CREATE INDEX idx_part_name_group_id ON partexplorer.part_name(group_id);
CREATE INDEX idx_part_name_brand_id ON partexplorer.part_name(brand_id);
CREATE INDEX idx_part_name_type ON partexplorer.part_name(type);
CREATE INDEX idx_part_name_created_at ON partexplorer.part_name(created_at);
CREATE INDEX idx_part_name_updated_at ON partexplorer.part_name(updated_at);

-- Índices para application
CREATE INDEX idx_application_model ON partexplorer.application(model);
CREATE INDEX idx_application_manufacturer ON partexplorer.application(manufacturer);
CREATE INDEX idx_application_created_at ON partexplorer.application(created_at);
CREATE INDEX idx_application_updated_at ON partexplorer.application(updated_at);

-- Índices para brand
CREATE INDEX idx_brand_created_at ON partexplorer.brand(created_at);
CREATE INDEX idx_brand_updated_at ON partexplorer.brand(updated_at);

-- Índices para part_group_application
CREATE INDEX idx_part_group_application_group_id ON partexplorer.part_group_application(group_id);
CREATE INDEX idx_part_group_application_application_id ON partexplorer.part_group_application(application_id);

-- Índices para part_image
CREATE INDEX idx_part_image_group_id ON partexplorer.part_image(group_id);

-- Índices para part_video
CREATE INDEX idx_part_video_group_id ON partexplorer.part_video(group_id);

-- Índices para part_group_dimension
CREATE INDEX idx_part_group_dimension_id ON partexplorer.part_group_dimension(id);

-- Índices para company
CREATE INDEX idx_company_name ON partexplorer.company(name);
CREATE INDEX idx_company_created_at ON partexplorer.company(created_at);
CREATE INDEX idx_company_updated_at ON partexplorer.company(updated_at);

-- Índices para stock
CREATE INDEX idx_stock_part_name_id ON partexplorer.stock(part_name_id);
CREATE INDEX idx_stock_company_id ON partexplorer.stock(company_id);

-- ========================================
-- TRIGGERS AUTOMÁTICOS
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
CREATE TRIGGER update_brand_updated_at 
    BEFORE UPDATE ON partexplorer.brand 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_updated_at 
    BEFORE UPDATE ON partexplorer.family 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subfamily_updated_at 
    BEFORE UPDATE ON partexplorer.subfamily 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_type_updated_at 
    BEFORE UPDATE ON partexplorer.product_type 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_part_group_updated_at 
    BEFORE UPDATE ON partexplorer.part_group 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_part_group_dimension_updated_at 
    BEFORE UPDATE ON partexplorer.part_group_dimension 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_part_name_updated_at 
    BEFORE UPDATE ON partexplorer.part_name 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_part_image_updated_at 
    BEFORE UPDATE ON partexplorer.part_image 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_part_video_updated_at 
    BEFORE UPDATE ON partexplorer.part_video 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_updated_at 
    BEFORE UPDATE ON partexplorer.application 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_updated_at 
    BEFORE UPDATE ON partexplorer.company 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_updated_at 
    BEFORE UPDATE ON partexplorer.stock 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON SCHEMA partexplorer IS 'Schema para catálogo de peças automotivas';
COMMENT ON TABLE partexplorer.brand IS 'Marcas de peças';
COMMENT ON TABLE partexplorer.family IS 'Famílias de peças';
COMMENT ON TABLE partexplorer.subfamily IS 'Subfamílias de peças';
COMMENT ON TABLE partexplorer.product_type IS 'Tipos de produtos';
COMMENT ON TABLE partexplorer.part_group IS 'Grupos de peças similares';
COMMENT ON TABLE partexplorer.part_name IS 'Nomes/SKUs/EANs das peças';
COMMENT ON TABLE partexplorer.part_image IS 'Imagens das peças';
COMMENT ON TABLE partexplorer.part_video IS 'Vídeos das peças';
COMMENT ON TABLE partexplorer.application IS 'Aplicações/veículos compatíveis';
COMMENT ON TABLE partexplorer.company IS 'Empresas/fornecedores';
COMMENT ON TABLE partexplorer.stock IS 'Estoque por SKU específico';

-- ========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ========================================

-- Inserir algumas marcas de exemplo
INSERT INTO partexplorer.brand (id, name) VALUES 
    (uuid_generate_v4(), 'KIT E CIA'),
    (uuid_generate_v4(), 'Renault'),
    (uuid_generate_v4(), 'Ford');

-- Inserir famílias de exemplo
INSERT INTO partexplorer.family (id, description) VALUES 
    (uuid_generate_v4(), 'EMBREAGEM'),
    (uuid_generate_v4(), 'FREIOS'),
    (uuid_generate_v4(), 'MOTOR');

-- Inserir subfamílias de exemplo
INSERT INTO partexplorer.subfamily ( family_id, description) VALUES 
    ((SELECT id FROM partexplorer.family WHERE description = 'EMBREAGEM' LIMIT 1), 'COMANDO EMBREAGEM PEDAL'),
    ((SELECT id FROM partexplorer.family WHERE description = 'FREIOS' LIMIT 1), 'PASTILHAS DE FREIO'),
    ((SELECT id FROM partexplorer.family WHERE description = 'MOTOR' LIMIT 1), 'BOMBA DE ÓLEO');

-- Inserir tipos de produto de exemplo
INSERT INTO partexplorer.product_type ( subfamily_id, description) VALUES 
    ((SELECT id FROM partexplorer.subfamily WHERE description = 'COMANDO EMBREAGEM PEDAL' LIMIT 1), 'BUCHA PEDAL'),
    ((SELECT id FROM partexplorer.subfamily WHERE description = 'PASTILHAS DE FREIO' LIMIT 1), 'PASTILHA FRONTAL'),
    ((SELECT id FROM partexplorer.subfamily WHERE description = 'BOMBA DE ÓLEO' LIMIT 1), 'BOMBA PRINCIPAL');

-- Inserir empresas de exemplo
INSERT INTO partexplorer.company (
    id, name, image_url, street, number, neighborhood, city, state, country, zip_code,
    phone, mobile, email, website
) VALUES 
    (
        uuid_generate_v4(),
        'Grupo Amazonas',
        'https://example.com/logo-amazonas.png',
        'Rua das Peças',
        '123',
        'Vila Industrial',
        'São Paulo',
        'SP',
        'Brasil',
        '01000-000',
        '(11) 9999-8888',
        '(11) 99999-9999',
        'contato@autoparts.com.br',
        'https://www.autoparts.com.br'
    ),
    (
        uuid_generate_v4(),
        'Orletti',
        'https://example.com/logo-orletti.png',
        'Av. dos Motores',
        '456',
        'Centro',
        'Rio de Janeiro',
        'RJ',
        'Brasil',
        '20000-000',
        '(21) 8888-7777',
        '(21) 88888-8888',
        'vendas@mecanicacentral.com.br',
        'https://www.mecanicacentral.com.br'
    ),
    (
        uuid_generate_v4(),
        'Sinal',
        'https://example.com/logo-sinal.png',
        'Rua do Comércio',
        '789',
        'Funcionários',
        'Belo Horizonte',
        'MG',
        'Brasil',
        '30000-000',
        '(31) 7777-6666',
        '(31) 77777-7777',
        'pedidos@distribuidoranacional.com.br',
        'https://www.distribuidoranacional.com.br'
    );

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se as tabelas foram criadas
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'partexplorer' 
AND column_name IN ('created_at', 'updated_at')
ORDER BY table_name, column_name;

-- Verificar se os triggers foram criados
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'partexplorer'
ORDER BY event_object_table, trigger_name;