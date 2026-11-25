ALTER TABLE `pawsy_db`.`historial_ubicacion`
  ADD COLUMN `latitud` DECIMAL(10,8) NULL DEFAULT NULL,
  ADD COLUMN `longitud` DECIMAL(11,8) NULL DEFAULT NULL;
