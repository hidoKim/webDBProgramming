// 202233207 김도연
// purchase.js
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
var sql12 = "SELECT * FROM person;";
var sql4 =
  "SELECT * FROM product WHERE name LIKE ? OR brand LIKE ? OR supplier LIKE ?;";
const sql6 = `
  SELECT p.*, prd.name, prd.image, prd.price
  FROM purchase p
  JOIN product prd ON p.prod_id = prd.prod_id
  WHERE p.loginid = ?
  ORDER BY p.date DESC
`;

const sql8 = `
    SELECT c.*, p.name, p.image, p.price
    FROM cart c
    JOIN product p ON c.prod_id = p.prod_id
    WHERE c.loginid = ?
    ORDER BY c.date DESC
  `;
const sql10 = `
  SELECT 
  p.*, 
  u.name AS customer_name, 
  prd.name AS prod_name
  FROM purchase p
  JOIN person u ON p.loginid = u.loginid
  JOIN product prd ON p.prod_id = prd.prod_id
  ORDER BY p.date DESC

`;

// 객체를 module.exports에 바로 저장
module.exports = {
  purchasedetail: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "CST") {
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
        body: "purchaseDetail.ejs",
        cls: cls,
        hideActions: true,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  purchaseProcess: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "CST") {
      return res.send(`
      <script>
        alert('권한이 없습니다.');
        history.back();
      </script>
    `);
    }
    const loginid = req.session.loginid;
    const prod_id = req.body.prod_id;
    const price = Number(req.body.price);
    const qty = Number(req.body.qty);
    const total = price * qty;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");

    db.query(
      `INSERT INTO purchase (loginid, prod_id, date, price, qty, total, payYN)
     VALUES (?, ?, ?, ?, ?, ?, 'N')`,
      [loginid, prod_id, date, price, qty, total],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("DB Error");
        }
        res.redirect("/purchase");
      }
    );
  },

  purchase: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "CST") {
      return res.send(`
      <script>
        alert('권한이 없습니다.');
        history.back();
      </script>
    `);
    }
    const loginid = req.session.loginid;

    db.query(sql1 + sql3 + sql6, [loginid], (error, results) => {
      if (error) return res.status(500).send("DB Error");
      var context = {
        who: name,
        login: login,
        boardtypes: results[0], // boardtype
        codes: results[1], // code
        products: results[2], // cart + product join 결과
        body: "purchase.ejs",
        cls: cls,
        hideActions: true,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  cancelPurchase: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "CST") {
      return res.send(
        `<script>alert('권한이 없습니다.');history.back();</script>`
      );
    }
    const purchase_id = req.params.purchase_id;
    // payYN을 'Y'로 변경
    const sql = "UPDATE purchase SET payYN='Y' WHERE purchase_id = ?";
    db.query(sql, [purchase_id], (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send("구매취소 오류");
      }
      res.redirect("/purchase");
    });
  },

  cartProcess: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "CST") {
      return res.send(
        `<script>alert('권한이 없습니다.');history.back();</script>`
      );
    }
    const loginid = req.session.loginid;
    const prod_id = req.body.prod_id;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    // 장바구니에 같은 상품이 이미 있으면 중복 추가 방지
    const checkSql = `SELECT * FROM cart WHERE loginid = ? AND prod_id = ?`;
    db.query(checkSql, [loginid, prod_id], (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send("DB Error");
      }

      if (result.length > 0) {
        return res.send(`
        <script>
          alert('장바구니에 이미 있는 제품입니다.');
          location.href='/purchase/cart';
        </script>
      `);
      }
      const insertSql = `
      INSERT INTO cart (loginid, prod_id, date)
      VALUES (?, ?, ?)
    `;
      db.query(insertSql, [loginid, prod_id, date], (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send("DB Error");
        }
        res.redirect("/purchase/cart");
      });
    });
  },
  cart: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "CST") {
      return res.send(
        `<script>alert('권한이 없습니다.');history.back();</script>`
      );
    }
    const loginid = req.session.loginid;
    db.query(sql1 + sql3 + sql8, [loginid], (error, results) => {
      if (error) return res.status(500).send("DB Error");
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        cartItems: results[2],
        body: "cart.ejs",
        cls: cls,
        hideActions: true,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  cartPay: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "CST") {
      return res.send(
        `<script>alert('권한이 없습니다.');history.back();</script>`
      );
    }
    if (!req.body.cart_id) {
      return res.send(`
      <script>
        alert('구매할 상품을 선택해 주세요');
        location.href='/purchase/cart';
      </script>
    `);
    }
    const loginid = req.session.loginid;
    const cartIds = Array.isArray(req.body.cart_id)
      ? req.body.cart_id
      : [req.body.cart_id];
    const sql7 = `
    SELECT c.*, p.price
    FROM cart c
    JOIN product p ON c.prod_id = p.prod_id
    WHERE c.cart_id IN (${cartIds.map(() => "?").join(",")})
  `;
    db.query(sql7, cartIds, (err, cartRows) => {
      if (err) {
        console.error(err);
        return res.status(500).send("DB Error");
      }
      if (!cartRows || cartRows.length === 0) {
        return res.send(
          `<script>alert('선택한 상품이 없습니다.');location.href='/purchase/cart';</script>`
        );
      }
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      const purchaseValues = cartRows.map((row) => [
        loginid,
        row.prod_id,
        now,
        row.price,
        1, // qty
        row.price,
        "N",
      ]);
      const purchaseSql = `
      INSERT INTO purchase (loginid, prod_id, date, price, qty, total, payYN)
      VALUES ?
    `;
      db.query(purchaseSql, [purchaseValues], (err2, result) => {
        if (err2) {
          console.error(err2);
          return res.status(500).send("구매 처리 오류");
        }
        const delSql = `DELETE FROM cart WHERE cart_id IN (${cartIds
          .map(() => "?")
          .join(",")})`;
        db.query(delSql, cartIds, (err3, result2) => {
          if (err3) {
            console.error(err3);
            return res.status(500).send("삭제 오류");
          }
          res.redirect("/purchase");
        });
      });
    });
  },
  cartDelete: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "CST") {
      return res.send(
        `<script>alert('권한이 없습니다.');history.back();</script>`
      );
    }
    if (!req.body.cart_id) {
      return res.send(`
      <script>
        alert('삭제할 상품을 선택해 주세요');
        location.href='/purchase/cart';
      </script>
    `);
    }
    // 삭제 처리 로직
    const cartIds = Array.isArray(req.body.cart_id)
      ? req.body.cart_id
      : [req.body.cart_id];
    const sql9 = `DELETE FROM cart WHERE cart_id IN (${cartIds
      .map(() => "?")
      .join(",")})`;
    db.query(sql9, cartIds, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send("삭제 오류");
      }
      // 장바구니로 리다이렉트
      return res.redirect("/purchase/cart");
    });
  },
  purchaseView: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "MNG") {
      return res.send(`
      <script>
        alert('관리자만 접근 가능합니다.');
        history.back();
      </script>
    `);
    }
    db.query(sql1 + sql3 + sql10, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("DB Error");
      }
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        codes: results[1],
        purchases: results[2],
        body: "purchaseView.ejs",
        cls: cls,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
  purchaseUpdate: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "MNG") {
      return res.send(`
      <script>
        alert('관리자만 접근 가능합니다.');
        history.back();
      </script>
    `);
    }
    const purchase_id = req.params.purchase_id;

    const sql11 = `
    SELECT p.*, u.name AS customer_name, prd.name AS prod_name
      FROM purchase p
      JOIN person u ON p.loginid = u.loginid
      JOIN product prd ON p.prod_id = prd.prod_id
      WHERE p.purchase_id = ?;
  `;
    db.query(
      sql1 + sql3 + sql12 + sql2 + sql11,
      [purchase_id],
      (error, results) => {
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
          purchase: results[4][0],
          body: "purchaseU.ejs",
          cls: cls,
        };
        req.app.render("mainFrame", context, (err, html) => {
          res.end(html);
        });
      }
    );
  },
  // 업데이트 처리
  update_process: (req, res) => {
    const {
      purchase_id,
      loginid,
      prod_id,
      date,
      price,
      qty,
      total,
      payYN,
      cancel,
      refund,
    } = req.body;
    db.query(
      `UPDATE purchase SET loginid=?, prod_id=?, price=?, qty=?, total=?, payYN=?, cancel=?, refund=? WHERE purchase_id=?`,
      [loginid, prod_id, price, qty, total, payYN, cancel, refund, purchase_id],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Update Error");
        }
        res.redirect("/purchase/view");
      }
    );
  },

  delete_process: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    if (cls !== "MNG") {
      return res.send(`
      <script>
        alert('관리자만 접근 가능합니다.');
        history.back();
      </script>
    `);
    }
    const { purchase_id } = req.params;
    db.query(
      `DELETE FROM purchase WHERE purchase_id=?`,
      [purchase_id],
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send("삭제 오류");
        }
        res.redirect("/purchase/view");
      }
    );
  },
};
