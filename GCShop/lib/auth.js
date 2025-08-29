// 202233207 김도연
// auth.js
const db = require("./db");
var sanitizeHtml = require("sanitize-html");
sql1 = "SELECT * FROM boardtype;";
sql2 = "SELECT main_name, sub_name FROM code;";
function authIsOwner(req, res) {
  var name = "Guest";
  var login = false;
  var cls = "NON";
  if (req.session.is_logined) {
    name = req.session.name;
    login = true;
    cls = req.session.cls; // cls: 로그인한 사람이 누구인지 (guest, 관리자 등)
  }
  return { name, login, cls };
}
module.exports = {
  // 메인 저자 페이지
  login: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql2, (err, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0], // 첫 번째 쿼리 결과
        codes: results[1], // 두 번째 쿼리 결과
        body: "login.ejs",
        cls: cls,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  login_process: (req, res) => {
    var post = req.body;
    var sntzedLoginid = sanitizeHtml(post.loginid);
    var sntzedPassword = sanitizeHtml(post.password);

    db.query(
      `SELECT COUNT(*) as num FROM person WHERE loginid = ? AND password = ?`,
      [sntzedLoginid, sntzedPassword],
      (error, results) => {
        if (results[0].num === 1) {
          db.query(
            "SELECT name, class, loginid FROM person WHERE loginid = ? AND password = ?",
            [sntzedLoginid, sntzedPassword],
            (error, results) => {
              req.session.is_logined = true;
              req.session.loginid = results[0].loginid;
              req.session.name = results[0].name;
              req.session.cls = results[0].class;
              res.redirect("/");
            }
          );
        } else {
          req.session.is_logined = false;
          req.session.name = "Guest";
          req.session.cls = "NON";
          res.redirect("/auth/login");
        }
      }
    );
  },
  logout_process: (req, res) => {
    req.session.destroy((err) => {
      res.clearCookie("connect.sid"); // 세션 쿠키 삭제 추가
      res.redirect("/");
    });
  },

  register: (req, res) => {
    // 이미 로그인한 경우 회원가입 페이지 접근 금지
    if (req.session.is_logined) {
      // 바로 메인으로 리다이렉트
      return res.redirect("/");
    }
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql2, (err, results) => {
      var context = {
        who: name,
        login: login,
        cls: cls,
        boardtypes: results[0],
        codes: results[1],
        body: "register.ejs",
      };
      res.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  register_process: (req, res) => {
    var post = req.body;
    var sanitize = require("sanitize-html");
    var loginid = sanitize(post.loginid);
    var password = sanitize(post.password);
    var name = sanitize(post.name);
    var mf = sanitize(post.mf); // 성별 추가
    var address = sanitize(post.address);
    var tel = sanitize(post.tel);
    var birth = sanitize(post.birth);

    // 회원 가입시 class 컬럼은 무조건 'CST'
    var userClass = "CST";

    const db = require("./db");
    db.query(
      "INSERT INTO person (loginid, password, name, mf, address, tel, birth, class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [loginid, password, name, mf, address, tel, birth, userClass],
      (err, result) => {
        if (err) {
          // 이미 존재하는 아이디 등 오류 처리
          return res.end(
            `<script>alert('회원가입 실패: 이미 존재하는 아이디 등 오류');history.back();</script>`
          );
        }
        // 회원가입 성공시 메인으로 이동
        res.redirect("/");
      }
    );
  },
};
