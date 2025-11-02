import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { apiClient } from '../services/api'
import type { CriteriaKey, EvaluationAnswers, EvaluationResult, ToolScore } from '../types'
import { recalculateScores } from '../utils/scoring'

interface EvaluationContextState {
  activeResult: EvaluationResult | null
  reweightedTools: ToolScore[]
  answers: EvaluationAnswers | null
  weightOverrides: Record<CriteriaKey, number>
  loading: boolean
  setActiveResult: (result: EvaluationResult) => void
  updateWeights: (weights: Partial<Record<CriteriaKey, number>>) => void
  resetWeights: () => void
  clear: () => void
  fetchEvaluation: (id: string) => Promise<EvaluationResult>
}

const EvaluationContext = createContext<EvaluationContextState | undefined>(undefined)

export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const [activeResult, setResultState] = useState<EvaluationResult | null>(null)
  const [answers, setAnswers] = useState<EvaluationAnswers | null>(null)
  const [weightOverrides, setWeightOverrides] = useState<Record<CriteriaKey, number>>({} as Record<CriteriaKey, number>)
  const [reweightedTools, setReweightedTools] = useState<ToolScore[]>([])
  const [loading, setLoading] = useState(false)

  const recompute = useCallback(
    (base: EvaluationResult, overrides: Record<CriteriaKey, number>) => {
      const tools = recalculateScores(base, overrides)
      setReweightedTools(tools)
    },
    []
  )

  const setActiveResult = useCallback((result: EvaluationResult) => {
    setResultState(result)
    const defaultAnswers = result.evaluation?.answers ?? null
    setAnswers(defaultAnswers)
    setWeightOverrides({} as Record<CriteriaKey, number>)
    setReweightedTools(result.scored_tools)
  }, [])

  const updateWeights = useCallback(
    (updates: Partial<Record<CriteriaKey, number>>) => {
      if (!activeResult) return
      const merged = { ...weightOverrides, ...updates } as Record<CriteriaKey, number>
      setWeightOverrides(merged)
      recompute(activeResult, merged)
    },
    [activeResult, recompute, weightOverrides]
  )

  const resetWeights = useCallback(() => {
    if (!activeResult) return
    setWeightOverrides({} as Record<CriteriaKey, number>)
    setReweightedTools(activeResult.scored_tools)
  }, [activeResult])

  const clear = useCallback(() => {
    setResultState(null)
    setAnswers(null)
    setWeightOverrides({} as Record<CriteriaKey, number>)
    setReweightedTools([])
  }, [])

  const fetchEvaluation = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { data } = await apiClient.get<EvaluationResult>(`/evaluations/${id}`)
      setActiveResult(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [setActiveResult])

  const value = useMemo(
    () => ({
      activeResult,
      reweightedTools,
      answers,
      weightOverrides,
      loading,
      setActiveResult,
      updateWeights,
      resetWeights,
      clear,
      fetchEvaluation
    }),
    [activeResult, answers, clear, fetchEvaluation, loading, resetWeights, reweightedTools, updateWeights, weightOverrides]
  )

  return <EvaluationContext.Provider value={value}>{children}</EvaluationContext.Provider>
}

export const useEvaluation = (): EvaluationContextState => {
  const context = useContext(EvaluationContext)
  if (!context) {
    throw new Error('useEvaluation must be used within EvaluationProvider')
  }
  return context
}
