"""Evaluation workflow endpoints."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models import Evaluation
from app.schemas.evaluation import (
    EvaluationOut,
    EvaluationRequest,
    EvaluationResultPayload,
)
from app.services.evaluation_service import EvaluationEngine


router = APIRouter(prefix="/evaluations", tags=["evaluations"])


def _snapshot_payload(payload: EvaluationResultPayload) -> dict:
    return {
        "default_weights": payload.default_weights,
        "scored_tools": [item.model_dump() for item in payload.scored_tools],
        "recommended_tool_ids": payload.recommended_tool_ids,
        "radar_categories": payload.radar_categories,
        "bar_chart_data": payload.bar_chart_data,
    }


def _build_payload(evaluation: Evaluation) -> EvaluationResultPayload:
    snapshot = evaluation.results_snapshot or {}
    payload = EvaluationResultPayload(
        evaluation=EvaluationOut.from_orm(evaluation),
        default_weights=snapshot.get("default_weights", {}),
        scored_tools=snapshot.get("scored_tools", []),
        recommended_tool_ids=snapshot.get("recommended_tool_ids", []),
        radar_categories=snapshot.get("radar_categories", []),
        bar_chart_data=snapshot.get("bar_chart_data", []),
    )
    return payload


@router.post("/run", response_model=EvaluationResultPayload)
def run_evaluation(
    request: EvaluationRequest,
    session: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_user),
) -> EvaluationResultPayload:
    """Execute the scoring engine and optionally persist the evaluation."""

    result = EvaluationEngine.run(session, answers=request.answers, weight_overrides=request.weight_overrides)

    if request.persist:
        evaluation = Evaluation(
            title=request.title or "Untitled Evaluation",
            summary=request.summary,
            answers=request.answers.dict(),
            weight_profile=result.default_weights,
            results_snapshot=_snapshot_payload(result),
            status="completed",
        )
        session.add(evaluation)
        session.commit()
        session.refresh(evaluation)
        result.evaluation = EvaluationOut.from_orm(evaluation)
    else:
        result.evaluation = None

    return result


@router.get("/", response_model=List[EvaluationOut])
def list_evaluations(session: Session = Depends(deps.get_db_session)) -> List[EvaluationOut]:
    evaluations = session.query(Evaluation).order_by(Evaluation.created_at.desc()).all()
    return [EvaluationOut.from_orm(item) for item in evaluations]


@router.get("/{evaluation_id}", response_model=EvaluationResultPayload)
def get_evaluation(evaluation_id: str, session: Session = Depends(deps.get_db_session)) -> EvaluationResultPayload:
    evaluation = session.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluation not found")

    return _build_payload(evaluation)


@router.put("/{evaluation_id}", response_model=EvaluationResultPayload)
def update_evaluation(
    evaluation_id: str,
    request: EvaluationRequest,
    session: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_user),
) -> EvaluationResultPayload:
    evaluation = session.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluation not found")

    evaluation.title = request.title or evaluation.title
    evaluation.summary = request.summary or evaluation.summary
    evaluation.answers = request.answers.dict()

    result = EvaluationEngine.run(session, answers=request.answers, weight_overrides=request.weight_overrides)
    evaluation.weight_profile = result.default_weights
    evaluation.results_snapshot = _snapshot_payload(result)

    session.add(evaluation)
    session.commit()
    session.refresh(evaluation)

    result.evaluation = EvaluationOut.from_orm(evaluation)
    return result


@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evaluation(
    evaluation_id: str,
    session: Session = Depends(deps.get_db_session),
    _: object = Depends(deps.get_current_user),
) -> None:
    evaluation = session.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluation not found")

    session.delete(evaluation)
    session.commit()


@router.get("/{evaluation_id}/export/json")
def export_evaluation_json(evaluation_id: str, session: Session = Depends(deps.get_db_session)) -> dict:
    """Return a JSON snapshot of the evaluation data."""

    evaluation = session.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluation not found")

    return {
        "id": evaluation.id,
        "title": evaluation.title,
        "summary": evaluation.summary,
        "answers": evaluation.answers,
        "weight_profile": evaluation.weight_profile,
        "results": evaluation.results_snapshot,
        "created_at": evaluation.created_at.isoformat(),
        "updated_at": evaluation.updated_at.isoformat(),
    }
