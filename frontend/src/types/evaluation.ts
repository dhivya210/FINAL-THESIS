export type CriteriaKey =
  | 'ai_assistance'
  | 'reporting'
  | 'maintenance'
  | 'execution'
  | 'cross_browser'
  | 'ci_cd'
  | 'budget_fit'
  | 'team_skill_fit'
  | 'language_fit'
  | 'analytics'
  | 'community'

export interface CriteriaScore {
  value: number
  rationale: string
}

export interface ToolScore {
  tool_id: number
  tool_name: string
  total_score: number
  normalized_score: number
  rank: number
  criteria: Record<CriteriaKey, CriteriaScore>
  summary: string
  recommended_use_cases: string[]
}

export interface EvaluationAnswers {
  project_type: string
  team_scripting_skill: string
  primary_language: string
  budget: string
  test_run_frequency: string
  ci_cd_required: boolean
  ai_automation_preference: number
  maintenance_team_size: string
  cross_browser_required: boolean
  reporting_importance: number
  preferred_approach: string
  expected_duration: string
}

export interface EvaluationRecord {
  id: string
  title: string
  summary?: string | null
  answers: EvaluationAnswers
  weight_profile: Record<CriteriaKey, number>
  created_at: string
  updated_at: string
  status: string
}

export interface EvaluationResult {
  evaluation: EvaluationRecord | null
  default_weights: Record<CriteriaKey, number>
  scored_tools: ToolScore[]
  recommended_tool_ids: number[]
  radar_categories: string[]
  bar_chart_data: Array<Record<string, any>>
}

export interface ToolModel {
  id: number
  name: string
  slug: string
  tagline?: string
  summary?: string
  overall_score: number
  pricing_tier: string
  ai_capability: number
  ci_cd_support: boolean
  supports_cross_browser: boolean
  has_mobile_support: boolean
  supports_api: boolean
  maintenance_effort: number
  reporting_quality: number
  execution_speed: number
  analytics_depth: number
  community_strength: number
  onboarding_time_minutes?: number | null
  avg_dev_steps?: number | null
  avg_execution_seconds?: number | null
  learning_curve: string
  recommended_team_skill: string
  preferred_project_types: Record<string, number>
  languages_supported: string[]
  criteria_scores: Record<string, number>
  pros: string[]
  cons: string[]
  additional_metadata: Record<string, any>
}
