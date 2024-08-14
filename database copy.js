const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Usuario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            fecha_registro DATE NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Pictograma (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            prompt TEXT NOT NULL,
            url_imagen TEXT NOT NULL,
            fecha_creacion DATE NOT NULL,
            FOREIGN KEY (usuario_id) REFERENCES Usuario (id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Sesiones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            fecha_inicio DATETIME NOT NULL,
            fecha_fin DATETIME NOT NULL,
            FOREIGN KEY (usuario_id) REFERENCES Usuario (id)
        )
    `);
});

module.exports = db;
