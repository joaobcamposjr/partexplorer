-- Script para testar a query da busca por empresa
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Verificar se há empresas com group_name "Grupo Lorenzoni"
SELECT 
    id,
    name,
    group_name,
    state,
    city
FROM partexplorer.company 
WHERE LOWER(group_name) = LOWER('Grupo Lorenzoni')
ORDER BY name;

-- 2. Testar a query principal da busca por empresa
SELECT DISTINCT 
    pg.id as part_group_id,
    pg.product_type_id,
    pg.discontinued,
    pg.created_at,
    pg.updated_at
FROM partexplorer.part_group pg
JOIN partexplorer.part_name pn ON pn.group_id = pg.id
JOIN partexplorer.stock s ON s.part_name_id = pn.id
JOIN partexplorer.company c ON c.id = s.company_id
WHERE LOWER(c.group_name) = LOWER('Grupo Lorenzoni')
ORDER BY pg.created_at DESC
LIMIT 10;

-- 3. Contar total de part_groups
SELECT COUNT(DISTINCT pg.id) as total_part_groups
FROM partexplorer.part_group pg
JOIN partexplorer.part_name pn ON pn.group_id = pg.id
JOIN partexplorer.stock s ON s.part_name_id = pn.id
JOIN partexplorer.company c ON c.id = s.company_id
WHERE LOWER(c.group_name) = LOWER('Grupo Lorenzoni');

-- 4. Verificar se há part_names para os part_groups encontrados
SELECT 
    pg.id as part_group_id,
    COUNT(pn.id) as part_names_count
FROM partexplorer.part_group pg
JOIN partexplorer.part_name pn ON pn.group_id = pg.id
JOIN partexplorer.stock s ON s.part_name_id = pn.id
JOIN partexplorer.company c ON c.id = s.company_id
WHERE LOWER(c.group_name) = LOWER('Grupo Lorenzoni')
GROUP BY pg.id
ORDER BY part_names_count DESC
LIMIT 10;
