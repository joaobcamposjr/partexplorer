
-- Migração para criar tabela de estoque
-- 007_add_obsolete_to_stock.sql

-- Create stock table
CREATE TABLE partexplorer.stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES partexplorer.company(id) ON DELETE CASCADE,
    part_name_id UUID REFERENCES partexplorer.part_name(id) ON DELETE CASCADE,
    obsolete BOOLEAN DEFAULT FALSE,
    available INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_company_id ON partexplorer.stock(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_part_name_id ON partexplorer.stock(part_name_id);
CREATE INDEX IF NOT EXISTS idx_stock_obsolete ON partexplorer.stock(obsolete);
CREATE INDEX IF NOT EXISTS idx_stock_available ON partexplorer.stock(available);
CREATE INDEX IF NOT EXISTS idx_stock_price ON partexplorer.stock(price);
CREATE INDEX IF NOT EXISTS idx_stock_created_at ON partexplorer.stock(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_updated_at ON partexplorer.stock(updated_at);

-- Create trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_updated_at 
    BEFORE UPDATE ON partexplorer.stock 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();