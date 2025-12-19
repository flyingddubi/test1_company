-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isLoggedIn BOOLEAN DEFAULT FALSE,
  isActive BOOLEAN DEFAULT TRUE,
  failedLoginAttempts INT DEFAULT 0,
  lastLoginAttempt DATETIME NULL,
  ipAddress VARCHAR(45) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_username ON users(username);

-- contacts 테이블 생성
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_email ON contacts(email);
CREATE INDEX idx_status ON contacts(status);
CREATE INDEX idx_createdAt ON contacts(createdAt);

-- posts 테이블 생성
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number INT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  fileUrl JSON NULL,
  views INT DEFAULT 0,
  createdBy VARCHAR(30) NULL,
  updatedBy VARCHAR(30) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_number ON posts(number);
CREATE INDEX idx_title ON posts(title);
CREATE INDEX idx_createdAt ON posts(createdAt);
CREATE INDEX idx_views ON posts(views);
CREATE INDEX idx_createdBy ON posts(createdBy);
CREATE INDEX idx_updatedBy ON posts(updatedBy);

-- post_view_logs 테이블 생성 (조회 로그 저장)
CREATE TABLE IF NOT EXISTS post_view_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  username VARCHAR(30) NOT NULL,
  userAgent VARCHAR(500) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_postId (postId),
  INDEX idx_username (username),
  INDEX idx_createdAt (createdAt),
  -- 동일한 게시글에 대한 동일 사용자 조회 중복 방지 인덱스
  INDEX idx_postId_username (postId, username)
);

