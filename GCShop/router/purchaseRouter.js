// 202233207 김도연
// purchaseRouter.js
const express = require("express");
var router = express.Router(); // express의 메소드
var purchase = require("../lib/purchase"); // ./ 가 아닌 ../ (한단계위의 폴더에서 시작)

router.get("/detail/:prodId", (req, res) => {
  purchase.purchasedetail(req, res);
});
router.post("/purchase_process", (req, res) => {
  purchase.purchaseProcess(req, res);
});

router.get("/", (req, res) => {
  purchase.purchase(req, res); // 구매목록 조회
});

router.post("/cart_process", (req, res) => {
  purchase.cartProcess(req, res);
});
router.get("/cart", (req, res) => {
  purchase.cart(req, res);
});
router.get("/cancel/:purchase_id", (req, res) => {
  purchase.cancelPurchase(req, res);
});
router.post("/cart_pay", (req, res) => {
  purchase.cartPay(req, res);
});
router.post("/cart_delete", (req, res) => {
  purchase.cartDelete(req, res);
});

// purchase View 페이지 라우터
router.get("/view", (req, res) => {
  purchase.purchaseView(req, res);
});
router.get("/update/:purchase_id", (req, res) => {
  purchase.purchaseUpdate(req, res);
});
router.post("/update_process", (req, res) => {
  purchase.update_process(req, res);
});
router.get("/delete/:purchase_id", (req, res) => {
  purchase.delete_process(req, res);
});

module.exports = router; // 라우터로
