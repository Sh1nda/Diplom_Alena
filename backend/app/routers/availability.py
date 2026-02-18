from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.db import get_db
from app.schemas.room import RoomOut
from app.services.availability import get_free_rooms

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("/rooms", response_model=list[RoomOut])
def free_rooms(
    start: datetime,
    end: datetime,
    db: Session = Depends(get_db),
):
    return get_free_rooms(db, start, end)
