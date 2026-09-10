// backend/models/ruleModel.js
import { pool } from '../config/db.js'

export async function getAllRules({ activeOnly = false } = {}) {
  const query = activeOnly
    ? `SELECT * FROM rules WHERE active = true ORDER BY created_at ASC`
    : `SELECT * FROM rules ORDER BY created_at ASC`
  const result = await pool.query(query)
  return result.rows
}

export async function getRuleById(id) {
  const result = await pool.query(`SELECT * FROM rules WHERE id = $1`, [id])
  return result.rows[0] || null
}

export async function createRule({ fieldName, ruleType, condition, weight, active }) {
  const result = await pool.query(
    `INSERT INTO rules (field_name, rule_type, condition, weight, active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [fieldName, ruleType, JSON.stringify(condition || {}), weight ?? 10, active ?? true]
  )
  return result.rows[0]
}

export async function updateRule(id, { fieldName, ruleType, condition, weight, active }) {
  const result = await pool.query(
    `UPDATE rules SET
       field_name = COALESCE($2, field_name),
       rule_type = COALESCE($3, rule_type),
       condition = COALESCE($4, condition),
       weight = COALESCE($5, weight),
       active = COALESCE($6, active)
     WHERE id = $1
     RETURNING *`,
    [
      id,
      fieldName,
      ruleType,
      condition ? JSON.stringify(condition) : null,
      weight,
      active,
    ]
  )
  return result.rows[0] || null
}

export async function deleteRule(id) {
  const result = await pool.query(`DELETE FROM rules WHERE id = $1 RETURNING id`, [id])
  return result.rows[0] || null
}