// 202233207 김도연
// rootRouter.js
const express = require("express");
var router = express.Router(); // express의 메소드
var root = require("../lib/root"); // ./ 가 아닌 ../ (한단계위의 폴더에서 시작)

router.get("/", (req, res) => {
  root.home(req, res);
});

router.get("/category/:categ", (req, res) => {
  root.categoryview(req, res);
});

router.get("/search", (req, res) => {
  root.search(req, res);
});

router.post("/search", (req, res) => {
  root.search(req, res);
});

router.get("/detail/:prodId", (req, res) => {
  root.detail(req, res);
});

// 장바구니 관련 라우터
router.get("/cartview", (req, res) => {
  root.cartView(req, res);
});
router.get("/cartupdate/:cart_id", (req, res) => {
  root.cartUpdate(req, res);
});
router.post("/update_process", (req, res) => {
  root.update_process(req, res);
});
router.get("/cartdelete/:cart_id", (req, res) => {
  root.delete_process(req, res);
});

module.exports = router; // 라우터로
