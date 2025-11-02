"""Database bootstrap and seeding helpers."""

from __future__ import annotations

from sqlalchemy import inspect

from app.core.config import get_settings
from app.core.database import Base, engine, session_scope
from app.models import Tool, User
from app.utils.security import hash_password
from .tool_data import SEED_TOOLS


def ensure_seed_data() -> None:
    """Create tables and populate default records when empty."""

    Base.metadata.create_all(bind=engine)

    settings = get_settings()

    with session_scope() as session:
        inspector = inspect(engine)
        if "users" not in inspector.get_table_names():
            return

        user_count = session.query(User).count()
        if user_count == 0:
            session.add(
                User(
                    email=settings.default_admin_email,
                    full_name="QA Lead",
                    role="qa_lead",
                    hashed_password=hash_password(settings.default_admin_password),
                )
            )

        tool_count = session.query(Tool).count()
        if tool_count == 0:
            for tool in SEED_TOOLS:
                session.add(Tool(**tool))
