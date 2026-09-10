// backend/routes/analyticsRoutes.js
import express from 'express'
import { getOverview, getAlerts } from '../controllers/analyticsController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/overview', protect, getOverview)
router.get('/alerts', protect, getAlerts)

export default router