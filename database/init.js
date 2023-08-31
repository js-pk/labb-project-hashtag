const path = require('path');
const sqlite3 = require("sqlite3").verbose();

// Connect DB
const dbName = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbName, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'database.db'")
})

// Create Users Table
const createUsers = `CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    stage_01 INTEGER DEFAULT 0 NOT NULL,
    stage_02 INTEGER DEFAULT 0 NOT NULL,
    stage_03 INTEGER DEFAULT 0 NOT NULL
  );`;

const createPhotos = `CREATE TABLE IF NOT EXISTS Photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(100) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL
);`;

// Run Users Table
db.run(createUsers, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful creation of the 'Users' table")
})

db.run(createPhotos, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful creation of the 'Photos' table")
})