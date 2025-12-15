// MariaDB용 User 모델 - SQL 쿼리 헬퍼 함수들
class User {
  // 사용자 이름으로 사용자 찾기
  static async findOne(db, condition) {
    const { username } = condition;
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0] || null;
  }

  // 새 사용자 생성
  static async create(db, userData) {
    const {
      username,
      password,
      isLoggedIn = false,
      isActive = true,
      failedLoginAttempts = 0,
      ipAddress = null,
    } = userData;

    const [result] = await db.execute(
      `INSERT INTO users (username, password, isLoggedIn, isActive, failedLoginAttempts, ipAddress, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [username, password, isLoggedIn, isActive, failedLoginAttempts, ipAddress]
    );

    return result.insertId;
  }

  // ID로 사용자 찾기
  static async findById(db, userId) {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    return rows[0] || null;
  }

  // ID로 사용자 삭제
  static async deleteById(db, userId) {
    const [result] = await db.execute(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );
    return {
      affectedRows: result.affectedRows,  // 삭제된 행의 수 (보통 1 또는 0)
    };
  }

  // 사용자 정보 업데이트
  static async update(db, userId, updateData) {
    const {
      isLoggedIn,
      isActive,
      failedLoginAttempts,
      lastLoginAttempt,
      ipAddress,
    } = updateData;

    const updateFields = [];
    const values = [];

    if (isLoggedIn !== undefined) {
      updateFields.push("isLoggedIn = ?");
      values.push(isLoggedIn);
    }
    if (isActive !== undefined) {
      updateFields.push("isActive = ?");
      values.push(isActive);
    }
    if (failedLoginAttempts !== undefined) {
      updateFields.push("failedLoginAttempts = ?");
      values.push(failedLoginAttempts);
    }
    if (lastLoginAttempt !== undefined) {
      updateFields.push("lastLoginAttempt = ?");
      values.push(lastLoginAttempt);
    }
    if (ipAddress !== undefined) {
      updateFields.push("ipAddress = ?");
      values.push(ipAddress);
    }

    if (updateFields.length === 0) {
      return { affectedRows: 0 };
    }

    values.push(userId);

    const [result] = await db.execute(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    // UPDATE 결과 반환
    return {
      affectedRows: result.affectedRows,  // 영향받은 행의 수 (보통 1 또는 0)
      changedRows: result.changedRows,    // 실제로 값이 변경된 행의 수
    };
  }
}

module.exports = User;