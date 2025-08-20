-- Script para limpar duplicatas e adicionar constraints mais seguras
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Primeiro, vamos ver as duplicatas existentes
SELECT 
    n.name as value,
    n.type as data_type,
    COUNT(*) as total,
    STRING_AGG(DISTINCT pg.id::text, ', ') as group_ids,
    STRING_AGG(DISTINCT b.name, ', ') as brands
FROM partexplorer.part_name pn
JOIN partexplorer.part_name_names pnn ON pnn.part_name_id = pn.id
JOIN partexplorer.name n ON n.id = pnn.name_id
JOIN partexplorer.part_group pg ON pg.id = pn.group_id
LEFT JOIN partexplorer.brand b ON b.id = pn.brand_id
GROUP BY n.name, n.type
HAVING COUNT(*) > 1
ORDER BY total DESC, n.type, n.name
LIMIT 20;

-- 2. Remover a constraint atual (se existir)
ALTER TABLE partexplorer.part_name DROP CONSTRAINT IF EXISTS part_name_group_brand_name_type_unique;

-- 3. Limpar duplicatas mantendo apenas o primeiro registro de cada combinação
WITH duplicates AS (
    SELECT 
        n.id as name_id,
        n.name,
        n.type,
        ROW_NUMBER() OVER (PARTITION BY n.name, n.type ORDER BY n.id) as rn
    FROM partexplorer.name n
)
DELETE FROM partexplorer.part_name_names 
WHERE name_id IN (
    SELECT name_id 
    FROM duplicates 
    WHERE rn > 1
);

-- 4. Remover os nomes duplicados
WITH duplicates AS (
    SELECT 
        n.id as name_id,
        n.name,
        n.type,
        ROW_NUMBER() OVER (PARTITION BY n.name, n.type ORDER BY n.id) as rn
    FROM partexplorer.name n
)
DELETE FROM partexplorer.name 
WHERE id IN (
    SELECT name_id 
    FROM duplicates 
    WHERE rn > 1
);

-- 5. Adicionar constraints mais seguras

-- Constraint para garantir que cada nome seja único por tipo
ALTER TABLE partexplorer.name ADD CONSTRAINT name_type_unique UNIQUE (name, type);

-- Constraint para garantir que cada part_name tenha apenas uma referência por nome
ALTER TABLE partexplorer.part_name_names ADD CONSTRAINT part_name_names_unique UNIQUE (part_name_id, name_id);

-- 6. Verificar se ainda há duplicatas
SELECT 
    n.name as value,
    n.type as data_type,
    COUNT(*) as total
FROM partexplorer.part_name pn
JOIN partexplorer.part_name_names pnn ON pnn.part_name_id = pn.id
JOIN partexplorer.name n ON n.id = pnn.name_id
GROUP BY n.name, n.type
HAVING COUNT(*) > 1
ORDER BY total DESC, n.type, n.name;

-- 7. Estatísticas finais
SELECT 
    n.type,
    COUNT(*) as total_names,
    COUNT(DISTINCT n.name) as unique_names
FROM partexplorer.name n
GROUP BY n.type
ORDER BY n.type;
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Primeiro, vamos ver as duplicatas existentes
SELECT 
    n.name as value,
    n.type as data_type,
    COUNT(*) as total,
    STRING_AGG(DISTINCT pg.id::text, ', ') as group_ids,
    STRING_AGG(DISTINCT b.name, ', ') as brands
FROM partexplorer.part_name pn
JOIN partexplorer.part_name_names pnn ON pnn.part_name_id = pn.id
JOIN partexplorer.name n ON n.id = pnn.name_id
JOIN partexplorer.part_group pg ON pg.id = pn.group_id
LEFT JOIN partexplorer.brand b ON b.id = pn.brand_id
GROUP BY n.name, n.type
HAVING COUNT(*) > 1
ORDER BY total DESC, n.type, n.name
LIMIT 20;

-- 2. Remover a constraint atual (se existir)
ALTER TABLE partexplorer.part_name DROP CONSTRAINT IF EXISTS part_name_group_brand_name_type_unique;

-- 3. Limpar duplicatas mantendo apenas o primeiro registro de cada combinação
WITH duplicates AS (
    SELECT 
        n.id as name_id,
        n.name,
        n.type,
        ROW_NUMBER() OVER (PARTITION BY n.name, n.type ORDER BY n.id) as rn
    FROM partexplorer.name n
)
DELETE FROM partexplorer.part_name_names 
WHERE name_id IN (
    SELECT name_id 
    FROM duplicates 
    WHERE rn > 1
);

-- 4. Remover os nomes duplicados
WITH duplicates AS (
    SELECT 
        n.id as name_id,
        n.name,
        n.type,
        ROW_NUMBER() OVER (PARTITION BY n.name, n.type ORDER BY n.id) as rn
    FROM partexplorer.name n
)
DELETE FROM partexplorer.name 
WHERE id IN (
    SELECT name_id 
    FROM duplicates 
    WHERE rn > 1
);

-- 5. Adicionar constraints mais seguras

-- Constraint para garantir que cada nome seja único por tipo
ALTER TABLE partexplorer.name ADD CONSTRAINT name_type_unique UNIQUE (name, type);

-- Constraint para garantir que cada part_name tenha apenas uma referência por nome
ALTER TABLE partexplorer.part_name_names ADD CONSTRAINT part_name_names_unique UNIQUE (part_name_id, name_id);

-- 6. Verificar se ainda há duplicatas
SELECT 
    n.name as value,
    n.type as data_type,
    COUNT(*) as total
FROM partexplorer.part_name pn
JOIN partexplorer.part_name_names pnn ON pnn.part_name_id = pn.id
JOIN partexplorer.name n ON n.id = pnn.name_id
GROUP BY n.name, n.type
HAVING COUNT(*) > 1
ORDER BY total DESC, n.type, n.name;

-- 7. Estatísticas finais
SELECT 
    n.type,
    COUNT(*) as total_names,
    COUNT(DISTINCT n.name) as unique_names
FROM partexplorer.name n
GROUP BY n.type
ORDER BY n.type;
