// 202233207 김도연
// personRouter.js
const express = require("express");
var router = express.Router(); // express의 메소드
var person = require("../lib/person"); // ./ 가 아닌 ../ (한단계위의 폴더에서 시작)

router.get("/view", (req, res) => {
  person.view(req, res);
});

router.get("/create", (req, res) => {
  person.create(req, res);
});

router.post("/create_process", (req, res) => {
  person.create_process(req, res);
});

router.get("/update/:loginid", (req, res) => {
  person.update(req, res);
});

router.post("/update_process", (req, res) => {
  person.update_process(req, res);
});

router.get("/delete/:loginid", (req, res) => {
  person.delete_process(req, res);
});
module.exports = router; // 라우터로
