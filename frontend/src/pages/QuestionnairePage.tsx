import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Toggle } from '../components/ui/Toggle'
import { RangeSlider } from '../components/ui/RangeSlider'
import { questionnaire, defaultAnswers } from '../utils/questionnaire'
import type { EvaluationAnswers, EvaluationResult } from '../types'
import { useEvaluation } from '../context/EvaluationContext'
import { apiClient } from '../services/api'

const totalSteps = questionnaire.length

export const QuestionnairePage = () => {
  const navigate = useNavigate()
  const { setActiveResult } = useEvaluation()
  const [answers, setAnswers] = useState<EvaluationAnswers>(defaultAnswers)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questionnaire[step]
  const progress = useMemo(() => Math.round(((step + 1) / totalSteps) * 100), [step])

  const updateAnswer = (id: keyof EvaluationAnswers, value: string | boolean | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const persistEvaluation = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: 'QA Evaluation',
        answers,
        persist: true
      }
      const { data } = await apiClient.post<EvaluationResult>('/evaluations/run', payload)
      setActiveResult(data)
      return data
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? 'Unable to save evaluation. Please try again.'
      setError(message)
      throw new Error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    const result = await persistEvaluation()
    if (result) {
      navigate('/results')
    }
  }

  const handleSaveDraft = async () => {
    await persistEvaluation()
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Project Questionnaire</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Answer the twelve cues below. We store your responses as you go so you can revisit and refine weighting later.
        </p>
        <ProgressBar value={progress} />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Step {step + 1} of {totalSteps}
        </p>
      </div>

      <Card className="p-6 md:p-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">Question {step + 1}</p>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{currentQuestion.label}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{currentQuestion.description}</p>
          </div>

          {currentQuestion.type === 'dropdown' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Select an option</label>
              <select
                value={answers[currentQuestion.id] as string}
                onChange={(event) => updateAnswer(currentQuestion.id, event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900/80"
              >
                {currentQuestion.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentQuestion.type === 'radio' && (
            <div className="grid gap-3 md:grid-cols-3">
              {currentQuestion.options?.map((option) => {
                const checked = answers[currentQuestion.id] === option.value
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => updateAnswer(currentQuestion.id, option.value)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                      checked
                        ? 'border-primary-500 bg-primary-500/15 text-primary-600 dark:border-primary-400 dark:text-primary-200'
                        : 'border-slate-200 bg-white/70 text-slate-600 hover:border-primary-200 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-semibold">{option.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {currentQuestion.type === 'toggle' && (
            <Toggle
              enabled={Boolean(answers[currentQuestion.id])}
              onChange={(value) => updateAnswer(currentQuestion.id, value)}
              label={currentQuestion.label}
              hint={currentQuestion.helpfulHint}
            />
          )}

          {currentQuestion.type === 'slider' && currentQuestion.slider && (
            <RangeSlider
              label={currentQuestion.label}
              value={answers[currentQuestion.id] as number}
              min={currentQuestion.slider.min}
              max={currentQuestion.slider.max}
              step={currentQuestion.slider.step}
              onChange={(value) => updateAnswer(currentQuestion.id, value)}
              description={currentQuestion.helpfulHint}
            />
          )}

          <div className="rounded-2xl bg-slate-100/60 p-4 text-sm text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
            {currentQuestion.helpfulHint}
          </div>

          {error && <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleBack} disabled={step === 0 || saving}>
                Back
              </Button>
              <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
                Save progress
              </Button>
            </div>
            {step === totalSteps - 1 ? (
              <Button onClick={handleSubmit} disabled={saving} className="min-w-[160px]">
                {saving ? 'Calculating...' : 'Generate recommendations'}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={saving}>
                Next
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
