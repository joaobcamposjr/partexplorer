-- Migration: Create triggers for car and car_error tables
-- Date: 2025-01-XX

-- Trigger function for car table (insert or update)
CREATE OR REPLACE FUNCTION partexplorer.handle_car_upsert()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to update existing record only if data has changed
    UPDATE partexplorer.car 
    SET 
        brand = NEW.brand,
        model = NEW.model,
        year = NEW.year,
        model_year = NEW.model_year,
        color = NEW.color,
        fuel_type = NEW.fuel_type,
        chassis_number = NEW.chassis_number,
        city = NEW.city,
        state = NEW.state,
        imported = NEW.imported,
        fipe_code = NEW.fipe_code,
        fipe_value = NEW.fipe_value,
        updated_at = CURRENT_TIMESTAMP
    WHERE license_plate = NEW.license_plate
      AND (
          COALESCE(brand, '') != COALESCE(NEW.brand, '') OR
          COALESCE(model, '') != COALESCE(NEW.model, '') OR
          year != NEW.year OR
          model_year != NEW.model_year OR
          COALESCE(color, '') != COALESCE(NEW.color, '') OR
          COALESCE(fuel_type, '') != COALESCE(NEW.fuel_type, '') OR
          COALESCE(chassis_number, '') != COALESCE(NEW.chassis_number, '') OR
          COALESCE(city, '') != COALESCE(NEW.city, '') OR
          COALESCE(state, '') != COALESCE(NEW.state, '') OR
          COALESCE(imported, '') != COALESCE(NEW.imported, '') OR
          COALESCE(fipe_code, '') != COALESCE(NEW.fipe_code, '') OR
          fipe_value != NEW.fipe_value
      );
    
    -- If no rows were updated, insert new record
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Return NULL to prevent the original INSERT
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for car table
DROP TRIGGER IF EXISTS car_upsert_trigger ON partexplorer.car;
CREATE TRIGGER car_upsert_trigger
    BEFORE INSERT ON partexplorer.car
    FOR EACH ROW
    EXECUTE FUNCTION partexplorer.handle_car_upsert();

-- Trigger function for car_error table (insert or update)
CREATE OR REPLACE FUNCTION partexplorer.handle_car_error_upsert()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to update existing record only if data has changed
    UPDATE partexplorer.car_error 
    SET 
        data = NEW.data,
        updated_at = CURRENT_TIMESTAMP
    WHERE license_plate = NEW.license_plate
      AND data::text != NEW.data::text;
    
    -- If no rows were updated, insert new record
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Return NULL to prevent the original INSERT
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for car_error table
DROP TRIGGER IF EXISTS car_error_upsert_trigger ON partexplorer.car_error;
CREATE TRIGGER car_error_upsert_trigger
    BEFORE INSERT ON partexplorer.car_error
    FOR EACH ROW
    EXECUTE FUNCTION partexplorer.handle_car_error_upsert(); 