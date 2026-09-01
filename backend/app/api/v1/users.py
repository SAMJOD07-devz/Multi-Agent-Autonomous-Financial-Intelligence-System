import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.database import User, Portfolio, UserDecisionDB
from app.models.schemas import UserSchema, PortfolioSchema, HoldingSchema, UserDecisionCreate, UserDecisionSchema
from app.metrics.telemetry import calculate_hhi

router = APIRouter()


@router.get("/users/{user_id}", response_model=UserSchema, tags=["Users"])
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )
    return UserSchema(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        risk_preference=user.risk_preference,
        created_at=user.created_at
    )


@router.get("/users/{user_id}/portfolios", response_model=List[PortfolioSchema], tags=["Portfolios"])
def get_user_portfolios(user_id: str, db: Session = Depends(get_db)):
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
    result = []
    for p in portfolios:
        holdings_data = [
            {
                "holding_id": h.holding_id,
                "portfolio_id": h.portfolio_id,
                "ticker": h.ticker,
                "quantity": h.quantity,
                "avg_buy_price": h.avg_buy_price,
                "current_price": h.current_price,
                "asset_class": h.asset_class,
                "weight": h.weight
            }
            for h in p.holdings
        ]
        hhi = calculate_hhi(holdings_data)
        result.append(
            PortfolioSchema(
                portfolio_id=p.portfolio_id,
                user_id=p.user_id,
                name=p.name,
                holdings=[HoldingSchema(**h) for h in holdings_data],
                hhi_score=hhi
            )
        )
    return result


@router.post("/decisions", response_model=UserDecisionSchema, tags=["Decisions"])
def record_user_decision(payload: UserDecisionCreate, db: Session = Depends(get_db)):
    decision_id = f"dec_{uuid.uuid4().hex[:12]}"
    db_decision = UserDecisionDB(
        decision_id=decision_id,
        session_id=payload.session_id,
        user_id=payload.user_id,
        action=payload.action.upper(),
        notes=payload.notes
    )
    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)

    return UserDecisionSchema(
        decision_id=db_decision.decision_id,
        session_id=db_decision.session_id,
        user_id=db_decision.user_id,
        action=db_decision.action,
        notes=db_decision.notes,
        created_at=db_decision.created_at
    )
