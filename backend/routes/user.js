const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const axios = require("axios");
const https = require("https");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 데이터베이스 연결 가져오기
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
    }

    // 입력 검증
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "사용자 이름과 비밀번호를 입력해주세요." });
    }

    // 기존 사용자 확인
    const existingUser = await User.findOne(db, { username });
    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 생성
    await User.create(db, {
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 데이터베이스 연결 가져오기
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
    }

    const user = await User.findOne(db, { username });

    // 사용자가 없으면 null 반환
    if (!user || user === null) {
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
    }

    console.log("user found:", user);

    if (!user.isActive) {
      return res
        .status(401)
        .json({ message: "비활성화된 계정입니다. 관리자에게 문의하세요." });
    }

    if (user.isLoggedIn) {
      return res
        .status(401)
        .json({ message: "이미 다른 기기에서 로그인된 상태입니다." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const updateData = {
        failedLoginAttempts: newFailedAttempts,
        lastLoginAttempt: new Date(),
      };

      if (newFailedAttempts >= 5) {
        updateData.isActive = false;
        await User.update(db, user.id, updateData);
        return res.status(401).json({
          message: "비밀번호를 5회 이상 틀려 계정이 비활성화되었습니다. ",
        });
      } else {
        await User.update(db, user.id, updateData);
        return res.status(401).json({
          message: "사용자 이름 또는 비밀번호가 올바르지 않습니다.",
          remainingAttempts: 5 - newFailedAttempts,
        });
      }
    }

    // 로그인 성공 - IP 주소 가져오기
    let ipAddress = null;
    try {
      // SSL 인증서 검증 비활성화 (개발 환경용)
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });

      const response = await axios.get("https://api.ipify.org?format=json", {
        httpsAgent: httpsAgent,
      });
      ipAddress = response.data.ip;
    } catch (error) {
      console.log("IP 주소를 가져오던 중 오류 발생: ", error.message);
    }

    // 로그인 성공 시 업데이트
    await User.update(db, user.id, {
      failedLoginAttempts: 0,
      lastLoginAttempt: new Date(),
      isLoggedIn: true,
      ipAddress: ipAddress,
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log(token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // password 제외한 사용자 정보 반환 (업데이트된 정보 포함)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: { ...userWithoutPassword, isLoggedIn: true, ipAddress: ipAddress },
    });
  } catch (error) {
    console.log("서버 오류: " + error.message);
    res.status(500).json({ messgae: "서버 오류가 발생했습니다." });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({ message: "이미 로그아웃된 상태입니다." });
    }

    // 데이터베이스 연결 가져오기
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(db, decoded.userId);

      if (user) {
        // 로그아웃 시 isLoggedIn을 false로 업데이트
        await User.update(db, user.id, {
          isLoggedIn: false,
        });
      }
    } catch (error) {
      console.log("토큰 검증 오류: " + error.message);
      // 토큰이 유효하지 않아도 쿠키는 삭제
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "로그아웃되었습니다." });
  } catch (error) {
    console.log("로그아웃 오류: " + error.message);
    res.status(500).json({ message: "서버 오류가 발생하였습니다." });
  }
});

router.post("/delete/:userId", async (req, res) => {
  try {
    // 데이터베이스 연결 가져오기
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ message: "데이터베이스 연결이 없습니다." });
    }

    const userId = req.params.userId;
    const result = await User.deleteById(db, userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json({ message: "사용자가 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.log("사용자 삭제 오류: " + error.message);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.post("/verify-token", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(400)
      .json({ isValid: false, message: "토큰이 없습니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ isValid: true, user: decoded });
  } catch (error) {
    return res
      .status(401)
      .json({ isValid: false, message: "유효하지 않은 토큰입니다." });
  }
});

module.exports = router;
