const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("SQLite connection failed:", err.message);
    } else {
        console.log("Connected to SQLite successfully");
    }
});

module.exports = {
    query: (text, params = []) => {
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
    }
};
