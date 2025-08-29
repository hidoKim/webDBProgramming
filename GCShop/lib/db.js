// 202233207 김도연
// db.js
var mysql = require("mysql2");

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "webdb2025",
  multipleStatements: true,
});

db.connect();
module.exports = db;
