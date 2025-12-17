const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ messgae: "유효하지 않은 토큰입니다." });
  }
};

router.post("/", async (req, res) => {
  // 데이터베이스 연결 가져오기
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { name, email, phone, message, status } = req.body;

    // 새 문의글 생성
    await Contact.create(db, {
      name,
      email,
      phone,
      message,
      status,
    });

    res.status(201).json({ message: "문의가 성공적으로 등록되었습니다." });
  } catch (error) {
    console.error("문의등록 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

//router.get("/", authenticateToken, async (req, res) => {
router.get("/", async (req, res) => {
  // 데이터베이스 연결 가져오기
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const contact = await Contact.findReqAll(db);

    res.json(contact);
  } catch (error) {
    console.error("전체 문의 불러오기 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

//router.get("/:id", authenticateToken, async (req, res) => {
router.get("/:id", async (req, res) => {
  // 데이터베이스 연결 가져오기
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const contact = await Contact.findReqById(db, req.params.id);

    //res.json(contact);
    //const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "문의를 찾을 수 없습니다." });
    }
    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
