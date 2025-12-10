require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3000;

const userRoutes = require("./routes/user");

app.use(express.json());
app.use(express.urlencoded());

app.use("/api/auth", userRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

// MariaDB 연결
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || null,
});

connection
  .then((conn) => {
    console.log("MariaDB 접근 성공");
    // 연결을 전역으로 저장하여 나중에 사용할 수 있도록 함
    app.locals.db = conn;
  })
  .catch((error) => {
    console.log("MariaDB 접근 실패", error);
  });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
