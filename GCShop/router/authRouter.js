// 202233207 김도연
// authRouter.js
const express = require("express");
var router = express.Router(); // express의 메소드
var auth = require("../lib/auth"); // ./ 가 아닌 ../ (한단계위의 폴더에서 시작)

router.get("/login", (req, res) => {
  auth.login(req, res);
});
router.post("/login_process", (req, res) => {
  auth.login_process(req, res);
});

router.post("/logout_process", (req, res) => {
  auth.logout_process(req, res);
});

router.get("/register", (req, res) => {
  auth.register(req, res);
});
router.post("/register_process", (req, res) => {
  auth.register_process(req, res);
});

module.exports = router; // 라우터로
