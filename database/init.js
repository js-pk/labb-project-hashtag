const sqlite3 = require("sqlite3").verbose();

// Connect DB
const db_name = path.join(__dirname, "database", "database.db");
const db = new sqlite3.Database(db_name, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'database.db'")
})

// Create Users Table
const sql_create = `CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    mail VARCHAR(100),
    stage_01 INTEGER DEFAULT 0 NOT NULL,
    stage_02 INTEGER DEFAULT 0 NOT NULL,
    stage_03 INTEGER DEFAULT 0 NOT NULL
  );`;

// Run Users Table
db.run(sql_create, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful creation of the 'Users' table")
})