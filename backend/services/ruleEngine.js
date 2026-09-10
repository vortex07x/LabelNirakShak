// backend/services/ruleEngine.js

// Evaluates extracted OCR fields against active rules from the DB.

function evaluatePresenceRule(rule, extractedFields) {
  const matchedField = extractedFields.find(
    (f) => f.field.toLowerCase() === rule.field_name.toLowerCase()
  )

  if (!matchedField || matchedField.status === 'missing') {
    return {
      passed: false,
      violation: {
        type: `${rule.field_name} Missing`,
        severity: rule.condition?.severity || 'Medium',
        ruleId: rule.id,
      },
    }
  }

  if (matchedField.status === 'low_confidence') {
    // Field was detected but OCR isn't confident in it — don't penalize
    // the compliance score, but surface it so a human can verify.
    return {
      passed: true,
      reviewFlag: {
        field: rule.field_name,
        confidence: matchedField.confidence,
        reason: 'Low OCR confidence — verify manually',
      },
    }
  }

  return { passed: true }
}

function evaluateFormatRule(rule, extractedFields) {
  const matchedField = extractedFields.find(
    (f) => f.field.toLowerCase() === rule.field_name.toLowerCase()
  )

  if (!matchedField || matchedField.status === 'missing') {
    // format can't be checked if the field wasn't even extracted — presence rule already covers this
    return { passed: true }
  }

  const pattern = rule.condition?.pattern
  if (!pattern) return { passed: true }

  try {
    const regex = new RegExp(pattern)
    const isValid = regex.test(matchedField.value)
    if (!isValid) {
      return {
        passed: false,
        violation: {
          type: `${rule.field_name} Format Invalid`,
          severity: rule.condition?.severity || 'Low',
          ruleId: rule.id,
        },
      }
    }
    return { passed: true }
  } catch {
    // malformed regex in DB — fail safe, don't crash the scan
    return { passed: true }
  }
}

export function runRuleEngine(extractedFields, rules) {
  const violations = []
  const reviewFlags = []
  let totalWeight = 0
  let lostWeight = 0

  for (const rule of rules) {
    if (!rule.active) continue

    totalWeight += rule.weight

    let result
    if (rule.rule_type === 'presence') {
      result = evaluatePresenceRule(rule, extractedFields)
    } else if (rule.rule_type === 'format') {
      result = evaluateFormatRule(rule, extractedFields)
    } else {
      // 'logical' rules (cross-field checks) — extend here later as needed
      result = { passed: true }
    }

    if (!result.passed) {
      violations.push(result.violation)
      lostWeight += rule.weight
    } else if (result.reviewFlag) {
      reviewFlags.push(result.reviewFlag)
    }
  }

  const complianceScore = totalWeight > 0
    ? Number((((totalWeight - lostWeight) / totalWeight) * 100).toFixed(2))
    : 100

  return { violations, reviewFlags, complianceScore }
}