// backend/models/inspectionModel.js
import { pool } from '../config/db.js'

export async function createInspection({
  inspectorId,
  productId,
  imageUrl,
  extractedFields,
  violations,
  reviewFlags,
  complianceScore,
  status,
  location,
}) {
  const result = await pool.query(
    `INSERT INTO inspections
      (inspector_id, product_id, image_url, extracted_fields, violations, review_flags, compliance_score, status, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      inspectorId,
      productId || null,
      imageUrl || null,
      JSON.stringify(extractedFields),
      JSON.stringify(violations),
      JSON.stringify(reviewFlags || []),
      complianceScore,
      status || 'completed',
      location || null,
    ]
  )
  return result.rows[0]
}

export async function getInspectionsByInspector(inspectorId, { limit = 20, offset = 0 } = {}) {
  const result = await pool.query(
    `SELECT i.*, p.name AS product_name, p.brand AS product_brand
     FROM inspections i
     LEFT JOIN products p ON p.id = i.product_id
     WHERE i.inspector_id = $1
     ORDER BY i.created_at DESC
     LIMIT $2 OFFSET $3`,
    [inspectorId, limit, offset]
  )
  return result.rows
}

export async function getInspectionById(id) {
  const result = await pool.query(
    `SELECT i.*, p.name AS product_name, p.brand AS product_brand
     FROM inspections i
     LEFT JOIN products p ON p.id = i.product_id
     WHERE i.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export async function getRecentViolations(limit = 5) {
  const result = await pool.query(
    `SELECT i.id, p.name AS product, p.brand, i.violations, i.location, i.created_at
     FROM inspections i
     LEFT JOIN products p ON p.id = i.product_id
     WHERE jsonb_array_length(i.violations) > 0
     ORDER BY i.created_at DESC
     LIMIT $1`,
    [limit]
  )
  return result.rows
}

export async function getOverviewStats() {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total_scans,
      COUNT(*) FILTER (WHERE jsonb_array_length(violations) > 0) AS violations_found,
      COUNT(*) FILTER (WHERE status = 'processing') AS pending_review
    FROM inspections
  `)
  return result.rows[0]
}

export async function getViolationsOverTime(days = 31) {
  const result = await pool.query(
    `SELECT
       TO_CHAR(created_at, 'DD Mon') AS date,
       COUNT(*) FILTER (WHERE jsonb_array_length(violations) > 0) AS value
     FROM inspections
     WHERE created_at >= NOW() - ($1 || ' days')::interval
     GROUP BY DATE(created_at), TO_CHAR(created_at, 'DD Mon')
     ORDER BY DATE(created_at) ASC`,
    [days]
  )
  return result.rows
}

export async function getCategoryBreakdown() {
  const result = await pool.query(`
    SELECT
      COALESCE(p.category, 'Others') AS name,
      COUNT(*) AS count
    FROM inspections i
    LEFT JOIN products p ON p.id = i.product_id
    GROUP BY p.category
    ORDER BY count DESC
  `)
  return result.rows
}

export async function getHighSeverityViolations(days = 7) {
  const result = await pool.query(
    `SELECT i.id, p.name AS product, p.brand, i.violations, i.location, i.created_at, i.compliance_score
     FROM inspections i
     LEFT JOIN products p ON p.id = i.product_id
     WHERE i.created_at >= NOW() - ($1 || ' days')::interval
       AND EXISTS (
         SELECT 1 FROM jsonb_array_elements(i.violations) v
         WHERE v->>'severity' = 'High'
       )
     ORDER BY i.created_at DESC`,
    [days]
  )
  return result.rows
}