"""Pydantic schemas for tool resources."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ToolBase(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str
    tagline: Optional[str] = None
    summary: Optional[str] = None
    overall_score: float = 0.0
    pricing_tier: str = "free"
    ai_capability: int = 3
    ci_cd_support: bool = True
    supports_cross_browser: bool = True
    has_mobile_support: bool = False
    supports_api: bool = True
    maintenance_effort: int = 3
    reporting_quality: int = 3
    execution_speed: int = 3
    analytics_depth: int = 3
    community_strength: int = 3
    onboarding_time_minutes: Optional[int] = None
    avg_dev_steps: Optional[int] = None
    avg_execution_seconds: Optional[float] = None
    learning_curve: str = "medium"
    recommended_team_skill: str = "medium"
    preferred_project_types: Dict[str, Any] = Field(default_factory=dict)
    languages_supported: List[str] = Field(default_factory=list)
    criteria_scores: Dict[str, Any] = Field(default_factory=dict)
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    additional_metadata: Dict[str, Any] = Field(default_factory=dict)


class ToolCreate(ToolBase):
    pass


class ToolUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    tagline: Optional[str] = None
    summary: Optional[str] = None
    overall_score: Optional[float] = None
    pricing_tier: Optional[str] = None
    ai_capability: Optional[int] = None
    ci_cd_support: Optional[bool] = None
    supports_cross_browser: Optional[bool] = None
    has_mobile_support: Optional[bool] = None
    supports_api: Optional[bool] = None
    maintenance_effort: Optional[int] = None
    reporting_quality: Optional[int] = None
    execution_speed: Optional[int] = None
    analytics_depth: Optional[int] = None
    community_strength: Optional[int] = None
    onboarding_time_minutes: Optional[int] = None
    avg_dev_steps: Optional[int] = None
    avg_execution_seconds: Optional[float] = None
    learning_curve: Optional[str] = None
    recommended_team_skill: Optional[str] = None
    preferred_project_types: Optional[Dict[str, Any]] = None
    languages_supported: Optional[List[str]] = None
    criteria_scores: Optional[Dict[str, Any]] = None
    pros: Optional[List[str]] = None
    cons: Optional[List[str]] = None
    additional_metadata: Optional[Dict[str, Any]] = None


class ToolOut(ToolBase):
    id: int

    class Config:
        orm_mode = True
