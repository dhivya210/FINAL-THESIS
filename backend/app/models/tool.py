"""Tool metadata model."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy import JSON, Boolean, Column, Float, Integer, String, Text

from app.core.database import Base


class Tool(Base):
    """Represents an automation tool with scoring metadata."""

    __tablename__ = "tools"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String(100), unique=True, nullable=False)
    slug: str = Column(String(120), unique=True, nullable=False)
    tagline: Optional[str] = Column(String(200))
    summary: Optional[str] = Column(Text)
    overall_score: float = Column(Float, nullable=False, default=0)
    pricing_tier: str = Column(String(50), nullable=False, default="free")
    ai_capability: int = Column(Integer, nullable=False, default=3)
    ci_cd_support: bool = Column(Boolean, nullable=False, default=True)
    supports_cross_browser: bool = Column(Boolean, nullable=False, default=True)
    has_mobile_support: bool = Column(Boolean, nullable=False, default=False)
    supports_api: bool = Column(Boolean, nullable=False, default=True)
    maintenance_effort: int = Column(Integer, nullable=False, default=3)
    reporting_quality: int = Column(Integer, nullable=False, default=3)
    execution_speed: int = Column(Integer, nullable=False, default=3)
    analytics_depth: int = Column(Integer, nullable=False, default=3)
    community_strength: int = Column(Integer, nullable=False, default=3)
    onboarding_time_minutes: Optional[int] = Column(Integer)
    avg_dev_steps: Optional[int] = Column(Integer)
    avg_execution_seconds: Optional[float] = Column(Float)
    learning_curve: str = Column(String(50), nullable=False, default="medium")
    recommended_team_skill: str = Column(String(50), nullable=False, default="medium")
    preferred_project_types: Dict[str, Any] = Column(JSON, nullable=False, default=dict)
    languages_supported: List[str] = Column(JSON, nullable=False, default=list)
    criteria_scores: Dict[str, Any] = Column(JSON, nullable=False, default=dict)
    pros: List[str] = Column(JSON, nullable=False, default=list)
    cons: List[str] = Column(JSON, nullable=False, default=list)
    additional_metadata: Dict[str, Any] = Column(JSON, nullable=False, default=dict)

    def as_dict(self) -> Dict[str, Any]:
        """Return a serialisable dictionary representation."""

        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "tagline": self.tagline,
            "summary": self.summary,
            "overall_score": self.overall_score,
            "pricing_tier": self.pricing_tier,
            "ai_capability": self.ai_capability,
            "ci_cd_support": self.ci_cd_support,
            "supports_cross_browser": self.supports_cross_browser,
            "has_mobile_support": self.has_mobile_support,
            "supports_api": self.supports_api,
            "maintenance_effort": self.maintenance_effort,
            "reporting_quality": self.reporting_quality,
            "execution_speed": self.execution_speed,
            "analytics_depth": self.analytics_depth,
            "community_strength": self.community_strength,
            "onboarding_time_minutes": self.onboarding_time_minutes,
            "avg_dev_steps": self.avg_dev_steps,
            "avg_execution_seconds": self.avg_execution_seconds,
            "learning_curve": self.learning_curve,
            "recommended_team_skill": self.recommended_team_skill,
            "preferred_project_types": self.preferred_project_types,
            "languages_supported": self.languages_supported,
            "criteria_scores": self.criteria_scores,
            "pros": self.pros,
            "cons": self.cons,
            "additional_metadata": self.additional_metadata,
        }
