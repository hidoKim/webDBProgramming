// 202233207 김도연
// code.js
const db = require("./db");
var sanitizeHtml = require("sanitize-html");

function authIsOwner(req, res) {
  var name = "Guest";
  var login = false;
  var cls = "NON";
  if (req.session.is_logined) {
    name = req.session.name;
    login = true;
    cls = req.session.cls; // cls: 로그인한 사람이 누구인지
  }
  return { name, login, cls };
}

var sql1 = "SELECT * FROM boardtype;";
var sql2 = "SELECT * FROM code;";
var sql3 = "SELECT main_name, sub_name FROM code;";

module.exports = {
  view: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql2, (error, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        body: "code.ejs",
        cls: cls,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  // create
  create: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql3, (err, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        code: {},
        body: "codeCU.ejs",
        cls: cls,
        mode: "create",
      };
      res.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  create_process: (req, res) => {
    const post = req.body;

    db.query(
      `INSERT INTO code (main_id, sub_id, main_name, sub_name, start, end)
     VALUES (?, ?, ?, ?, ?, ?)`,
      [
        post.main_id,
        post.sub_id,
        post.main_name,
        post.sub_name,
        post.start,
        post.end,
      ],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("코드 등록 오류");
        }
        res.redirect("/code/view");
      }
    );
  },

  // 업데이트 폼 표시
  update: (req, res) => {
    const { main, sub, start } = req.params;
    db.query(
      `SELECT * FROM code WHERE main_id=? AND sub_id=? AND start=?`,
      [main, sub, start],
      (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Internal Server Error");
        }
        if (results.length === 0) {
          return res.status(404).send("Not Found");
        }
        var { name, login, cls } = authIsOwner(req, res);
        db.query(sql1 + sql3, (err, qresults) => {
          const context = {
            who: name,
            login: login,
            cls: cls,
            boardtypes: qresults[0],
            codes: qresults[1],
            code: results[0],
            body: "codeCU.ejs",
            mode: "update",
          };
          res.render("mainFrame", context);
        });
      }
    );
  },

  // 업데이트 처리
  update_process: (req, res) => {
    const post = req.body;
    db.query(
      `UPDATE code SET 
      main_name=?, 
      sub_name=?, 
      end=?
    WHERE main_id=? AND sub_id=? AND start=?`,
      [
        post.main_name,
        post.sub_name,
        post.end,
        post.main_id,
        post.sub_id,
        post.start,
      ],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Update Error");
        }
        res.redirect("/code/view");
      }
    );
  },
  delete_process: (req, res) => {
    const { main, sub, start } = req.params;
    db.query(
      `DELETE FROM code WHERE main_id=? AND sub_id=? AND start=?`,
      [main, sub, start],
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send("삭제 오류");
        }
        res.redirect("/code/view");
      }
    );
  },
};
