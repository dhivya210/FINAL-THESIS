"""create core tables

Revision ID: 20241102_01
Revises: 
Create Date: 2025-11-02 00:00:00.000000

"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20241102_01"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=120), nullable=False, unique=True),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, default="qa_lead"),
        sa.Column("hashed_password", sa.String(length=200), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "tools",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
        sa.Column("slug", sa.String(length=120), nullable=False, unique=True),
        sa.Column("tagline", sa.String(length=200), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("overall_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("pricing_tier", sa.String(length=50), nullable=False, server_default="free"),
        sa.Column("ai_capability", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("ci_cd_support", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("supports_cross_browser", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("has_mobile_support", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("supports_api", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("maintenance_effort", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("reporting_quality", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("execution_speed", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("analytics_depth", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("community_strength", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("onboarding_time_minutes", sa.Integer(), nullable=True),
        sa.Column("avg_dev_steps", sa.Integer(), nullable=True),
        sa.Column("avg_execution_seconds", sa.Float(), nullable=True),
        sa.Column("learning_curve", sa.String(length=50), nullable=False, server_default="medium"),
        sa.Column("recommended_team_skill", sa.String(length=50), nullable=False, server_default="medium"),
        sa.Column("preferred_project_types", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("languages_supported", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("criteria_scores", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("pros", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("cons", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("additional_metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
    )

    op.create_table(
        "evaluations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("title", sa.String(length=150), nullable=False, server_default="Untitled Evaluation"),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("answers", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("weight_profile", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("results_snapshot", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="draft"),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("evaluations")
    op.drop_table("tools")
    op.drop_table("users")
