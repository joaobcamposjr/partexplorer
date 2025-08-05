-- Debug script para verificar brand_id
SELECT 
    pn.id,
    pn.name,
    pn.type,
    pn.brand_id,
    b.name as brand_name
FROM partexplorer.part_name pn
LEFT JOIN partexplorer.brand b ON pn.brand_id = b.id
WHERE pn.group_id = 'df7d0089-870d-4397-80e9-1ca44e7af74b'
ORDER BY pn.name; 