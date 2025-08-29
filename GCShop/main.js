// 202233207 김도연
// 1. import 코드
const express = require("express");
// 9주ppt 22페이지
var session = require("express-session");
var MySqlStore = require("express-mysql-session")(session);
var bodyParser = require("body-parser");
// 사용자 정의 모듈
var authRouter = require("./router/authRouter");
var rootRouter = require("./router/rootRouter");
var codeRouter = require("./router/codeRouter");
var productRouter = require("./router/productRouter");
var personRouter = require("./router/personRouter");
var boardRouter = require("./router/boardRouter");
var purchaseRouter = require("./router/purchaseRouter");
var tableRouter = require("./router/tableRouter");
var analRouter = require("./router/analRouter");

// 2. 모든 경로에서 실행되어야만 하는 모듈
var options = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "webdb2025",
};
// mysql과 연결을 위해
var sessionStore = new MySqlStore(options);
const app = express();
app.use(
  // 세션 관련 모듈 실행시킴
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);
// ejs엔진을 사용하겠다.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public")); // 10주차 ppt 7페이지, public이라는 경로를 만들어준것

var db = require("./lib/db"); // db모듈
const { authPlugins } = require("mysql2");

// 10주차 ppt 5페이지
// 3. 개발자 정의 라우터
app.use("/", rootRouter);
app.use("/auth", authRouter);
app.use("/code", codeRouter);
app.use("/product", productRouter);
app.use("/person", personRouter);
app.use("/board", boardRouter);
app.use("/purchase", purchaseRouter);
app.use("/table", tableRouter);
app.use("/anal", analRouter);

app.get("/favicon.ico", (req, res) => res.writeHead(404));
app.listen(3000, () => console.log("Example app listening on port 3000"));
