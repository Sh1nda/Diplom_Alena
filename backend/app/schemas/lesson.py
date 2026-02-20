from pydantic import BaseModel
from datetime import time
from app.models.lesson import Weekday


class LessonOut(BaseModel):
    id: int
    group_id: int
    teacher_id: int
    room_id: int
    subject_raw: str
    weekday: Weekday
    start_time: time
    end_time: time

    class Config:
        orm_mode = True
