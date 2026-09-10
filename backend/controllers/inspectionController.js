// backend/controllers/inspectionController.js
import axios from 'axios'
import FormData from 'form-data'
import { findOrCreateProduct } from '../models/productModel.js'
import { createInspection, getInspectionsByInspector, getInspectionById } from '../models/inspectionModel.js'
import { getAllRules } from '../models/ruleModel.js'
import { runRuleEngine } from '../services/ruleEngine.js'
import { uploadPackageImage } from '../services/storageService.js'
import { generateInspectionPDF } from '../services/pdfService.js'

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8000'

async function runOCR(fileBuffer, originalname, mimetype) {
  const formData = new FormData()
  formData.append('image', fileBuffer, { filename: originalname, contentType: mimetype })

  const { data } = await axios.post(`${OCR_SERVICE_URL}/extract`, formData, {
    headers: {
      ...formData.getHeaders(),
      ...(process.env.OCR_SHARED_SECRET && { 'X-Internal-Secret': process.env.OCR_SHARED_SECRET }),
    },
    timeout: 30000,
  })

  return data.extractedFields
}

export async function scanPackage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' })
    }

    let extractedFields
    try {
      extractedFields = await runOCR(req.file.buffer, req.file.originalname, req.file.mimetype)
    } catch (ocrErr) {
      console.error('OCR service error:', ocrErr.message)
      return res.status(502).json({ message: 'OCR service unavailable. Please try again shortly.' })
    }

    let imageUrl = null
    try {
      imageUrl = await uploadPackageImage(req.file.buffer, req.file.originalname, req.file.mimetype)
    } catch (uploadErr) {
      console.error('Image upload error:', uploadErr.message)
    }

    const activeRules = await getAllRules({ activeOnly: true })
    const { violations, reviewFlags, complianceScore } = runRuleEngine(extractedFields, activeRules)

    let productId = null
    if (req.body.productName) {
      const product = await findOrCreateProduct({
        name: req.body.productName,
        brand: req.body.brand,
        category: req.body.category,
      })
      productId = product.id
    }

    const inspection = await createInspection({
      inspectorId: req.user.id,
      productId,
      imageUrl,
      extractedFields,
      violations,
      reviewFlags,
      complianceScore,
      status: 'completed',
      location: req.body.location,
    })

    res.status(201).json({
      inspectionId: inspection.id,
      imageUrl,
      extractedFields,
      violations,
      reviewFlags,
      complianceScore,
      status: inspection.status,
      createdAt: inspection.created_at,
    })
  } catch (err) {
    next(err)
  }
}

export async function listInspections(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0
    const inspections = await getInspectionsByInspector(req.user.id, { limit, offset })
    res.status(200).json({ inspections })
  } catch (err) {
    next(err)
  }
}

export async function getInspection(req, res, next) {
  try {
    const inspection = await getInspectionById(req.params.id)
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' })
    res.status(200).json({ inspection })
  } catch (err) {
    next(err)
  }
}

export async function downloadReport(req, res, next) {
  try {
    const inspection = await getInspectionById(req.params.id)
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' })
    }

    const pdfBuffer = await generateInspectionPDF(inspection)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="inspection-${inspection.id}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) {
    next(err)
  }
}