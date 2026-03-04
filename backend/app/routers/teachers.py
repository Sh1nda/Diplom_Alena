from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserOut

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("/", response_model=list[UserOut])
def list_teachers(db: Session = Depends(get_db)):
    return (
        db.query(User)
        .filter(User.role == UserRole.teacher)
        .order_by(User.full_name)
        .all()
    )
