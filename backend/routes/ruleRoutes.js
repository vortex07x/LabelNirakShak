// backend/routes/ruleRoutes.js
import express from 'express'
import { listRules, getRule, addRule, editRule, removeRule } from '../controllers/ruleController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// Any logged-in user can view rules (needed by the rule engine + admin UI)
router.get('/', protect, listRules)
router.get('/:id', protect, getRule)

// Only admins can mutate rules — this is the "live rule editing" demo feature
router.post('/', protect, requireRole('admin'), addRule)
router.put('/:id', protect, requireRole('admin'), editRule)
router.delete('/:id', protect, requireRole('admin'), removeRule)

export default router