const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const isEmpty = require('../utils/isEmpty.js');

//Connect to DB
// const db_name = path.join(__dirname, "database.db");

// const db = new sqlite3.Database(db_name, err => {
//     if (err) {
//         console.error(err.message);
//         throw err;
//     }
// })

module.exports = class Database {
    constructor() {
        this.name = path.join(__dirname, "database.db");
        this.db = new sqlite3.Database(this.name, err => {
            if (err) {
                console.error(err.message);
                throw err;
            }
        })
    }

    first(table, condition, args) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM ' + table + ' WHERE ' + condition;
            this.db.get(query, args, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(isEmpty(row) ? null : row)
            })
        })
    }

    all(table, condition, args, limit) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM ' + table + ' WHERE ' + condition +(limit ? " LIMIT " + limit : '');
            this.db.all(query, args, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                
                resolve(rows || []);
            })
        })
    }

    update(table, setCondition, searchCondition, args) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE ' + table + ' SET ' + setCondition + ' WHERE ' + searchCondition;
            this.db.run(query, args, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } 
                resolve(this.changes); 
            })
        })
    }

    insert(table, rows, values) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO ' + table + ' (' + rows.map(r => `"${r}"`).join(',') + ')' + ' VALUES ' + '(' + values.map(v => `"${v}"`).join(',') +')';
            this.db.run(query, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } 
                resolve(this.lastID); //should I return obj with select method? sure.
            })
        })
    }

    delete(table, condition, args) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM ' + table + ' WHERE ' + condition;
            this.db.run(query, args, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve("Deleted..");
            })
        })
    }
};