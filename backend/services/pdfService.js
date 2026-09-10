// backend/services/pdfService.js
import PDFDocument from 'pdfkit'
import axios from 'axios'

const STATUS_LABELS = { valid: 'Valid', low_confidence: 'Low Confidence', missing: 'Missing' }
const SEVERITY_COLORS = { High: '#e24b4a', Medium: '#ef9f27', Low: '#639922' }

async function fetchImageBuffer(url) {
  if (!url) return null
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
    return Buffer.from(response.data)
  } catch {
    return null // report still generates without the image if this fails
  }
}

export async function generateInspectionPDF(inspection) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks = []
  doc.on('data', (chunk) => chunks.push(chunk))

  const donePromise = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
  })

  // --- Header ---
  doc.fontSize(20).fillColor('#0f172a').text('PackCheck AI — Compliance Inspection Report', { align: 'left' })
  doc.moveDown(0.3)
  doc.fontSize(9).fillColor('#64748b').text('Legal Metrology (Packaged Commodities) Rules, 2011 — Automated Compliance Check')
  doc.moveDown(1)

  // --- Meta info ---
  doc.fontSize(10).fillColor('#0f172a')
  doc.text(`Inspection ID: ${inspection.id}`)
  doc.text(`Product: ${inspection.product_name || 'Unnamed product'}${inspection.product_brand ? ` (${inspection.product_brand})` : ''}`)
  doc.text(`Location: ${inspection.location || '—'}`)
  doc.text(`Date: ${new Date(inspection.created_at).toLocaleString('en-IN')}`)
  doc.moveDown(1)

  // --- Compliance score ---
  const score = inspection.compliance_score
  const scoreColor = score >= 80 ? '#639922' : score >= 50 ? '#ef9f27' : '#e24b4a'
  doc.fontSize(14).fillColor(scoreColor).text(`Compliance Score: ${score !== null ? `${score}%` : 'N/A'}`, { continued: false })
  doc.moveDown(1)

  // --- Package image, if available ---
  const imageBuffer = await fetchImageBuffer(inspection.image_url)
  if (imageBuffer) {
    try {
      doc.image(imageBuffer, { fit: [200, 260], align: 'left' })
      doc.moveDown(1)
    } catch {
      // corrupt/unsupported image format — skip silently, rest of report still valid
    }
  }

  // --- Extracted fields table ---
  doc.fontSize(13).fillColor('#0f172a').text('Extracted Information', { underline: false })
  doc.moveDown(0.5)

  const fields = Array.isArray(inspection.extracted_fields) ? inspection.extracted_fields : []
  const tableTop = doc.y
  const colX = { field: 50, value: 220, conf: 370, status: 440 }

  doc.fontSize(9).fillColor('#64748b')
  doc.text('Field', colX.field, tableTop)
  doc.text('Extracted Value', colX.value, tableTop)
  doc.text('Confidence', colX.conf, tableTop)
  doc.text('Status', colX.status, tableTop)
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#e2e8f0').stroke()

  let y = tableTop + 22
  fields.forEach((f) => {
    const rowColor = f.status === 'missing' ? '#e24b4a' : f.status === 'low_confidence' ? '#ef9f27' : '#0f172a'
    doc.fontSize(9).fillColor(rowColor)
    doc.text(f.field, colX.field, y, { width: 160 })
    doc.text(f.value || '—', colX.value, y, { width: 140 })
    doc.text(f.status === 'missing' ? '0%' : `${f.confidence}%`, colX.conf, y)
    doc.text(STATUS_LABELS[f.status] || f.status, colX.status, y)
    y += 20
  })

  doc.y = y + 15

  // --- Violations ---
  const violations = Array.isArray(inspection.violations) ? inspection.violations : []
  doc.fontSize(13).fillColor('#0f172a').text('Violations', { underline: false })
  doc.moveDown(0.5)

  if (violations.length === 0) {
    doc.fontSize(10).fillColor('#639922').text('No violations detected. Package meets all active compliance rules.')
  } else {
    violations.forEach((v) => {
      doc.fontSize(10).fillColor(SEVERITY_COLORS[v.severity] || '#0f172a')
      doc.text(`• [${v.severity || 'Medium'}] ${v.type}`)
    })
  }

  doc.moveDown(2)

  // --- Footer ---
  doc.fontSize(8).fillColor('#94a3b8').text(
    'This report was generated automatically by PackCheck AI and should be used alongside manual verification for any fields flagged as low confidence or missing.',
    { align: 'left' }
  )

  doc.end()
  return donePromise
}