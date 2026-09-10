// backend/controllers/ruleController.js
import { getAllRules, getRuleById, createRule, updateRule, deleteRule } from '../models/ruleModel.js'

const VALID_RULE_TYPES = ['presence', 'format', 'logical']

export async function listRules(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly === 'true'
    const rules = await getAllRules({ activeOnly })
    res.status(200).json({ rules })
  } catch (err) {
    next(err)
  }
}

export async function getRule(req, res, next) {
  try {
    const rule = await getRuleById(req.params.id)
    if (!rule) return res.status(404).json({ message: 'Rule not found' })
    res.status(200).json({ rule })
  } catch (err) {
    next(err)
  }
}

export async function addRule(req, res, next) {
  try {
    const { fieldName, ruleType, condition, weight, active } = req.body

    if (!fieldName || !ruleType) {
      return res.status(400).json({ message: 'fieldName and ruleType are required' })
    }
    if (!VALID_RULE_TYPES.includes(ruleType)) {
      return res.status(400).json({ message: `ruleType must be one of: ${VALID_RULE_TYPES.join(', ')}` })
    }
    if (weight !== undefined && (typeof weight !== 'number' || weight < 0)) {
      return res.status(400).json({ message: 'weight must be a non-negative number' })
    }

    const rule = await createRule({ fieldName, ruleType, condition, weight, active })
    res.status(201).json({ rule })
  } catch (err) {
    next(err)
  }
}

export async function editRule(req, res, next) {
  try {
    const { fieldName, ruleType, condition, weight, active } = req.body

    if (ruleType && !VALID_RULE_TYPES.includes(ruleType)) {
      return res.status(400).json({ message: `ruleType must be one of: ${VALID_RULE_TYPES.join(', ')}` })
    }

    const rule = await updateRule(req.params.id, { fieldName, ruleType, condition, weight, active })
    if (!rule) return res.status(404).json({ message: 'Rule not found' })

    res.status(200).json({ rule })
  } catch (err) {
    next(err)
  }
}

export async function removeRule(req, res, next) {
  try {
    const deleted = await deleteRule(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Rule not found' })
    res.status(200).json({ message: 'Rule deleted', id: deleted.id })
  } catch (err) {
    next(err)
  }
}