const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET이 환경변수에 설정되지 않았습니다.");
    return res.status(500).json({ message: "서버 설정 오류가 발생했습니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("토큰 검증 오류:", error.message);
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};

router.post("/", async (req, res) => {
  // 데이터베이스 연결 가져오기
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const { title, content, fileUrl } = req.body;

    // JWT 토큰에서 username 가져오기 (createdBy용)
    let createdBy = null;
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        createdBy = decoded.username;
      } catch (error) {
        console.log("토큰 검증 실패:", error.message);
      }
    }

    // 가장 최근 게시글 찾기 (number 기준 내림차순)
    const allPosts = await Post.findAll(db, {
      orderBy: "number",
      order: "DESC",
      limit: 1,
    });
    const nextNumber = allPosts.length > 0 ? allPosts[0].number + 1 : 1;

    // 새 게시글 생성
    await Post.create(db, {
      number: nextNumber,
      title,
      content,
      fileUrl,
      createdBy,
    });

    res.status(201).json({ message: "게시글이 성공적으로 등록되었습니다." });
  } catch (error) {
    console.error("게시글 생성 오류:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const posts = await Post.findAll(db, {
      orderBy: "createdAt",
      order: "DESC",
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/:id", async (req, res) => {
  const db = req.app.locals.db;
  if (!db) {
    return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
  }

  try {
    const post = await Post.findById(db, req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // JWT 토큰에서 username 가져오기
    let username = null;
    const token = req.cookies.token;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        username = decoded.username; // JWT에 { userId, username } 형태로 저장됨
      } catch (error) {
        console.log("토큰 검증 실패:", error.message);
        // 토큰이 없거나 유효하지 않으면 username은 null
      }
    }

    // username이 없으면 조회수 증가하지 않음 (선택사항)
    if (!username) {
      return res.json(post); // 인증되지 않은 사용자는 조회수 증가 없이 게시글만 반환
    }

    const userAgent = req.headers['user-agent'] || null;

    // 조회수 증가 및 로그 추가 (중복 체크 포함)
    const result = await Post.incrementViewsWithLog(db, req.params.id, {
      username,
      userAgent,
    });

    // 업데이트된 게시글 정보 다시 가져오기
    const updatedPost = await Post.findById(db, req.params.id);

    res.json(updatedPost);
  } catch (error) {
    console.error("게시글 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;
