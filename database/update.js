const Database = require('./connection.js');
const db = new Database();

db.update("users", "stage_01=1", "id=4", []);