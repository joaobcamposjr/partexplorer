-- Script para verificar o group_name das empresas Lorenzoni
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Verificar o group_name das empresas Lorenzoni
SELECT 
    id,
    name,
    group_name,
    state,
    city
FROM partexplorer.company 
WHERE LOWER(name) LIKE '%lorenzoni%'
ORDER BY name;

-- 2. Verificar se há empresas com group_name preenchido
SELECT 
    group_name,
    COUNT(*) as total_empresas
FROM partexplorer.company 
WHERE group_name IS NOT NULL AND group_name != ''
GROUP BY group_name
ORDER BY total_empresas DESC;

-- 3. Verificar empresas sem group_name
SELECT 
    name,
    group_name
FROM partexplorer.company 
WHERE group_name IS NULL OR group_name = ''
ORDER BY name;
