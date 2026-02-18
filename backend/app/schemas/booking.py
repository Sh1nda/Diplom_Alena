from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class BookingStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class BookingCreate(BaseModel):
    room_id: int
    subject: str
    start_datetime: datetime
    end_datetime: datetime
    group_id: int | None = None
    discipline_id: int | None = None

class BookingOut(BaseModel):
    id: int
    teacher_id: int
    room_id: int
    subject: str
    start_datetime: datetime
    end_datetime: datetime
    status: BookingStatus
    admin_comment: str | None = None
    group_id: int | None = None
    discipline_id: int | None = None

    model_config = {
        "from_attributes": True
    }
