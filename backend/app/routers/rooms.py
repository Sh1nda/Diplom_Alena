from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.schemas.room import RoomCreate, RoomOut
from app.models.room import Room
from app.core.deps import require_admin

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("/", response_model=list[RoomOut])
def list_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()


@router.post("/", response_model=RoomOut)
def create_room(
    data: RoomCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    room = Room(**data.dict())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.put("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int,
    data: RoomCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    room.name = data.name
    room.capacity = data.capacity

    db.commit()
    db.refresh(room)
    return room


@router.delete("/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(room)
    db.commit()
    return {"detail": "Room deleted"}
