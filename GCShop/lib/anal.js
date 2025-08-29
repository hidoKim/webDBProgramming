// 202233207 김도연
// anal.js
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
var sql4 = "SELECT * FROM code;";
var sql5 =
  "select address, ROUND(( count(*) / ( select count(*) from person )) * 100, 2) as rate from person group by address;";
module.exports = {
  analCustomer: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql4 + sql5, (error, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        percentage: results[2],
        body: "anal.ejs",
        cls: cls,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
};
