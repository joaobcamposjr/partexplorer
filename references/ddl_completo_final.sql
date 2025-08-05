-- DDL COMPLETO - PartExplorer
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
    obsolete boolean,
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
CREATE INDEX  idx_stock_part_name_id ON partexplorer.stock(part_name_id);
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

CREATE OR REPLACE TRIGGER update_stock_updated_at 
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
    (uuid_generate_v4(), 'Ford'),
    (uuid_generate_v4(), 'N/A');

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









-- INSERTS nas bases
select * from partexplorer.application
  
select * from partexplorer.brand -- b2fdd6d0-e6c0-415e-b5ea-5b2d5e9b860c /// 6e9140b6-9ce0-465d-a42b-a98056c146ca
where id = 'b2fdd6d0-e6c0-415e-b5ea-5b2d5e9b860c'
  
select * from partexplorer.company -- ok
  
select * from partexplorer.family -- ok 
  
select * from partexplorer.part_group
insert into partexplorer.part_group (
product_type_id,
discontinued) values ('e9403f22-51a0-447b-9e64-8501e7a2413a',false)



select * from partexplorer.company
-- update partexplorer.company set image_url = 'https://imgs-amz.s3.us-east-1.amazonaws.com/partexplorer/company/orletti-logo.png'
where id = '2863882c-b49b-4fe9-8314-96c252683964'
  

  
select * from partexplorer.part_group_dimension

  INSERT INTO partexplorer.part_group_dimension (
    id, length_mm, width_mm, height_mm, weight_kg
) VALUES (
    '587fe752-1ea6-4a48-8ea9-c9883996bf20',
    120.00, 45.00, 30.00, 0.150
);
  
select * from partexplorer.part_image -- depois 
  
select * from partexplorer.part_name 
  -- Names/SKUs/aliases
INSERT INTO partexplorer.part_name (group_id, brand_id,name,  type) VALUES
    ('587fe752-1ea6-4a48-8ea9-c9883996bf20','6e9140b6-9ce0-465d-a42b-a98056c146ca', 'BUCHA PEDAL', 'desc'),
    ('587fe752-1ea6-4a48-8ea9-c9883996bf20','b2fdd6d0-e6c0-415e-b5ea-5b2d5e9b860c', '55562' ,'sku'),
    ('587fe752-1ea6-4a48-8ea9-c9883996bf20','6e9140b6-9ce0-465d-a42b-a98056c146ca', '7899099136249', 'ean')

  
select * from partexplorer.part_video
  
select * from partexplorer.product_type -- e9403f22-51a0-447b-9e64-8501e7a2413a
  
select * from partexplorer.stock


select * from partexplorer.stock

insert into partexplorer.stock (part_name_id,company_id, quantity, price, obsolete)
values 
('df7d0089-870d-4397-80e9-1ca44e7af74b','66aa8e66-12b2-4721-ab7b-f6032c77bfd6',10,350,true),
('df7d0089-870d-4397-80e9-1ca44e7af74b','2863882c-b49b-4fe9-8314-96c252683964',3,500,false),
('df7d0089-870d-4397-80e9-1ca44e7af74b','1e349c2c-b84a-4779-9cbd-a0bd3f739cfc',1,200,false)

  
select * from partexplorer.subfamily -- ok 
select * from partexplorer.company -- ok

SELECT id, name FROM partexplorer.part_name
WHERE id = 'df7d0089-870d-4397-80e9-1ca44e7af74b';


select * from partexplorer.application


select * from partexplorer.part_group_application

-- N:N relation (part_group <-> application)
INSERT INTO partexplorer.part_group_application (group_id, application_id)
SELECT '587fe752-1ea6-4a48-8ea9-c9883996bf20', id FROM partexplorer.application;

-- INSERT aplicações 
INSERT INTO partexplorer.application (
    line, manufacturer, model, version, generation, engine, body, fuel,
    year_start, year_end, reliable, adaptation, additional_info, cylinders, hp, image
) VALUES
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.0 16V D4D', 'HATCHBACK', 'GASOLINA', 2000, 2003, true, false, NULL, '4', '71', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/88fc6d05-1135-4a49-8be7-ad3e03e78823.jpg'),
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.0 16V D4D', 'SEDAN', 'GASOLINA', 2000, 2003, true, false, NULL, '4', '71', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/06eabf7b-a93c-459f-918a-b6c06bbf8845.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G2', '1.0 8V D7D', 'HATCHBACK', 'GASOLINA', 1999, 2003, true, false, NULL, '4', '58', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/0bee733a-002c-4e1c-b90d-568f18caaa36.jpg'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G2', '1.0 8V D7D', 'HATCHBACK', 'GASOLINA', 1999, 2003, true, false, NULL, '4', '58', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/0bee733a-002c-4e1c-b90d-568f18caaa36.jpg'),
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.0 8V D7D', 'HATCHBACK', 'GASOLINA', 1999, 2003, true, false, NULL, '4', '58', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/0bee733a-002c-4e1c-b90d-568f18caaa36.jpg'),
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.0 8V D7D', 'HATCHBACK', 'GASOLINA', 1999, 2003, true, false, NULL, '4', '58', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/0bee733a-002c-4e1c-b90d-568f18caaa36.jpg'),
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.6 16V K4M', 'HATCHBACK', 'GASOLINA', 2000, 2003, true, false, NULL, '4', '110', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/173c4ff1-4c9e-4a95-a10c-ed8cfc3fd94c.jpg'),
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.6 16V K4M', 'SEDAN', 'GASOLINA', 2000, 2003, true, false, NULL, '4', '110', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/18acad8b-6814-4e71-871c-85b40bb5a810.png'),
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.6 8V C3L', 'HATCHBACK', 'GASOLINA', 1999, 2002, true, false, NULL, '4', '90', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/2c2c103f-9882-43d2-88e5-96efa6ad61d1.jpg'),
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.6 8V C3L', 'SEDAN', 'GASOLINA', 1999, 2002, true, false, NULL, '4', '90', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/4300518c-0259-4965-96a8-7ccdf05cd941.png'),
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.6 8V K7M', 'HATCHBACK', 'GASOLINA', 1999, 2002, true, false, NULL, '4', '90', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/50ebd115-fdd4-4ffc-8a99-14815c2bb82a.jpg'),
('Leve', 'RENAULT', 'CLIO', 'RL', 'G2', '1.6 8V K7M', 'SEDAN', 'GASOLINA', 1999, 2002, true, false, NULL, '4', '90', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/a8931e94-ecc9-4435-ace0-18327c9f82ee.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.0 16V D4D', 'HATCHBACK', 'GASOLINA', 2003, 2006, true, false, NULL, '4', '71', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/95b7024a-f589-454d-8496-502186677720.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.0 16V D4D', 'HATCHBACK', 'FLEX', 2003, 2005, true, false, NULL, '4', '77', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/f343b119-b5f4-48ce-b534-2286763f7233.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.0 16V D4D', 'SEDAN', 'FLEX', 2003, 2005, true, false, NULL, '4', '77', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/f9df4152-6d15-45c0-a590-1669ea05e01f.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.0 16V D4D', 'SEDAN', 'GASOLINA', 2003, 2006, true, false, NULL, '4', '71', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/bad3331f-6059-41fe-b50f-f78e813e56c2.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.0 8V D7D', 'HATCHBACK', 'GASOLINA', 2003, 2005, true, false, NULL, '4', '58', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/43bdf6fb-6e5c-427a-9a69-cbf53cc0100a.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.0 8V D7D', 'HATCHBACK', 'GASOLINA', 2003, 2005, true, false, NULL, '4', '58', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/43bdf6fb-6e5c-427a-9a69-cbf53cc0100a.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.6 16V K4M', 'HATCHBACK', 'GASOLINA', 2003, 2005, true, false, NULL, '4', '110', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/f89a65b7-eb3d-490b-a706-41b22c8007c9.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.6 16V K4M', 'HATCHBACK', 'FLEX', 2004, 2005, true, false, NULL, '4', '112', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/39a0125d-ad73-4088-b638-8fe0f91810c4.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.6 16V K4M', 'SEDAN', 'GASOLINA', 2003, 2005, true, false, NULL, '4', '110', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/99b079cf-c39f-4e48-a789-479cea551e9c.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F1', '1.6 16V K4M', 'SEDAN', 'FLEX', 2004, 2005, true, false, NULL, '4', '112', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/635f5ab9-897f-49f8-b089-b4c35ab59a6f.png'),
('Leve', 'RENAULT', 'CLIO', 'AUTHENTIQUE HI-FLEX', 'G3 F2', '1.0 16V D4D', 'HATCHBACK', 'FLEX', 2005, 2010, true, false, NULL, '4', '77', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/10de65b8-25ef-43ed-a323-87d5725cfdf0.png'),
('Leve', 'RENAULT', 'CLIO', 'AUTHENTIQUE HI-FLEX', 'G3 F2', '1.0 16V D4D', 'HATCHBACK', 'FLEX', 2011, 2012, true, false, NULL, '4', '77', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/b08ae6cb-b1ae-49c0-b96f-1b83f4c7b7e4.png'),
('Leve', 'RENAULT', 'CLIO', 'AUTHENTIQUE HI-FLEX', 'G3 F2', '1.0 16V D4D', 'SEDAN', 'FLEX', 2005, 2010, true, false, NULL, '4', '77', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/36158a1b-c1c3-44c2-b4e8-7dda39391606.png'),
('Leve', 'RENAULT', 'CLIO', 'AUTHENTIQUE HI-FLEX', 'G3 F2', '1.0 16V D4D', 'SEDAN', 'FLEX', 2011, 2012, true, false, NULL, '4', '77', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/f9a44f68-b607-44a8-9339-2c31644e67dc.png'),
('Leve', 'RENAULT', 'CLIO', 'AUTHENTIQUE', 'G3 F2', '1.0 8V D7D', 'HATCHBACK', 'GASOLINA', 2005, 2008, true, false, NULL, '4', '58', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/8267f916-e5f3-47e1-a896-770371e86349.png'),
('Leve', 'RENAULT', 'CLIO', 'AUTHENTIQUE', 'G3 F2', '1.0 8V D7D', 'HATCHBACK', 'GASOLINA', 2005, 2008, true, false, NULL, '4', '58', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/8267f916-e5f3-47e1-a896-770371e86349.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F2', '1.6 16V K4M', 'HATCHBACK', 'GASOLINA', 2005, 2006, true, false, NULL, '4', '110', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/7bcadb3d-31cb-44ac-873e-cec0882524ac.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F2', '1.6 16V K4M', 'HATCHBACK', 'FLEX', 2005, 2009, true, false, NULL, '4', '112', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/8f5ec210-c615-42d4-87a2-9380429a9917.png'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F2', '1.6 16V K4M', 'SEDAN', 'FLEX', 2005, 2009, true, false, NULL, '4', '112', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/76a88da2-227f-439b-8f16-f10a952709c1.jpg'),
('Leve', 'RENAULT', 'CLIO', 'R-LINE', 'G3 F2', '1.6 16V K4M', 'SEDAN', 'GASOLINA', 2005, 2006, true, false, NULL, '4', '110', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/a3680530-c802-4071-af15-0d2101eb7c88.jpg'),
('Leve', 'RENAULT', 'CLIO', 'AUTHENTIQUE HI-FLEX', 'G4', '1.0 16V D4D', 'HATCHBACK', 'FLEX', 2012, 2016, true, false, NULL, '4', '80', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/70026320-5977-4579-a6ec-e6657854a58d.png'),
('Leve', 'RENAULT', 'KANGOO', 'RL', 'G1 F1', '1.0 16V D4D', 'FURGAO', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '70', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/61d009b6-12e5-4b6f-9a8f-d80ede06f2c2.png'),
('Leve', 'RENAULT', 'KANGOO', 'RL', 'G1 F1', '1.0 16V D4D', 'MINIVAN', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '70', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/59ef385f-171a-4fe4-b051-31776a5beb35.png'),
('Leve', 'RENAULT', 'KANGOO', 'R-LINE', 'G1 F1', '1.0 16V D4D', 'MINIVAN', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '70', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/59ef385f-171a-4fe4-b051-31776a5beb35.png'),
('Leve', 'RENAULT', 'KANGOO', 'RL', 'G1 F1', '1.0 16V D4D', 'PICK-UP CAB. SIMPLES', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '70', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/a8a3fc7c-8083-4bea-944d-6667a6320171.png'),
('Leve', 'RENAULT', 'KANGOO', 'RL', 'G1 F1', '1.0 8V D7D', 'FURGAO', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '59', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/855369ad-3769-48b5-87af-19cea3ed9639.png'),
('Leve', 'RENAULT', 'KANGOO', 'RL', 'G1 F1', '1.0 8V D7D', 'FURGAO', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '59', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/855369ad-3769-48b5-87af-19cea3ed9639.png'),
('Leve', 'RENAULT', 'KANGOO', 'R-LINE', 'G1 F1', '1.0 8V D7D', 'MINIVAN', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '59', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/296cae6f-3a95-47ed-ad71-fdf2d9ad41b5.png'),
('Leve', 'RENAULT', 'KANGOO', 'RL', 'G1 F1', '1.0 8V D7D', 'MINIVAN', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '59', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/296cae6f-3a95-47ed-ad71-fdf2d9ad41b5.png'),
('Leve', 'RENAULT', 'KANGOO', 'RL', 'G1 F1', '1.0 8V D7D', 'MINIVAN', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '59', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/296cae6f-3a95-47ed-ad71-fdf2d9ad41b5.png'),
('Leve', 'RENAULT', 'KANGOO', 'R-LINE', 'G1 F1', '1.0 8V D7D', 'MINIVAN', 'GASOLINA', 2000, 2005, true, false, NULL, '4', '59', 'https://catalogopdtstorage.blob.core.windows.net/imagens-prd/veiculo/296cae6f-3a95-47ed-ad71-fdf2d9ad41b5.png');



















