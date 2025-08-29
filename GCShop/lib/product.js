// 202233207 김도연
// product.js
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

module.exports = {
  // 상품 목록
  view: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql2 + sql3, (error, results) => {
      var context = {
        who: name,
        login: login,
        boardtypes: results[0],
        products: results[1],
        codes: results[2],
        body: "product.ejs",
        cls: cls,
        hideActions: false,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  // 상품 등록 폼
  create: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    db.query(sql1 + sql3, (err, results) => {
      db.query(
        "SELECT DISTINCT main_id, sub_id, main_name, sub_name FROM code",
        (error, categories) => {
          var context = {
            who: name,
            login: login,
            boardtypes: results[0],
            codes: results[1],
            product: {},
            categories: categories, // 카테고리 데이터 넘김
            body: "productCU.ejs",
            cls: cls,
            mode: "create",
          };
          res.app.render("mainFrame", context, (err, html) => {
            res.end(html);
          });
        }
      );
    });
  },
  // 상품 등록 처리
  create_process: (req, res) => {
    const post = req.body;
    const image = req.file ? req.file.filename : "";
    let main_id = "";
    let sub_id = "";
    if (post.category) {
      [main_id, sub_id] = post.category.split(":");
    }

    db.query(
      `INSERT INTO product (main_id, sub_id, name, price, stock, brand, supplier, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        main_id,
        sub_id,
        post.name,
        post.price,
        post.stock,
        post.brand,
        post.supplier,
        image,
      ],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("상품 등록 오류");
        }
        res.redirect("/product/view");
      }
    );
  },

  // 상품 수정 폼
  update: (req, res) => {
    const { prod_id } = req.params;
    db.query(
      `SELECT * FROM product WHERE prod_id=?`,
      [prod_id],
      (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Internal Server Error");
        }
        if (results.length === 0) {
          return res.status(404).send("Not Found");
        }
        var { name, login, cls } = authIsOwner(req, res);

        // code 테이블에서 main_id, sub_id 조회
        db.query(sql1 + sql3, (err, qresults) => {
          db.query(
            "SELECT DISTINCT main_id, sub_id, main_name, sub_name FROM code",
            (err2, categories) => {
              if (err2) {
                console.error(err2);
                return res.status(500).send("Internal Server Error");
              }
              const context = {
                who: name,
                login: login,
                cls: cls,
                boardtypes: qresults[0],
                codes: qresults[1],
                product: results[0],
                categories: categories,
                body: "productCU.ejs",
              };
              res.render("mainFrame", context);
            }
          );
        });
      }
    );
  },
  // 상품 수정 처리
  update_process: (req, res) => {
    const post = req.body;
    const image = req.file ? req.file.filename : "";
    let main_id = "";
    let sub_id = "";
    if (post.category) {
      [main_id, sub_id] = post.category.split(":");
    }

    db.query(
      `UPDATE product SET 
      main_id=?, 
      sub_id=?, 
      name=?, 
      price=?, 
      stock=?, 
      brand=?, 
      supplier=?, 
      image=?
    WHERE prod_id=?`,
      [
        main_id,
        sub_id,
        post.name,
        post.price,
        post.stock,
        post.brand,
        post.supplier,
        image,
        post.prod_id,
      ],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("상품 수정 오류");
        }
        res.redirect("/product/view");
      }
    );
  },

  // 상품 삭제 처리
  delete_process: (req, res) => {
    const { prod_id } = req.params;
    db.query(
      `DELETE FROM product WHERE prod_id=?`,
      [prod_id],
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send("삭제 오류");
        }
        res.redirect("/product/view");
      }
    );
  },
};
