// 202233207 김도연
// tableRouter.js
const express = require("express");
var router = express.Router(); // express의 메소드
var table = require("../lib/table"); // ./ 가 아닌 ../ (한단계위의 폴더에서 시작)

router.get("/view", (req, res) => {
  table.tableView(req, res);
});

router.get("/view/:tableName", (req, res) => {
  table.tableDetail(req, res);
});

module.exports = router;
