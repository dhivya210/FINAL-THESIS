import type { CriteriaKey, EvaluationResult, ToolScore } from '../types'

export const CRITERIA_LABELS: Record<CriteriaKey, string> = {
  ai_assistance: 'AI Assistance',
  reporting: 'Reporting',
  maintenance: 'Maintenance',
  execution: 'Execution',
  cross_browser: 'Cross Browser',
  ci_cd: 'CI/CD',
  budget_fit: 'Budget Fit',
  team_skill_fit: 'Team Fit',
  language_fit: 'Language Fit',
  analytics: 'Analytics',
  community: 'Community'
}

export const normaliseWeights = (weights: Record<CriteriaKey, number>) => {
  const entries = Object.entries(weights) as Array<[CriteriaKey, number]>
  const sum = entries.reduce((total, [, weight]) => total + weight, 0)
  if (sum === 0) return weights
  const factor = entries.length / sum
  const normalised: Record<CriteriaKey, number> = { ...weights }
  entries.forEach(([key, weight]) => {
    normalised[key] = parseFloat((weight * factor).toFixed(2))
  })
  return normalised
}

export const recalculateScores = (
  baseResult: EvaluationResult,
  weightOverrides: Record<CriteriaKey, number>
): ToolScore[] => {
  const weights = { ...baseResult.default_weights, ...weightOverrides }
  const maxPossible = Object.values(weights).reduce((total, weight) => total + weight * 5, 0)

  const recomputed = baseResult.scored_tools.map((tool) => {
    let totalScore = 0

    (Object.entries(weights) as Array<[CriteriaKey, number]>).forEach(([key, weight]) => {
      const value = tool.criteria[key]?.value ?? 0
      totalScore += value * weight
    })

    const normalized = maxPossible ? (totalScore / maxPossible) * 100 : 0

    return {
      ...tool,
      total_score: parseFloat(totalScore.toFixed(2)),
      normalized_score: parseFloat(normalized.toFixed(2))
    }
  })

  recomputed.sort((a, b) => b.total_score - a.total_score)
  recomputed.forEach((tool, index) => {
    tool.rank = index + 1
  })

  return recomputed
}

export const buildRadarDataset = (tools: ToolScore[]) => {
  const keys = Object.keys(CRITERIA_LABELS) as CriteriaKey[]
  return keys.map((key) => {
    const row: Record<string, any> = { criteria: CRITERIA_LABELS[key] }
    tools.forEach((tool) => {
      row[tool.tool_name] = tool.criteria[key]?.value ?? 0
    })
    return row
  })
}
