// 202233207 김도연
// boardRouter.js
const express = require("express");
var router = express.Router(); // express의 메소드
var board = require("../lib/board"); // ./ 가 아닌 ../ (한단계위의 폴더에서 시작)

// boardType
router.get("/type/view", (req, res) => {
  board.typeview(req, res);
});
router.get("/type/create", (req, res) => {
  board.typecreate(req, res);
});

router.post("/type/create_process", (req, res) => {
  board.typecreate_process(req, res);
});

router.get("/type/update/:typeId", (req, res) => {
  board.typeupdate(req, res);
});

router.post("/type/update_process", (req, res) => {
  board.typeupdate_process(req, res);
});

router.get("/type/delete/:typeId", (req, res) => {
  board.typedelete_process(req, res);
});

// board
router.get("/view/:typeId/:pNum", (req, res) => {
  board.view(req, res);
});
router.get("/create/:typeId", (req, res) => {
  board.create(req, res);
});

router.post("/create_process", (req, res) => {
  board.create_process(req, res);
});

router.get("/update/:boardId/:pNum", (req, res) => {
  board.update(req, res);
});

router.post("/update_process", (req, res) => {
  board.update_process(req, res);
});

router.post("/delete/:boardId/:typeId/:pNum", (req, res) => {
  board.delete_process(req, res);
});
router.post("/delete_process", (req, res) => {
  board.delete_process(req, res);
});
router.get("/detail/:boardId/:pNum", (req, res) => {
  board.detail(req, res);
});

// 답글 기능 추가 시작
router.get("/answer/:parentId/:pNum", (req, res) => {
  board.answerForm(req, res);
});
router.post("/answer_process", (req, res) => {
  board.answer_process(req, res);
});

module.exports = router; // 라우터로
