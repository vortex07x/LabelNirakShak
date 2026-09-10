// backend/routes/inspectionRoutes.js
import express from 'express'
import { scanPackage, listInspections, getInspection, downloadReport } from '../controllers/inspectionController.js'
import { protect, protectViaLink } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post('/scan', protect, upload.single('image'), scanPackage)
router.get('/', protect, listInspections)
router.get('/:id', protect, getInspection)
router.get('/:id/report', protectViaLink, downloadReport)

export default router