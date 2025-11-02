"""Tool catalogue endpoints."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models import Tool
from app.schemas.tool import ToolCreate, ToolOut, ToolUpdate


router = APIRouter(prefix="/tools", tags=["tools"])


@router.get("/", response_model=List[ToolOut])
def list_tools(session: Session = Depends(deps.get_db_session)) -> List[ToolOut]:
    tools = session.query(Tool).order_by(Tool.overall_score.desc()).all()
    return tools


@router.get("/{tool_id}", response_model=ToolOut)
def get_tool(tool_id: int, session: Session = Depends(deps.get_db_session)) -> ToolOut:
    tool = session.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    return tool


@router.post("/", response_model=ToolOut)
def create_tool(
    payload: ToolCreate,
    session: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_user),
) -> ToolOut:
    tool = Tool(**payload.dict())
    session.add(tool)
    session.commit()
    session.refresh(tool)
    return tool


@router.put("/{tool_id}", response_model=ToolOut)
def update_tool(
    tool_id: int,
    payload: ToolUpdate,
    session: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_user),
) -> ToolOut:
    tool = session.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(tool, key, value)

    session.add(tool)
    session.commit()
    session.refresh(tool)
    return tool


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tool(
    tool_id: int,
    session: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_user),
) -> None:
    tool = session.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")

    session.delete(tool)
    session.commit()


@router.get("/export/json", response_model=List[ToolOut])
def export_tools(session: Session = Depends(deps.get_db_session)) -> List[ToolOut]:
    """Export the current tool catalogue as JSON for client-side download."""

    return session.query(Tool).order_by(Tool.name.asc()).all()


@router.post("/import/json", response_model=List[ToolOut])
def import_tools(
    catalogue: List[ToolCreate],
    session: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_user),
) -> List[ToolOut]:
    """Replace the catalogue with the provided JSON payload."""

    session.query(Tool).delete()
    session.commit()

    created = []
    for entry in catalogue:
        tool = Tool(**entry.dict())
        session.add(tool)
        created.append(tool)

    session.commit()
    for tool in created:
        session.refresh(tool)

    return created
