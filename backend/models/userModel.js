// backend/models/userModel.js
import bcrypt from 'bcryptjs'
import { pool } from '../config/db.js'

export async function createUser({ name, email, password, role }) {
  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, hashedPassword, role === 'admin' ? 'admin' : 'inspector']
  )

  return result.rows[0]
}

export async function findUserByEmail(email) {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
  return result.rows[0] || null
}

export async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export async function comparePassword(candidatePassword, hashedPassword) {
  return bcrypt.compare(candidatePassword, hashedPassword)
}

export function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}