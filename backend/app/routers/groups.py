from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.group import Group

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("")
def get_groups(db: Session = Depends(get_db)):
    groups = db.query(Group).order_by(Group.code).all()
    return [
        {
            "id": g.id,
            "name": g.name or g.code,
            "code": g.code,
            "course": g.course,
        }
        for g in groups
    ]
