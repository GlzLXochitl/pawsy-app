CREATE TABLE IF NOT EXISTS `pawsy_db`.`notificacion` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` INT UNSIGNED NOT NULL,
  `actor_usuario_id` INT UNSIGNED NULL DEFAULT NULL,
  `tipo` ENUM('comentario_publicacion', 'publicacion_publicada', 'like_publicacion') NOT NULL,
  `publicacion_id` INT UNSIGNED NOT NULL,
  `mensaje` VARCHAR(255) NOT NULL,
  `leida` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notificacion_usuario_fecha` (`usuario_id`, `fecha_creacion`),
  INDEX `idx_notificacion_usuario_leida` (`usuario_id`, `leida`),
  CONSTRAINT `notificacion_usuario_fk`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `pawsy_db`.`usuario` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `notificacion_actor_usuario_fk`
    FOREIGN KEY (`actor_usuario_id`)
    REFERENCES `pawsy_db`.`usuario` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `notificacion_publicacion_fk`
    FOREIGN KEY (`publicacion_id`)
    REFERENCES `pawsy_db`.`publicacion` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

ALTER TABLE `pawsy_db`.`notificacion`
  MODIFY `tipo` ENUM('comentario_publicacion', 'publicacion_publicada', 'like_publicacion') NOT NULL;
