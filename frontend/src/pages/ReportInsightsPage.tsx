import { useMemo, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Link, useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useEvaluation } from '../context/EvaluationContext'
import { apiClient } from '../services/api'

export const ReportInsightsPage = () => {
  const navigate = useNavigate()
  const { activeResult, reweightedTools, clear } = useEvaluation()
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const topThree = useMemo(() => reweightedTools.slice(0, 3), [reweightedTools])

  const areaData = useMemo(
    () =>
      topThree.map((tool) => ({
        name: tool.tool_name,
        Score: tool.normalized_score,
        Maintenance: tool.criteria.maintenance.value,
        Reporting: tool.criteria.reporting.value,
        AI: tool.criteria.ai_assistance.value
      })),
    [topThree]
  )

  const handleDownloadPdf = async () => {
    if (!exportRef.current) return
    const canvas = await html2canvas(exportRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('portrait', 'pt', 'a4')
    const width = pdf.internal.pageSize.getWidth()
    const height = (canvas.height * width) / canvas.width
    pdf.addImage(imgData, 'PNG', 20, 20, width - 40, Math.min(height, pdf.internal.pageSize.getHeight() - 40))
    pdf.save('qa-insights-report.pdf')
  }

  const handleDownloadJson = async () => {
    if (!activeResult?.evaluation?.id) return
    setDownloading(true)
    setMessage(null)
    try {
      const { data } = await apiClient.get(`/evaluations/${activeResult.evaluation.id}/export/json`)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qa-evaluation-${activeResult.evaluation.id}.json`
      link.click()
      window.URL.revokeObjectURL(url)
      setMessage('JSON export downloaded')
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const handleStartNew = () => {
    clear()
    navigate('/questionnaire')
  }

  if (!activeResult) {
    return (
      <Card className="p-10">
        <div className="space-y-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">No report available</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Generate an evaluation first, then return to craft an executive-ready summary.
          </p>
          <Link to="/questionnaire">
            <Button>Start questionnaire</Button>
          </Link>
        </div>
      </Card>
    )
  }

  if (topThree.length === 0) {
    return (
      <Card className="p-10">
        <p className="text-sm text-slate-600 dark:text-slate-300">No tools were scored. Please rerun the evaluation.</p>
      </Card>
    )
  }

  const leadTool = topThree[0]

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Report & Insights</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Package up your recommendations with supporting rationale, highlight the top performers, and hand executives the
            data they need to approve next steps.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleDownloadJson} disabled={downloading}>
            {downloading ? 'Preparing...' : 'Download JSON'}
          </Button>
          <Button onClick={handleDownloadPdf}>Download PDF</Button>
        </div>
      </header>

      {message && <p className="rounded-2xl bg-primary-500/10 p-3 text-sm text-primary-600 dark:text-primary-200">{message}</p>}

      <div ref={exportRef} className="space-y-8">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Executive summary</h3>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            The evaluation emphasised low maintenance effort, analytics depth, and AI augmentation. {leadTool.tool_name}{' '}
            leads with a {leadTool.normalized_score.toFixed(1)}% weighted score, outperforming peers across AI assistance and
            CI/CD readiness. We recommend funding a pilot with {leadTool.tool_name} while running a targeted proof of concept
            with {topThree[1]?.tool_name ?? 'alternate candidate'} to validate language fit.
          </p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Metrics spotlight</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {topThree.map((tool) => (
              <div key={tool.tool_id} className="rounded-2xl border border-slate-200 bg-white/60 p-5 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{tool.tool_name}</span>
                  <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-200">
                    {tool.normalized_score.toFixed(1)}%
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li>Maintenance effort rating: {tool.criteria.maintenance.value.toFixed(1)}/5</li>
                  <li>Reporting quality rating: {tool.criteria.reporting.value.toFixed(1)}/5</li>
                  <li>AI assistance rating: {tool.criteria.ai_assistance.value.toFixed(1)}/5</li>
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Score trend overview</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
                <XAxis dataKey="name" stroke="currentColor" />
                <YAxis stroke="currentColor" />
                <Tooltip />
                <Area type="monotone" dataKey="Score" stroke="#4f46e5" fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={handleStartNew}>
          Start new evaluation
        </Button>
        <Link to="/questionnaire">
          <Button variant="secondary">Refine answers</Button>
        </Link>
      </div>
    </div>
  )
}
