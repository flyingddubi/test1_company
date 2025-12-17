// MariaDB용 Contact 모델 - SQL 쿼리 헬퍼 함수들
class Contact {
  // 특정 문의글 찾은 후 삭제
  static async findReqByIdAndDelete(db, contactId) {

    const [result] = await db.execute(
      "DELETE FROM contacts where id = ?",
      [contactId]
    );
    return result;
  }
  // 특정 문의글 찾은 후 수정
  static async findReqByIdAndUpdate(db, contactData) {
    const { id, status } = contactData;

    const [result] = await db.execute(
      "UPDATE contacts SET status = ? where id = ?",
      [status, id]
    );
    return result;
  }

  // 특정 문의글 찾기
  static async findReqById(db, contactId) {
    const [rows] = await db.execute("SELECT * FROM contacts where id = ?", [
      contactId,
    ]);
    return rows[0] || null;
  }

  // 전체 문의글 찾기
  static async findReqAll(db) {
    const [rows] = await db.execute(
      "SELECT * FROM contacts ORDER BY createdAt desc"
    );
    return rows || null;
  }

  // 새 문의 생성
  static async create(db, contactData) {
    const { name, email, phone, message, status = "pending" } = contactData;

    const [result] = await db.execute(
      `INSERT INTO contacts (name, email, phone, message, status, createdAt) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [name, email, phone, message, status]
    );

    return result.insertId;
  }
}

module.exports = Contact;
