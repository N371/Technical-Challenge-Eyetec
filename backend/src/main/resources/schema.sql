-- Executado por DatabaseConfig na primeira inicialização
-- SQLite cria o arquivo automaticamente se não existir

CREATE TABLE IF NOT EXISTS users (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nome             TEXT    NOT NULL,
    email            TEXT    NOT NULL UNIQUE,
    cpf              TEXT    NOT NULL UNIQUE,
    telefone         TEXT,
    foto_path        TEXT,                     -- caminho relativo em uploads/
    face_descriptor  TEXT,                     -- JSON do Float32Array[128] gerado pelo face-api.js
    criado_em        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
