CREATE DATABASE IF NOT EXISTS saepsaude
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE saepsaude;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS curtidas;
DROP TABLE IF EXISTS atividades;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS empresa;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE empresa (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  logo VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  foto VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE atividades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  tipo ENUM('corrida', 'caminhada', 'trilha') NOT NULL,
  distancia_metros INT UNSIGNED NOT NULL,
  duracao_minutos INT UNSIGNED NOT NULL,
  calorias INT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_atividades_usuario (usuario_id),
  KEY idx_atividades_tipo_data (tipo, criado_em),
  KEY idx_atividades_data (criado_em),
  CONSTRAINT fk_atividades_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE curtidas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  atividade_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_curtida_usuario_atividade (atividade_id, usuario_id),
  KEY idx_curtidas_atividade (atividade_id),
  KEY idx_curtidas_usuario (usuario_id),
  CONSTRAINT fk_curtidas_atividade
    FOREIGN KEY (atividade_id) REFERENCES atividades(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_curtidas_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comentarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  atividade_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  texto VARCHAR(500) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comentarios_atividade (atividade_id),
  KEY idx_comentarios_usuario (usuario_id),
  CONSTRAINT fk_comentarios_atividade
    FOREIGN KEY (atividade_id) REFERENCES atividades(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_comentarios_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO empresa (nome, logo)
VALUES ('SAEPSaúde', '/assets/SAEPSaude.png');

INSERT INTO usuarios (nome, email, senha, foto) VALUES
('Usuário_01', 'usuario01@saepsaude.com', '$2b$10$sEXwlVt1UZiLFzbrQlPzZeh.Gg9fGbvTedZx5t/ZHvh65qlpJgoM2', '/assets/avatar.svg'),
('Usuário_02', 'usuario02@saepsaude.com', '$2b$10$sEXwlVt1UZiLFzbrQlPzZeh.Gg9fGbvTedZx5t/ZHvh65qlpJgoM2', '/assets/avatar.svg'),
('Usuário_03', 'usuario03@saepsaude.com', '$2b$10$sEXwlVt1UZiLFzbrQlPzZeh.Gg9fGbvTedZx5t/ZHvh65qlpJgoM2', '/assets/avatar.svg');

INSERT INTO atividades (usuario_id, tipo, distancia_metros, duracao_minutos, calorias, criado_em) VALUES
(1, 'caminhada', 5000, 50, 350, '2026-09-10 05:30:00'),
(1, 'corrida', 3000, 50, 350, '2026-09-09 17:20:00'),
(2, 'trilha', 7200, 95, 620, '2026-09-08 08:10:00'),
(2, 'caminhada', 4200, 48, 290, '2026-09-07 07:40:00'),
(3, 'corrida', 6100, 42, 510, '2026-09-06 18:15:00'),
(3, 'trilha', 8400, 110, 780, '2026-09-05 06:20:00'),
(1, 'caminhada', 3500, 38, 230, '2026-09-04 16:05:00'),
(2, 'corrida', 10000, 58, 850, '2026-09-03 19:00:00'),
(3, 'caminhada', 2800, 31, 180, '2026-09-02 09:25:00'),
(1, 'trilha', 9000, 125, 920, '2026-09-01 06:45:00');

INSERT INTO curtidas (atividade_id, usuario_id) VALUES
(1, 2),
(1, 3),
(2, 1),
(3, 1),
(3, 2),
(4, 3),
(5, 1),
(6, 1),
(6, 2),
(8, 3);

INSERT INTO comentarios (atividade_id, usuario_id, texto) VALUES
(1, 2, 'Ótimo ritmo!'),
(1, 3, 'Parabéns pela atividade.'),
(2, 2, 'Boa corrida!'),
(3, 1, 'Essa trilha parece excelente.'),
(3, 3, 'Muito bom!'),
(4, 1, 'Excelente caminhada.'),
(5, 2, 'Parabéns pelo desempenho.'),
(6, 1, 'Que atividade incrível!'),
(8, 3, '10 km muito bem feitos.');

-- Os hashes acima correspondem à senha de teste: 123456
