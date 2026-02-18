from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.schemas.booking import BookingCreate, BookingOut, BookingStatus
from app.models.booking import BookingRequest
from app.core.deps import require_teacher, require_admin

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=BookingOut)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    teacher=Depends(require_teacher),
):
    booking = BookingRequest(
        teacher_id=teacher.id,
        **data.dict(),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my", response_model=list[BookingOut])
def my_bookings(db: Session = Depends(get_db), teacher=Depends(require_teacher)):
    return (
        db.query(BookingRequest)
        .filter(BookingRequest.teacher_id == teacher.id)
        .order_by(BookingRequest.start_datetime)
        .all()
    )


@router.get("/", response_model=list[BookingOut])
def list_bookings(
    status_filter: BookingStatus | None = None,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    q = db.query(BookingRequest)
    if status_filter:
        q = q.filter(BookingRequest.status == status_filter)
    return q.order_by(BookingRequest.start_datetime).all()


@router.post("/{booking_id}/approve", response_model=BookingOut)
def approve_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    booking = db.query(BookingRequest).get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Not found")
    booking.status = BookingStatus.approved
    db.commit()
    db.refresh(booking)
    return booking


@router.post("/{booking_id}/reject", response_model=BookingOut)
def reject_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    booking = db.query(BookingRequest).get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Not found")
    booking.status = BookingStatus.rejected
    db.commit()
    db.refresh(booking)
    return booking
