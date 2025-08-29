// 202233207 김도연
// table.js
const db = require("./db");
var sanitizeHtml = require("sanitize-html");

function authIsOwner(req, res) {
  var name = "Guest";
  var login = false;
  var cls = "NON";
  if (req.session.is_logined) {
    name = req.session.name;
    login = true;
    cls = req.session.cls;
  }
  return { name, login, cls };
}

var sql1 = "SELECT * FROM boardtype;";
var sql2 = "SELECT * FROM product;";
var sql3 = "SELECT main_name, sub_name FROM code;";
var sql4 = "SELECT * FROM code;";
var sql5 =
  "SELECT TABLE_NAME, TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'webdb2025';";
var sql6 =
  "SELECT COLUMN_NAME, COLUMN_COMMENT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'webdb2025' AND TABLE_NAME = ?;";
const sqlData = "SELECT * FROM ??";

module.exports = {
  tableView: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql4 + sql5, (error, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        tables: results[2],
        body: "tableManage.ejs",
        cls: cls,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  tableDetail: (req, res) => {
    const tableName = req.params.tableName;
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql4 + sql6, [tableName], (error, results) => {
      if (error) return res.status(500).send("DB Error");

      db.query(sqlData, [tableName], (err2, dataRows) => {
        if (err2) return res.status(500).send("DB Error");
        var context = {
          who: name,
          login: login,
          boardtypes: results[0],
          codes: results[1],
          columns: results[2],
          tableName: tableName,
          dataRows: dataRows,
          body: "tableView.ejs",
          cls: cls,
        };
        req.app.render("mainFrame", context, (err, html) => {
          res.end(html);
        });
      });
    });
  },
};
