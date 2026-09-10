// backend/controllers/analyticsController.js
import {
  getOverviewStats,
  getViolationsOverTime,
  getCategoryBreakdown,
  getRecentViolations,
  getHighSeverityViolations,
} from '../models/inspectionModel.js'

const CATEGORY_COLORS = {
  'Food & Beverages': '#3b82f6',
  FMCG: '#22c55e',
  Pharmaceuticals: '#f5a524',
  'Agri Products': '#a855f7',
  Others: '#64748b',
}

export async function getOverview(req, res, next) {
  try {
    const rawStats = await getOverviewStats()
    const totalScans = Number(rawStats.total_scans)
    const violationsFound = Number(rawStats.violations_found)
    const pendingReview = Number(rawStats.pending_review)
    const complianceRate = totalScans > 0
      ? (((totalScans - violationsFound) / totalScans) * 100).toFixed(2)
      : '0.00'

    const stats = [
      { label: 'Total Scans', value: totalScans.toLocaleString(), delta: '+0%', deltaDir: 'up', vs: 'vs last period' },
      { label: 'Violations Found', value: violationsFound.toLocaleString(), delta: '+0%', deltaDir: 'up', vs: 'vs last period' },
      { label: 'Compliance Rate', value: `${complianceRate}%`, delta: '+0%', deltaDir: 'up', vs: 'vs last period' },
      { label: 'Pending Review', value: pendingReview.toLocaleString(), delta: '+0%', deltaDir: 'down', vs: 'vs last period' },
    ]

    const violationsOverTimeRaw = await getViolationsOverTime(31)
    const violationsOverTime = violationsOverTimeRaw.map((r) => ({
      date: r.date,
      value: Number(r.value),
    }))

    const categoryRaw = await getCategoryBreakdown()
    const totalCategoryCount = categoryRaw.reduce((sum, c) => sum + Number(c.count), 0)
    const productCategories = categoryRaw.map((c) => ({
      name: c.name,
      value: totalCategoryCount > 0 ? Math.round((Number(c.count) / totalCategoryCount) * 100) : 0,
      color: CATEGORY_COLORS[c.name] || '#64748b',
    }))

    const recentViolationsRaw = await getRecentViolations(5)
    const recentViolations = recentViolationsRaw.map((r, idx) => {
      const firstViolation = Array.isArray(r.violations) && r.violations[0] ? r.violations[0] : {}
      return {
        id: idx + 1,
        inspectionId: r.id,
        product: r.product || 'Unknown product',
        brand: r.brand || '—',
        type: firstViolation.type || 'Violation detected',
        location: r.location || '—',
        date: new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        severity: firstViolation.severity || 'Medium',
        action: 'Open',
      }
    })

    res.status(200).json({
      stats,
      violationsOverTime,
      productCategories,
      recentViolations,
    })
  } catch (err) {
    next(err)
  }
}

export async function getAlerts(req, res, next) {
  try {
    const days = Number(req.query.days) || 7
    const rows = await getHighSeverityViolations(days)

    const alerts = rows.map((r) => {
      const highSeverityViolations = Array.isArray(r.violations)
        ? r.violations.filter((v) => v.severity === 'High')
        : []
      return {
        inspectionId: r.id,
        product: r.product || 'Unnamed product',
        brand: r.brand || '—',
        location: r.location || '—',
        date: r.created_at,
        complianceScore: r.compliance_score,
        violations: highSeverityViolations,
      }
    })

    res.status(200).json({ alerts, windowDays: days })
  } catch (err) {
    next(err)
  }
}