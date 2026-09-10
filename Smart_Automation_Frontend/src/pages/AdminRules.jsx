// src/pages/AdminRules.jsx
import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw, Plus, Trash2, Pencil, X } from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import apiClient from '../lib/apiClient.js'

const RULE_TYPES = ['presence', 'format', 'logical']
const SEVERITIES = ['High', 'Medium', 'Low']

const emptyForm = {
  fieldName: '',
  ruleType: 'presence',
  severity: 'Medium',
  pattern: '',
  weight: 10,
  active: true,
}

export default function AdminRules() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [rules, setRules] = useState([])
  const [status, setStatus] = useState('loading') // loading | done | error
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function fetchRules() {
    setStatus('loading')
    setError('')
    try {
      const { data } = await apiClient.get('/rules')
      setRules(data.rules)
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rules.')
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  function openAddForm() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setFormOpen(true)
  }

  function openEditForm(rule) {
    setEditingId(rule.id)
    setForm({
      fieldName: rule.field_name,
      ruleType: rule.rule_type,
      severity: rule.condition?.severity || 'Medium',
      pattern: rule.condition?.pattern || '',
      weight: rule.weight,
      active: rule.active,
    })
    setFormError('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.fieldName.trim()) {
      setFormError('Field name is required.')
      return
    }
    if (form.ruleType === 'format' && !form.pattern.trim()) {
      setFormError('Format rules require a regex pattern.')
      return
    }

    const condition = {
      severity: form.severity,
      ...(form.ruleType === 'format' ? { pattern: form.pattern.trim() } : {}),
    }

    const payload = {
      fieldName: form.fieldName.trim(),
      ruleType: form.ruleType,
      condition,
      weight: Number(form.weight),
      active: form.active,
    }

    setSaving(true)
    setFormError('')
    try {
      if (editingId) {
        await apiClient.put(`/rules/${editingId}`, payload)
      } else {
        await apiClient.post('/rules', payload)
      }
      closeForm()
      fetchRules()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save rule.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(rule) {
    try {
      await apiClient.put(`/rules/${rule.id}`, { active: !rule.active })
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r))
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update rule.')
    }
  }

  async function handleDelete(rule) {
    if (!window.confirm(`Delete the "${rule.field_name}" rule? This cannot be undone.`)) return
    try {
      await apiClient.delete(`/rules/${rule.id}`)
      setRules((prev) => prev.filter((r) => r.id !== rule.id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete rule.')
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <DashboardHeader title="Compliance Rules" onMenuClick={() => setMobileOpen(true)}>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-light)]"
          >
            <Plus size={15} /> New Rule
          </button>
        </DashboardHeader>

        <div className="flex flex-col gap-5 p-6 md:p-8">
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-sm text-[var(--color-text-dim)]">
              <Loader2 size={18} className="animate-spin" /> Loading rules…
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-bad)]/35 bg-[var(--color-bad)]/8 p-10 text-center">
              <AlertCircle size={22} className="text-[var(--color-bad)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-bad)]">Couldn't load rules</p>
                <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">{error}</p>
              </div>
              <button
                onClick={fetchRules}
                className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-light)]"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {status === 'done' && (
            <>
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--color-bad)]/35 bg-[var(--color-bad)]/8 p-3 text-[13px] text-[var(--color-bad)]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              {rules.length === 0 ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-xs text-[var(--color-text-faint)]">
                  No rules yet — add one to start enforcing compliance checks.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-faint)]">
                        <th className="px-4 py-3 font-medium">Field</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Severity</th>
                        <th className="px-4 py-3 font-medium">Pattern</th>
                        <th className="px-4 py-3 font-medium">Weight</th>
                        <th className="px-4 py-3 font-medium">Active</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((rule) => (
                        <tr key={rule.id} className="border-b border-[var(--color-border)] last:border-0">
                          <td className="px-4 py-3 font-medium">{rule.field_name}</td>
                          <td className="px-4 py-3 capitalize text-[var(--color-text-dim)]">{rule.rule_type}</td>
                          <td className="px-4 py-3 text-[var(--color-text-dim)]">{rule.condition?.severity || '—'}</td>
                          <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-faint)]">
                            {rule.condition?.pattern || '—'}
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-dim)]">{rule.weight}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleActive(rule)}
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                rule.active
                                  ? 'bg-[var(--color-good)]/12 text-[var(--color-good)]'
                                  : 'bg-white/5 text-[var(--color-text-faint)]'
                              }`}
                            >
                              {rule.active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditForm(rule)}
                                className="rounded-lg p-1.5 text-[var(--color-text-dim)] hover:bg-white/5"
                                aria-label="Edit rule"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(rule)}
                                className="rounded-lg p-1.5 text-[var(--color-bad)] hover:bg-[var(--color-bad)]/10"
                                aria-label="Delete rule"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-bold">
                {editingId ? 'Edit Rule' : 'New Rule'}
              </h2>
              <button onClick={closeForm} className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-dim)]">
                Field Name
                <input
                  type="text"
                  value={form.fieldName}
                  onChange={(e) => setForm((f) => ({ ...f, fieldName: e.target.value }))}
                  placeholder="e.g. Manufacturer Name"
                  className="rounded-lg border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm text-[var(--color-text)]"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-dim)]">
                Rule Type
                <select
                  value={form.ruleType}
                  onChange={(e) => setForm((f) => ({ ...f, ruleType: e.target.value }))}
                  className="rounded-lg border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm text-[var(--color-text)]"
                >
                  {RULE_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[var(--color-surface)]">
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              {form.ruleType === 'logical' && (
                <p className="text-[11px] text-[var(--color-warn)]">
                  Note: logical (cross-field) rules aren't evaluated by the rule engine yet — this rule will be saved but won't affect compliance scoring until that's implemented.
                </p>
              )}

              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-dim)]">
                Severity
                <select
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                  className="rounded-lg border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm text-[var(--color-text)]"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s} className="bg-[var(--color-surface)]">
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              {form.ruleType === 'format' && (
                <label className="flex flex-col gap-1 text-xs text-[var(--color-text-dim)]">
                  Regex Pattern
                  <input
                    type="text"
                    value={form.pattern}
                    onChange={(e) => setForm((f) => ({ ...f, pattern: e.target.value }))}
                    placeholder="e.g. ^\\d{14}$"
                    className="rounded-lg border border-[var(--color-border-strong)] bg-transparent px-3 py-2 font-mono text-sm text-[var(--color-text)]"
                  />
                </label>
              )}

              <label className="flex flex-col gap-1 text-xs text-[var(--color-text-dim)]">
                Weight
                <input
                  type="number"
                  min="0"
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  className="rounded-lg border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm text-[var(--color-text)]"
                />
              </label>

              <label className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Active
              </label>

              {formError && <p className="text-xs text-[var(--color-bad)]">{formError}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-[var(--color-border-strong)] px-3.5 py-2 text-xs font-medium text-[var(--color-text-dim)] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-light)] disabled:opacity-60"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}