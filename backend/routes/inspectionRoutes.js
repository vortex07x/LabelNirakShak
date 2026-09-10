// backend/routes/inspectionRoutes.js
import express from 'express'
import {
  scanPackage,
  listInspections,
  getInspection,
  getReportLink,
  downloadReport,
} from '../controllers/inspectionController.js'
import { protect, protectViaLink } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post('/scan', protect, upload.single('image'), scanPackage)
router.get('/', protect, listInspections)
router.get('/:id', protect, getInspection)

// Two-step report flow:
// 1. Frontend calls this (normal session auth) to mint a short-lived,
//    single-inspection token.
router.get('/:id/report-link', protect, getReportLink)
// 2. That token is appended as ?token=... to build a direct-download/
//    shareable URL — this route itself needs no session header, since
//    the token in the query string carries its own scoped auth.
router.get('/:id/report', protectViaLink, downloadReport)

export default router