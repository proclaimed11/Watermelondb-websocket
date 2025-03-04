-- File: /backend/src/db/migrations/001_add_change_notification.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trigger function
CREATE OR REPLACE FUNCTION notify_client_changes()
RETURNS trigger AS $$
DECLARE
    payload json;
BEGIN
    -- Handle different operations
    IF (TG_OP = 'DELETE') THEN
        payload = json_build_object(
            'operation', TG_OP,
            'id', OLD.id,
            'table', TG_TABLE_NAME
        );
    ELSE
        payload = json_build_object(
            'operation', TG_OP,
            'record', row_to_json(NEW),
            'table', TG_TABLE_NAME
        );
    END IF;

    -- Notify all listeners
    PERFORM pg_notify('client_changes', payload::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger
DROP TRIGGER IF EXISTS clients_change_trigger ON clients_td;
CREATE TRIGGER clients_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON clients_td
FOR EACH ROW EXECUTE FUNCTION notify_client_changes();