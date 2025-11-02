"""Pydantic schemas for evaluations and scoring."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


QUESTION_KEYS = [
    "project_type",
    "team_scripting_skill",
    "primary_language",
    "budget",
    "test_run_frequency",
    "ci_cd_required",
    "ai_automation_preference",
    "maintenance_team_size",
    "cross_browser_required",
    "reporting_importance",
    "preferred_approach",
    "expected_duration",
]


class EvaluationAnswerSet(BaseModel):
    project_type: str
    team_scripting_skill: str
    primary_language: str
    budget: str
    test_run_frequency: str
    ci_cd_required: bool
    ai_automation_preference: int
    maintenance_team_size: str
    cross_browser_required: bool
    reporting_importance: int
    preferred_approach: str
    expected_duration: str


class CriteriaScore(BaseModel):
    value: float
    rationale: str


class ToolScoreBreakdown(BaseModel):
    tool_id: int
    tool_name: str
    total_score: float
    normalized_score: float
    rank: int
    criteria: Dict[str, CriteriaScore]
    summary: str
    recommended_use_cases: List[str]


class EvaluationBase(BaseModel):
    title: str = Field(default="Untitled Evaluation", max_length=150)
    summary: Optional[str] = None
    answers: EvaluationAnswerSet
    weight_profile: Dict[str, float] = Field(default_factory=dict)
    results_snapshot: Dict[str, Any] = Field(default_factory=dict)
    status: str = Field(default="draft")


class EvaluationCreate(EvaluationBase):
    pass


class EvaluationUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    answers: Optional[EvaluationAnswerSet] = None
    weight_profile: Optional[Dict[str, float]] = None
    results_snapshot: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class EvaluationOut(EvaluationBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class EvaluationResultPayload(BaseModel):
    evaluation: Optional[EvaluationOut]
    default_weights: Dict[str, float]
    scored_tools: List[ToolScoreBreakdown]
    recommended_tool_ids: List[int]
    radar_categories: List[str]
    bar_chart_data: List[Dict[str, Any]]


class EvaluationRequest(BaseModel):
    title: Optional[str] = Field(default="Untitled Evaluation")
    summary: Optional[str] = None
    answers: EvaluationAnswerSet
    weight_overrides: Optional[Dict[str, float]] = None
    persist: bool = True

