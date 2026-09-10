// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import { findUserById } from '../models/userModel.js'
import { verifyReportToken } from '../utils/reportToken.js'

async function authenticate(token, req, res, next) {
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await findUserById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid token' })
  }
}

// Standard auth — header only. Use this everywhere by default.
export function protect(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  return authenticate(token, req, res, next)
}

// Report-link auth — a separate, narrow, short-lived token (15 min),
// scoped to exactly one inspection. NOT a session JWT — a leaked report
// link can only ever fetch that one report, and only briefly.
// Do not use this for any other route.
export function protectViaLink(req, res, next) {
  const token = req.query.token
  if (!token) {
    return res.status(401).json({ message: 'Missing or expired report link' })
  }

  try {
    const decoded = verifyReportToken(token)

    if (decoded.inspectionId !== req.params.id) {
      return res.status(403).json({ message: 'This link is not valid for this report' })
    }

    // Minimal user context — enough for downstream ownership checks,
    // without a DB lookup on every report view.
    req.user = { id: decoded.userId }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired report link' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' })
    }
    next()
  }
}