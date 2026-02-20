from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
import re

from app.core.db import get_db
from app.models.lesson import Lesson, Weekday

router = APIRouter(prefix="/schedule", tags=["schedule"])


WEEKDAY_TO_OFFSET = {
    Weekday.monday: 0,
    Weekday.tuesday: 1,
    Weekday.wednesday: 2,
    Weekday.thursday: 3,
    Weekday.friday: 4,
    Weekday.saturday: 5,
}


def normalize_subject(subject_raw: str):
    # Убираем группу (первые 1–2 слова)
    parts = subject_raw.split(" ", 1)
    if len(parts) == 2:
        subject_raw = parts[1]

    # Убираем тип занятия
    subject_raw = re.sub(r"\b(лб|лек|пр|сем)\.? ", "", subject_raw)

    # Аудитория — последнее слово
    room_match = re.search(r"(\d+[а-яА-Я\-]*)$", subject_raw)
    room = room_match.group(1) if room_match else ""

    # Убираем преподавателей
    subject_clean = re.sub(r"[А-ЯЁ][а-яё]+\s[А-ЯЁ]\.[А-ЯЁ]\.", "", subject_raw)
    subject_clean = re.sub(r"\s{2,}", " ", subject_clean).strip()

    # Убираем аудиторию из названия
    if room:
        subject_clean = subject_clean.replace(room, "").strip()

    return subject_clean, room


@router.get("/week")
def get_week_schedule(
    start: date = Query(..., description="Дата понедельника недели"),
    db: Session = Depends(get_db),
):
    lessons = db.query(Lesson).all()

    events = []
    for l in lessons:
        offset = WEEKDAY_TO_OFFSET[l.weekday]
        lesson_date = start + timedelta(days=offset)

        subject, room = normalize_subject(l.subject_raw)

        events.append({
            "id": l.id,
            "title": subject,
            "room_name": room,
            "date": lesson_date.isoformat(),
            "start_time": l.start_time.strftime("%H:%M"),
            "end_time": l.end_time.strftime("%H:%M"),
        })

    return events
