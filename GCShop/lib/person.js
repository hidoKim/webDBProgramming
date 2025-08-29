// 202233207 김도연
// person.js
const board = require("./board");
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
var sql2 = "SELECT * FROM person;";
var sql3 = "SELECT main_name, sub_name FROM code;";

module.exports = {
  // 목록
  view: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql2 + sql3, (error, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        persons: results[1],
        codes: results[2],
        body: "person.ejs",
        cls: cls,
        hideActions: false,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  // 등록 폼
  create: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql3, (err, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        person: {},
        body: "personCU.ejs",
        cls: cls,
        mode: "create",
      };
      res.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  // 등록 처리
  create_process: (req, res) => {
    const post = req.body;
    db.query(
      `INSERT INTO person (loginid, password, name, mf, address, tel, birth, class)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.loginid,
        post.password,
        post.name,
        post.mf,
        post.address,
        post.tel,
        post.birth,
        post.class,
      ],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("사람 등록 오류");
        }
        res.redirect("/person/view");
      }
    );
  },
  // 수정 폼
  update: (req, res) => {
    const { loginid } = req.params;
    db.query(
      `SELECT * FROM person WHERE loginid=?`,
      [loginid],
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
            person: results[0],
            body: "personCU.ejs",
            mode: "update",
          };
          res.render("mainFrame", context);
        });
      }
    );
  },

  // 수정 처리
  update_process: (req, res) => {
    const post = req.body;
    db.query(
      `UPDATE person SET 
        name=?, 
        mf=?,
        address=?, 
        tel=?, 
        birth=?, 
        class=?
      WHERE loginid=?`,
      [
        post.name,
        post.mf,
        post.address,
        post.tel,
        post.birth,
        post.class,
        post.loginid,
      ],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Update Error");
        }
        res.redirect("/person/view");
      }
    );
  },
  // 삭제 처리
  delete_process: (req, res) => {
    const { loginid } = req.params;
    db.query(
      `DELETE FROM person WHERE loginid = ?`,
      [loginid],
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send("삭제 오류");
        }
        res.redirect("/person/view");
      }
    );
  },
};
