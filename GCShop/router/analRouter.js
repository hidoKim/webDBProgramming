// 202233207 김도연
// analRouter.js
const express = require("express");
var router = express.Router(); // express의 메소드
var anal = require("../lib/anal"); // ./ 가 아닌 ../ (한단계위의 폴더에서 시작)

router.get("/customer", (req, res) => {
  anal.analCustomer(req, res); // 구매목록 조회
});

module.exports = router; // 라우터로
