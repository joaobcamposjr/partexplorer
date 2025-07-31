-- Migration: Add obsolete column to stock table
-- Date: 2025-01-27

ALTER TABLE stock ADD COLUMN obsolete BOOLEAN DEFAULT FALSE;

-- Add comment to the column
COMMENT ON COLUMN stock.obsolete IS 'Indicates if the stock item is obsolete/discontinued'; 