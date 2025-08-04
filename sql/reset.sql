-- 1️⃣ Desactiva el trigger temporalmente
DROP TRIGGER IF EXISTS trigger_contador ON usuarios;

-- 2️⃣ Borra todos los usuarios
DELETE FROM usuarios;

-- 3️⃣ Reinicia la secuencia del ID (empieza en 1)
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;

-- 4️⃣ Reinicia el contador de usuarios
UPDATE contador_usuarios SET total = 0;

-- 5️⃣ Vuelve a crear el trigger
CREATE TRIGGER trigger_contador
AFTER INSERT OR DELETE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_contador();
