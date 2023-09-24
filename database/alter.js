const path = require('path');
const sqlite3 = require("sqlite3").verbose();

const dbName = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbName, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful connection to the database 'database.db'")
})

const alterUsers = 'ALTER TABLE users ADD reward_exchanged INTEGER DEFAULT 0 NOT NULL;'

db.run(alterUsers, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Add reward_exchanged column to 'Users' table")
})