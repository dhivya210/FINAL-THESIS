"""Evaluation and scoring logic for decision support."""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

from sqlalchemy.orm import Session

from app.models import Tool
from app.schemas.evaluation import (
    CriteriaScore,
    EvaluationAnswerSet,
    EvaluationResultPayload,
    ToolScoreBreakdown,
)


CRITERIA_KEYS = [
    "ai_assistance",
    "reporting",
    "maintenance",
    "execution",
    "cross_browser",
    "ci_cd",
    "budget_fit",
    "team_skill_fit",
    "language_fit",
    "analytics",
    "community",
]


def _base_weights() -> Dict[str, float]:
    return {
        "ai_assistance": 1.0,
        "reporting": 1.1,
        "maintenance": 1.2,
        "execution": 1.0,
        "cross_browser": 1.0,
        "ci_cd": 0.9,
        "budget_fit": 1.0,
        "team_skill_fit": 1.0,
        "language_fit": 0.8,
        "analytics": 0.9,
        "community": 0.6,
    }


def calculate_weights(answers: EvaluationAnswerSet) -> Dict[str, float]:
    """Derive a weight profile from questionnaire answers."""

    weights = _base_weights()

    if answers.project_type.lower() == "web":
        weights["cross_browser"] += 0.4
        weights["execution"] += 0.2
    elif answers.project_type.lower() == "mobile":
        weights["cross_browser"] += 0.2
        weights["ai_assistance"] += 0.2
    elif answers.project_type.lower() == "api":
        weights["execution"] += 0.3
        weights["maintenance"] += 0.2

    skill = answers.team_scripting_skill.lower()
    if skill == "low":
        weights["ai_assistance"] += 0.6
        weights["maintenance"] += 0.4
    elif skill == "medium":
        weights["maintenance"] += 0.2
    else:
        weights["team_skill_fit"] += 0.3
        weights["language_fit"] += 0.2

    if answers.ci_cd_required:
        weights["ci_cd"] += 0.6

    if answers.cross_browser_required:
        weights["cross_browser"] += 0.6

    if answers.ai_automation_preference >= 70:
        weights["ai_assistance"] += 0.6
    elif answers.ai_automation_preference >= 40:
        weights["ai_assistance"] += 0.3

    if answers.reporting_importance >= 70:
        weights["reporting"] += 0.6
        weights["analytics"] += 0.2
    elif answers.reporting_importance >= 40:
        weights["reporting"] += 0.3

    if answers.budget == "free":
        weights["budget_fit"] += 0.6
    elif answers.budget == "< $500":
        weights["budget_fit"] += 0.3

    if answers.test_run_frequency.lower() == "daily":
        weights["execution"] += 0.5
        weights["maintenance"] += 0.3
    elif answers.test_run_frequency.lower() == "weekly":
        weights["execution"] += 0.2

    if answers.maintenance_team_size == ">10":
        weights["maintenance"] -= 0.2
    elif answers.maintenance_team_size == "1-3":
        weights["maintenance"] += 0.4

    if answers.preferred_approach.lower() == "scriptless":
        weights["ai_assistance"] += 0.4
        weights["maintenance"] += 0.3
    elif answers.preferred_approach.lower() == "keyword-driven":
        weights["team_skill_fit"] += 0.2
    else:  # hybrid
        weights["team_skill_fit"] += 0.3
        weights["maintenance"] += 0.2

    if answers.expected_duration == ">1 year":
        weights["maintenance"] += 0.4
        weights["community"] += 0.2
    elif answers.expected_duration == "<6 months":
        weights["execution"] += 0.2

    # Normalise: ensure weights are positive
    for key in weights:
        weights[key] = round(max(weights[key], 0.2), 2)

    return weights


def _scale(value: float, min_value: float = 0, max_value: float = 5) -> float:
    clipped = min(max(value, min_value), max_value)
    return round(clipped, 2)


def _budget_score(tool: Tool, budget: str) -> float:
    tier_map = {
        "free": 5,
        "< $500": 4,
        "> $500": 2,
        "enterprise": 1,
    }
    desired = tier_map.get(budget, 3)
    tool_tier = tier_map.get(tool.pricing_tier, 3)
    score = 5 - abs(desired - tool_tier)
    return _scale(score)


def _team_fit(tool: Tool, skill: str) -> float:
    mapping = {"low": 1, "medium": 3, "high": 5}
    tool_skill_map = {"low": 2, "medium": 3, "high": 4}
    desired = mapping.get(skill.lower(), 3)
    tool_val = tool_skill_map.get(tool.recommended_team_skill.lower(), 3)
    score = 5 - abs(desired - tool_val)
    return _scale(score)


def _language_fit(tool: Tool, language: str) -> float:
    if language.lower() == "other":
        return 3.0
    supported = [lang.lower() for lang in tool.languages_supported]
    return 5.0 if language.lower() in supported else 2.5


def compute_scores(
    tools: List[Tool],
    answers: EvaluationAnswerSet,
    weights: Dict[str, float],
) -> Tuple[List[ToolScoreBreakdown], List[int], List[str], List[Dict[str, Any]]]:
    """Compute scores for each tool and return ranking and chart data."""

    scored: List[ToolScoreBreakdown] = []

    for tool in tools:
        criteria_map = tool.criteria_scores or {}
        criteria_breakdown: Dict[str, CriteriaScore] = {}

        maintenance_value = 6 - (tool.maintenance_effort or 3)
        total = 0.0
        max_possible = 0.0

        for key in CRITERIA_KEYS:
            weight = weights.get(key, 1.0)
            max_possible += 5 * weight

            if key == "ai_assistance":
                value = _scale(criteria_map.get("ai_assistance", tool.ai_capability))
                rationale = "AI-driven authoring and maintenance support"
            elif key == "reporting":
                value = _scale(criteria_map.get("reporting_quality", tool.reporting_quality))
                rationale = "Depth of reporting, analytics, and insights"
            elif key == "maintenance":
                value = _scale(criteria_map.get("maintenance", maintenance_value))
                rationale = "Expected maintenance effort from seed data"
            elif key == "execution":
                value = _scale(criteria_map.get("execution_speed", tool.execution_speed))
                rationale = "Execution speed benchmarks"
            elif key == "cross_browser":
                value = _scale(criteria_map.get("cross_browser_support", 5 if tool.supports_cross_browser else 3))
                rationale = "Cross-browser/device coverage capabilities"
            elif key == "ci_cd":
                value = _scale(criteria_map.get("ci_cd", 5 if tool.ci_cd_support else 3))
                rationale = "Strength of CI/CD integrations"
            elif key == "budget_fit":
                value = _budget_score(tool, answers.budget)
                rationale = "Alignment with stated budget"
            elif key == "team_skill_fit":
                value = _team_fit(tool, answers.team_scripting_skill)
                rationale = "Fit for team scripting proficiency"
            elif key == "language_fit":
                value = _scale(criteria_map.get("language_fit", _language_fit(tool, answers.primary_language)))
                rationale = "Support for preferred language"
            elif key == "analytics":
                value = _scale(criteria_map.get("analytics_depth", tool.analytics_depth))
                rationale = "Analytics depth and dashboards"
            elif key == "community":
                value = _scale(criteria_map.get("community_strength", tool.community_strength))
                rationale = "Ecosystem maturity and community strength"
            else:
                value = 3.0
                rationale = "Generic criteria"

            contribution = value * weight
            total += contribution
            criteria_breakdown[key] = CriteriaScore(value=value, rationale=rationale)

        normalized = round((total / max_possible) * 100, 2) if max_possible else 0.0

        scored.append(
            ToolScoreBreakdown(
                tool_id=tool.id,
                tool_name=tool.name,
                total_score=round(total, 2),
                normalized_score=normalized,
                rank=0,
                criteria=criteria_breakdown,
                summary=tool.summary or "",
                recommended_use_cases=tool.additional_metadata.get("best_for", []),
            )
        )

    scored.sort(key=lambda entry: entry.total_score, reverse=True)
    for idx, entry in enumerate(scored, start=1):
        entry.rank = idx

    radar_categories = [
        "AI Assistance",
        "Reporting",
        "Maintenance",
        "Execution",
        "Cross Browser",
        "CI/CD",
        "Budget Fit",
        "Team Fit",
        "Language Fit",
        "Analytics",
        "Community",
    ]

    bar_chart: List[Dict[str, Any]] = []
    for entry in scored[:5]:
        bar_chart.append(
            {
                "tool": entry.tool_name,
                "score": entry.normalized_score,
                "maintenance": entry.criteria["maintenance"].value,
                "reporting": entry.criteria["reporting"].value,
                "ai": entry.criteria["ai_assistance"].value,
            }
        )

    top_ids = [entry.tool_id for entry in scored[:3]]

    return scored, top_ids, radar_categories, bar_chart


class EvaluationEngine:
    """Facade for executing evaluation workflows."""

    @staticmethod
    def run(session: Session, answers: EvaluationAnswerSet, weight_overrides: Dict[str, float] | None = None) -> EvaluationResultPayload:
        tools = session.query(Tool).order_by(Tool.overall_score.desc()).all()
        weights = calculate_weights(answers)

        if weight_overrides:
            for key, value in weight_overrides.items():
                if key in weights:
                    weights[key] = round(max(value, 0.1), 2)

        scored, top_ids, radar_categories, bar_chart = compute_scores(tools, answers, weights)

        return EvaluationResultPayload(
            evaluation=None,  # to be filled by caller once persisted
            default_weights=weights,
            scored_tools=scored,
            recommended_tool_ids=top_ids,
            radar_categories=radar_categories,
            bar_chart_data=bar_chart,
        )
