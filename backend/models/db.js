require('dotenv').config();
const path = require('path');

let queryFn;

if (process.env.DATABASE_URL) {
    console.log("Database configuration detected: PostgreSQL");
    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : {
            rejectUnauthorized: false
        }
    });

    queryFn = (text, params = []) => {
        return pool.query(text, params);
    };
} else {
    console.log("Database configuration detected: SQLite (Local Fallback)");
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, 'payroll.db');
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("SQLite connection failed:", err.message);
        } else {
            console.log("Connected to SQLite successfully");
        }
    });

    queryFn = (text, params = []) => {
        return new Promise((resolve, reject) => {
            let sqliteText = text.replace(/\$\d+/g, '?');
            sqliteText = sqliteText.replace(/ILIKE/g, 'LIKE');
            
            const returningIdMatch = sqliteText.match(/RETURNING\s+id/i);
            sqliteText = sqliteText.replace(/RETURNING\s+id/i, '');

            const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT');

            if (isSelect) {
                db.all(sqliteText, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve({ rows });
                });
            } else {
                db.run(sqliteText, params, function(err) {
                    if (err) reject(err);
                    else {
                        if (returningIdMatch) {
                            resolve({ rows: [{ id: this.lastID }] });
                        } else {
                            resolve({ rows: [] });
                        }
                    }
                });
            }
        });
    };
}

module.exports = {
    query: queryFn
};
