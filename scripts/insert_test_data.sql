-- Script para inserir dados de exemplo para testar a API
-- Assumindo que já existem dados básicos (brand, family, subfamily, product_type, company)

-- Inserir um part_group de exemplo
INSERT INTO partexplorer.part_group (id, product_type_id, discontinued) 
VALUES (
    '538e301d-1fd1-4023-9277-6b6a121cf417',
    (SELECT id FROM partexplorer.product_type WHERE description = 'BUCHA PEDAL' LIMIT 1),
    false
);

-- Inserir part_names de exemplo (incluindo o SKU 55562)
INSERT INTO partexplorer.part_name (group_id, name, brand_id, type) VALUES 
    ('538e301d-1fd1-4023-9277-6b6a121cf417', 'BUCHA PEDAL', null, 'desc'),
    ('538e301d-1fd1-4023-9277-6b6a121cf417', '55562', (SELECT id FROM partexplorer.brand WHERE name = 'KIT E CIA' LIMIT 1), 'sku'),
    ('538e301d-1fd1-4023-9277-6b6a121cf417', '7899099136249', null, 'ean');

-- Inserir uma empresa de exemplo se não existir
INSERT INTO partexplorer.company (id, name, image_url, street, number, neighborhood, city, state, country, zip_code, phone, mobile, email, website)
VALUES (
    uuid_generate_v4(),
    'Test Company',
    'https://example.com/test.png',
    'Rua Teste',
    '123',
    'Centro',
    'São Paulo',
    'SP',
    'Brasil',
    '01000-000',
    '(11) 1234-5678',
    '(11) 98765-4321',
    'test@example.com',
    'https://www.example.com'
) ON CONFLICT DO NOTHING;

-- Inserir stock de exemplo
INSERT INTO partexplorer.stock (part_name_id, company_id, quantity, price)
VALUES (
    (SELECT id FROM partexplorer.part_name WHERE name = '55562' LIMIT 1),
    (SELECT id FROM partexplorer.company WHERE name = 'Test Company' LIMIT 1),
    10,
    25.50
); 