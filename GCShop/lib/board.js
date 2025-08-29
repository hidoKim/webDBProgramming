// 202233207 김도연
// board.js
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
var sql2 = "SELECT main_name, sub_name FROM code;";

module.exports = {
  // boardType
  typeview: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql2, (error, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        body: "boardtype.ejs",
        cls: cls,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  typecreate: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql2, (err, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        boardtype: {},
        body: "boardtypeCU.ejs",
        cls: cls,
        mode: "create",
      };
      res.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  typecreate_process: (req, res) => {
    const post = req.body;

    db.query(
      `INSERT INTO boardtype (type_id, title, description, write_YN, re_YN, numPerPage)
     VALUES (?, ?, ?, ?, ?, ?)`,
      [
        post.type_id,
        post.title,
        post.description,
        post.write_YN,
        post.re_YN,
        post.numPerPage,
      ],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("게시판 등록 오류");
        }
        res.redirect("/board/type/view");
      }
    );
  },

  // 업데이트 폼 표시
  typeupdate: (req, res) => {
    const { typeId } = req.params;

    db.query(
      `SELECT * FROM boardtype WHERE type_id=?`,
      [typeId],
      (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Internal Server Error");
        }
        if (results.length === 0) {
          return res.status(404).send("Not Found");
        }
        var { name, login, cls } = authIsOwner(req, res);
        db.query(sql1 + sql2, (err, qresults) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
          }
          const context = {
            who: name,
            login: login,
            cls: cls,
            boardtype: results[0],
            boardtypes: qresults[0],
            codes: qresults[1],
            body: "boardtypeCU.ejs",
            mode: "update",
          };
          res.render("mainFrame", context);
        });
      }
    );
  },

  // 업데이트 처리
  typeupdate_process: (req, res) => {
    const post = req.body;
    db.query(
      `UPDATE boardtype SET 
        title=?, 
        description=?, 
        write_YN=?, 
        re_YN=?, 
        numPerPage=?
       WHERE type_id=?`,
      [
        post.title,
        post.description,
        post.write_YN,
        post.re_YN,
        post.numPerPage,
        post.type_id,
      ],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Update Error");
        }
        res.redirect("/board/type/view");
      }
    );
  },
  typedelete_process: (req, res) => {
    const { typeId } = req.params;
    db.query(
      `DELETE FROM boardtype WHERE type_id=?`,
      [typeId],
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send("삭제 오류");
        }
        res.redirect("/board/type/view");
      }
    );
  },

  // board
  view: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    const { typeId, pNum } = req.params;
    const page = parseInt(pNum, 10) || 1;

    db.query(
      sql1 +
        sql2 +
        `SELECT * FROM boardtype WHERE type_id = ?;` +
        `SELECT COUNT(*) as total FROM board WHERE type_id = ?;`,
      [typeId, typeId],
      (err, results) => {
        if (err) return res.status(500).send("DB Error");
        const boardtypes = results[0];
        const codes = results[1];
        const thisBoardtype = results[2][0];
        const totalCount = results[3][0].total;
        const numPerPage = parseInt(thisBoardtype.numPerPage, 10) || 10;
        const totalPages = Math.ceil(totalCount / numPerPage);
        const offset = (page - 1) * numPerPage;

        db.query(
          "SELECT * FROM board WHERE type_id=? ORDER BY IFNULL(p_id, board_id) DESC, p_id ASC, board_id ASC LIMIT ? OFFSET ?",
          [typeId, numPerPage, offset],
          (error, boards) => {
            if (error) return res.status(500).send("DB Error");
            var context = {
              who: name,
              login: login,
              boardtypes: boardtypes,
              codes: codes,
              boards: boards,
              typeId: typeId,
              pNum: page,
              totalPages: totalPages,
              body: "board.ejs",
              cls: cls,
              thisBoardtype: thisBoardtype,
            };
            req.app.render("mainFrame", context, (err, html) => {
              res.end(html);
            });
          }
        );
      }
    );
  },

  // create
  // board.js의 create 함수
  create: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    const { typeId } = req.params;
    db.query(sql1 + sql2, (err, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        board: {},
        typeId: typeId,
        pNum: 1,
        mode: "create",
        body: "boardCRU.ejs",
        cls: cls,
      };
      res.app.render("mainFrame", context, (err, html) => {
        if (err) {
          console.error("EJS Render Error:", err);
          return res.status(500).send("EJS Render Error");
        }
        res.end(html);
      });
    });
  },

  create_process: (req, res) => {
    const post = req.body;
    db.query(
      `INSERT INTO board (type_id, loginid, password, title, date, content)
     VALUES (?, ?, ?, ?, NOW(), ?)`,
      [post.type_id, post.loginid, post.password, post.title, post.content],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("보드 등록 오류");
        }
        res.redirect(`/board/view/${post.type_id}/${post.pNum}`);
      }
    );
  },

  // 업데이트 폼 표시
  update: (req, res) => {
    const { boardId, pNum } = req.params;
    db.query(
      `SELECT * FROM board WHERE board_id=?`,
      [boardId],
      (error, results) => {
        if (error) return res.status(500).send("Internal Server Error");
        if (results.length === 0) return res.status(404).send("Not Found");
        var { name, login, cls } = authIsOwner(req, res);
        db.query(sql1 + sql2, (err, qresults) => {
          if (err) return res.status(500).send("Internal Server Error");
          const context = {
            who: name,
            login: login,
            boardtypes: qresults[0],
            codes: qresults[1],
            board: results[0],
            body: "boardCRU.ejs",
            cls,
            typeId: results[0].type_id,
            pNum: pNum,
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
      "SELECT password, loginid FROM board WHERE board_id=?",
      [post.board_id],
      (err, results) => {
        if (err || results.length === 0) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        const writer = results[0].loginid;
        const dbPassword = results[0].password;

        if (
          !(
            req.session.cls === "MNG" ||
            (req.session.cls === "CST" && req.session.name === writer)
          )
        ) {
          return res
            .status(403)
            .send("<script>alert('권한이 없습니다.');history.back();</script>");
        }

        if (req.session.cls === "CST" && post.password !== dbPassword) {
          return res.send(
            "<script>alert('비밀번호가 일치하지 않습니다.');history.back();</script>"
          );
        }

        db.query(
          `UPDATE board SET title=?, content=?, password=? WHERE board_id=?`,
          [post.title, post.content, post.password, post.board_id],
          (error) => {
            if (error) {
              console.error(error);
              return res.status(500).send("Update Error");
            }
            res.redirect(`/board/view/${post.type_id}/${post.pNum}`);
          }
        );
      }
    );
  },

  delete_process: (req, res) => {
    const post = req.body;
    console.log("delete_process post:", post);
    if (!post.board_id) {
      return res.status(400).send("잘못된 요청: board_id 없음");
    }
    db.query(
      "SELECT password, loginid FROM board WHERE board_id=?",
      [post.board_id],
      (err, results) => {
        if (err || results.length === 0)
          return res.status(500).send("Internal Server Error");
        const writer = results[0].loginid;
        // 권한 체크
        if (
          !(
            req.session.cls === "MNG" ||
            (req.session.cls === "CST" && req.session.name === writer)
          )
        ) {
          return res
            .status(403)
            .send("<script>alert('권한이 없습니다.');history.back();</script>");
        }

        db.query(
          "DELETE FROM board WHERE board_id=?",
          [post.board_id],
          (error) => {
            if (error) return res.status(500).send("삭제 오류");
            res.redirect(`/board/view/${post.type_id}/${post.pNum}`);
          }
        );
      }
    );
  },

  detail: (req, res) => {
    const { boardId, pNum } = req.params;
    db.query(
      "SELECT * FROM board WHERE board_id=?",
      [boardId],
      (error, results) => {
        if (error) return res.status(500).send("Internal Server Error");
        if (results.length === 0) return res.status(404).send("Not Found");
        var { name, login, cls } = authIsOwner(req, res);
        db.query(
          sql1 + sql2 + "SELECT * FROM boardtype WHERE type_id=?;",
          [results[0].type_id],
          (err, qresults) => {
            if (err) return res.status(500).send("Internal Server Error");
            const context = {
              who: name,
              login: login,
              boardtypes: qresults[0],
              codes: qresults[1],
              board: results[0],
              body: "boardCRU.ejs",
              cls,
              typeId: results[0].type_id,
              pNum: pNum,
              mode: "detail", // 읽기 전용 모드
              thisBoardtype: qresults[2][0],
            };
            res.render("mainFrame", context);
          }
        );
      }
    );
  },
  // 답글 폼
  answerForm: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    if (cls !== "MNG") {
      return res.status(403).send("권한이 없습니다.");
    }
    const { parentId, pNum } = req.params;
    db.query(
      "SELECT * FROM board WHERE board_id=?",
      [parentId],
      (err, results) => {
        if (err || results.length === 0)
          return res.status(404).send("원글 없음");
        db.query(
          sql1 + sql2 + "SELECT * FROM boardtype WHERE type_id=?;",
          [results[0].type_id],
          (e2, qresults) => {
            if (e2) return res.status(500).send("DB Error");
            const context = {
              who: name,
              login: login,
              boardtypes: qresults[0],
              codes: qresults[1],
              board: {
                title: "[답변]: " + results[0].title,
                content: "",
                loginid: "관리자",
                type_id: results[0].type_id,
                p_id: parentId,
                date: results[0].date,
              },
              pNum: pNum,
              typeId: results[0].type_id,
              mode: "answer",
              body: "boardCRU.ejs",
              cls,
              thisBoardtype: qresults[2][0],
            };
            res.render("mainFrame", context);
          }
        );
      }
    );
  },
  // 답글 작성 처리
  answer_process: (req, res) => {
    const post = req.body;
    if (req.session.cls !== "MNG") {
      return res.status(403).send("권한이 없습니다.");
    }
    db.query(
      `INSERT INTO board (type_id, loginid, title, date, content, p_id)
       VALUES (?, '관리자', ?, NOW(), ?, ?)`,
      [post.type_id, post.title, post.content, post.p_id],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("답글 등록 오류");
        }
        res.redirect(`/board/view/${post.type_id}/${post.pNum}`);
      }
    );
  },
};
