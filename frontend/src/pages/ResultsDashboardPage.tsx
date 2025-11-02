import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  PolarAngleAxis,
  Radar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from 'recharts'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { RangeSlider } from '../components/ui/RangeSlider'
import { useEvaluation } from '../context/EvaluationContext'
import type { CriteriaKey } from '../types'
import { buildRadarDataset, CRITERIA_LABELS } from '../utils/scoring'

const radarPalette = ['#4f46e5', '#0ea5e9', '#14b8a6']

const sliderFromWeight = (weight: number) => Math.round(weight * 50)
const weightFromSlider = (value: number) => parseFloat((value / 50).toFixed(2))

export const ResultsDashboardPage = () => {
  const { activeResult, reweightedTools, updateWeights, resetWeights } = useEvaluation()
  const [localWeights, setLocalWeights] = useState<Record<CriteriaKey, number>>({} as Record<CriteriaKey, number>)

  useEffect(() => {
    if (activeResult) {
      setLocalWeights(activeResult.default_weights)
    }
  }, [activeResult])

  const leadingTools = useMemo(() => reweightedTools.slice(0, 3), [reweightedTools])
  const radarData = useMemo(() => buildRadarDataset(leadingTools), [leadingTools])

  const barData = useMemo(() => {
    return reweightedTools.map((tool) => ({
      tool: tool.tool_name,
      Score: tool.normalized_score,
      Reporting: tool.criteria.reporting.value,
      Maintenance: tool.criteria.maintenance.value,
      'AI Assistance': tool.criteria.ai_assistance.value
    }))
  }, [reweightedTools])

  if (!activeResult) {
    return (
      <Card className="p-10">
        <div className="space-y-4 text-center">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">No evaluation yet</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Complete the guided questionnaire to generate your first set of recommendations.
          </p>
          <Link to="/questionnaire">
            <Button>Start questionnaire</Button>
          </Link>
        </div>
      </Card>
    )
  }

  const handleWeightChange = (key: CriteriaKey, sliderValue: number) => {
    const weight = weightFromSlider(sliderValue)
    setLocalWeights((prev) => ({ ...prev, [key]: weight }))
    updateWeights({ [key]: weight })
  }

  const handleReset = () => {
    setLocalWeights(activeResult.default_weights)
    resetWeights()
  }

  const topThree = leadingTools

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Results Dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Compare the top recommendations generated from your inputs. Adjust weighting sliders to test what-if scenarios
            before moving forward with funding or pilot decisions.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/comparison">
            <Button variant="secondary">Go to tool comparison</Button>
          </Link>
          <Link to="/report">
            <Button>View executive report</Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {topThree.map((tool) => (
          <Card key={tool.tool_id} className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-primary-500">Rank {tool.rank}</span>
              <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-200">
                {tool.normalized_score.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{tool.tool_name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{tool.summary}</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500 dark:text-slate-400">
              {tool.recommended_use_cases.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weight sliders</h3>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Rebalance the importance of each dimension. Scores update instantly to reflect the new emphasis.
          </p>
          <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '480px' }}>
            {(Object.keys(CRITERIA_LABELS) as CriteriaKey[]).map((key) => (
              <RangeSlider
                key={key}
                label={CRITERIA_LABELS[key]}
                value={sliderFromWeight(localWeights[key] ?? activeResult.default_weights[key])}
                min={20}
                max={200}
                step={5}
                onChange={(value) => handleWeightChange(key, value)}
                description={`Base weight ${(activeResult.default_weights[key] ?? 0).toFixed(2)}`}
              />
            ))}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Capability radar</h3>
            <div className="h-80">
              <ResponsiveContainer>
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="rgba(148, 163, 184, 0.35)" />
                  <PolarAngleAxis dataKey="criteria" tick={{ fill: 'currentColor', fontSize: 11 }} />
                  <PolarRadiusAxis angle={45} domain={[0, 5]} stroke="rgba(148, 163, 184, 0.35)" />
                  {topThree.map((tool, index) => (
                    <Radar
                      key={tool.tool_id}
                      name={tool.tool_name}
                      dataKey={tool.tool_name}
                      stroke={radarPalette[index % radarPalette.length]}
                      fill={radarPalette[index % radarPalette.length]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Score breakdown</h3>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
                  <XAxis dataKey="tool" stroke="currentColor" tick={{ fontSize: 12 }} />
                  <YAxis stroke="currentColor" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Score" fill="#4f46e5" radius={8} />
                  <Bar dataKey="Reporting" fill="#0ea5e9" radius={8} />
                  <Bar dataKey="Maintenance" fill="#f97316" radius={8} />
                  <Bar dataKey="AI Assistance" fill="#14b8a6" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
