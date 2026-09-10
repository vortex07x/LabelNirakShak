// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import { findUserById } from '../models/userModel.js'

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

// Header OR query-param auth — ONLY for routes hit via direct browser
// navigation (<a href>) where a custom header can't be set, e.g. PDF
// report downloads. Do not use this for any state-changing route.
export function protectViaLink(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.query.token || null
  return authenticate(token, req, res, next)
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' })
    }
    next()
  }
}