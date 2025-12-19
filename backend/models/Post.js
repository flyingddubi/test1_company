// MariaDB용 Post 모델 - SQL 쿼리 헬퍼 함수들
class Post {
  // 새 게시글 생성
  static async create(db, postData) {
    const {
      number,
      title,
      content,
      fileUrl = null,
      views = 0,
      createdBy = null,
    } = postData;

    // fileUrl 처리: 배열이거나 null/undefined인 경우 처리
    let fileUrlValue = null;
    if (fileUrl !== null && fileUrl !== undefined) {
      // 배열인지 확인하고 JSON 문자열로 변환
      if (Array.isArray(fileUrl)) {
        fileUrlValue = fileUrl.length > 0 ? JSON.stringify(fileUrl) : JSON.stringify([]);
      } else {
        // 배열이 아니면 배열로 변환
        fileUrlValue = JSON.stringify([fileUrl]);
      }
    }

    const [result] = await db.execute(
      `INSERT INTO posts (number, title, content, fileUrl, views, createdBy, updatedAt, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        number,
        title,
        content,
        fileUrlValue,
        views,
        createdBy,
      ]
    );

    return result.insertId;
  }

  // ID로 게시글 찾기
  static async findById(db, postId) {
    const [rows] = await db.execute("SELECT * FROM posts WHERE id = ?", [
      postId,
    ]);
    if (rows[0]) {
      return this.parsePost(rows[0]);
    }
    return null;
  }

  // number로 게시글 찾기
  static async findByNumber(db, number) {
    const [rows] = await db.execute("SELECT * FROM posts WHERE number = ?", [
      number,
    ]);
    if (rows[0]) {
      return this.parsePost(rows[0]);
    }
    return null;
  }

  // 전체 게시글 찾기
  static async findAll(db, options = {}) {
    const { orderBy, order, limit, offset } = options;
    let query = `SELECT * FROM posts ORDER BY ${orderBy} ${order}`;
    const params = [];

    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
      if (offset) {
        query += " OFFSET ?";
        params.push(offset);
      }
    }

    const [rows] = await db.execute(query, params);
    return rows.map((row) => this.parsePost(row));
  }

  // 게시글 수정
  static async update(db, postId, updateData) {
    const { title, content, fileUrl, updatedBy = null, updatedAt = new Date() } = updateData;

    const updateFields = [];
    const values = [];

    if (title !== undefined) {
      updateFields.push("title = ?");
      values.push(title);
    }
    if (content !== undefined) {
      updateFields.push("content = ?");
      values.push(content);
    }
    if (fileUrl !== undefined) {
      // fileUrl 처리: 배열이거나 null/undefined인 경우 처리
      let fileUrlValue = null;
      if (fileUrl !== null && fileUrl !== undefined) {
        if (Array.isArray(fileUrl)) {
          fileUrlValue = fileUrl.length > 0 ? JSON.stringify(fileUrl) : JSON.stringify([]);
        } else {
          fileUrlValue = JSON.stringify([fileUrl]);
        }
      }
      updateFields.push("fileUrl = ?");
      values.push(fileUrlValue);
    }
    if (updatedBy !== undefined && updatedBy !== null) {
      updateFields.push("updatedBy = ?");
      values.push(updatedBy);
    }
    updateFields.push("updatedAt = NOW()");
    values.push(postId);

    if (updateFields.length === 0) {
      return { affectedRows: 0 };
    }

    const [result] = await db.execute(
      `UPDATE posts SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    };
  }

  // 게시글 삭제
  static async deleteById(db, postId) {
    const [result] = await db.execute("DELETE FROM posts WHERE id = ?", [
      postId,
    ]);
    return {
      affectedRows: result.affectedRows,
    };
  }

  // 조회수 증가
  static async incrementViews(db, postId) {
    const [result] = await db.execute(
      "UPDATE posts SET views = views + 1 WHERE id = ?",
      [postId]
    );
    return {
      affectedRows: result.affectedRows,
    };
  }

  // 동일 사용자의 조회 기록 확인 (중복 체크)
  static async hasViewed(db, postId, username) {
    const [rows] = await db.execute(
      "SELECT id FROM post_view_logs WHERE postId = ? AND username = ? LIMIT 1",
      [postId, username]
    );
    return rows.length > 0;
  }

  // 조회 로그 추가
  static async addViewLog(db, postId, viewLog) {
    const { username, userAgent = null } = viewLog;

    // 게시글이 존재하는지 확인
    const post = await this.findById(db, postId);
    if (!post) {
      return null;
    }

    // 조회 로그 추가
    const [result] = await db.execute(
      `INSERT INTO post_view_logs (postId, username, userAgent, createdAt) 
       VALUES (?, ?, ?, NOW())`,
      [postId, username, userAgent]
    );

    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
    };
  }

  // 조회수 증가 및 로그 추가 (중복 체크 포함)
  static async incrementViewsWithLog(db, postId, viewLog) {
    const { username, userAgent = null } = viewLog;

    // 이미 조회한 사용자인지 확인
    const hasViewed = await this.hasViewed(db, postId, username);
    
    if (!hasViewed) {
      // 조회수 증가
      await this.incrementViews(db, postId);
      // 조회 로그 추가
      await this.addViewLog(db, postId, { username, userAgent });
      return { isNewView: true };
    }

    return { isNewView: false };
  }

  // 특정 게시글의 조회 로그 조회
  static async getViewLogs(db, postId, options = {}) {
    const { limit, offset } = options;
    let query = "SELECT * FROM post_view_logs WHERE postId = ? ORDER BY createdAt DESC";
    const params = [postId];

    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
      if (offset) {
        query += " OFFSET ?";
        params.push(offset);
      }
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  // 특정 사용자의 조회 로그 조회
  static async getViewLogsByUsername(db, username, options = {}) {
    const { limit, offset } = options;
    let query = "SELECT * FROM post_view_logs WHERE username = ? ORDER BY createdAt DESC";
    const params = [username];

    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
      if (offset) {
        query += " OFFSET ?";
        params.push(offset);
      }
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  // 특정 게시글의 조회 로그 개수
  static async getViewLogCount(db, postId) {
    const [rows] = await db.execute(
      "SELECT COUNT(*) as count FROM post_view_logs WHERE postId = ?",
      [postId]
    );
    return rows[0].count;
  }

  // JSON 필드 파싱 헬퍼 함수
  static parsePost(row) {
    if (!row) return null;

    // fileUrl 파싱: JSON 문자열이면 파싱, null이면 null, 빈 배열도 처리
    let fileUrl = null;
    if (row.fileUrl) {
      try {
        fileUrl = JSON.parse(row.fileUrl);
        // 파싱 결과가 배열이 아니면 배열로 변환
        if (!Array.isArray(fileUrl)) {
          fileUrl = [fileUrl];
        }
      } catch (e) {
        // JSON 파싱 실패 시 원본 값 사용
        fileUrl = row.fileUrl;
      }
    }

    return {
      ...row,
      fileUrl,
    };
  }
}

module.exports = Post;
