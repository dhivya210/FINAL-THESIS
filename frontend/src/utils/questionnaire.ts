import type { EvaluationAnswers } from '../types'

export interface QuestionDescriptor {
  id: keyof EvaluationAnswers
  label: string
  description: string
  type: 'dropdown' | 'radio' | 'toggle' | 'slider'
  options?: Array<{ label: string; value: string }>
  slider?: {
    min: number
    max: number
    step: number
    markers: Array<{ value: number; label: string }>
  }
  helpfulHint: string
}

export const defaultAnswers: EvaluationAnswers = {
  project_type: 'Web',
  team_scripting_skill: 'Medium',
  primary_language: 'JavaScript',
  budget: '< $500',
  test_run_frequency: 'Weekly',
  ci_cd_required: true,
  ai_automation_preference: 40,
  maintenance_team_size: '4-10',
  cross_browser_required: true,
  reporting_importance: 60,
  preferred_approach: 'Hybrid',
  expected_duration: '6-12 months'
}

export const questionnaire: QuestionDescriptor[] = [
  {
    id: 'project_type',
    label: 'Project Type',
    description: 'What type of product are you primarily automating? Choose the closest fit.',
    type: 'dropdown',
    options: [
      { label: 'Web', value: 'Web' },
      { label: 'Mobile', value: 'Mobile' },
      { label: 'API', value: 'API' },
      { label: 'Desktop', value: 'Desktop' }
    ],
    helpfulHint: 'Determines emphasis on cross-browser/device coverage.'
  },
  {
    id: 'team_scripting_skill',
    label: 'Team Scripting Skill',
    description: 'How comfortable is the maintenance team with code-first frameworks?',
    type: 'radio',
    options: [
      { label: 'Low', value: 'Low' },
      { label: 'Medium', value: 'Medium' },
      { label: 'High', value: 'High' }
    ],
    helpfulHint: 'Impacts recommendation between scriptless vs code-centric tooling.'
  },
  {
    id: 'primary_language',
    label: 'Primary Language',
    description: 'Which language do you expect the team to prefer for authoring?',
    type: 'dropdown',
    options: [
      { label: 'Python', value: 'Python' },
      { label: 'JavaScript', value: 'JavaScript' },
      { label: 'Java', value: 'Java' },
      { label: 'C#', value: 'C#' },
      { label: 'Other', value: 'Other' }
    ],
    helpfulHint: 'Language alignment influences onboarding and productivity.'
  },
  {
    id: 'budget',
    label: 'Budget',
    description: 'What level of annual investment is available for tooling & platform?',
    type: 'dropdown',
    options: [
      { label: 'Free', value: 'Free' },
      { label: '< $500', value: '< $500' },
      { label: '> $500', value: '> $500' }
    ],
    helpfulHint: 'Budget guides consideration of commercial vs open-source solutions.'
  },
  {
    id: 'test_run_frequency',
    label: 'Test Run Frequency',
    description: 'How often must suites run in CI or on-demand?',
    type: 'radio',
    options: [
      { label: 'Daily', value: 'Daily' },
      { label: 'Weekly', value: 'Weekly' },
      { label: 'On-demand', value: 'On-demand' }
    ],
    helpfulHint: 'Influences weighting towards execution speed and reliability.'
  },
  {
    id: 'ci_cd_required',
    label: 'CI/CD Integration Required?',
    description: 'Do you need native CI/CD connectors and pipelines?',
    type: 'toggle',
    helpfulHint: 'Prioritises tools with built-in pipelines and webhooks.'
  },
  {
    id: 'ai_automation_preference',
    label: 'AI Automation Preference',
    description: 'How strongly should recommendations favour AI-augmented authoring?',
    type: 'slider',
    slider: {
      min: 0,
      max: 100,
      step: 10,
      markers: [
        { value: 10, label: 'Low' },
        { value: 50, label: 'Medium' },
        { value: 90, label: 'High' }
      ]
    },
    helpfulHint: 'Higher values elevate platforms with auto-healing and AI suggestions.'
  },
  {
    id: 'maintenance_team_size',
    label: 'Team Size for Maintenance',
    description: 'How many people will maintain automated suites long term?',
    type: 'radio',
    options: [
      { label: '1?3', value: '1-3' },
      { label: '4?10', value: '4-10' },
      { label: '>10', value: '>10' }
    ],
    helpfulHint: 'Smaller teams benefit from lower maintenance footprints.'
  },
  {
    id: 'cross_browser_required',
    label: 'Cross-Browser/Device Required?',
    description: 'Do you require broad cross-browser and mobile device coverage?',
    type: 'toggle',
    helpfulHint: 'Boosts weight for multi-browser and device support.'
  },
  {
    id: 'reporting_importance',
    label: 'Importance of Detailed Reporting',
    description: 'How critical are analytics, dashboards, and rich reporting?',
    type: 'slider',
    slider: {
      min: 0,
      max: 100,
      step: 10,
      markers: [
        { value: 10, label: 'Low' },
        { value: 50, label: 'Medium' },
        { value: 90, label: 'High' }
      ]
    },
    helpfulHint: 'Higher values favour tools with executive-friendly reporting.'
  },
  {
    id: 'preferred_approach',
    label: 'Preferred Automation Approach',
    description: 'Which authoring style best matches your strategy?',
    type: 'dropdown',
    options: [
      { label: 'Keyword-driven', value: 'Keyword-driven' },
      { label: 'Scriptless', value: 'Scriptless' },
      { label: 'Hybrid', value: 'Hybrid' }
    ],
    helpfulHint: 'Aligns recommendations to low-code vs pro-code platforms.'
  },
  {
    id: 'expected_duration',
    label: 'Expected Programme Duration',
    description: 'How long will this testing initiative run?',
    type: 'dropdown',
    options: [
      { label: '<6 months', value: '<6 months' },
      { label: '6?12 months', value: '6-12 months' },
      { label: '>1 year', value: '>1 year' }
    ],
    helpfulHint: 'Longer timelines emphasise maintainability and community support.'
  }
]
