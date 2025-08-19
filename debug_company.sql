-- Script para verificar dados da empresa Lorenzoni
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Verificar se a empresa existe
SELECT 
    id,
    name,
    state,
    city,
    street,
    number,
    neighborhood
FROM partexplorer.company 
WHERE LOWER(name) LIKE '%lorenzoni%'
ORDER BY name;

-- 2. Verificar se há estoques da empresa
SELECT 
    c.name as company_name,
    COUNT(s.id) as total_stocks,
    COUNT(DISTINCT s.part_name_id) as unique_parts
FROM partexplorer.company c
JOIN partexplorer.stock s ON s.company_id = c.id
WHERE LOWER(c.name) LIKE '%lorenzoni%'
GROUP BY c.id, c.name;

-- 3. Verificar part_names que têm estoque na empresa
SELECT 
    c.name as company_name,
    pn.id as part_name_id,
    pg.id as part_group_id,
    COUNT(s.id) as stock_count
FROM partexplorer.company c
JOIN partexplorer.stock s ON s.company_id = c.id
JOIN partexplorer.part_name pn ON pn.id = s.part_name_id
JOIN partexplorer.part_group pg ON pg.id = pn.group_id
WHERE LOWER(c.name) LIKE '%lorenzoni%'
GROUP BY c.id, c.name, pn.id, pg.id
ORDER BY c.name, stock_count DESC
LIMIT 10;

-- 4. Verificar se há names associados aos part_names
SELECT 
    c.name as company_name,
    pn.id as part_name_id,
    pg.id as part_group_id,
    COUNT(pnn.name_id) as names_count
FROM partexplorer.company c
JOIN partexplorer.stock s ON s.company_id = c.id
JOIN partexplorer.part_name pn ON pn.id = s.part_name_id
JOIN partexplorer.part_group pg ON pg.id = pn.group_id
LEFT JOIN partexplorer.part_name_names pnn ON pnn.part_name_id = pn.id
WHERE LOWER(c.name) LIKE '%lorenzoni%'
GROUP BY c.id, c.name, pn.id, pg.id
ORDER BY c.name, names_count DESC
LIMIT 10;

-- 5. Verificar names específicos
SELECT 
    c.name as company_name,
    pn.id as part_name_id,
    n.name as name_value,
    n.type as name_type
FROM partexplorer.company c
JOIN partexplorer.stock s ON s.company_id = c.id
JOIN partexplorer.part_name pn ON pn.id = s.part_name_id
JOIN partexplorer.part_name_names pnn ON pnn.part_name_id = pn.id
JOIN partexplorer.name n ON n.id = pnn.name_id
WHERE LOWER(c.name) LIKE '%lorenzoni%'
ORDER BY c.name, n.type, n.name
LIMIT 20;
