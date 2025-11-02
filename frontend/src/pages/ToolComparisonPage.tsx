import { useEffect, useMemo, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useEvaluation } from '../context/EvaluationContext'
import type { ToolModel } from '../types'
import { apiClient } from '../services/api'

interface AdminDraft {
  id: number
  summary: string
  pricing_tier: string
  overall_score: number
  reporting_quality: number
  maintenance_effort: number
}

export const ToolComparisonPage = () => {
  const { activeResult } = useEvaluation()
  const [tools, setTools] = useState<ToolModel[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [adminDraft, setAdminDraft] = useState<AdminDraft | null>(null)
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true)
      try {
        const { data } = await apiClient.get<ToolModel[]>('/tools/')
        setTools(data)
        if (activeResult) {
          const defaults = activeResult.recommended_tool_ids.slice(0, 3)
          if (defaults.length) {
            setSelectedIds(defaults)
          }
        } else {
          setSelectedIds(data.slice(0, 3).map((tool) => tool.id))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchTools().catch((error) => console.error(error))
  }, [activeResult])

  const selectedTools = useMemo(
    () => tools.filter((tool) => selectedIds.includes(tool.id)),
    [selectedIds, tools]
  )

  const handleSelectionChange = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        const next = [...prev, id]
        return next.slice(-3)
      }
      return prev.filter((item) => item !== id)
    })
  }

  const handleExportPdf = async () => {
    if (!exportRef.current) return
    const canvas = await html2canvas(exportRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('landscape', 'pt', 'a4')
    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height * width) / canvas.width
    pdf.addImage(imgData, 'PNG', 20, 20, width - 40, height - 40)
    pdf.save('tool-comparison.pdf')
  }

  const openAdminEditor = (tool: ToolModel) => {
    setAdminDraft({
      id: tool.id,
      summary: tool.summary ?? '',
      pricing_tier: tool.pricing_tier,
      overall_score: tool.overall_score,
      reporting_quality: tool.reporting_quality,
      maintenance_effort: tool.maintenance_effort
    })
  }

  const handleAdminSave = async () => {
    if (!adminDraft) return
    setSaving(true)
    setMessage(null)
    try {
      await apiClient.put(`/tools/${adminDraft.id}`, {
        summary: adminDraft.summary,
        pricing_tier: adminDraft.pricing_tier,
        overall_score: adminDraft.overall_score,
        reporting_quality: adminDraft.reporting_quality,
        maintenance_effort: adminDraft.maintenance_effort
      })
      setTools((prev) =>
        prev.map((tool) => (tool.id === adminDraft.id ? { ...tool, ...adminDraft } : tool))
      )
      setMessage('Tool details updated')
      setAdminDraft(null)
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Tool Comparison</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Select up to three tools to compare side-by-side. Export the snapshot to PDF for stakeholder circulation, and
            tweak metadata using the admin console below.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportPdf} disabled={loading || selectedTools.length === 0}>
            Export PDF
          </Button>
        </div>
      </header>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Select tools</h3>
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">Loading tool catalogue...</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tools.map((tool) => {
              const checked = selectedIds.includes(tool.id)
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleSelectionChange(tool.id, !checked)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    checked
                      ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-200'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300'
                  }`}
                >
                  {tool.name}
                </button>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="p-0" padded={false}>
        <div ref={exportRef} className="overflow-x-auto p-6">
          {selectedTools.length === 0 ? (
            <p className="text-sm text-slate-500">Choose tools to populate the comparison table.</p>
          ) : (
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="sticky left-0 bg-white/90 p-4 dark:bg-slate-900/90">Attribute</th>
                  {selectedTools.map((tool) => (
                    <th key={tool.id} className="p-4 text-slate-900 dark:text-slate-100">
                      {tool.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 dark:text-slate-200">
                {[
                  { label: 'Tagline', accessor: (tool: ToolModel) => tool.tagline ?? '?' },
                  { label: 'Overall score', accessor: (tool: ToolModel) => `${tool.overall_score.toFixed(1)}/5` },
                  { label: 'Pricing tier', accessor: (tool: ToolModel) => tool.pricing_tier },
                  { label: 'Maintenance effort', accessor: (tool: ToolModel) => `${tool.maintenance_effort}/5` },
                  { label: 'Reporting quality', accessor: (tool: ToolModel) => `${tool.reporting_quality}/5` },
                  { label: 'Execution speed', accessor: (tool: ToolModel) => `${tool.execution_speed}/5` },
                  { label: 'AI capability', accessor: (tool: ToolModel) => `${tool.ai_capability}/5` },
                  {
                    label: 'Supported languages',
                    accessor: (tool: ToolModel) => tool.languages_supported.join(', ')
                  },
                  {
                    label: 'Pros',
                    accessor: (tool: ToolModel) => (
                      <ul className="list-disc space-y-1 pl-4">
                        {tool.pros.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )
                  },
                  {
                    label: 'Cons',
                    accessor: (tool: ToolModel) => (
                      <ul className="list-disc space-y-1 pl-4">
                        {tool.cons.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )
                  }
                ].map((row) => (
                  <tr key={row.label} className="border-t border-slate-200/60 dark:border-slate-800/60">
                    <td className="sticky left-0 bg-white/90 p-4 font-medium dark:bg-slate-900/90">{row.label}</td>
                    {selectedTools.map((tool) => (
                      <td key={tool.id} className="p-4 align-top">
                        {typeof row.accessor === 'function' ? row.accessor(tool) : row.accessor}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Admin catalogue controls</h3>
          <span className="text-xs uppercase tracking-wide text-slate-500">Update seed data</span>
        </div>
        {message && <p className="rounded-2xl bg-primary-500/10 p-3 text-sm text-primary-600 dark:text-primary-200">{message}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <div key={tool.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{tool.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tool.tagline}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openAdminEditor(tool)}>
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>

        {adminDraft && (
          <div className="rounded-2xl border border-primary-200 bg-primary-500/5 p-6 dark:border-primary-500/40">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-200">
              Editing {tools.find((tool) => tool.id === adminDraft.id)?.name}
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">Summary</span>
                <textarea
                  value={adminDraft.summary}
                  onChange={(event) => setAdminDraft((prev) => (prev ? { ...prev, summary: event.target.value } : prev))}
                  className="min-h-[80px] w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">Pricing tier</span>
                <select
                  value={adminDraft.pricing_tier}
                  onChange={(event) => setAdminDraft((prev) => (prev ? { ...prev, pricing_tier: event.target.value } : prev))}
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <option value="Free">Free</option>
                  <option value="< $500">&lt; $500</option>
                  <option value="> $500">&gt; $500</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">Overall score</span>
                <input
                  type="number"
                  step="0.1"
                  value={adminDraft.overall_score}
                  onChange={(event) =>
                    setAdminDraft((prev) => (prev ? { ...prev, overall_score: Number(event.target.value) } : prev))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">Reporting quality (0-5)</span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={adminDraft.reporting_quality}
                  onChange={(event) =>
                    setAdminDraft((prev) => (prev ? { ...prev, reporting_quality: Number(event.target.value) } : prev))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">Maintenance effort (0-5)</span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={adminDraft.maintenance_effort}
                  onChange={(event) =>
                    setAdminDraft((prev) => (prev ? { ...prev, maintenance_effort: Number(event.target.value) } : prev))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setAdminDraft(null)}>
                Cancel
              </Button>
              <Button onClick={handleAdminSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
