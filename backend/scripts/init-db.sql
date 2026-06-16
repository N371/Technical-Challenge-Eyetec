CREATE TABLE IF NOT EXISTS users (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nome             TEXT    NOT NULL,
    email            TEXT    NOT NULL UNIQUE,
    cpf              TEXT    NOT NULL UNIQUE,
    telefone         TEXT,
    foto_path        TEXT,
    face_descriptor  TEXT,
    criado_em        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
