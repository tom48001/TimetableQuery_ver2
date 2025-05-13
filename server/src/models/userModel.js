import pool from '../db.js';

class UserModel {
  // Constructor to initialize the UserModel class
  static async getAllUsers() {
    const [rows] = await pool.query('SELECT * FROM user');
    return rows;
  }

  // Get user by ID
  static async getUserById(userId) {
    const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [userId]);
    return rows[0];
  }

  // Get user by email
  static async getUserByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    return rows[0];
  }

  // Get user by name
  static async deleteUserById(userId) {
    await pool.query('DELETE FROM user WHERE user_id = ?', [userId]);
  }

  // Update user information
  static async updateUser(userId, userData) {
    const { user_name, email } = userData;
    await pool.query(
      'UPDATE user SET user_name = ?, email = ? WHERE user_id = ?',
      [user_name, email, userId]
    );
  }
}

export default UserModel;
