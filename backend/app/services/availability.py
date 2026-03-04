from datetime import datetime
from sqlalchemy.orm import Session
from app.models.room import Room
from app.models.lesson import Lesson, Weekday
from app.models.booking import BookingRequest, BookingStatus


WEEKDAY_MAP = {
    0: Weekday.monday,
    1: Weekday.tuesday,
    2: Weekday.wednesday,
    3: Weekday.thursday,
    4: Weekday.friday,
    5: Weekday.saturday,
}


def get_free_rooms(db: Session, start: datetime, end: datetime) -> list[Room]:
    # День недели из datetime
    weekday_enum = WEEKDAY_MAP[start.weekday()]

    start_t = start.time()
    end_t = end.time()

    rooms = db.query(Room).all()
    free_rooms: list[Room] = []

    for room in rooms:

        # --- 1. Проверяем пары в расписании ---
        conflict_lesson = (
            db.query(Lesson)
            .filter(
                Lesson.room_id == room.id,
                Lesson.weekday == weekday_enum,  # ← добавлено
                Lesson.start_time < end_t,
                Lesson.end_time > start_t,
            )
            .first()
        )

        if conflict_lesson:
            continue

        # --- 2. Проверяем бронирования ---
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
