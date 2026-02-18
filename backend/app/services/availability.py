from datetime import datetime
from sqlalchemy.orm import Session
from app.models.room import Room
from app.models.lesson import Lesson
from app.models.booking import BookingRequest, BookingStatus


def get_free_rooms(db: Session, start: datetime, end: datetime) -> list[Room]:
    rooms = db.query(Room).all()
    free_rooms: list[Room] = []

    for room in rooms:
        conflict_lesson = (
            db.query(Lesson)
            .filter(Lesson.room_id == room.id)
            .filter(
                Lesson.start_time < end.time(),
                Lesson.end_time > start.time(),
            )
            .first()
        )
        if conflict_lesson:
            continue

        conflict_booking = (
            db.query(BookingRequest)
            .filter(
                BookingRequest.room_id == room.id,
                BookingRequest.status == BookingStatus.approved,
                BookingRequest.start_datetime < end,
                BookingRequest.end_datetime > start,
            )
            .first()
        )
        if conflict_booking:
            continue

        free_rooms.append(room)

    return free_rooms
