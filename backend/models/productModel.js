// backend/models/productModel.js
import { pool } from '../config/db.js'

export async function findOrCreateProduct({ name, brand, category }) {
  const existing = await pool.query(
    `SELECT * FROM products WHERE name = $1 AND brand = $2 LIMIT 1`,
    [name, brand || null]
  )

  if (existing.rows[0]) return existing.rows[0]

  const result = await pool.query(
    `INSERT INTO products (name, brand, category)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, brand || null, category || null]
  )

  return result.rows[0]
}

export async function getProductById(id) {
  const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [id])
  return result.rows[0] || null
}

export async function getAllProductsWithStats() {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.brand,
      p.category,
      p.created_at,
      COUNT(i.id) AS scan_count,
      ROUND(AVG(i.compliance_score)::numeric, 2) AS avg_score,
      MAX(i.created_at) AS last_scanned
    FROM products p
    LEFT JOIN inspections i ON i.product_id = p.id
    GROUP BY p.id
    ORDER BY last_scanned DESC NULLS LAST, p.created_at DESC
  `)
  return result.rows
}