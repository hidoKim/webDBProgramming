// 202233207 김도연
// root.js
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
var sql3 = "SELECT * FROM code;";
var sql4 =
  "SELECT * FROM product WHERE name LIKE ? OR brand LIKE ? OR supplier LIKE ?;";
var sql5 = `
    SELECT c.cart_id, c.loginid, u.name AS customer_name, c.prod_id, p.name AS prod_name, c.date
    FROM cart c
    JOIN person u ON c.loginid = u.loginid
    JOIN product p ON c.prod_id = p.prod_id
    ORDER BY c.date DESC
  `;
var sql6 = "SELECT * FROM person;";
var sql7 = `
    SELECT c.*, u.name AS customer_name, p.name AS prod_name
      FROM cart c
      JOIN person u ON c.loginid = u.loginid
      JOIN product p ON c.prod_id = p.prod_id
      WHERE c.cart_id = ?;
  `;
// 객체를 module.exports에 바로 저장
module.exports = {
  home: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    db.query(sql1 + sql2 + sql3, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("DB Error");
      }
      if (!results || !results[0]) {
        console.error("쿼리 결과 없음:", results);
        return res.status(500).send("DB 결과가 없습니다.");
      }
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        products: results[1],
        codes: results[2],
        body: "product.ejs",
        cls: cls,
        hideActions: true,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  categoryview: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const categ = req.params.categ;
    const main_id = categ.substring(0, 4);
    const sub_id = categ.substring(4, 8);
    db.query(sql1 + sql2 + sql3, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("DB Error");
      }
      if (!results || !results[0]) {
        console.error("쿼리 결과 없음:", results);
        return res.status(500).send("DB 결과가 없습니다.");
      }

      const allProducts = results[1];
      const filteredProducts = allProducts.filter(
        (p) =>
          String(p.main_id) === String(main_id) &&
          String(p.sub_id) === String(sub_id)
      );

      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        products: filteredProducts,
        codes: results[2],
        body: "product.ejs",
        cls: cls,
        hideActions: true,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  search: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var keyword = sanitizeHtml(req.body.search || "");
    var params = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`];

    db.query(sql1 + sql3 + sql4, params, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("DB Error");
      }
      if (!results || !results[0]) {
        console.error("쿼리 결과 없음:", results);
        return res.status(500).send("DB 결과가 없습니다.");
      }

      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        products: results[2],
        codes: results[1],
        body: "product.ejs",
        cls: cls,
        hideActions: true,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  detail: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "CST" && cls !== "NON") {
      return res.send(`
    <script>
      alert('권한이 없습니다.');
      history.back();
    </script>
  `);
    }
    const prodId = req.params.prodId;
    db.query(sql1 + sql2 + sql3, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("DB Error");
      }
      if (!results || !results[0]) {
        console.error("쿼리 결과 없음:", results);
        return res.status(500).send("DB 결과가 없습니다.");
      }
      const allProducts = results[1];
      const pDetail = allProducts.filter(
        (p) => String(p.prod_id) === String(prodId)
      );

      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        pDetail: pDetail,
        codes: results[2],
        body: "productDetail.ejs",
        cls: cls,
        hideActions: true,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  cartView: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "MNG") {
      return res.send(`
      <script>
        alert('관리자만 접근 가능합니다.');
        history.back();
      </script>
    `);
    }

    db.query(sql1 + sql3 + sql5, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("DB Error");
      }
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        carts: results[2],
        body: "cartView.ejs",
        cls: cls,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  // 업데이트 폼 표시
  cartUpdate: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "MNG") {
      return res.send(`
      <script>
        alert('관리자만 접근 가능합니다.');
        history.back();
      </script>
    `);
    }
    const cart_id = req.params.cart_id;

    db.query(sql1 + sql3 + sql6 + sql2 + sql7, [cart_id], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("DB Error");
      }
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        customers: results[2],
        products: results[3],
        cart: results[4][0],
        body: "cartU.ejs",
        cls: cls,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  // 업데이트 처리
  update_process: (req, res) => {
    const { cart_id, loginid, prod_id } = req.body;
    db.query(
      `UPDATE cart SET loginid=?, prod_id=? WHERE cart_id=?`,
      [loginid, prod_id, cart_id],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Update Error");
        }
        res.redirect("/cartview");
      }
    );
  },

  delete_process: (req, res) => {
    const { cart_id } = req.params;
    db.query(`DELETE FROM cart WHERE cart_id=?`, [cart_id], (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send("삭제 오류");
      }
      res.redirect("/cartView");
    });
  },
};
