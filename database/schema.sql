-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema pawsy_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema pawsy_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `pawsy_db` DEFAULT CHARACTER SET utf8 ;
USE `pawsy_db` ;

-- -----------------------------------------------------
-- Table `pawsy_db`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pawsy_db`.`usuario` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre_usuario` VARCHAR(30) NOT NULL,
  `foto_perfil` VARCHAR(255) NULL DEFAULT 'default_avatar.png',
  `nombre` VARCHAR(30) NOT NULL,
  `apellidos` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `contrasena` VARCHAR(25) NOT NULL,
  `celular` VARCHAR(45) NULL DEFAULT NULL,
  `ciudad` VARCHAR(100) NOT NULL,
  `colonia` VARCHAR(100) NOT NULL,
  `calle` VARCHAR(100) NULL DEFAULT NULL,
  `ultimo_login` DATETIME NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `nombre_usuario_UNIQUE` (`nombre_usuario` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pawsy_db`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pawsy_db`.`roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rol` VARCHAR(15) NOT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pawsy_db`.`mascota`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pawsy_db`.`mascota` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` INT UNSIGNED NOT NULL,
  `nombre` VARCHAR(30) NOT NULL,
  `especie` VARCHAR(20) NOT NULL,
  `raza` VARCHAR(30) NOT NULL,
  `edad` VARCHAR(20) NULL DEFAULT NULL,
  `sexo` ENUM('Macho', 'Hembra', 'Desconocido') NOT NULL,
  `tamanio` ENUM('Grande', 'Mediano', 'Chico') NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(255) NOT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_mascota_usuario_idx` (`usuario_id` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `usuario_mascota_fk`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `pawsy_db`.`usuario` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pawsy_db`.`publicacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pawsy_db`.`publicacion` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` INT UNSIGNED NOT NULL,
  `mascota_id` INT UNSIGNED NOT NULL,
  `titulo` VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(255) NULL DEFAULT NULL,
  `imagen` VARCHAR(255) NULL DEFAULT NULL,
  `estado` ENUM('En Adopción', 'Adoptado', 'En búsqueda', 'Encontrado', 'Cancelado') NOT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_publicacion_usuario_idx` (`usuario_id` ASC) VISIBLE,
  INDEX `fk_publicacion_mascota_idx` (`mascota_id` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `usuario_publicasion_fk`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `pawsy_db`.`usuario` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `mascota_publicasion_fk`
    FOREIGN KEY (`mascota_id`)
    REFERENCES `pawsy_db`.`mascota` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pawsy_db`.`historial_ubicacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pawsy_db`.`historial_ubicacion` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `publicacion_id` INT UNSIGNED NOT NULL,
  `ciudad` VARCHAR(100) NOT NULL,
  `colonia` VARCHAR(100) NOT NULL,
  `calle` VARCHAR(100) NULL DEFAULT NULL,
  `referencias` VARCHAR(255) NOT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_historial_ubicacion_publicacion_idx` (`publicacion_id` ASC) VISIBLE,
  UNIQUE INDEX `id_historial_ubicacion_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `publicasion_historial_ubicasion_fk`
    FOREIGN KEY (`publicacion_id`)
    REFERENCES `pawsy_db`.`publicacion` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pawsy_db`.`comentarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pawsy_db`.`comentarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` INT UNSIGNED NOT NULL,
  `publicacion_id` INT UNSIGNED NOT NULL,
  `descripcion` VARCHAR(255) NOT NULL,
  `imagen` VARCHAR(255) NULL DEFAULT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_comentarios_publicacion_idx` (`publicacion_id` ASC) VISIBLE,
  INDEX `fk_comentarios_usuario_idx` (`usuario_id` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `usuario_comentarios_fk`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `pawsy_db`.`usuario` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `publicasion_comentarios_fk`
    FOREIGN KEY (`publicacion_id`)
    REFERENCES `pawsy_db`.`publicacion` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pawsy_db`.`usuario_rol`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pawsy_db`.`usuario_rol` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `roles_id` INT UNSIGNED NOT NULL,
  `usuario_id` INT UNSIGNED NOT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `usuario_usuario_rol_id_fk_idx` (`usuario_id` ASC) VISIBLE,
  INDEX `roles_usuario_rol_id_fk_idx` (`roles_id` ASC) VISIBLE,
  CONSTRAINT `roles_usuario_rol_fk`
    FOREIGN KEY (`roles_id`)
    REFERENCES `pawsy_db`.`roles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `usuario_usuario_rol_fk`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `pawsy_db`.`usuario` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `pawsy_db`.`publicacion_likes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pawsy_db`.`publicacion_likes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` INT UNSIGNED NOT NULL,
  `publicacion_id` INT UNSIGNED NOT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_publicacion_likes_usuario_idx` (`usuario_id` ASC) VISIBLE,
  INDEX `fk_publicacion_likes_publicacion_idx` (`publicacion_id` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  CONSTRAINT `usuario_publicasion_likes_fk`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `pawsy_db`.`usuario` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `publicasion_publicasion_likes_fk`
    FOREIGN KEY (`publicacion_id`)
    REFERENCES `pawsy_db`.`publicacion` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
