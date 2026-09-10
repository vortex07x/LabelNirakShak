// backend/utils/reportToken.js
import jwt from 'jsonwebtoken'

const REPORT_TOKEN_TTL = '15m'

export function generateReportToken(inspectionId, userId) {
  return jwt.sign(
    { inspectionId, userId, scope: 'report' },
    process.env.JWT_SECRET,
    { expiresIn: REPORT_TOKEN_TTL }
  )
}

export function verifyReportToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  if (decoded.scope !== 'report') {
    throw new Error('Invalid token scope')
  }
  return decoded
}